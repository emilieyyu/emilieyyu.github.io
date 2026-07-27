import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const navLinks = [
    { name: 'About', href: '#about' },
    { name: 'Explore', href: '#adventures' },
    { name: 'Crafts', href: '#builds' },
    { name: 'Resume', href: '#experience' },
    { name: 'Contact', href: '#contact' },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 w-full z-[1000] transition-all duration-300 ${scrolled ? 'bg-background/80 backdrop-blur-xl py-4 shadow-sm shadow-black/5' : 'bg-transparent py-8'
                }`}
        >
            <div className="container mx-auto px-6 flex justify-between items-center">
                <a href="#" className="flex items-center gap-2 transition-transform duration-200 hover:scale-105">
                    <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
                </a>

                {/* Desktop Nav */}
                <div className="hidden md:flex gap-1">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="group relative px-4 py-2 font-display text-lg uppercase tracking-widest hover:text-accent transition-colors duration-200"
                        >
                            {link.name}
                            <span className="absolute left-4 right-4 -bottom-0.5 h-[2px] scale-x-0 origin-left bg-accent transition-transform duration-300 group-hover:scale-x-100" />
                        </a>
                    ))}
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-off-white hover:text-accent transition-colors"
                    onClick={() => setIsOpen(true)}
                >
                    <Menu size={32} />
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-0 bg-background z-[1100] flex flex-col p-10"
                    >
                        <div className="flex justify-end">
                            <button onClick={() => setIsOpen(false)} className="text-accent">
                                <X size={48} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-10 mt-20">
                            {navLinks.map((link, i) => (
                                <motion.a
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * i }}
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className="font-display text-6xl font-bold uppercase tracking-tighter hover:text-accent"
                                >
                                    {link.name}
                                </motion.a>
                            ))}
                        </div>


                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
