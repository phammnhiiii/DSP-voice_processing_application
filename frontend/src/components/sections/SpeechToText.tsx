import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Languages, Copy, Trash2, Loader2, Volume2, Download, Upload } from 'lucide-react';
import { GlowButton } from '../ui/GlowButton';
import { AudioVisualizer } from '../ui/AudioVisualizer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import {
  translateText as apiTranslate,
  speechToText as apiSpeechToText,
  convertTextToSpeech,
  getFileUrl,
  getVoices,
  ttsElevenLabs,
  Voice,
  xttsCloneVoice,
  getXTTSStatus
} from '@/api';
import { useToast } from '@/hooks/use-toast';
import { downloadAsWav } from '@/lib/audioUtils';

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
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [language, setLanguage] = useState('vi-VN');
  const [targetLang, setTargetLang] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [translatedAudioUrl, setTranslatedAudioUrl] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

  // ElevenLabs TTS for translated text
  const [ttsEngine, setTtsEngine] = useState<'google' | 'elevenlabs' | 'xtts'>('google');
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [isLoadingVoices, setIsLoadingVoices] = useState(false);

  // XTTS states
  const [xttsAvailable, setXttsAvailable] = useState(false);
  const [xttsSpeakerFile, setXttsSpeakerFile] = useState<File | null>(null);
  const [hasConsentedClone, setHasConsentedClone] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const xttsSpeakerInputRef = useRef<HTMLInputElement>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const { toast } = useToast();

  // Load voices when switching to ElevenLabs
  useEffect(() => {
    if (ttsEngine === 'elevenlabs' && voices.length === 0) {
      loadVoices();
    }
    if (ttsEngine === 'xtts') {
      checkXttsStatus();
    }
  }, [ttsEngine]);

  const checkXttsStatus = async () => {
    try {
      const status = await getXTTSStatus();
      setXttsAvailable(status.available);
    } catch {
      setXttsAvailable(false);
    }
  };

  const loadVoices = async () => {
    setIsLoadingVoices(true);
    try {
      const result = await getVoices();
      setVoices(result);
      if (result.length > 0 && !selectedVoice) {
        setSelectedVoice(result[0].voice_id);
      }
    } catch (error) {
      console.error('Error loading voices:', error);
    } finally {
      setIsLoadingVoices(false);
    }
  };

  const startRecording = async () => {
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
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        stream.getTracks().forEach(track => track.stop());
        setAnalyser(null);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể truy cập microphone.',
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleRecognize = async () => {
    if (!audioBlob) {
      toast({
        title: 'Chưa có audio',
        description: 'Vui lòng ghi âm trước.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await apiSpeechToText(audioBlob, language);
      setTranscript(response.text);
      toast({
        title: 'Thành công',
        description: 'Đã nhận diện giọng nói.',
      });
    } catch (error: any) {
      console.error('STT error:', error);
      toast({
        title: 'Lỗi nhận diện',
        description: error?.response?.data?.error || 'Không thể nhận diện giọng nói.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Translate and generate TTS
  const handleTranslate = async () => {
    if (!transcript.trim()) return;

    const sourceLang = languages.find(l => l.code === language)?.shortCode || 'vi';

    setIsTranslating(true);
    setTranslatedAudioUrl(null);

    try {
      const response = await apiTranslate(transcript, sourceLang, targetLang);
      setTranslatedText(response.translated_text);

      // Generate TTS for translated text
      setIsGeneratingAudio(true);
      try {
        let ttsResponse;
        if (ttsEngine === 'xtts' && xttsSpeakerFile) {
          ttsResponse = await xttsCloneVoice(response.translated_text, xttsSpeakerFile, targetLang);
        } else if (ttsEngine === 'elevenlabs' && selectedVoice) {
          ttsResponse = await ttsElevenLabs(response.translated_text, selectedVoice);
        } else {
          ttsResponse = await convertTextToSpeech(response.translated_text, targetLang);
        }
        setTranslatedAudioUrl(getFileUrl(ttsResponse.audio_url));
      } catch (ttsError) {
        console.error('TTS error:', ttsError);
      } finally {
        setIsGeneratingAudio(false);
      }
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
      description: 'Văn bản đã được sao chép.',
    });
  };

  const handleClear = () => {
    setTranscript('');
    setTranslatedText('');
    setAudioUrl(null);
    setAudioBlob(null);
    setTranslatedAudioUrl(null);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <section id="speech-to-text" className="py-24 relative section-stt noise-bg">
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
            Ghi âm và nhận diện giọng nói bằng Google Speech Recognition.
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
                onClick={isRecording ? stopRecording : startRecording}
                variant={isRecording ? 'accent' : 'primary'}
                size="lg"
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-5 h-5" /> Dừng Ghi
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5" /> Ghi Âm
                  </>
                )}
              </GlowButton>

              {isRecording && (
                <span className="text-sm text-muted-foreground animate-pulse">
                  Đang ghi âm...
                </span>
              )}
            </div>

            <AudioVisualizer
              analyser={analyser}
              isActive={isRecording}
              className="h-24 mb-4"
            />

            {audioUrl && !isRecording && (
              <div className="space-y-3">
                <audio controls src={audioUrl} className="w-full" />
                <div className="flex gap-2">
                  <GlowButton
                    onClick={() => {
                      if (audioBlob && audioUrl) {
                        downloadAsWav(audioBlob, `recording-${Date.now()}.wav`);
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Download className="w-4 h-4" /> Lưu File
                  </GlowButton>
                  <GlowButton
                    onClick={handleRecognize}
                    isLoading={isProcessing}
                    variant="secondary"
                    className="flex-1"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Đang nhận diện...
                      </>
                    ) : (
                      'Nhận Diện Giọng Nói'
                    )}
                  </GlowButton>
                </div>
              </div>
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
                <GlowButton onClick={handleClear} variant="outline" size="sm" disabled={!transcript && !audioUrl}>
                  <Trash2 className="w-4 h-4" />
                </GlowButton>
              </div>
            </div>

            <Textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Văn bản nhận diện sẽ xuất hiện ở đây..."
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
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h3 className="font-semibold">Dịch Văn Bản</h3>
              <div className="flex items-center gap-2 flex-wrap">
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

            {/* TTS Engine Selection for translated audio */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <Label className="text-sm">Giọng đọc:</Label>
              <button
                onClick={() => setTtsEngine('google')}
                className={`px-3 py-1 text-sm rounded-lg border transition-all ${ttsEngine === 'google'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border hover:border-primary/50'
                  }`}
              >
                Google
              </button>
              <button
                onClick={() => setTtsEngine('elevenlabs')}
                className={`px-3 py-1 text-sm rounded-lg border transition-all ${ttsEngine === 'elevenlabs'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border hover:border-primary/50'
                  }`}
              >
                ElevenLabs
              </button>
              {ttsEngine === 'elevenlabs' && (
                <>
                  <Select value={selectedVoice} onValueChange={setSelectedVoice} disabled={isLoadingVoices}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder={isLoadingVoices ? "Đang tải..." : "Chọn giọng"} />
                    </SelectTrigger>
                    <SelectContent>
                      {voices.map((voice) => (
                        <SelectItem key={voice.voice_id} value={voice.voice_id}>
                          {voice.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <GlowButton onClick={loadVoices} variant="outline" size="sm" disabled={isLoadingVoices}>
                    Refresh
                  </GlowButton>
                </>
              )}

              <button
                onClick={() => setTtsEngine('xtts')}
                className={`px-3 py-1 text-sm rounded-lg border transition-all ${ttsEngine === 'xtts'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border hover:border-primary/50'
                  }`}
              >
                Voice Clone
              </button>
            </div>

            {/* Voice Clone Settings */}
            {ttsEngine === 'xtts' && (
              <div className="mb-4 space-y-3 bg-card/50 p-4 rounded-lg border border-border">
                {!xttsAvailable && (
                  <p className="text-xs text-red-500">
                    Voice Clone đang khởi động. Vui lòng chờ...
                  </p>
                )}

                <div className="border-t border-border pt-4 mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="font-sans text-sm font-medium text-foreground">Clone Giọng Của Bạn</Label>
                    <button
                      onClick={() => setShowLegalModal(true)}
                      className="font-sans text-xs text-gray-500 dark:text-gray-400 hover:text-primary transition-colors"
                    >
                      Điều khoản pháp lý
                    </button>
                  </div>

                  {/* Full Legal Warning Box */}
                  <div className="bg-card border border-border rounded-lg p-4 mb-4">
                    <h4 className="font-semibold mb-2 text-sm">Cảnh báo pháp lý</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      Việc sao chép giọng nói mà không có sự đồng ý là <strong className="text-foreground">bất hợp pháp</strong>.
                      Bạn chỉ được sử dụng giọng nói của chính mình hoặc có sự cho phép bằng văn bản.
                    </p>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasConsentedClone}
                        onChange={(e) => setHasConsentedClone(e.target.checked)}
                        className="w-4 h-4 mt-0.5 rounded border-border"
                      />
                      <span className="text-xs text-muted-foreground">
                        Tôi xác nhận đây là giọng nói của tôi hoặc tôi có sự đồng ý hợp pháp.
                      </span>
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex gap-2 items-center w-full">
                      <input
                        type="file"
                        accept="audio/*"
                        ref={xttsSpeakerInputRef}
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setXttsSpeakerFile(file);
                        }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <GlowButton
                            onClick={() => xttsSpeakerInputRef.current?.click()}
                            variant="secondary"
                            size="sm"
                            disabled={!hasConsentedClone}
                          >
                            <Upload className="w-3 h-3" /> Upload Mẫu
                          </GlowButton>
                          {xttsSpeakerFile ? (
                            <span className="text-xs text-green-500 truncate max-w-[150px]">
                              ✓ {xttsSpeakerFile.name}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">File mẫu (6s+)</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Textarea
              value={translatedText}
              onChange={(e) => setTranslatedText(e.target.value)}
              placeholder="Văn bản dịch sẽ xuất hiện ở đây..."
              className="min-h-[120px] bg-background/50 border-border/50"
            />

            {/* Audio control for translated text */}
            {isGeneratingAudio && (
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang tạo audio...
              </div>
            )}

            {translatedAudioUrl && (
              <div className="mt-4">
                <audio controls src={translatedAudioUrl} className="w-full" />
              </div>
            )}

            {translatedText && !translatedAudioUrl && !isGeneratingAudio && (
              <div className="mt-3 flex justify-end">
                <GlowButton onClick={() => handleCopy(translatedText)} variant="outline" size="sm">
                  <Copy className="w-4 h-4" /> Sao Chép
                </GlowButton>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Legal Modal */}
      {showLegalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold">Điều Khoản Pháp Lý Chi Tiết</h3>
              <button
                onClick={() => setShowLegalModal(false)}
                className="text-muted-foreground hover:text-foreground text-xl"
              >
                ×
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Warning - beige/amber subtle */}
              <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Cảnh Báo Quan Trọng</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Công nghệ Voice Clone có thể bị lạm dụng cho mục đích xấu. Việc sử dụng sai có thể dẫn đến:
                </p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>Truy cứu trách nhiệm hình sự theo Điều 155-156 Bộ luật Hình sự</li>
                  <li>Bồi thường thiệt hại dân sự theo Điều 584-608 Bộ luật Dân sự</li>
                  <li>Xử phạt hành chính từ 10-200 triệu đồng</li>
                </ul>
              </div>

              {/* Rights */}
              <div>
                <h4 className="font-semibold mb-2">Quy Định Về Quyền Nhân Thân</h4>
                <p className="text-sm text-muted-foreground">
                  Theo Điều 32 Bộ luật Dân sự 2015, giọng nói là một phần của quyền về hình ảnh và quyền nhân thân.
                  Việc sử dụng hình ảnh, giọng nói của cá nhân phải được sự đồng ý của người đó.
                </p>
              </div>

              {/* Allowed */}
              <div>
                <h4 className="font-semibold mb-2">Trường Hợp Được Phép</h4>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>Sử dụng giọng nói của chính bạn</li>
                  <li>Có văn bản đồng ý từ chủ sở hữu giọng nói</li>
                  <li>Mục đích giáo dục, nghiên cứu không thương mại</li>
                  <li>Sử dụng trong phạm vi gia đình</li>
                </ul>
              </div>

              {/* Forbidden */}
              <div>
                <h4 className="font-semibold mb-2">Trường Hợp Bị Cấm</h4>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>Mạo danh người khác để lừa đảo</li>
                  <li>Tạo nội dung deepfake gây hại</li>
                  <li>Phát tán thông tin sai lệch</li>
                  <li>Xâm phạm đời tư, danh dự người khác</li>
                  <li>Sử dụng cho hoạt động phạm pháp</li>
                </ul>
              </div>

              {/* Contact - blue subtle */}
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
                <h4 className="font-semibold mb-1">Liên Hệ Hỗ Trợ Pháp Lý</h4>
                <p className="text-sm text-muted-foreground">
                  Nếu bạn phát hiện giọng nói của mình bị sử dụng trái phép, vui lòng liên hệ cơ quan công an hoặc luật sư để được hỗ trợ.
                </p>
              </div>
            </div>

            {/* Footer with button */}
            <div className="p-4 border-t border-border">
              <button
                onClick={() => setShowLegalModal(false)}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
