import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Copy, Check, FileText, Trash2 } from 'lucide-react';
import { GlowButton } from '../ui/GlowButton';
import { AudioVisualizer } from '../ui/AudioVisualizer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '@/hooks/use-toast';

const languages = [
  { code: 'vi-VN', name: 'Tiếng Việt' },
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' },
  { code: 'ja-JP', name: '日本語' },
  { code: 'ko-KR', name: '한국어' },
  { code: 'zh-CN', name: '中文' },
  { code: 'fr-FR', name: 'Français' },
  { code: 'de-DE', name: 'Deutsch' },
  { code: 'es-ES', name: 'Español' },
];

interface TranscriptEntry {
  id: string;
  text: string;
  timestamp: Date;
  isFinal: boolean;
}

export const SpeechToText = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [interimText, setInterimText] = useState('');
  const [language, setLanguage] = useState('vi-VN');
  const [copied, setCopied] = useState(false);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onresult = (event) => {
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          const newEntry: TranscriptEntry = {
            id: Date.now().toString(),
            text: result[0].transcript,
            timestamp: new Date(),
            isFinal: true,
          };
          setTranscript(prev => [...prev, newEntry]);
          setInterimText('');
        } else {
          interimTranscript += result[0].transcript;
        }
      }
      
      setInterimText(interimTranscript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        toast({
          title: 'Không có quyền truy cập',
          description: 'Vui lòng cho phép truy cập microphone để sử dụng tính năng này.',
          variant: 'destructive',
        });
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      if (isListening) {
        recognition.start();
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [language, isListening, toast]);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyserNode = audioContext.createAnalyser();
      analyserNode.fftSize = 256;
      source.connect(analyserNode);
      setAnalyser(analyserNode);

      if (recognitionRef.current) {
        recognitionRef.current.lang = language;
        recognitionRef.current.start();
        setIsListening(true);
      }
    } catch (error) {
      console.error('Error starting listening:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể khởi động nhận dạng giọng nói.',
        variant: 'destructive',
      });
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      setAnalyser(null);
    }
  };

  const copyToClipboard = () => {
    const fullText = transcript.map(t => t.text).join(' ');
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    toast({
      title: 'Đã sao chép',
      description: 'Văn bản đã được sao chép vào clipboard.',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const clearTranscript = () => {
    setTranscript([]);
    setInterimText('');
  };

  if (!isSupported) {
    return (
      <section id="speech-to-text" className="py-24 relative bg-gradient-to-b from-card/30 to-background">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold mb-4">
              <span className="gradient-text">Speech to Text</span>
            </h2>
            <p className="text-destructive">
              Trình duyệt của bạn không hỗ trợ nhận dạng giọng nói. 
              Vui lòng sử dụng Chrome hoặc Edge.
            </p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="speech-to-text" className="py-24 relative bg-gradient-to-b from-card/30 to-background">
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
            Hỗ trợ nhiều ngôn ngữ khác nhau.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-6 mb-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-48">
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

              <div className="flex gap-3">
                <GlowButton
                  onClick={isListening ? stopListening : startListening}
                  variant={isListening ? 'accent' : 'primary'}
                  size="lg"
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-5 h-5" /> Dừng
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5" /> Bắt Đầu
                    </>
                  )}
                </GlowButton>
              </div>
            </div>

            {/* Visualizer */}
            <AudioVisualizer
              analyser={analyser}
              isActive={isListening}
              className="h-24"
            />

            {isListening && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 flex items-center justify-center gap-2 text-primary"
              >
                <motion.div
                  className="w-2 h-2 rounded-full bg-primary"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                Đang lắng nghe...
              </motion.div>
            )}
          </motion.div>

          {/* Transcript */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Văn Bản Nhận Dạng
              </h3>
              <div className="flex gap-2">
                {transcript.length > 0 && (
                  <>
                    <GlowButton
                      onClick={copyToClipboard}
                      variant="outline"
                      size="sm"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Đã sao chép' : 'Sao chép'}
                    </GlowButton>
                    <GlowButton
                      onClick={clearTranscript}
                      variant="outline"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" /> Xóa
                    </GlowButton>
                  </>
                )}
              </div>
            </div>

            <div className="min-h-[200px] p-4 rounded-lg bg-background/50 border border-border/50">
              {transcript.length === 0 && !interimText ? (
                <p className="text-muted-foreground text-center py-8">
                  Nhấn "Bắt Đầu" và nói để chuyển đổi giọng nói thành văn bản
                </p>
              ) : (
                <div className="space-y-2">
                  {transcript.map((entry) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-foreground"
                    >
                      <span className="text-xs text-muted-foreground mr-2">
                        {entry.timestamp.toLocaleTimeString()}
                      </span>
                      {entry.text}
                    </motion.div>
                  ))}
                  {interimText && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-muted-foreground italic"
                    >
                      {interimText}
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
