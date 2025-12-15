import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Play, Square, Download, Languages, Sparkles } from 'lucide-react';
import { GlowButton } from '../ui/GlowButton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { Textarea } from '../ui/textarea';

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
  { code: 'ru-RU', name: 'Русский' },
];

export const TextToSpeech = () => {
  const [text, setText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('vi-VN');
  const [targetLang, setTargetLang] = useState('en-US');
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0) {
        const defaultVoice = availableVoices.find(v => v.lang.startsWith('vi')) || availableVoices[0];
        setSelectedVoice(defaultVoice.name);
      }
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      speechSynthesis.cancel();
    };
  }, []);

  const translateText = async () => {
    if (!text.trim()) return;
    
    setIsTranslating(true);
    
    // Using a simple translation simulation
    // In production, you would use Google Translate API or similar
    try {
      // Simulated translation delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, we'll just add a note about the translation
      // In real app, integrate with translation API
      const translated = `[Translated to ${languages.find(l => l.code === targetLang)?.name}]\n${text}`;
      setTranslatedText(translated);
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  const speak = (textToSpeak: string, lang: string) => {
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.lang = lang;
    
    const voice = voices.find(v => v.name === selectedVoice);
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    
    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
  };

  const filteredVoices = voices.filter(v => v.lang.startsWith(targetLang.split('-')[0]));

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
            Chuyển đổi văn bản thành giọng nói tự nhiên. 
            Hỗ trợ dịch tự động và nhiều ngôn ngữ khác nhau.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Source Text */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Languages className="w-5 h-5 text-primary" />
                  Văn Bản Nguồn
                </h3>
                <Select value={sourceLang} onValueChange={setSourceLang}>
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
              </div>
              
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Nhập văn bản bạn muốn chuyển thành giọng nói..."
                className="min-h-[200px] bg-background/50 border-border/50"
              />

              <div className="mt-4 flex gap-3">
                <GlowButton
                  onClick={() => speak(text, sourceLang)}
                  disabled={!text.trim() || isPlaying}
                  variant="outline"
                  size="sm"
                >
                  <Play className="w-4 h-4" /> Phát
                </GlowButton>
                {isPlaying && (
                  <GlowButton onClick={stopSpeaking} variant="accent" size="sm">
                    <Square className="w-4 h-4" /> Dừng
                  </GlowButton>
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
                <h3 className="font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-secondary" />
                  Đã Dịch
                </h3>
                <Select value={targetLang} onValueChange={setTargetLang}>
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
              </div>
              
              <Textarea
                value={translatedText}
                readOnly
                placeholder="Văn bản dịch sẽ xuất hiện ở đây..."
                className="min-h-[200px] bg-background/50 border-border/50"
              />

              <div className="mt-4 flex gap-3">
                <GlowButton
                  onClick={translateText}
                  disabled={!text.trim()}
                  isLoading={isTranslating}
                  size="sm"
                >
                  <Languages className="w-4 h-4" /> Dịch
                </GlowButton>
                {translatedText && (
                  <GlowButton
                    onClick={() => speak(translatedText, targetLang)}
                    disabled={isPlaying}
                    variant="secondary"
                    size="sm"
                  >
                    <Play className="w-4 h-4" /> Phát
                  </GlowButton>
                )}
              </div>
            </motion.div>
          </div>

          {/* Voice Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-6 mt-6"
          >
            <h3 className="font-semibold mb-6 flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-primary" />
              Cài Đặt Giọng Nói
            </h3>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Voice Selection */}
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Giọng đọc</label>
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn giọng" />
                  </SelectTrigger>
                  <SelectContent>
                    {(filteredVoices.length > 0 ? filteredVoices : voices).map((voice) => (
                      <SelectItem key={voice.name} value={voice.name}>
                        {voice.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Speed */}
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

              {/* Pitch */}
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
