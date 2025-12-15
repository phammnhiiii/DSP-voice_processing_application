import { useState, useRef, useCallback } from 'react';
import { processAudio, getFileUrl, DSPEffect } from '@/api';

export type VoiceEffect = DSPEffect;

interface UseAudioProcessorReturn {
  isRecording: boolean;
  audioBlob: Blob | null;
  processedUrl: string | null;
  rawAudioUrl: string | null;
  waveformUrl: string | null;
  analyser: AnalyserNode | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  applyEffect: (effect: VoiceEffect, delay?: number, repeat?: number, enableFilter?: boolean) => Promise<void>;
  setAudioFile: (file: File) => void;
}

export const useAudioProcessor = (): UseAudioProcessorReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [rawAudioUrl, setRawAudioUrl] = useState<string | null>(null);
  const [waveformUrl, setWaveformUrl] = useState<string | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyserNode = audioContext.createAnalyser();
      analyserNode.fftSize = 256;
      source.connect(analyserNode);
      setAnalyser(analyserNode);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setProcessedUrl(null);
        setRawAudioUrl(null);
        setWaveformUrl(null);
        stream.getTracks().forEach(track => track.stop());
        setAnalyser(null);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const setAudioFile = useCallback((file: File) => {
    setAudioBlob(file);
    setProcessedUrl(null);
    setRawAudioUrl(null);
    setWaveformUrl(null);
  }, []);

  const applyEffect = useCallback(async (
    effect: VoiceEffect,
    delay: number = 0.2,
    repeat: number = 3,
    enableFilter: boolean = false
  ) => {
    if (!audioBlob) return;

    try {
      const response = await processAudio(audioBlob, effect, delay, repeat, enableFilter);
      setProcessedUrl(getFileUrl(response.audio_url));
      setWaveformUrl(getFileUrl(response.waveform_url));
      setRawAudioUrl(getFileUrl(response.raw_audio_url));
    } catch (error) {
      console.error('Error processing audio:', error);
      throw error;
    }
  }, [audioBlob]);

  return {
    isRecording,
    audioBlob,
    processedUrl,
    rawAudioUrl,
    waveformUrl,
    analyser,
    startRecording,
    stopRecording,
    applyEffect,
    setAudioFile,
  };
};
