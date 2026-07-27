import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Calendar, Mountain, ChevronLeft, ChevronRight } from 'lucide-react';
import hikesData from '../data/hikes.json';

// Placeholder key - user will need to replace this
mapboxgl.accessToken = 'pk.eyJ1IjoiZW1pbGlleXl1IiwiYSI6ImNtbXY2cmI5eDJmNWcycW9tOWhtNWU5dHMifQ.q2ZdUwh4erArkc6VSq-TiA';

export default function HikesMap() {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [selectedHike, setSelectedHike] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Reset image index when hike changes
    useEffect(() => {
        setCurrentImageIndex(0);
    }, [selectedHike]);

    useEffect(() => {
        if (map.current) return;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/dark-v11',
            center: [-121.7603, 46.8523], // Rainier center
            zoom: 6,
            pitch: 45,
            cooperativeGestures: true
        });

        // Close details panel when clicking empty space on the map
        map.current.on('click', () => {
            setSelectedHike(null);
        });

        hikesData.forEach((hike) => {
            const el = document.createElement('div');
            el.className = 'marker cursor-pointer flex items-center justify-center';
            el.innerHTML = `<div class="w-4 h-4 bg-accent rounded-full border-2 border-white animate-pulse"></div>`;

            new mapboxgl.Marker(el)
                .setLngLat(hike.coordinates)
                .addTo(map.current);

            el.addEventListener('click', (e) => {
                e.stopPropagation(); // Avoid triggering map click handler
                setSelectedHike(hike);
                map.current.flyTo({
                    center: hike.coordinates,
                    zoom: 10,
                    essential: true
                });
            });
        });

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []);

    return (
        <section id="hikes" className="py-24 bg-background relative">
            <div className="container mx-auto px-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex justify-between items-end mb-16"
                >
                    <div>
                        <span className="text-accent font-display tracking-[0.4em] uppercase text-sm mb-2 block">TRAIL LOG</span>
                        <h2 className="text-7xl md:text-9xl tracking-tighter">HIKES</h2>
                    </div>
                    <p className="text-right text-off-white/40 max-w-xs font-display uppercase tracking-widest hidden md:block">
                        Click a marker on the map to explore the trail.
                    </p>
                </motion.div>

                {/* Map Frame Container */}
                <div className="relative h-[65vh] w-full rounded-3xl bg-muted-gray/5 shadow-xl shadow-black/10 overflow-hidden">
                    <div ref={mapContainer} className="w-full h-full" />

                    {/* Overlay Title */}
                    <div className="absolute top-6 left-6 z-10 pointer-events-none">
                        <h2 className="text-4xl md:text-6xl text-off-white/10 select-none font-display">PACIFIC NORTHWEST</h2>
                    </div>

                    {/* Hike Side Panel / Modal */}
                    <AnimatePresence>
                        {selectedHike && (
                            <motion.div
                                initial={{ x: '105%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '105%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="absolute top-0 right-0 h-full w-full md:w-[450px] bg-background/95 backdrop-blur-xl z-[1100] shadow-2xl p-8 overflow-y-auto"
                            >
                                <button
                                    onClick={() => setSelectedHike(null)}
                                    className="absolute top-6 right-6 text-accent hover:rotate-90 transition-transform duration-300 z-[1200] cursor-pointer"
                                    aria-label="Close details"
                                >
                                    <X size={32} />
                                </button>

                                <div className="mt-12">
                                    <span className="text-accent font-display tracking-[0.3em] uppercase text-sm mb-2 block">TRAIL DETAILS</span>
                                    <h3 className="text-5xl mb-6">{selectedHike.name}</h3>

                                    <div className="flex flex-wrap gap-4 mb-8">
                                        <div className="flex items-center gap-2 text-off-white/60">
                                            <Calendar size={16} className="text-accent" />
                                            <span className="text-sm uppercase font-display">{selectedHike.date}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-off-white/60">
                                            <Mountain size={16} className="text-accent" />
                                            <span className="text-sm uppercase font-display">{selectedHike.elevation}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-off-white/60">
                                            <MapPin size={16} className="text-accent" />
                                            <span className="text-sm uppercase font-display">{selectedHike.distance}</span>
                                        </div>
                                    </div>

                                    <div className="relative aspect-video bg-muted-gray mb-8 overflow-hidden rounded-2xl shadow-lg group">
                                        <AnimatePresence mode="wait">
                                            <motion.img
                                                key={currentImageIndex}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                src={selectedHike.images && selectedHike.images.length > 0 
                                                    ? selectedHike.images[currentImageIndex] 
                                                    : selectedHike.thumbnail}
                                                alt={`${selectedHike.name} - ${currentImageIndex + 1}`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800"; }}
                                            />
                                        </AnimatePresence>
                                        
                                        {selectedHike.images && selectedHike.images.length > 1 && (
                                            <>
                                                <button 
                                                    onClick={() => setCurrentImageIndex((prev) => (prev - 1 + selectedHike.images.length) % selectedHike.images.length)}
                                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-md p-2 text-accent border border-accent/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent hover:text-background"
                                                >
                                                    <ChevronLeft size={20} />
                                                </button>
                                                <button 
                                                    onClick={() => setCurrentImageIndex((prev) => (prev + 1) % selectedHike.images.length)}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-md p-2 text-accent border border-accent/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent hover:text-background"
                                                >
                                                    <ChevronRight size={20} />
                                                </button>
                                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                                    {selectedHike.images.map((_, idx) => (
                                                        <div 
                                                            key={idx}
                                                            className={`w-1 h-1 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'bg-accent w-4' : 'bg-off-white/30'}`}
                                                        />
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Map Hint */}
                    {!selectedHike && (
                        <div className="absolute bottom-6 left-6 bg-accent/10 backdrop-blur-sm rounded-full px-5 py-3 font-display text-sm tracking-widest text-accent z-10 shadow-md">
                            CLICK A PIN TO EXPLORE
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
