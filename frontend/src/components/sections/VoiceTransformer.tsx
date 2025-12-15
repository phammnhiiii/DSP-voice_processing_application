import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Wand2, Download, Upload, Filter } from 'lucide-react';
import { GlowButton } from '../ui/GlowButton';
import { AudioVisualizer } from '../ui/AudioVisualizer';
import { useAudioProcessor, VoiceEffect } from '@/hooks/useAudioProcessor';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';

// DSP effects - no emoji icons
const effects: { id: VoiceEffect; name: string }[] = [
  { id: 'chipmunk', name: 'Chipmunk' },
  { id: 'robot', name: 'Robot' },
  { id: 'echo', name: 'Echo' },
  { id: 'electronic', name: 'Electronic' },
  { id: 'stutter', name: 'Stutter' },
  { id: 'whisper', name: 'Whisper' },
  { id: 'distortion', name: 'Distortion' },
  { id: 'reverse', name: 'Reverse' },
  { id: 'monster', name: 'Monster' },
  { id: 'telephone', name: 'Telephone' },
  { id: 'process_voice', name: 'Denoise' },
];

export const VoiceTransformer = () => {
  const [selectedEffect, setSelectedEffect] = useState<VoiceEffect>('chipmunk');
  const [isProcessing, setIsProcessing] = useState(false);
  const [echoDelay, setEchoDelay] = useState(0.2);
  const [stutterRepeat, setStutterRepeat] = useState(3);
  const [enableNoiseFilter, setEnableNoiseFilter] = useState(true);
  const [localAudioUrl, setLocalAudioUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    isRecording,
    audioBlob,
    processedUrl,
    waveformUrl,
    analyser,
    startRecording,
    stopRecording,
    applyEffect,
    setAudioFile,
  } = useAudioProcessor();

  // Create local URL for playback before applying effect
  useEffect(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      setLocalAudioUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setLocalAudioUrl(null);
    }
  }, [audioBlob]);

  const handleApplyEffect = async () => {
    setIsProcessing(true);
    try {
      await applyEffect(selectedEffect, echoDelay, stutterRepeat, enableNoiseFilter);
    } catch (error) {
      console.error('Error applying effect:', error);
    }
    setIsProcessing(false);
  };

  const handleDownload = () => {
    if (processedUrl) {
      const a = document.createElement('a');
      a.href = processedUrl;
      a.download = `voice-${selectedEffect}.wav`;
      a.click();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
    }
  };

  return (
    <section id="transformer" className="py-24 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">
            <span className="gradient-text">Biến Đổi Giọng Nói</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Ghi âm hoặc tải file âm thanh và áp dụng các hiệu ứng DSP được xử lý trên server.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Audio */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card p-6"
          >
            <h3 className="text-xl font-semibold mb-4">Nhập Âm Thanh</h3>

            <AudioVisualizer
              analyser={analyser}
              isActive={isRecording}
              className="h-32 mb-4"
            />

            <div className="flex flex-wrap gap-3 mb-4">
              <GlowButton
                onClick={isRecording ? stopRecording : startRecording}
                variant={isRecording ? 'accent' : 'primary'}
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-4 h-4" /> Dừng Ghi
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" /> Ghi Âm
                  </>
                )}
              </GlowButton>

              <input
                type="file"
                accept="audio/*"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
              <GlowButton
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
              >
                <Upload className="w-4 h-4" /> Tải File
              </GlowButton>
            </div>

            {/* Audio player for original audio */}
            {localAudioUrl && (
              <div className="mt-4">
                <audio controls src={localAudioUrl} className="w-full" />
              </div>
            )}

            {/* Noise Filter Toggle */}
            <div className="mt-4 flex items-center space-x-2 p-3 bg-card/50 rounded-lg border border-border">
              <Switch
                id="noise-filter"
                checked={enableNoiseFilter}
                onCheckedChange={setEnableNoiseFilter}
              />
              <Label htmlFor="noise-filter" className="flex items-center gap-2 cursor-pointer">
                <Filter className="w-4 h-4" />
                Lọc nhiễu trước khi xử lý
              </Label>
            </div>
          </motion.div>

          {/* Processed Audio Output */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card p-6"
          >
            <h3 className="text-xl font-semibold mb-4">Kết Quả</h3>

            {/* Waveform Comparison - English labels in chart */}
            {waveformUrl ? (
              <div className="mb-4">
                <div className="h-64 flex items-center justify-center bg-card/50 rounded-lg overflow-hidden border border-border">
                  <img
                    src={waveformUrl}
                    alt="Waveform comparison"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            ) : (
              <div className="h-64 mb-4 flex items-center justify-center bg-card/30 rounded-lg border border-dashed border-border">
                <p className="text-sm text-muted-foreground text-center px-4">
                  Biểu đồ so sánh sẽ hiển thị sau khi xử lý
                </p>
              </div>
            )}

            {/* Processed Audio Player */}
            {processedUrl && (
              <div className="space-y-3">
                <audio controls src={processedUrl} className="w-full" />
                <GlowButton onClick={handleDownload} variant="outline" className="w-full">
                  <Download className="w-4 h-4" /> Tải Xuống
                </GlowButton>
              </div>
            )}
          </motion.div>
        </div>

        {/* Effects Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8"
        >
          <h3 className="text-lg font-semibold mb-4 text-center">Chọn Hiệu Ứng</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {effects.map((effect) => (
              <motion.button
                key={effect.id}
                onClick={() => setSelectedEffect(effect.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-4 rounded-xl border transition-all ${selectedEffect === effect.id
                  ? 'bg-primary/20 border-primary text-primary'
                  : 'bg-card/50 border-border hover:border-primary/50'
                  }`}
              >
                <div className="text-sm font-medium">{effect.name}</div>
              </motion.button>
            ))}
          </div>

          {/* Effect Parameters */}
          {(selectedEffect === 'echo' || selectedEffect === 'stutter') && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 p-4 bg-card/50 rounded-xl border border-border"
            >
              {selectedEffect === 'echo' && (
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium">Độ trễ (giây):</label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={echoDelay}
                    onChange={(e) => setEchoDelay(parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm w-12">{echoDelay}s</span>
                </div>
              )}
              {selectedEffect === 'stutter' && (
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium">Số lần lặp:</label>
                  <input
                    type="range"
                    min="2"
                    max="10"
                    step="1"
                    value={stutterRepeat}
                    onChange={(e) => setStutterRepeat(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm w-12">{stutterRepeat}x</span>
                </div>
              )}
            </motion.div>
          )}

          {audioBlob && (
            <div className="mt-6 text-center">
              <GlowButton
                onClick={handleApplyEffect}
                isLoading={isProcessing}
                size="lg"
              >
                <Wand2 className="w-5 h-5" />
                Áp Dụng Hiệu Ứng
              </GlowButton>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};
