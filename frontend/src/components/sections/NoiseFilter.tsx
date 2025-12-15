import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Filter, Play, Square, Download, Volume2 } from 'lucide-react';
import { GlowButton } from '../ui/GlowButton';
import { AudioVisualizer } from '../ui/AudioVisualizer';
import { Slider } from '../ui/slider';

type FilterType = 'noise' | 'echo' | 'music' | 'siren';

const filters: { id: FilterType; name: string; description: string }[] = [
  { id: 'noise', name: 'Lọc Nhiễu', description: 'Loại bỏ tiếng ồn nền' },
  { id: 'echo', name: 'Khử Vọng', description: 'Giảm tiếng vọng' },
  { id: 'music', name: 'Tách Nhạc', description: 'Loại bỏ âm nhạc nền' },
  { id: 'siren', name: 'Lọc Còi', description: 'Lọc tiếng còi, chuông' },
];

export const NoiseFilter = () => {
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('noise');
  const [intensity, setIntensity] = useState(50);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      const url = URL.createObjectURL(uploadedFile);
      setAudioUrl(url);
      setProcessedUrl(null);
    }
  };

  const applyFilter = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    
    // Simulate processing (in real app, this would be actual audio processing)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // For demo, we'll apply a simple filter using Web Audio API
    const audioContext = new AudioContext();
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    const offlineContext = new OfflineAudioContext(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate
    );
    
    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;
    
    // Apply different filters based on selection
    let filterNode: BiquadFilterNode;
    
    switch (selectedFilter) {
      case 'noise':
        filterNode = offlineContext.createBiquadFilter();
        filterNode.type = 'lowpass';
        filterNode.frequency.value = 3000 + (100 - intensity) * 50;
        break;
      case 'echo':
        filterNode = offlineContext.createBiquadFilter();
        filterNode.type = 'highpass';
        filterNode.frequency.value = 200 + intensity * 5;
        break;
      case 'music':
        filterNode = offlineContext.createBiquadFilter();
        filterNode.type = 'bandpass';
        filterNode.frequency.value = 1000;
        filterNode.Q.value = intensity / 10;
        break;
      case 'siren':
        filterNode = offlineContext.createBiquadFilter();
        filterNode.type = 'notch';
        filterNode.frequency.value = 800;
        filterNode.Q.value = intensity / 5;
        break;
    }
    
    source.connect(filterNode);
    filterNode.connect(offlineContext.destination);
    source.start();
    
    const renderedBuffer = await offlineContext.startRendering();
    
    // Convert to blob
    const wavBlob = audioBufferToWav(renderedBuffer);
    const url = URL.createObjectURL(wavBlob);
    setProcessedUrl(url);
    setIsProcessing(false);
  };

  const playAudio = (url: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    const audio = new Audio(url);
    audioRef.current = audio;
    
    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;
    
    const source = audioContext.createMediaElementSource(audio);
    const analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 256;
    
    source.connect(analyserNode);
    analyserNode.connect(audioContext.destination);
    
    setAnalyser(analyserNode);
    
    audio.onended = () => setIsPlaying(false);
    audio.play();
    setIsPlaying(true);
  };

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return (
    <section id="lọc-nhiễu" className="py-24 relative bg-gradient-to-b from-background to-card/30">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">
            <span className="gradient-text">Lọc Nhiễu Âm Thanh</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Loại bỏ tiếng ồn, tiếng vọng, nhạc nền và các âm thanh không mong muốn 
            khỏi file ghi âm của bạn.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {/* Upload Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8 mb-8"
          >
            <label className="block cursor-pointer">
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-12 text-center transition-colors">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">
                  {file ? file.name : 'Kéo thả hoặc nhấn để tải file'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Hỗ trợ MP3, WAV, OGG, FLAC
                </p>
              </div>
            </label>
          </motion.div>

          {audioUrl && (
            <>
              {/* Visualizer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-6 mb-8"
              >
                <AudioVisualizer
                  analyser={analyser}
                  isActive={isPlaying}
                  variant="waveform"
                  className="h-32"
                />
              </motion.div>

              {/* Filter Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
              >
                {filters.map((filter) => (
                  <motion.button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-xl border transition-all text-left ${
                      selectedFilter === filter.id
                        ? 'bg-primary/20 border-primary'
                        : 'bg-card/50 border-border hover:border-primary/50'
                    }`}
                  >
                    <Filter className={`w-5 h-5 mb-2 ${
                      selectedFilter === filter.id ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                    <div className="font-medium">{filter.name}</div>
                    <div className="text-xs text-muted-foreground">{filter.description}</div>
                  </motion.button>
                ))}
              </motion.div>

              {/* Intensity Slider */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-6 mb-8"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-primary" />
                    Cường Độ Lọc
                  </span>
                  <span className="text-primary font-mono">{intensity}%</span>
                </div>
                <Slider
                  value={[intensity]}
                  onValueChange={(value) => setIntensity(value[0])}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </motion.div>

              {/* Controls */}
              <div className="flex flex-wrap justify-center gap-4">
                <GlowButton
                  onClick={() => playAudio(audioUrl)}
                  disabled={isPlaying}
                  variant="outline"
                >
                  <Play className="w-4 h-4" /> Phát Gốc
                </GlowButton>
                
                <GlowButton
                  onClick={applyFilter}
                  isLoading={isProcessing}
                >
                  <Filter className="w-4 h-4" /> Áp Dụng Bộ Lọc
                </GlowButton>

                {processedUrl && (
                  <>
                    <GlowButton
                      onClick={() => playAudio(processedUrl)}
                      variant="secondary"
                    >
                      <Play className="w-4 h-4" /> Phát Đã Lọc
                    </GlowButton>
                    <GlowButton
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = processedUrl;
                        a.download = 'filtered-audio.wav';
                        a.click();
                      }}
                      variant="outline"
                    >
                      <Download className="w-4 h-4" /> Tải Xuống
                    </GlowButton>
                  </>
                )}

                {isPlaying && (
                  <GlowButton onClick={stopPlayback} variant="accent">
                    <Square className="w-4 h-4" /> Dừng
                  </GlowButton>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

// Helper function
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const bufferArray = new ArrayBuffer(length);
  const view = new DataView(bufferArray);
  const channels: Float32Array[] = [];
  let offset = 0;
  let pos = 0;

  const setUint16 = (data: number) => {
    view.setUint16(pos, data, true);
    pos += 2;
  };
  const setUint32 = (data: number) => {
    view.setUint32(pos, data, true);
    pos += 4;
  };

  setUint32(0x46464952);
  setUint32(length - 8);
  setUint32(0x45564157);
  setUint32(0x20746d66);
  setUint32(16);
  setUint16(1);
  setUint16(numOfChan);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * numOfChan);
  setUint16(numOfChan * 2);
  setUint16(16);
  setUint32(0x61746164);
  setUint32(length - pos - 4);

  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (offset < buffer.length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([bufferArray], { type: 'audio/wav' });
}
