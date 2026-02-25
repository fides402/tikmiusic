/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GenreSelector } from './components/GenreSelector';
import { VideoFeed } from './components/VideoFeed';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  return (
    <div className="bg-black min-h-screen text-white font-sans">
      <AnimatePresence mode="wait">
        {!selectedGenre ? (
          <motion.div
            key="selector"
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <GenreSelector onSelect={setSelectedGenre} />
          </motion.div>
        ) : (
          <motion.div
            key="feed"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <VideoFeed genre={selectedGenre} onBack={() => setSelectedGenre(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
