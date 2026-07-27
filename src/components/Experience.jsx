import { motion } from 'framer-motion';
import expData from '../data/experience.json';

export default function Experience() {
    return (
        <section id="experience" className="py-24 bg-background overflow-hidden relative">
            {/* Background Graphic */}
            <div className="absolute -left-20 top-0 text-[20rem] font-bold text-accent/[0.02] select-none pointer-events-none rotate-90">
                TIMELINE
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-4xl mx-auto">
                    <span className="text-accent font-display tracking-[0.4em] uppercase text-sm mb-2 block text-center">WORK EXPERIENCE</span>
                    <h2 className="text-7xl md:text-9xl text-center mb-24 tracking-tighter">RESUME</h2>

                    <div className="space-y-24">
                        {expData.experience.map((job, i) => (
                            <motion.div
                                key={job.company}
                                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="relative grid md:grid-cols-[200px_1fr] gap-8 md:gap-16"
                            >
                                {/* Sidebar / Date */}
                                <div>
                                    <div className="font-display text-2xl text-accent">{job.dates}</div>
                                    <div className="h-[1px] w-12 bg-accent/30 mt-2" />
                                </div>

                                {/* Content */}
                                <div>
                                    <h3 className="text-4xl md:text-5xl mb-2">{job.company}</h3>
                                    <div className="text-accent font-display uppercase tracking-widest text-lg mb-6">{job.role}</div>

                                    <ul className="space-y-4">
                                        {job.bullets.map((bullet, j) => (
                                            <li key={j} className="flex items-start gap-4 text-off-white/70 leading-relaxed">
                                                <span className="text-accent mt-2 shrink-0">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                                                </span>
                                                {bullet}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Skills Section */}
                    <div className="mt-32 pt-24 border-t border-accent/10">
                        <h3 className="text-3xl font-display uppercase tracking-widest mb-12 text-center">Toolkit & Domains</h3>
                        <div className="grid md:grid-cols-3 gap-12">
                            {expData.skills.map((skillGroup) => (
                                <div key={skillGroup.category}>
                                    <h4 className="text-accent font-display tracking-[0.3em] uppercase text-sm mb-6 pb-2 border-b border-accent/20">
                                        {skillGroup.category}
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {skillGroup.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-3 py-1.5 rounded-full text-xs uppercase font-display bg-muted-gray/40 text-off-white/60 hover:bg-accent hover:text-white transition-colors duration-200"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
