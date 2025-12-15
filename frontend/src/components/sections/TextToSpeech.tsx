import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Download, Languages, Upload, Mic } from 'lucide-react';
import { GlowButton } from '../ui/GlowButton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  translateText as apiTranslate,
  convertTextToSpeech,
  getFileUrl,
  getVoices,
  ttsElevenLabs,
  cloneVoice,
  Voice
} from '@/api';

const languages = [
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'en', name: 'English' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'zh-CN', name: '中文' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'es', name: 'Español' },
];

type TTSEngine = 'google' | 'elevenlabs';

export const TextToSpeech = () => {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('vi');
  const [targetLang, setTargetLang] = useState('en');
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isGeneratingSource, setIsGeneratingSource] = useState(false);
  const [isGeneratingTarget, setIsGeneratingTarget] = useState(false);
  const [sourceAudioUrl, setSourceAudioUrl] = useState<string | null>(null);
  const [targetAudioUrl, setTargetAudioUrl] = useState<string | null>(null);

  // ElevenLabs states
  const [ttsEngine, setTtsEngine] = useState<TTSEngine>('google');
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [isLoadingVoices, setIsLoadingVoices] = useState(false);
  const [cloneName, setCloneName] = useState('');
  const [isCloning, setIsCloning] = useState(false);
  const [cloneStatus, setCloneStatus] = useState('');
  const cloneInputRef = useRef<HTMLInputElement>(null);


  // Fetch ElevenLabs voices when engine changes
  useEffect(() => {
    if (ttsEngine === 'elevenlabs') {
      loadVoices();
    }
  }, [ttsEngine]);

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

  // Clone voice handler
  const handleCloneVoice = async (file: File) => {
    if (!cloneName.trim()) {
      setCloneStatus('Vui lòng nhập tên cho giọng nói');
      return;
    }

    setIsCloning(true);
    setCloneStatus('Đang clone giọng nói...');
    try {
      const result = await cloneVoice(cloneName, file);
      setCloneStatus(`Clone thành công: ${result.name}`);
      setSelectedVoice(result.voice_id);
      await loadVoices(); // Refresh voice list
    } catch (error: any) {
      setCloneStatus(`Lỗi: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsCloning(false);
    }
  };

  // Translation using backend API
  const handleTranslate = async () => {
    if (!sourceText.trim()) return;

    setIsTranslating(true);
    try {
      const response = await apiTranslate(sourceText, sourceLang, targetLang);
      setTranslatedText(response.translated_text);
    } catch (error) {
      console.error('Translation error:', error);
      setTranslatedText('Lỗi dịch. Vui lòng thử lại.');
    } finally {
      setIsTranslating(false);
    }
  };

  // Generate speech for source text
  const generateSourceAudio = async () => {
    if (!sourceText.trim()) return;

    setIsGeneratingSource(true);
    try {
      let response;
      if (ttsEngine === 'elevenlabs' && selectedVoice) {
        response = await ttsElevenLabs(sourceText, selectedVoice);
      } else {
        response = await convertTextToSpeech(sourceText, sourceLang);
      }
      setSourceAudioUrl(getFileUrl(response.audio_url));
    } catch (error) {
      console.error('TTS error:', error);
    } finally {
      setIsGeneratingSource(false);
    }
  };

  // Generate speech for translated text
  const generateTargetAudio = async () => {
    if (!translatedText.trim()) return;

    setIsGeneratingTarget(true);
    try {
      let response;
      if (ttsEngine === 'elevenlabs' && selectedVoice) {
        response = await ttsElevenLabs(translatedText, selectedVoice);
      } else {
        response = await convertTextToSpeech(translatedText, targetLang);
      }
      setTargetAudioUrl(getFileUrl(response.audio_url));
    } catch (error) {
      console.error('TTS error:', error);
    } finally {
      setIsGeneratingTarget(false);
    }
  };

  const handleDownload = (url: string | null, lang: string) => {
    if (url) {
      const a = document.createElement('a');
      a.href = url;
      a.download = `tts-${lang}.mp3`;
      a.click();
    }
  };

  return (
    <section id="text-to-speech" className="py-24 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">
            <span className="gradient-text">Text to Speech</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Dịch văn bản và chuyển đổi thành giọng nói tự nhiên.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          {/* TTS Engine Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-6 mb-6"
          >
            <h3 className="font-semibold mb-4">Chọn Engine TTS</h3>
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={() => setTtsEngine('google')}
                className={`px-4 py-2 rounded-lg border transition-all ${ttsEngine === 'google'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border hover:border-primary/50'
                  }`}
              >
                Google
              </button>
              <button
                onClick={() => setTtsEngine('elevenlabs')}
                className={`px-4 py-2 rounded-lg border transition-all ${ttsEngine === 'elevenlabs'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border hover:border-primary/50'
                  }`}
              >
                ElevenLabs (AI Voice)
              </button>
            </div>

            {/* ElevenLabs Voice Selection */}
            {ttsEngine === 'elevenlabs' && (
              <div className="mt-4 space-y-4">
                <div className="flex gap-4 items-end flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <Label className="mb-2 block">Chọn Giọng</Label>
                    <Select
                      value={selectedVoice}
                      onValueChange={setSelectedVoice}
                      disabled={isLoadingVoices}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingVoices ? "Đang tải..." : "Chọn giọng"} />
                      </SelectTrigger>
                      <SelectContent>
                        {voices.map((voice) => (
                          <SelectItem key={voice.voice_id} value={voice.voice_id}>
                            {voice.name} ({voice.category})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <GlowButton onClick={loadVoices} variant="outline" disabled={isLoadingVoices}>
                    Refresh
                  </GlowButton>
                </div>

                {/* Clone Voice */}
                <div className="border-t border-border pt-4">
                  <Label className="mb-2 block">Clone Giọng Của Bạn</Label>
                  <div className="flex gap-2 items-end flex-wrap">
                    <div className="flex-1 min-w-[150px]">
                      <Input
                        placeholder="Tên giọng mới"
                        value={cloneName}
                        onChange={(e) => setCloneName(e.target.value)}
                      />
                    </div>
                    <input
                      type="file"
                      accept="audio/*"
                      ref={cloneInputRef}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleCloneVoice(file);
                      }}
                    />
                    <GlowButton
                      onClick={() => cloneInputRef.current?.click()}
                      variant="secondary"
                      disabled={isCloning || !cloneName.trim()}
                      isLoading={isCloning}
                    >
                      <Upload className="w-4 h-4" />
                      Upload
                    </GlowButton>
                  </div>
                  {cloneStatus && (
                    <p className={`text-sm mt-2 ${cloneStatus.includes('Lỗi') ? 'text-red-500' : 'text-green-500'}`}>
                      {cloneStatus}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Upload file audio 30s - 1 phút để clone giọng nói
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Two Column Layout */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Source Text */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Văn Bản Nguồn</h3>
                <Select value={sourceLang} onValueChange={setSourceLang}>
                  <SelectTrigger className="w-36">
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
              </div>

              <Textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Nhập văn bản cần dịch và chuyển thành giọng nói..."
                className="min-h-[150px] bg-background/50 border-border/50"
              />

              <div className="mt-4 space-y-3">
                <GlowButton
                  onClick={generateSourceAudio}
                  disabled={!sourceText.trim()}
                  isLoading={isGeneratingSource}
                  variant="primary"
                  className="w-full"
                >
                  <Volume2 className="w-4 h-4" /> Tạo Audio
                </GlowButton>

                {sourceAudioUrl && (
                  <>
                    <audio controls src={sourceAudioUrl} className="w-full" />
                    <GlowButton
                      onClick={() => handleDownload(sourceAudioUrl, sourceLang)}
                      variant="outline"
                      className="w-full"
                    >
                      <Download className="w-4 h-4" /> Tải Xuống
                    </GlowButton>
                  </>
                )}
              </div>
            </motion.div>

            {/* Translated Text */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Văn Bản Đã Dịch</h3>
                <Select value={targetLang} onValueChange={setTargetLang}>
                  <SelectTrigger className="w-36">
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
              </div>

              <Textarea
                value={translatedText}
                onChange={(e) => setTranslatedText(e.target.value)}
                placeholder="Văn bản dịch sẽ xuất hiện ở đây..."
                className="min-h-[150px] bg-background/50 border-border/50"
              />

              <div className="mt-4 space-y-3">
                <div className="flex gap-2">
                  <GlowButton
                    onClick={handleTranslate}
                    disabled={!sourceText.trim()}
                    isLoading={isTranslating}
                    variant="secondary"
                    className="flex-1"
                  >
                    <Languages className="w-4 h-4" /> Dịch
                  </GlowButton>
                  <GlowButton
                    onClick={generateTargetAudio}
                    disabled={!translatedText.trim()}
                    isLoading={isGeneratingTarget}
                    variant="primary"
                    className="flex-1"
                  >
                    <Volume2 className="w-4 h-4" /> Tạo Audio
                  </GlowButton>
                </div>

                {targetAudioUrl && (
                  <>
                    <audio controls src={targetAudioUrl} className="w-full" />
                    <GlowButton
                      onClick={() => handleDownload(targetAudioUrl, targetLang)}
                      variant="outline"
                      className="w-full"
                    >
                      <Download className="w-4 h-4" /> Tải Xuống
                    </GlowButton>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
