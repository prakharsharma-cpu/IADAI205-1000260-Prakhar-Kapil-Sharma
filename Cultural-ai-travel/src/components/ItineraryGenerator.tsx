import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { generateItinerary, translateText, generateWeatherSuggestion, generateImage, refineItinerary } from '../services/gemini';
import { Download, Globe, MapPin, Sun, Cloud, FileText, Loader2, Image as ImageIcon, Sparkles, Edit3 } from 'lucide-react';
import { exportToPDF } from '../utils/pdfExport';
import { cities } from '../data/cities';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp, orderBy } from 'firebase/firestore';

export function ItineraryGenerator() {
  const [preferences, setPreferences] = useState({
    destination: '',
    age: 30,
    interests: [] as string[],
    duration: 5,
    accessibility: false,
    season: 'Spring',
    budget: 'Mid-range',
    aspectRatio: '16:9'
  });

  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState<any[]>([]);
  const [suggestion, setSuggestion] = useState('');
  const [language, setLanguage] = useState('English');
  const [translating, setTranslating] = useState(false);
  const [thinking, setThinking] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [pastItineraries, setPastItineraries] = useState<any[]>([]);
  const [refinementRequest, setRefinementRequest] = useState('');
  const [refining, setRefining] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  const interestOptions = ['Culture', 'Nature', 'Adventure', 'History', 'Art', 'Cuisine'];
  const seasonOptions = ['Spring', 'Summer', 'Autumn', 'Winter'];
  const budgetOptions = ['Budget', 'Mid-range', 'Luxury'];
  const aspectRatioOptions = ['1:1', '3:4', '4:3', '9:16', '16:9', '21:9'];

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'itineraries'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPastItineraries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'itineraries');
    });

    return () => unsubscribe();
  }, []);

  const handleInterestToggle = (interest: string) => {
    setPreferences(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleGenerate = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    setSuggestion('');
    setItinerary([]);
    setThinking("AI is thinking deeply about your perfect trip...");
    setGeneratedImageUrl(null);
    
    const matchedCity = cities[Math.floor(Math.random() * cities.length)];
    const targetDestination = preferences.destination.trim() || matchedCity.city;
    
    const temp = Math.floor(Math.random() * 15) + 15;
    const conditions = ['sunny', 'cloudy', 'rainy', 'clear'];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];

    try {
      const [aiSuggestion, result, imageUrl] = await Promise.all([
        generateWeatherSuggestion(targetDestination, temp, condition),
        generateItinerary({...preferences, destination: targetDestination}, preferences.duration),
        generateImage(`A beautiful cinematic travel photo of ${targetDestination}, high quality, cultural vibe`, preferences.aspectRatio)
      ]);
      
      setSuggestion(`Based on your preferences, we recommend ${targetDestination}. Current weather: ${temp}°C and ${condition}. AI Suggestion: ${aiSuggestion}`);
      setItinerary(result.plan);
      setThinking(result.thinking || null);
      setGeneratedImageUrl(imageUrl);
      setLanguage('English');

      // Save to Firestore
      await addDoc(collection(db, 'itineraries'), {
        userId: auth.currentUser.uid,
        destination: targetDestination,
        duration: preferences.duration,
        preferences: preferences,
        plan: result.plan,
        // We omit imageUrl here because base64 strings often exceed the 1MB Firestore limit.
        // The image is still displayed in the UI for the current session.
        createdAt: serverTimestamp()
      }).catch(err => handleFirestoreError(err, OperationType.CREATE, 'itineraries'));

    } catch (error) {
      console.error(error);
      setThinking("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async (targetLang: string) => {
    if (targetLang === language) return;
    setTranslating(true);
    
    const translatedItinerary = await Promise.all(
      itinerary.map(async (day) => {
        const translatedTitle = await translateText(day.title, targetLang);
        const translatedDesc = await translateText(day.description, targetLang);
        return { ...day, title: translatedTitle, description: translatedDesc };
      })
    );
    
    setItinerary(translatedItinerary);
    setLanguage(targetLang);
    setTranslating(false);
  };
  
  const handleRefine = async () => {
    if (!refinementRequest.trim() || itinerary.length === 0) return;
    setRefining(true);
    setThinking("Refining your itinerary based on your feedback...");
    try {
      const updatedPlan = await refineItinerary(itinerary, refinementRequest);
      setItinerary(updatedPlan);
      setRefinementRequest('');
      setThinking("Itinerary refined successfully!");
    } catch (error) {
      console.error(error);
      setThinking("Failed to refine itinerary.");
    } finally {
      setRefining(false);
    }
  };

  const downloadPDF = async () => {
    setGeneratingPDF(true);
    try {
      await exportToPDF('itinerary-content', `Cultural_AI_Itinerary_${preferences.destination || 'Trip'}.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
    } finally {
      setGeneratingPDF(false);
    }
  };

  const languages = ['English', 'French', 'Hindi', 'Spanish', 'Japanese'];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Trip Planner</h2>
        <p className="text-gray-400">Set your preferences and generate a personalized day-by-day itinerary.</p>
      </div>

      <div className="bg-[#242731] rounded-3xl p-8 shadow-sm border border-[#2a2d39] space-y-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-300 mb-2">Destination (Optional)</label>
            <input 
              type="text" 
              placeholder="Leave empty for an AI recommendation"
              value={preferences.destination}
              onChange={(e) => setPreferences({...preferences, destination: e.target.value})}
              className="w-full p-3 bg-[#1a1c23] border border-[#2a2d39] text-white rounded-xl focus:ring-2 focus:ring-[#d4f870] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Age</label>
            <input 
              type="number" 
              value={preferences.age}
              onChange={(e) => setPreferences({...preferences, age: parseInt(e.target.value)})}
              className="w-full p-3 bg-[#1a1c23] border border-[#2a2d39] text-white rounded-xl focus:ring-2 focus:ring-[#d4f870] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Duration (Days)</label>
            <input 
              type="number" 
              value={preferences.duration}
              onChange={(e) => setPreferences({...preferences, duration: parseInt(e.target.value)})}
              className="w-full p-3 bg-[#1a1c23] border border-[#2a2d39] text-white rounded-xl focus:ring-2 focus:ring-[#d4f870] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Budget Level</label>
            <select 
              value={preferences.budget}
              onChange={(e) => setPreferences({...preferences, budget: e.target.value})}
              className="w-full p-3 bg-[#1a1c23] border border-[#2a2d39] text-white rounded-xl focus:ring-2 focus:ring-[#d4f870] outline-none"
            >
              {budgetOptions.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Interests</label>
          <div className="flex flex-wrap gap-2">
            {interestOptions.map(interest => (
              <button
                key={interest}
                onClick={() => handleInterestToggle(interest)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  preferences.interests.includes(interest)
                    ? 'bg-[#d4f870] text-[#1a1c23]'
                    : 'bg-[#1a1c23] text-gray-400 hover:bg-[#2a2d39]'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Preferred Season</label>
            <select 
              value={preferences.season}
              onChange={(e) => setPreferences({...preferences, season: e.target.value})}
              className="w-full p-3 bg-[#1a1c23] border border-[#2a2d39] text-white rounded-xl focus:ring-2 focus:ring-[#d4f870] outline-none"
            >
              {seasonOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Image Aspect Ratio</label>
            <select 
              value={preferences.aspectRatio}
              onChange={(e) => setPreferences({...preferences, aspectRatio: e.target.value})}
              className="w-full p-3 bg-[#1a1c23] border border-[#2a2d39] text-white rounded-xl focus:ring-2 focus:ring-[#d4f870] outline-none"
            >
              {aspectRatioOptions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex items-center pt-8">
            <input 
              type="checkbox" 
              id="accessibility"
              checked={preferences.accessibility}
              onChange={(e) => setPreferences({...preferences, accessibility: e.target.checked})}
              className="w-5 h-5 text-[#d4f870] bg-[#1a1c23] rounded border-[#2a2d39] focus:ring-[#d4f870]"
            />
            <label htmlFor="accessibility" className="ml-3 text-sm font-medium text-gray-300">
              Require Accessibility
            </label>
          </div>
        </div>

        <button 
          onClick={handleGenerate}
          disabled={loading}
          className="w-full py-4 bg-[#d4f870] hover:bg-[#c2e65d] text-[#1a1c23] rounded-xl font-bold transition-colors disabled:opacity-50 flex justify-center items-center space-x-2"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>Generating Itinerary...</span>
            </>
          ) : (
            <span>Generate Smart Itinerary</span>
          )}
        </button>
      </div>

      {thinking && (
        <div className="mb-8 p-4 bg-[#1a1c23] border border-[#d4f870]/20 rounded-xl flex items-center space-x-3 text-sm text-gray-400">
          <Sparkles size={16} className="text-[#d4f870] animate-pulse" />
          <span>{thinking}</span>
        </div>
      )}

      {suggestion && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 bg-[#1a1c23] border border-[#d4f870]/30 rounded-xl text-white"
        >
          <h4 className="font-semibold mb-2 text-[#d4f870]">AI Recommendation & Weather</h4>
          <p className="leading-relaxed text-gray-300">{suggestion}</p>
        </motion.div>
      )}

      {generatedImageUrl && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 rounded-3xl overflow-hidden border border-[#2a2d39] shadow-xl"
        >
          <img src={generatedImageUrl} alt="Destination" className="w-full h-auto object-cover" />
        </motion.div>
      )}

      {itinerary.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4 bg-[#242731] p-3 rounded-xl border border-[#2a2d39] shadow-sm">
              <Globe className="text-gray-400" size={18} />
              <span className="font-medium text-white text-sm">Translate:</span>
              <div className="flex space-x-2">
                {languages.map(lang => (
                  <button
                    key={lang}
                    onClick={() => handleTranslate(lang)}
                    disabled={translating}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      language === lang 
                        ? 'bg-[#d4f870] text-[#1a1c23]' 
                        : 'text-gray-400 hover:bg-[#1a1c23]'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
              {translating && <span className="text-xs text-gray-400 animate-pulse ml-2">Translating...</span>}
            </div>
            
            <button 
              onClick={downloadPDF}
              disabled={generatingPDF}
              className="px-4 py-3 bg-[#242731] hover:bg-[#2a2d39] text-white rounded-xl font-medium transition-colors flex items-center space-x-2 border border-[#2a2d39] disabled:opacity-50"
            >
              {generatingPDF ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
              <span>{generatingPDF ? 'Generating PDF...' : 'Export PDF'}</span>
            </button>
          </div>
          
          {/* Refinement Section */}
          <div className="mb-8 bg-[#242731] p-6 rounded-2xl border border-[#2a2d39] shadow-sm">
            <h4 className="text-white font-bold mb-4 flex items-center">
              <Edit3 size={18} className="mr-2 text-[#d4f870]" />
              Refine Your Plan
            </h4>
            <div className="flex space-x-4">
              <input 
                type="text" 
                value={refinementRequest}
                onChange={(e) => setRefinementRequest(e.target.value)}
                placeholder="e.g., 'Make it more budget-friendly' or 'Add more art galleries'"
                className="flex-1 p-3 bg-[#1a1c23] border border-[#2a2d39] text-white rounded-xl focus:ring-2 focus:ring-[#d4f870] outline-none"
                disabled={refining}
              />
              <button
                onClick={handleRefine}
                disabled={refining || !refinementRequest.trim()}
                className="px-6 py-3 bg-[#d4f870] hover:bg-[#c2e65d] text-[#1a1c23] rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {refining ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                <span>Refine</span>
              </button>
            </div>
          </div>

          <div id="itinerary-content" className="space-y-6 bg-[#1a1c23] p-6 rounded-2xl border border-[#2a2d39]">
            {itinerary.map((day, idx) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={idx} 
                className="bg-[#242731] p-6 rounded-2xl shadow-sm border border-[#2a2d39]"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="inline-block px-3 py-1 bg-[#d4f870]/20 text-[#d4f870] text-sm font-bold rounded-lg mb-2">
                      Day {day.day}
                    </span>
                    <h3 className="text-xl font-bold text-white">{day.title}</h3>
                  </div>
                  <div className="flex flex-col items-end space-y-2 text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <MapPin size={16} className="text-red-500" />
                      <span>{day.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {day.weather.toLowerCase().includes('sun') ? <Sun size={16} className="text-yellow-500" /> : <Cloud size={16} className="text-gray-400" />}
                      <span>{day.weather}</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed">{day.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
