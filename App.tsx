import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ItineraryGenerator } from './components/ItineraryGenerator';
import { SmartRecommendations } from './components/SmartRecommendations';
import { ReturnTripVideo } from './components/ReturnTripVideo';
import { Chatbot } from './components/Chatbot';
import { TravelToolbox } from './components/TravelToolbox';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Search, Bell, ChevronDown, LogIn } from 'lucide-react';
import { auth, signInWithGoogle, db, handleFirestoreError, OperationType } from './firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function App() {
  const [user, loading, error] = useAuthState(auth);
  const [currentView, setCurrentView] = useState('dashboard');

  useEffect(() => {
    if (user) {
      // Sync user to Firestore
      const userRef = doc(db, 'users', user.uid);
      setDoc(userRef, {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
        role: 'user'
      }, { merge: true }).catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`));
    }
  }, [user]);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard setCurrentView={setCurrentView} user={user} />;
      case 'itinerary':
        return <ItineraryGenerator />;
      case 'recommendations':
        return <SmartRecommendations />;
      case 'video':
        return <ReturnTripVideo />;
      case 'chatbot':
        return <Chatbot />;
      case 'toolbox':
        return <TravelToolbox />;
      default:
        return <Dashboard setCurrentView={setCurrentView} user={user} />;
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#1a1c23] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#d4f870] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen bg-[#1a1c23] flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-[#242731] rounded-3xl p-10 border border-[#2a2d39] text-center shadow-2xl">
          <div className="text-4xl font-bold text-[#d4f870] mb-4">Cultural AI</div>
          <h1 className="text-2xl font-bold text-white mb-6">Welcome Traveler</h1>
          <p className="text-gray-400 mb-10 leading-relaxed">
            Connect with your cultural companion to plan your next adventure with the power of Gemini.
          </p>
          <button 
            onClick={signInWithGoogle}
            className="w-full py-4 bg-[#d4f870] hover:bg-[#c2e65d] text-[#1a1c23] rounded-2xl font-bold transition-all flex items-center justify-center space-x-3 shadow-lg shadow-[#d4f870]/10"
          >
            <LogIn size={20} />
            <span>Sign in with Google</span>
          </button>
          {error && <p className="mt-4 text-red-500 text-sm">{error.message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#1a1c23] text-white font-sans overflow-hidden">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex items-center justify-between px-8 py-6">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search for your favourite destination" 
              className="w-full bg-[#242731] text-white rounded-full py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#d4f870] border-none"
            />
          </div>
          <div className="flex items-center space-x-6">
            <button className="w-12 h-12 bg-[#242731] rounded-full flex items-center justify-center relative hover:bg-[#2a2d39] transition-colors">
              <Bell size={20} className="text-gray-400" />
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#242731]"></span>
            </button>
            <div className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity">
              <img src={user.photoURL || "https://i.pravatar.cc/150?img=47"} alt="User" className="w-12 h-12 rounded-full object-cover" />
              <div>
                <p className="font-semibold text-sm">{user.displayName || 'Traveler'}</p>
                <p className="text-xs text-gray-400">Traveler Pro</p>
              </div>
              <ChevronDown size={16} className="text-gray-400 ml-2" />
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          <ErrorBoundary>
            {renderView()}
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
