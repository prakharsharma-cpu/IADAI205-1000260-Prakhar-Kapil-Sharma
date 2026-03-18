import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { destinations } from '../data/destinations';
import { Calendar as CalendarIcon, MapPin, Briefcase, PenTool, Camera, Sparkles, Plus, ArrowRight } from 'lucide-react';
import { User } from 'firebase/auth';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';

export function Dashboard({ setCurrentView, user }: { setCurrentView: (view: string) => void, user: User | null }) {
  const [upcomingTrips, setUpcomingTrips] = useState<any[]>([]);
  const topDestinations = destinations.slice(0, 3);
  const popularDestinations = destinations.slice(3, 7);
  const firstName = user?.displayName?.split(' ')[0] || 'Traveler';
  
  const today = new Date();
  const currentMonth = today.toLocaleString('default', { month: 'long' }).toUpperCase();
  const currentYear = today.getFullYear();
  const currentDate = today.getDate();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'itineraries'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(3)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUpcomingTrips(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'itineraries');
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="flex gap-8 h-full">
      {/* Main Content */}
      <div className="flex-1 flex flex-col space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Hello {firstName}!</h1>
            <p className="text-gray-400">Where will your curiosity take you today?</p>
          </div>
          <button 
            onClick={() => setCurrentView('itinerary')}
            className="bg-[#d4f870] hover:bg-[#c2e65d] text-[#1a1c23] px-6 py-3 rounded-2xl font-bold flex items-center space-x-2 transition-all shadow-lg shadow-[#d4f870]/10"
          >
            <Plus size={20} />
            <span>Plan New Trip</span>
          </button>
        </div>

        {/* AI Travel Suite - More Intuitive Grid */}
        <section>
          <div className="flex items-center space-x-2 mb-6">
            <Sparkles className="text-[#d4f870]" size={20} />
            <h2 className="text-2xl font-bold text-white">Your AI Travel Suite</h2>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div 
              onClick={() => setCurrentView('itinerary')}
              className="bg-gradient-to-br from-[#242731] to-[#2a2d39] rounded-3xl p-6 border border-[#2a2d39] hover:border-[#d4f870]/50 transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#d4f870]/5 rounded-full blur-2xl group-hover:bg-[#d4f870]/10 transition-all"></div>
              <div className="w-12 h-12 bg-[#1a1c23] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
                <CalendarIcon className="text-[#d4f870]" size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Smart Itinerary</h3>
              <p className="text-gray-400 text-sm mb-4">AI-crafted multi-day plans</p>
              <div className="flex items-center text-[#d4f870] text-xs font-bold group-hover:translate-x-1 transition-transform">
                <span>GET STARTED</span>
                <ArrowRight size={14} className="ml-1" />
              </div>
            </div>

            <div 
              onClick={() => setCurrentView('toolbox')}
              className="bg-gradient-to-br from-[#242731] to-[#2a2d39] rounded-3xl p-6 border border-[#2a2d39] hover:border-[#d4f870]/50 transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#d4f870]/5 rounded-full blur-2xl group-hover:bg-[#d4f870]/10 transition-all"></div>
              <div className="w-12 h-12 bg-[#1a1c23] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
                <Briefcase className="text-[#d4f870]" size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Travel Toolbox</h3>
              <p className="text-gray-400 text-sm mb-4">Packing, Etiquette & AI Tools</p>
              <div className="flex items-center text-[#d4f870] text-xs font-bold group-hover:translate-x-1 transition-transform">
                <span>EXPLORE TOOLS</span>
                <ArrowRight size={14} className="ml-1" />
              </div>
            </div>
          </div>
        </section>

        {/* Top Destinations */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Top Cultural Destinations</h2>
            <button 
              onClick={() => setCurrentView('recommendations')}
              className="text-[#d4f870] font-semibold hover:underline"
            >
              View All
            </button>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {topDestinations.map((dest, idx) => (
              <motion.div
                key={dest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-[#242731] rounded-3xl overflow-hidden cursor-pointer group"
                onClick={() => setCurrentView('recommendations')}
              >
                <div className="h-48 overflow-hidden p-3">
                  <img 
                    src={dest.imageUrl} 
                    alt={dest.name} 
                    className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-5 pt-2">
                  <h3 className="text-xl font-bold text-white mb-4">{dest.name}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Best Season</span>
                    <span className="bg-[#d4f870] text-[#1a1c23] px-4 py-2 rounded-xl font-bold text-sm">
                      {dest.bestSeason}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Most Popular */}
        <section>
          <div className="flex space-x-8 mb-6 border-b border-[#2a2d39]">
            <button className="text-white font-bold border-b-2 border-[#d4f870] pb-2">Most Popular</button>
            <button className="text-gray-500 font-semibold pb-2 hover:text-gray-300">Special Offers</button>
            <button className="text-gray-500 font-semibold pb-2 hover:text-gray-300">Near Me</button>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            {popularDestinations.map((dest, idx) => (
              <motion.div
                key={dest.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-[#242731] rounded-3xl p-4 flex items-center space-x-4 cursor-pointer hover:bg-[#2a2d39] transition-colors"
                onClick={() => setCurrentView('recommendations')}
              >
                <img 
                  src={dest.imageUrl} 
                  alt={dest.name} 
                  className="w-24 h-24 rounded-2xl object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-white mb-1">{dest.name}</h4>
                  <div className="flex items-center text-gray-400 text-sm mb-2">
                    <MapPin size={14} className="mr-1 text-red-500" />
                    {dest.country}
                  </div>
                  <div className="text-[#d4f870] font-semibold text-sm">
                    {dest.type}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 flex flex-col space-y-8">
        {/* Calendar Widget */}
        <div className="bg-[#242731] rounded-3xl p-6 shadow-xl border border-[#2a2d39]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider">{currentMonth} {currentYear}</h3>
            <div className="flex space-x-2">
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1a1c23] text-gray-400 hover:text-white transition-colors">&lt;</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1a1c23] text-gray-400 hover:text-white transition-colors">&gt;</button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-gray-500 mb-4">
            <div>SUN</div><div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div>
          </div>
          <div className="grid grid-cols-7 gap-y-3 text-center text-sm text-white">
            {/* Simple calendar rendering for the current month */}
            {[...Array(31)].map((_, i) => {
              const day = i + 1;
              const isToday = day === currentDate;
              return (
                <div 
                  key={day} 
                  className={`${isToday ? 'bg-[#d4f870] text-[#1a1c23] rounded-full w-7 h-7 flex items-center justify-center mx-auto font-bold shadow-lg shadow-[#d4f870]/20' : ''}`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bookings */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">Upcoming Trips</h3>
            <button 
              onClick={() => setCurrentView('itinerary')}
              className="text-[#d4f870] font-semibold text-sm hover:underline"
            >
              View All
            </button>
          </div>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">Next Adventure</h4>
              <div className="space-y-4">
                {upcomingTrips.length > 0 ? (
                  upcomingTrips.map((trip) => (
                    <div 
                      key={trip.id}
                      className="bg-gradient-to-r from-[#242731] to-[#2a2d39] rounded-2xl p-4 flex items-center space-x-4 border border-[#2a2d39] hover:border-[#d4f870]/30 transition-all cursor-pointer group"
                    >
                      <div className="w-16 h-16 bg-[#1a1c23] rounded-xl flex items-center justify-center">
                        <MapPin className="text-[#d4f870]" size={24} />
                      </div>
                      <div className="flex-1">
                        <h5 className="text-white font-bold group-hover:text-[#d4f870] transition-colors line-clamp-1">{trip.destination}</h5>
                        <div className="flex items-center text-gray-400 text-xs mt-1">
                          <CalendarIcon size={12} className="mr-1 text-[#ff6b6b]" />
                          {trip.duration} Days Plan
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 bg-[#242731] rounded-2xl border border-dashed border-[#2a2d39]">
                    <p className="text-gray-500 text-sm">No trips planned yet</p>
                    <button 
                      onClick={() => setCurrentView('itinerary')}
                      className="text-[#d4f870] text-xs font-bold mt-2 hover:underline"
                    >
                      PLAN NOW
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
