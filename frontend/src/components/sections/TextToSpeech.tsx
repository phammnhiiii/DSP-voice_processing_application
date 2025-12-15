import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Download, Languages } from 'lucide-react';
import { GlowButton } from '../ui/GlowButton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { Textarea } from '../ui/textarea';
import { translateText as apiTranslate, convertTextToSpeech, getFileUrl } from '@/api';

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
      const response = await convertTextToSpeech(sourceText, sourceLang);
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
      const response = await convertTextToSpeech(translatedText, targetLang);
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

          {/* Voice Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-6"
          >
            <h3 className="font-semibold mb-6">Cài Đặt Giọng Nói</h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Tốc độ</span>
                  <span className="text-primary font-mono">{rate.toFixed(1)}x</span>
                </div>
                <Slider
                  value={[rate]}
                  onValueChange={(value) => setRate(value[0])}
                  min={0.5}
                  max={2}
                  step={0.1}
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Cao độ</span>
                  <span className="text-primary font-mono">{pitch.toFixed(1)}</span>
                </div>
                <Slider
                  value={[pitch]}
                  onValueChange={(value) => setPitch(value[0])}
                  min={0.5}
                  max={2}
                  step={0.1}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
