import React, { useState } from 'react';
import { motion } from 'motion/react';
import { destinations } from '../data/destinations';
import { Star, MapPin, Calendar } from 'lucide-react';

export function SmartRecommendations({ searchQuery = '' }: { searchQuery?: string }) {
  const [feedback, setFeedback] = useState<Record<string, 'like' | 'dislike'>>({});

  const handleFeedback = (id: string, type: 'like' | 'dislike') => {
    setFeedback(prev => ({ ...prev, [id]: type }));
  };

  const filteredDestinations = destinations.filter(dest => 
    dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dest.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dest.continent.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dest.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          {searchQuery ? `Search Results for "${searchQuery}"` : 'Smart Recommendations'}
        </h2>
        <p className="text-gray-400">Discover destinations tailored to your preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDestinations.length > 0 ? (
          filteredDestinations.map((dest, idx) => (
            <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            key={dest.id}
            className="bg-[#242731] rounded-3xl overflow-hidden shadow-sm border border-[#2a2d39] group"
          >
            <div className="h-48 overflow-hidden relative p-3">
              <img 
                src={dest.imageUrl} 
                alt={dest.name} 
                className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              {dest.unescoSite && (
                <div className="absolute top-6 left-6 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-md">
                  UNESCO
                </div>
              )}
            </div>
            
            <div className="p-5 pt-2">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-white leading-tight">{dest.name}</h3>
                <div className="flex items-center text-amber-400 bg-amber-400/10 px-2 py-1 rounded-md">
                  <Star size={14} className="fill-current mr-1" />
                  <span className="text-sm font-bold">{dest.avgRating}</span>
                </div>
              </div>
              
              <div className="flex items-center text-gray-400 text-sm mb-4">
                <MapPin size={14} className="mr-1 text-red-500" />
                <span>{dest.country}, {dest.continent}</span>
              </div>

              <div className="grid grid-cols-1 gap-3 mb-4">
                <div className="flex items-center justify-between text-sm text-gray-300 bg-[#1a1c23] p-3 rounded-xl border border-[#2a2d39]">
                  <div className="flex items-center">
                    <Calendar size={14} className="mr-2 text-[#d4f870]" />
                    <span>Best Season</span>
                  </div>
                  <span className="font-bold text-white">{dest.bestSeason}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#2a2d39]">
                <span className="text-xs font-medium text-[#d4f870] uppercase tracking-wider">{dest.type}</span>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleFeedback(dest.id, 'like')}
                    className={`p-2 rounded-full transition-colors ${feedback[dest.id] === 'like' ? 'bg-[#d4f870] text-[#1a1c23]' : 'bg-[#1a1c23] text-gray-400 hover:bg-[#2a2d39]'}`}
                  >
                    👍
                  </button>
                  <button 
                    onClick={() => handleFeedback(dest.id, 'dislike')}
                    className={`p-2 rounded-full transition-colors ${feedback[dest.id] === 'dislike' ? 'bg-red-500 text-white' : 'bg-[#1a1c23] text-gray-400 hover:bg-[#2a2d39]'}`}
                  >
                    👎
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))
      ) : (
        <div className="col-span-full text-center py-20 bg-[#242731] rounded-3xl border border-dashed border-[#2a2d39]">
          <p className="text-gray-400 text-lg">No destinations found matching "{searchQuery}"</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 text-[#d4f870] font-bold hover:underline"
          >
            Clear Search
          </button>
        </div>
      )}
      </div>
    </div>
  );
}
