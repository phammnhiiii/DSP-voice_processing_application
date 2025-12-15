import { motion } from 'framer-motion';
import { Waves, Github, Twitter, Mail } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="relative py-16 border-t border-border/30">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <motion.div
              className="flex items-center gap-3 mb-4"
              whileHover={{ scale: 1.02 }}
            >
              <Waves className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold gradient-text">VoiceLab Pro</span>
            </motion.div>
            <p className="text-muted-foreground max-w-md mb-6">
              Nền tảng xử lý âm thanh chuyên nghiệp với công nghệ AI tiên tiến. 
              Biến đổi, lọc nhiễu và chuyển đổi giọng nói một cách dễ dàng.
            </p>
            <div className="flex gap-4">
              {[Github, Twitter, Mail].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-10 h-10 rounded-lg bg-card flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Tính Năng</h4>
            <ul className="space-y-2">
              {['Biến đổi giọng', 'Lọc nhiễu', 'Text to Speech', 'Speech to Text'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Hỗ Trợ</h4>
            <ul className="space-y-2">
              {['Tài liệu', 'API', 'Liên hệ', 'FAQ'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 VoiceLab Pro. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Điều khoản</a>
            <a href="#" className="hover:text-primary transition-colors">Bảo mật</a>
            <a href="#" className="hover:text-primary transition-colors">Cookie</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
