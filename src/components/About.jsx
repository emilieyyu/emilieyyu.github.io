import { motion } from 'framer-motion';

export default function About() {
    return (
        <section id="about" className="py-24 bg-background relative overflow-hidden">
            {/* Angled Divider Top */}
            <div className="absolute top-0 left-0 w-full h-32 bg-muted-gray/40 -skew-y-2 z-0 origin-top-left" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    {/* Photo Side */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="aspect-[4/5] bg-muted-gray overflow-hidden rounded-3xl shadow-xl shadow-black/10 relative">
                            <img
                                src="/images/about/portrait.jpg"
                                alt="Emilie Yu"
                                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                                onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1551632432-c735e7a33a11?auto=format&fit=crop&q=80&w=800"; }}
                            />
                            <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-accent opacity-20 blur-3xl rounded-full pointer-events-none" />
                        </div>
                    </motion.div>

                    {/* Text Side */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-6xl md:text-8xl mb-8">
                            Precision & <br />
                            <span className="text-accent">Curiosity.</span>
                        </h2>

                        <p className="text-xl text-off-white/80 leading-relaxed max-w-xl">
                            I’m a software engineer based in the Pacific Northwest, but when I'm not at my keyboard, I'm usually balancing two very different worlds. Half of my time is spent outdoors—hiking up peaks, snowboarding, and training at the gym for the occasional half marathon. The other half goes into quiet, focused hobbies: assembling intricate scale models, building LEGO, and playing piano. I love the contrast of pushing myself in the mountains one day, and spending hours patiently focusing on tiny details the next.
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
