import { motion } from 'framer-motion';

export const LegalSection = () => {
    return (
        <section id="terms" className="py-16 border-t border-border/30">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="glass-card p-8"
                >
                    <h2 className="text-xl font-semibold mb-6">Điều Khoản Sử Dụng & Pháp Lý</h2>

                    <div className="space-y-4 text-sm text-muted-foreground">
                        <p>
                            <strong className="text-foreground">1. Quyền sở hữu giọng nói:</strong> Giọng nói của mỗi người là tài sản cá nhân được bảo vệ theo pháp luật.
                            Việc sao chép, sử dụng giọng nói của người khác mà không có sự đồng ý vi phạm quyền nhân thân và có thể bị truy cứu trách nhiệm hình sự.
                        </p>

                        <p>
                            <strong className="text-foreground">2. Mục đích sử dụng:</strong> Công cụ này chỉ được sử dụng cho mục đích hợp pháp như:
                            tạo nội dung cá nhân, giáo dục, giải trí với giọng nói của chính bạn hoặc có sự cho phép.
                        </p>

                        <p>
                            <strong className="text-foreground">3. Nghiêm cấm:</strong> Sử dụng để lừa đảo, mạo danh, phát tán thông tin sai lệch,
                            quấy rối, hoặc bất kỳ hành vi bất hợp pháp nào khác.
                        </p>

                        <p>
                            <strong className="text-foreground">4. Trách nhiệm:</strong> Người dùng hoàn toàn chịu trách nhiệm về việc sử dụng công cụ này.
                            Chúng tôi không chịu trách nhiệm cho bất kỳ thiệt hại nào phát sinh từ việc sử dụng sai mục đích.
                        </p>

                        <p>
                            <strong className="text-foreground">5. Luật áp dụng:</strong> Tuân thủ theo Bộ luật Dân sự 2015,
                            Luật Sở hữu trí tuệ 2005 (sửa đổi 2022), và các quy định pháp luật hiện hành của Việt Nam.
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
