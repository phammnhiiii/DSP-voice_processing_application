import { useState, useRef, useCallback } from 'react';
import { processAudio, getFileUrl, DSPEffect } from '@/api';

export type VoiceEffect = DSPEffect;

interface UseAudioProcessorReturn {
  isRecording: boolean;
  isPlaying: boolean;
  audioBlob: Blob | null;
  processedUrl: string | null;
  waveformUrl: string | null;
  analyser: AnalyserNode | null;
  processedAnalyser: AnalyserNode | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  applyEffect: (effect: VoiceEffect, delay?: number, repeat?: number) => Promise<void>;
  playOriginal: () => void;
  playProcessed: () => void;
  stopPlayback: () => void;
  setAudioFile: (file: File) => void;
}

export const useAudioProcessor = (): UseAudioProcessorReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [waveformUrl, setWaveformUrl] = useState<string | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [processedAnalyser, setProcessedAnalyser] = useState<AnalyserNode | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
        setWaveformUrl(null);
        stream.getTracks().forEach(track => track.stop());
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
    setWaveformUrl(null);
  }, []);

  // Call DSP backend to process audio
  const applyEffect = useCallback(async (effect: VoiceEffect, delay: number = 0.2, repeat: number = 3) => {
    if (!audioBlob) return;

    try {
      const response = await processAudio(audioBlob, effect, delay, repeat);
      setProcessedUrl(getFileUrl(response.audio_url));
      setWaveformUrl(getFileUrl(response.waveform_url));
    } catch (error) {
      console.error('Error processing audio:', error);
      throw error;
    }
  }, [audioBlob]);

  const playAudio = useCallback((url: string, setAnalyserState: (a: AnalyserNode) => void) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(url);
    audioRef.current = audio;

    const audioContext = new AudioContext();
    const source = audioContext.createMediaElementSource(audio);
    const analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 256;

    source.connect(analyserNode);
    analyserNode.connect(audioContext.destination);

    setAnalyserState(analyserNode);

    audio.onended = () => setIsPlaying(false);
    audio.play();
    setIsPlaying(true);
  }, []);

  const playOriginal = useCallback(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      playAudio(url, setAnalyser);
    }
  }, [audioBlob, playAudio]);

  const playProcessed = useCallback(() => {
    if (processedUrl) {
      playAudio(processedUrl, setProcessedAnalyser);
    }
  }, [processedUrl, playAudio]);

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  return {
    isRecording,
    isPlaying,
    audioBlob,
    processedUrl,
    waveformUrl,
    analyser,
    processedAnalyser,
    startRecording,
    stopRecording,
    applyEffect,
    playOriginal,
    playProcessed,
    stopPlayback,
    setAudioFile,
  };
};
