import React from 'react';
import { motion } from 'motion/react';

const GENRES = [
  "Electronic",
  "Rock",
  "Hip Hop",
  "Jazz",
  "Funk / Soul",
  "Pop",
  "Classical",
  "Reggae",
  "Latin",
  "Blues",
  "Folk, World, & Country"
];

interface GenreSelectorProps {
  onSelect: (genre: string) => void;
}

export const GenreSelector: React.FC<GenreSelectorProps> = ({ onSelect }) => {
  return (
    <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center justify-center">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold mb-12 tracking-tighter uppercase"
      >
        Select Genre
      </motion.h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-4xl">
        {GENRES.map((genre, index) => (
          <motion.button
            key={genre}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05, backgroundColor: "#333" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(genre)}
            className="p-6 border border-white/20 rounded-xl text-xl font-medium tracking-wide hover:border-white transition-colors text-left"
          >
            {genre}
          </motion.button>
        ))}
      </div>
    </div>
  );
};
