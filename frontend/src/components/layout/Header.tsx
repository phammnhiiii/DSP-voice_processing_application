import { motion } from 'framer-motion';
import { Mic, Waves } from 'lucide-react';

export const Header = () => {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/30"
    >
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <motion.div
          className="flex items-center gap-3"
          whileHover={{ scale: 1.02 }}
        >
          <div className="relative">
            <Waves className="w-8 h-8 text-primary" />
            <motion.div
              className="absolute inset-0 w-8 h-8 bg-primary/30 rounded-full blur-lg"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <span className="text-xl font-bold gradient-text">VoiceLab Pro</span>
        </motion.div>

        <nav className="hidden md:flex items-center gap-8">
          {['Transformer', 'Lọc Nhiễu', 'Text-to-Speech', 'Speech-to-Text'].map((item, i) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-muted-foreground hover:text-primary transition-colors relative group"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
            </motion.a>
          ))}
        </nav>

        <motion.div
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30"
          whileHover={{ scale: 1.05 }}
        >
          <Mic className="w-4 h-4 text-primary" />
          <span className="text-sm text-primary font-medium">Studio</span>
        </motion.div>
      </div>
    </motion.header>
  );
};
