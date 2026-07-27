import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

// Topographic contour lines — nods to the hiking/mountain theme
const contours = [
    "M -100 120 C 200 40, 500 200, 800 100 S 1300 60, 1600 140",
    "M -100 220 C 250 140, 550 300, 850 200 S 1350 160, 1600 240",
    "M -100 620 C 200 700, 500 560, 800 660 S 1300 720, 1600 640",
    "M -100 720 C 250 800, 550 660, 850 760 S 1350 820, 1600 740",
    "M -100 820 C 200 900, 500 760, 800 860 S 1300 920, 1600 840",
];

export default function Hero() {
    return (
        <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-background">
            {/* Topographic Contour Lines */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <svg width="100%" height="100%" className="absolute inset-0 opacity-[0.15]" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
                    {contours.map((d, i) => (
                        <motion.path
                            key={i}
                            d={d}
                            fill="none"
                            stroke="#2b6cb0"
                            strokeWidth="1.5"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 2, delay: i * 0.15, ease: "easeInOut" }}
                        />
                    ))}
                </svg>
            </div>

            {/* Content */}
            <div className="container mx-auto px-6 z-10 flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center"
                >
                    <h1 className="text-[clamp(4rem,15vw,12rem)] leading-[0.8] mb-4">
                        EMILIE <br />
                        <span className="text-accent">YU</span>
                    </h1>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="flex flex-wrap justify-center gap-4 text-2xl md:text-3xl font-display uppercase tracking-[0.2em] text-off-white/80"
                    >
                        <span>Software Engineer</span>
                        <span className="text-accent text-sm md:text-base self-center opacity-40">/</span>
                        <span>Adventurer</span>
                    </motion.div>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 text-accent cursor-pointer z-10"
                onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
            >
                <ChevronDown size={48} strokeWidth={1} />
            </motion.div>
        </section>
    );
}
