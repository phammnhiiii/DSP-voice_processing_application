import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Languages, Copy, Trash2 } from 'lucide-react';
import { GlowButton } from '../ui/GlowButton';
import { AudioVisualizer } from '../ui/AudioVisualizer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { translateText as apiTranslate } from '@/api';
import { useToast } from '@/hooks/use-toast';

const languages = [
  { code: 'vi-VN', name: 'Tiếng Việt', shortCode: 'vi' },
  { code: 'en-US', name: 'English', shortCode: 'en' },
  { code: 'ja-JP', name: '日本語', shortCode: 'ja' },
  { code: 'ko-KR', name: '한국어', shortCode: 'ko' },
  { code: 'zh-CN', name: '中文', shortCode: 'zh-CN' },
  { code: 'fr-FR', name: 'Français', shortCode: 'fr' },
  { code: 'de-DE', name: 'Deutsch', shortCode: 'de' },
  { code: 'es-ES', name: 'Español', shortCode: 'es' },
];

export const SpeechToText = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [language, setLanguage] = useState('vi-VN');
  const [targetLang, setTargetLang] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const isListeningRef = useRef(false);
  const errorCountRef = useRef(0);

  const { toast } = useToast();

  // Keep ref in sync with state
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Initialize speech recognition
  const initRecognition = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast({
        title: 'Không hỗ trợ',
        description: 'Vui lòng sử dụng Chrome hoặc Edge để nhận diện giọng nói.',
        variant: 'destructive',
      });
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onresult = (event: any) => {
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + ' ';
        }
      }

      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript);
        errorCountRef.current = 0; // Reset error count on success
      }
    };

    recognition.onerror = (event: any) => {
      console.log('Speech recognition error:', event.error);

      // Only show toast for critical errors, not network/no-speech
      if (event.error === 'not-allowed') {
        toast({
          title: 'Không có quyền truy cập',
          description: 'Vui lòng cho phép truy cập microphone trong cài đặt trình duyệt.',
          variant: 'destructive',
        });
        setIsListening(false);
      } else if (event.error === 'network') {
        // Network errors are common, just log them
        errorCountRef.current++;
        if (errorCountRef.current >= 5) {
          toast({
            title: 'Lỗi kết nối',
            description: 'Kiểm tra kết nối mạng của bạn.',
            variant: 'destructive',
          });
          errorCountRef.current = 0;
        }
      }
      // Ignore 'no-speech' and 'aborted' errors - they're normal
    };

    recognition.onend = () => {
      // Restart if still supposed to be listening
      if (isListeningRef.current && recognitionRef.current) {
        try {
          setTimeout(() => {
            if (isListeningRef.current && recognitionRef.current) {
              recognitionRef.current.start();
            }
          }, 100);
        } catch (e) {
          console.log('Recognition restart failed:', e);
        }
      }
    };

    return recognition;
  }, [language, toast]);

  const startListening = async () => {
    try {
      // Get microphone with high quality settings
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1,
        }
      });
      streamRef.current = stream;

      // Setup audio context for visualizer with gain boost
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);

      // Add gain node to boost audio
      const gainNode = audioContext.createGain();
      gainNode.gain.value = 2.0; // Boost audio by 2x

      const analyserNode = audioContext.createAnalyser();
      analyserNode.fftSize = 256;

      source.connect(gainNode);
      gainNode.connect(analyserNode);
      setAnalyser(analyserNode);

      // Setup media recorder with high quality
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
        audioBitsPerSecond: 128000,
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };

      // Record in smaller chunks for better quality
      mediaRecorder.start(1000);

      // Start speech recognition
      const recognition = initRecognition();
      if (recognition) {
        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
        errorCountRef.current = 0;
      }
    } catch (error) {
      console.error('Error starting:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập.',
        variant: 'destructive',
      });
    }
  };

  const stopListening = () => {
    setIsListening(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore stop errors
      }
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }

    setAnalyser(null);
  };

  // Translate recognized text
  const handleTranslate = async () => {
    if (!transcript.trim()) return;

    const sourceLang = languages.find(l => l.code === language)?.shortCode || 'vi';

    setIsTranslating(true);
    try {
      const response = await apiTranslate(transcript, sourceLang, targetLang);
      setTranslatedText(response.translated_text);
    } catch (error) {
      console.error('Translation error:', error);
      setTranslatedText('Lỗi dịch. Vui lòng thử lại.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Đã sao chép',
      description: 'Văn bản đã được sao chép vào clipboard',
    });
  };

  const handleClear = () => {
    setTranscript('');
    setTranslatedText('');
    setAudioUrl(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) { }
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <section id="speech-to-text" className="py-24 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">
            <span className="gradient-text">Speech to Text</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Nhận dạng giọng nói và chuyển đổi thành văn bản theo thời gian thực.
            <br />
            <span className="text-xs">Yêu cầu: Chrome/Edge + Kết nối internet</span>
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {/* Recording Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-6 mb-6"
          >
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <GlowButton
                onClick={isListening ? stopListening : startListening}
                variant={isListening ? 'accent' : 'primary'}
                size="lg"
              >
                {isListening ? (
                  <>
                    <MicOff className="w-5 h-5" /> Dừng Ghi
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5" /> Bắt Đầu Ghi
                  </>
                )}
              </GlowButton>

              {isListening && (
                <span className="text-sm text-muted-foreground animate-pulse">
                  Đang lắng nghe...
                </span>
              )}
            </div>

            <AudioVisualizer
              analyser={analyser}
              isActive={isListening}
              className="h-24 mb-4"
            />

            {/* Audio playback */}
            {audioUrl && !isListening && (
              <audio controls src={audioUrl} className="w-full" />
            )}
          </motion.div>

          {/* Transcript */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Văn Bản Nhận Dạng</h3>
              <div className="flex gap-2">
                <GlowButton onClick={() => handleCopy(transcript)} variant="outline" size="sm" disabled={!transcript}>
                  <Copy className="w-4 h-4" />
                </GlowButton>
                <GlowButton onClick={handleClear} variant="outline" size="sm" disabled={!transcript}>
                  <Trash2 className="w-4 h-4" />
                </GlowButton>
              </div>
            </div>

            <Textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Nhấn 'Bắt Đầu Ghi' và nói để chuyển đổi giọng nói thành văn bản..."
              className="min-h-[120px] bg-background/50 border-border/50"
            />
          </motion.div>

          {/* Translation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Dịch Văn Bản</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Dịch sang:</span>
                <Select value={targetLang} onValueChange={setTargetLang}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.shortCode} value={lang.shortCode}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <GlowButton
                  onClick={handleTranslate}
                  disabled={!transcript.trim()}
                  isLoading={isTranslating}
                  variant="secondary"
                  size="sm"
                >
                  <Languages className="w-4 h-4" /> Dịch
                </GlowButton>
              </div>
            </div>

            <Textarea
              value={translatedText}
              onChange={(e) => setTranslatedText(e.target.value)}
              placeholder="Văn bản dịch sẽ xuất hiện ở đây..."
              className="min-h-[120px] bg-background/50 border-border/50"
            />

            {translatedText && (
              <div className="mt-3 flex justify-end">
                <GlowButton onClick={() => handleCopy(translatedText)} variant="outline" size="sm">
                  <Copy className="w-4 h-4" /> Sao Chép
                </GlowButton>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
