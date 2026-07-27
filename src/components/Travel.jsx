import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Images } from 'lucide-react';
import travelData from '../data/travel.json';

function TravelCard({ item, index, onOpen }) {
    const previewImages = item.previewImages ?? item.images.slice(0, 4);

    return (
        <motion.button
            type="button"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.12 }}
            onClick={() => onOpen(item)}
            className="group relative aspect-[16/10] overflow-hidden rounded-3xl bg-black text-left w-full cursor-pointer shadow-md hover:shadow-xl transition-shadow duration-300"
        >
            <img
                src={item.coverImageUrl}
                alt={item.location}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                    e.target.src = `https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=800&sig=${index}`;
                }}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/40 backdrop-blur-md rounded-full px-3 py-1.5 text-xs font-display uppercase tracking-widest text-white/90">
                <Images size={14} />
                {item.images.length}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="text-accent font-display uppercase tracking-widest text-sm mb-1">{item.country}</div>
                <h3 className="text-3xl md:text-4xl font-display uppercase mb-2 text-white">{item.location}</h3>
                <div className="text-white/60 text-sm uppercase tracking-widest mb-4">{item.date}</div>

                <div className="flex gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                    {previewImages.map((src, i) => (
                        <div
                            key={src}
                            className="h-12 w-[4.5rem] md:h-14 md:w-20 overflow-hidden rounded-xl ring-1 ring-white/20 shrink-0"
                            style={{ transform: `translateY(${i % 2 === 0 ? '0' : '-4px'})` }}
                        >
                            <img src={src} alt="" className="w-full h-full object-cover" />
                        </div>
                    ))}
                    {item.images.length > previewImages.length && (
                        <div className="h-12 w-12 md:h-14 md:w-14 flex items-center justify-center rounded-xl ring-1 ring-white/20 bg-black/40 text-xs font-display uppercase tracking-widest text-white/70 shrink-0">
                            +{item.images.length - previewImages.length}
                        </div>
                    )}
                </div>
            </div>
        </motion.button>
    );
}

function TravelGallery({ trip, onClose }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        setCurrentIndex(0);
    }, [trip]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') {
                setCurrentIndex((prev) => (prev - 1 + trip.images.length) % trip.images.length);
            }
            if (e.key === 'ArrowRight') {
                setCurrentIndex((prev) => (prev + 1) % trip.images.length);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [trip, onClose]);

    const goPrev = () => setCurrentIndex((prev) => (prev - 1 + trip.images.length) % trip.images.length);
    const goNext = () => setCurrentIndex((prev) => (prev + 1) % trip.images.length);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-[#14141a]/90 backdrop-blur-lg flex flex-col items-center justify-center p-4 md:p-8 select-none"
            onClick={onClose}
        >
            <div
                className="relative max-w-5xl w-full flex flex-col items-center gap-6"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Image Contained Frame */}
                <div className="relative w-full aspect-video md:aspect-[16/10] bg-black/40 rounded-3xl flex items-center justify-center overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={currentIndex}
                            src={trip.images[currentIndex]}
                            alt={`${trip.location} — photo ${currentIndex + 1}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => {
                                e.target.src = "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=800";
                            }}
                        />
                    </AnimatePresence>

                    {/* Close button inside frame */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-4 right-4 z-20 bg-white/10 hover:bg-accent border border-white/10 p-2 rounded-full text-white hover:text-white transition-colors duration-200 cursor-pointer"
                        aria-label="Close gallery"
                    >
                        <X size={24} />
                    </button>

                    {trip.images.length > 1 && (
                        <>
                            <button
                                type="button"
                                onClick={goPrev}
                                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-accent border border-white/10 p-3 rounded-full text-white transition-colors duration-200 cursor-pointer"
                                aria-label="Previous photo"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                type="button"
                                onClick={goNext}
                                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-accent border border-white/10 p-3 rounded-full text-white transition-colors duration-200 cursor-pointer"
                                aria-label="Next photo"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </>
                    )}
                </div>

                {/* Caption Details */}
                <div className="w-full text-left">
                    <span className="text-accent font-display uppercase tracking-widest text-[10px] mb-1 block">
                        {trip.country}
                    </span>
                    <div className="flex justify-between items-baseline mb-2">
                        <h3 className="text-3xl font-display uppercase text-white">
                            {trip.location}
                        </h3>
                        <span className="text-white/40 text-xs font-display tracking-widest uppercase ml-4">
                            {trip.date} · {currentIndex + 1} / {trip.images.length}
                        </span>
                    </div>

                    {trip.description && (
                         <p className="text-sm md:text-base text-white/70 leading-relaxed max-w-2xl mt-2 font-light">
                             {trip.description}
                         </p>
                    )}
                </div>

                {/* Thumbnails */}
                {trip.images.length > 1 && (
                    <div className="w-full overflow-x-auto py-2 flex gap-2 justify-center scrollbar-hide">
                        {trip.images.map((src, idx) => (
                            <button
                                key={src}
                                type="button"
                                onClick={() => setCurrentIndex(idx)}
                                className={`h-12 w-18 md:h-14 md:w-20 shrink-0 overflow-hidden rounded-xl transition-all duration-200 cursor-pointer ${
                                    idx === currentIndex
                                        ? 'ring-2 ring-accent opacity-100 scale-105'
                                        : 'opacity-40 hover:opacity-85'
                                }`}
                            >
                                <img src={src} alt="" className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

export default function Travel() {
    const [selectedTrip, setSelectedTrip] = useState(null);

    return (
        <section id="travel" className="py-24 bg-background overflow-hidden">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex justify-between items-end mb-16"
                >
                    <div>
                        <span className="text-accent font-display tracking-[0.4em] uppercase text-sm mb-2 block">PLACES VISITED</span>
                        <h2 className="text-7xl md:text-9xl tracking-tighter">TRAVELS</h2>
                    </div>
                    <p className="text-right text-off-white/40 max-w-xs font-display uppercase tracking-widest hidden md:block">
                        Tap a spot to flip through the album.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {travelData.map((item, i) => (
                        <TravelCard key={item.id} item={item} index={i} onOpen={setSelectedTrip} />
                    ))}
                </div>
            </div>

            <AnimatePresence>
                {selectedTrip && (
                    <TravelGallery trip={selectedTrip} onClose={() => setSelectedTrip(null)} />
                )}
            </AnimatePresence>
        </section>
    );
}
