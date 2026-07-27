import { motion } from 'framer-motion';
import { Github, Linkedin, ArrowUpRight } from 'lucide-react';

export default function Contact() {
    return (
        <footer id="contact" className="bg-background pt-24 pb-12 overflow-hidden relative">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="grid md:grid-cols-2 gap-16 mb-24"
                >
                    <div>
                        <h2 className="text-7xl md:text-9xl mb-12 tracking-tighter">SAY <br /> <span className="text-accent">HELLO.</span></h2>
                        <p className="text-2xl text-off-white/60 font-display uppercase tracking-widest max-w-sm mb-12">
                            Always happy to hear from people who like building things too.
                        </p>

                        <a
                            href="mailto:emilieyyu@gmail.com"
                            className="group flex items-center gap-4 font-display text-4xl hover:text-accent transition-colors underline decoration-2 underline-offset-8"
                        >
                            EMILIEYYU@GMAIL.COM
                            <ArrowUpRight className="text-accent group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" size={40} />
                        </a>
                    </div>

                    <div className="flex flex-col justify-end items-start md:items-end gap-8">
                        <div className="flex gap-4">
                            <a href="https://github.com/emilieyyu" target="_blank" rel="noopener noreferrer" className="p-4 rounded-full bg-muted-gray/40 text-off-white/70 hover:bg-accent hover:text-white transition-colors duration-200">
                                <Github size={32} strokeWidth={1.5} />
                            </a>
                            <a href="https://linkedin.com/in/emilieyyu" target="_blank" rel="noopener noreferrer" className="p-4 rounded-full bg-muted-gray/40 text-off-white/70 hover:bg-accent hover:text-white transition-colors duration-200">
                                <Linkedin size={32} strokeWidth={1.5} />
                            </a>
                        </div>
                        <div className="text-right">
                            <span className="block text-accent font-display tracking-widest text-sm uppercase mb-2 italic">Based in the PNW</span>
                            <span className="text-off-white/20 font-display text-[8rem] leading-[0.7] select-none pointer-events-none hidden md:block">
                                2026
                            </span>
                        </div>
                    </div>
                </motion.div>

                <div className="pt-8 border-t border-accent/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase font-display tracking-[0.5em] text-off-white/20">
                    <div>&copy; EMILIE YU. ALL RIGHTS RESERVED.</div>
                    <div>EST. 1994 // CRAFTED WITH CARE</div>
                </div>
            </div>
        </footer>
    );
}
