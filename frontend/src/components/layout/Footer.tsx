import { motion } from 'framer-motion';
import { Waves, Github, Twitter, Mail } from 'lucide-react';

// ==========================================
// TÙY CHỈNH FOOTER TẠI ĐÂY
// ==========================================
const FOOTER_CONFIG = {
  // Tên thương hiệu
  brandName: 'VoiceLab Pro',

  // Mô tả ngắn
  description: 'Nền tảng xử lý âm thanh chuyên nghiệp. Biến đổi, lọc nhiễu và chuyển đổi giọng nói một cách dễ dàng.',

  // Năm bản quyền
  copyrightYear: 2024,

  // Links mạng xã hội (thay # bằng URL thực)
  socialLinks: {
    github: '#',    // VD: 'https://github.com/yourusername'
    twitter: '#',   // VD: 'https://twitter.com/yourusername'
    email: '#',     // VD: 'mailto:your@email.com'
  },
};
// ==========================================

const footerLinks = [
  { label: 'Biến Đổi Giọng', href: '#transformer' },
  { label: 'Lọc Nhiễu', href: '#noise-filter' },
  { label: 'Text to Speech', href: '#text-to-speech' },
  { label: 'Speech to Text', href: '#speech-to-text' },
];

export const Footer = () => {
  return (
    <footer className="relative py-16 border-t border-border/30">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <motion.a
              href="#"
              className="flex items-center gap-3 mb-4"
              whileHover={{ scale: 1.02 }}
            >
              <Waves className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold gradient-text">{FOOTER_CONFIG.brandName}</span>
            </motion.a>
            <p className="text-muted-foreground max-w-md mb-6">
              {FOOTER_CONFIG.description}
            </p>
            <div className="flex gap-4">
              <motion.a
                href={FOOTER_CONFIG.socialLinks.github}
                whileHover={{ scale: 1.1, y: -2 }}
                className="w-10 h-10 rounded-lg bg-card flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              >
                <Github className="w-5 h-5" />
              </motion.a>
              <motion.a
                href={FOOTER_CONFIG.socialLinks.twitter}
                whileHover={{ scale: 1.1, y: -2 }}
                className="w-10 h-10 rounded-lg bg-card flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </motion.a>
              <motion.a
                href={FOOTER_CONFIG.socialLinks.email}
                whileHover={{ scale: 1.1, y: -2 }}
                className="w-10 h-10 rounded-lg bg-card flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              >
                <Mail className="w-5 h-5" />
              </motion.a>
            </div>
          </div>

          {/* Links - matching header exactly */}
          <div>
            <h4 className="font-semibold mb-4">Tính Năng</h4>
            <ul className="space-y-2">
              {footerLinks.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="text-muted-foreground hover:text-primary transition-colors">
                    {item.label}
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
            © {FOOTER_CONFIG.copyrightYear} {FOOTER_CONFIG.brandName}. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            {/* Link điều khoản sử dụng - quan trọng cho voice clone */}
            <a href="#terms" className="hover:text-primary transition-colors">Điều khoản sử dụng</a>
            <a href="#" className="hover:text-primary transition-colors">Bảo mật</a>
            <a href="#" className="hover:text-primary transition-colors">Cookie</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
