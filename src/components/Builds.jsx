import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import buildsData from '../data/builds.json';

const categories = ['All', 'Metal', 'Wood', 'Sketches'];

export default function Builds() {
    const [activeTab, setActiveTab] = useState('All');

    const filteredBuilds = activeTab === 'All'
        ? buildsData
        : buildsData.filter(b => b.category === activeTab);

    return (
        <section id="builds" className="py-24 bg-muted-gray/30 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#dde3e6_100%)] opacity-60 pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-20"
                >
                    <span className="text-accent font-display tracking-[0.4em] uppercase text-sm mb-2 block">CREATIVE PROJECTS</span>
                    <h2 className="text-7xl md:text-9xl tracking-tighter mb-12">CRAFTS</h2>

                    <div className="flex flex-wrap gap-4">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveTab(cat)}
                                className={`px-8 py-2 rounded-full font-display uppercase tracking-widest border transition-all duration-200 ${activeTab === cat
                                        ? 'bg-accent border-accent text-white scale-105 shadow-lg shadow-accent/30'
                                        : 'border-accent/20 bg-background text-off-white/60 hover:border-accent hover:text-off-white'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredBuilds.map((build) => (
                            <motion.div
                                key={build.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                                className="group rounded-3xl p-4 bg-muted-gray/20 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="aspect-square bg-muted-gray mb-6 overflow-hidden rounded-2xl relative">
                                    <img
                                        src={build.imageUrl}
                                        alt={build.title}
                                        className="w-full h-full object-contain grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105"
                                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=800"; }}
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-accent/90 text-white text-[10px] px-2 py-0.5 rounded-full uppercase font-display tracking-widest">
                                            {build.category}
                                        </span>
                                    </div>
                                </div>

                                <h3 className="text-2xl mb-2 group-hover:text-accent transition-colors">{build.title}</h3>
                                <p className="text-off-white/40 text-sm leading-relaxed">
                                    {build.description}
                                </p>

                                <div className="mt-6 flex justify-end">
                                    <div className="w-8 h-[1px] bg-accent/30 group-hover:w-16 transition-all duration-300" />
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            </div>
        </section>
    );
}
