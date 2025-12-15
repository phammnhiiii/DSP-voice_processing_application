import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { GlowButton } from '../ui/GlowButton';

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 bg-background">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            <span className="gradient-text">Biến Đổi</span>
            <br />
            <span className="text-foreground">Giọng Nói Của Bạn</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
          >
            Nền tảng xử lý âm thanh chuyên nghiệp. Biến đổi giọng nói,
            lọc nhiễu, chuyển đổi văn bản ↔ giọng nói trong thời gian thực.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <GlowButton size="lg" className="w-full sm:w-auto">
              <Play className="w-5 h-5" />
              Bắt Đầu Ngay
            </GlowButton>
            <GlowButton variant="outline" size="lg" className="w-full sm:w-auto">
              Xem Demo
            </GlowButton>
          </motion.div>

          {/* Animated waveform decoration */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-16 flex items-center justify-center gap-1"
          >
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-gradient-to-t from-primary to-secondary rounded-full"
                animate={{
                  height: [20, Math.random() * 60 + 20, 20],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.05,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
