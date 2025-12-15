import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface AudioVisualizerProps {
  analyser: AnalyserNode | null;
  isActive: boolean;
  variant?: 'bars' | 'waveform';
  className?: string;
}

export const AudioVisualizer = ({ 
  analyser, 
  isActive, 
  variant = 'bars',
  className = '' 
}: AudioVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!canvasRef.current || !analyser || !isActive) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgba(10, 12, 16, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (variant === 'bars') {
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
          
          const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
          gradient.addColorStop(0, 'hsl(187, 100%, 50%)');
          gradient.addColorStop(0.5, 'hsl(280, 100%, 60%)');
          gradient.addColorStop(1, 'hsl(320, 100%, 60%)');
          
          ctx.fillStyle = gradient;
          ctx.shadowBlur = 15;
          ctx.shadowColor = 'hsl(187, 100%, 50%)';
          
          ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
          x += barWidth;
        }
      } else {
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'hsl(187, 100%, 50%)';
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'hsl(187, 100%, 50%)';
        ctx.beginPath();

        const sliceWidth = canvas.width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * canvas.height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyser, isActive, variant]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`relative overflow-hidden rounded-lg ${className}`}
    >
      <canvas
        ref={canvasRef}
        width={800}
        height={200}
        className="w-full h-full bg-card/50"
      />
      {!isActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-card/80">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-primary rounded-full"
                animate={{
                  height: [20, 40, 20],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
