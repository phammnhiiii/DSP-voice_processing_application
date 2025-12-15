import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Play, Square, Wand2, Download, Upload, Image } from 'lucide-react';
import { GlowButton } from '../ui/GlowButton';
import { AudioVisualizer } from '../ui/AudioVisualizer';
import { useAudioProcessor, VoiceEffect } from '@/hooks/useAudioProcessor';
import { DSP_EFFECTS } from '@/api';

// Use DSP backend effects
const effects = DSP_EFFECTS;

export const VoiceTransformer = () => {
  const [selectedEffect, setSelectedEffect] = useState<VoiceEffect>('chipmunk');
  const [isProcessing, setIsProcessing] = useState(false);
  const [echoDelay, setEchoDelay] = useState(0.2);
  const [stutterRepeat, setStutterRepeat] = useState(3);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
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
  } = useAudioProcessor();

  const handleApplyEffect = async () => {
    setIsProcessing(true);
    try {
      await applyEffect(selectedEffect, echoDelay, stutterRepeat);
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
            Ghi âm giọng nói hoặc tải file audio và áp dụng các hiệu ứng DSP mạnh mẽ
            được xử lý trên server.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Original Audio */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card p-6"
          >
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Mic className="w-5 h-5 text-primary" />
              Âm Thanh Gốc
            </h3>

            <AudioVisualizer
              analyser={analyser}
              isActive={isRecording || isPlaying}
              className="h-40 mb-6"
            />

            <div className="flex flex-wrap gap-3">
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

              {audioBlob && (
                <GlowButton
                  onClick={isPlaying ? stopPlayback : playOriginal}
                  variant="outline"
                >
                  {isPlaying ? (
                    <>
                      <Square className="w-4 h-4" /> Dừng
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" /> Phát
                    </>
                  )}
                </GlowButton>
              )}
            </div>

            {audioBlob && (
              <p className="mt-3 text-sm text-muted-foreground">
                ✅ Đã sẵn sàng: {audioBlob instanceof File ? audioBlob.name : 'Đã ghi âm'}
              </p>
            )}
          </motion.div>

          {/* Processed Audio */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card p-6"
          >
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-secondary" />
              Âm Thanh Đã Xử Lý
            </h3>

            {waveformUrl ? (
              <div className="h-40 mb-6 flex items-center justify-center bg-card/50 rounded-lg overflow-hidden">
                <img
                  src={waveformUrl}
                  alt="Waveform"
                  className="w-full h-full object-contain mix-blend-normal dark:invert"
                />
              </div>
            ) : (
              <AudioVisualizer
                analyser={processedAnalyser}
                isActive={isPlaying && !!processedUrl}
                className="h-40 mb-6"
              />
            )}

            <div className="flex flex-wrap gap-3">
              {processedUrl && (
                <>
                  <GlowButton
                    onClick={isPlaying ? stopPlayback : playProcessed}
                    variant="secondary"
                  >
                    {isPlaying ? (
                      <>
                        <Square className="w-4 h-4" /> Dừng
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" /> Phát
                      </>
                    )}
                  </GlowButton>
                  <GlowButton onClick={handleDownload} variant="outline">
                    <Download className="w-4 h-4" /> Tải Xuống
                  </GlowButton>
                </>
              )}
            </div>

            {processedUrl && (
              <audio controls src={processedUrl} className="w-full mt-4" />
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
          <h3 className="text-lg font-semibold mb-4 text-center">Chọn Hiệu Ứng DSP</h3>
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
                <div className="text-2xl mb-2">{effect.icon}</div>
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
                  <label className="text-sm font-medium">Delay (giây):</label>
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
                  <label className="text-sm font-medium">Lặp lại:</label>
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
