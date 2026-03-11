import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Briefcase, BookOpen, CheckCircle2, Loader2, MapPin, Sparkles, Languages, Info, DollarSign, ShieldCheck, Gem, Mic, Volume2 } from 'lucide-react';
import { generatePackingList, generateLocalEtiquette, generateBudgetEstimate, generatePhrasebook, generateSafetyTips, generateHiddenGems, translateAndSpeak } from '../services/gemini';
import Markdown from 'react-markdown';

type ToolType = 'packing' | 'etiquette' | 'budget' | 'phrasebook' | 'safety' | 'gems' | 'translator';

export function TravelToolbox() {
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState(5);
  const [season, setSeason] = useState('Spring');
  const [budgetLevel, setBudgetLevel] = useState('Mid-range');
  const [interests, setInterests] = useState<string[]>(['Culture', 'Cuisine']);
  
  const [packingList, setPackingList] = useState<string[]>([]);
  const [etiquette, setEtiquette] = useState<string | null>(null);
  const [budget, setBudget] = useState<string | null>(null);
  const [phrasebook, setPhrasebook] = useState<string | null>(null);
  const [safety, setSafety] = useState<string | null>(null);
  const [gems, setGems] = useState<string | null>(null);

  // Translator State
  const [translateInput, setTranslateInput] = useState('');
  const [targetLang, setTargetLang] = useState('French');
  const [translatedText, setTranslatedText] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<ToolType>('packing');

  const handleGenerate = async () => {
    if (!destination) return;
    setLoading(true);
    try {
      const [list, guide, budgetData, phrases, safetyTips, hiddenGems] = await Promise.all([
        generatePackingList(destination, duration, season, interests),
        generateLocalEtiquette(destination),
        generateBudgetEstimate(destination, duration, budgetLevel),
        generatePhrasebook(destination),
        generateSafetyTips(destination),
        generateHiddenGems(destination)
      ]);
      setPackingList(list);
      setEtiquette(guide);
      setBudget(budgetData);
      setPhrasebook(phrases);
      setSafety(safetyTips);
      setGems(hiddenGems);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async () => {
    if (!translateInput.trim()) return;
    setTranslating(true);
    try {
      const result = await translateAndSpeak(translateInput, targetLang);
      setTranslatedText(result.translatedText);
      setAudioUrl(result.audioUrl);
      if (result.audioUrl && audioRef.current) {
        audioRef.current.src = result.audioUrl;
        audioRef.current.play();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setTranslating(false);
    }
  };

  const tabs: { id: ToolType; label: string; icon: React.ReactNode }[] = [
    { id: 'packing', label: 'Packing List', icon: <Briefcase size={18} /> },
    { id: 'etiquette', label: 'Etiquette', icon: <BookOpen size={18} /> },
    { id: 'budget', label: 'Budget', icon: <DollarSign size={18} /> },
    { id: 'phrasebook', label: 'Phrasebook', icon: <Languages size={18} /> },
    { id: 'safety', label: 'Safety', icon: <ShieldCheck size={18} /> },
    { id: 'gems', label: 'Hidden Gems', icon: <Gem size={18} /> },
    { id: 'translator', label: 'Voice Translator', icon: <Mic size={18} /> },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Travel Toolbox</h2>
        <p className="text-gray-400">Essential AI utilities for your next adventure.</p>
      </div>

      {/* Input Section */}
      <div className="bg-[#242731] rounded-3xl p-8 border border-[#2a2d39] mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">Destination</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Where are you going?"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#1a1c23] border border-[#2a2d39] text-white rounded-xl focus:ring-2 focus:ring-[#d4f870] outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Duration (Days)</label>
            <input 
              type="number" 
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full p-3 bg-[#1a1c23] border border-[#2a2d39] text-white rounded-xl focus:ring-2 focus:ring-[#d4f870] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Budget Level</label>
            <select 
              value={budgetLevel}
              onChange={(e) => setBudgetLevel(e.target.value)}
              className="w-full p-3 bg-[#1a1c23] border border-[#2a2d39] text-white rounded-xl focus:ring-2 focus:ring-[#d4f870] outline-none"
            >
              <option value="Budget">Budget</option>
              <option value="Mid-range">Mid-range</option>
              <option value="Luxury">Luxury</option>
            </select>
          </div>
        </div>
        <button 
          onClick={handleGenerate}
          disabled={loading || !destination}
          className="w-full py-4 bg-[#d4f870] hover:bg-[#c2e65d] text-[#1a1c23] rounded-xl font-bold transition-colors disabled:opacity-50 flex justify-center items-center space-x-2"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
          <span>Generate Toolbox Data</span>
        </button>
      </div>

      {/* Results Section */}
      <div className="space-y-6">
        <div className="flex overflow-x-auto space-x-2 border-b border-[#2a2d39] no-scrollbar">
          {tabs.map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-4 font-bold flex items-center space-x-2 transition-all whitespace-nowrap ${activeTab === tab.id ? 'text-[#d4f870] border-b-2 border-[#d4f870]' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#242731] rounded-3xl p-8 border border-[#2a2d39] min-h-[400px]"
        >
          {activeTab === 'packing' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {packingList.length > 0 ? packingList.map((item, idx) => (
                <div key={idx} className="flex items-center space-x-3 p-4 bg-[#1a1c23] rounded-2xl border border-[#2a2d39] group hover:border-[#d4f870]/30 transition-all">
                  <div className="w-6 h-6 rounded-full border-2 border-[#2a2d39] group-hover:border-[#d4f870] flex items-center justify-center transition-colors">
                    <CheckCircle2 className="text-[#d4f870] opacity-0 group-hover:opacity-100 transition-opacity" size={14} />
                  </div>
                  <span className="text-gray-300">{item}</span>
                </div>
              )) : (
                <div className="col-span-2 text-center py-20 text-gray-500">
                  <Briefcase size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Generate data to see your smart packing list.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'etiquette' && (
            <div className="prose prose-invert max-w-none">
              <div className="flex items-center space-x-2 mb-6 text-[#d4f870]">
                <Info size={20} />
                <h3 className="font-bold uppercase tracking-widest text-sm">Cultural Guide</h3>
              </div>
              {etiquette ? (
                <div className="markdown-body text-gray-300 leading-relaxed">
                  <Markdown>{etiquette}</Markdown>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-20">Generate data to see local etiquette.</p>
              )}
            </div>
          )}

          {activeTab === 'budget' && (
            <div className="prose prose-invert max-w-none">
              <div className="flex items-center space-x-2 mb-6 text-[#d4f870]">
                <DollarSign size={20} />
                <h3 className="font-bold uppercase tracking-widest text-sm">Budget Estimator</h3>
              </div>
              {budget ? (
                <div className="markdown-body text-gray-300 leading-relaxed">
                  <Markdown>{budget}</Markdown>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-20">Generate data to see budget estimate.</p>
              )}
            </div>
          )}

          {activeTab === 'phrasebook' && (
            <div className="prose prose-invert max-w-none">
              <div className="flex items-center space-x-2 mb-6 text-[#d4f870]">
                <Languages size={20} />
                <h3 className="font-bold uppercase tracking-widest text-sm">Travel Phrasebook</h3>
              </div>
              {phrasebook ? (
                <div className="markdown-body text-gray-300 leading-relaxed">
                  <Markdown>{phrasebook}</Markdown>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-20">Generate data to see travel phrasebook.</p>
              )}
            </div>
          )}

          {activeTab === 'safety' && (
            <div className="prose prose-invert max-w-none">
              <div className="flex items-center space-x-2 mb-6 text-[#d4f870]">
                <ShieldCheck size={20} />
                <h3 className="font-bold uppercase tracking-widest text-sm">Safety & Health</h3>
              </div>
              {safety ? (
                <div className="markdown-body text-gray-300 leading-relaxed">
                  <Markdown>{safety}</Markdown>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-20">Generate data to see safety tips.</p>
              )}
            </div>
          )}

          {activeTab === 'gems' && (
            <div className="prose prose-invert max-w-none">
              <div className="flex items-center space-x-2 mb-6 text-[#d4f870]">
                <Gem size={20} />
                <h3 className="font-bold uppercase tracking-widest text-sm">Hidden Gems</h3>
              </div>
              {gems ? (
                <div className="markdown-body text-gray-300 leading-relaxed">
                  <Markdown>{gems}</Markdown>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-20">Generate data to see hidden gems.</p>
              )}
            </div>
          )}

          {activeTab === 'translator' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-6 text-[#d4f870]">
                <Mic size={20} />
                <h3 className="font-bold uppercase tracking-widest text-sm">Voice Translator</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-300">Enter text to translate</label>
                  <textarea 
                    value={translateInput}
                    onChange={(e) => setTranslateInput(e.target.value)}
                    placeholder="e.g., 'Where is the nearest train station?'"
                    className="w-full p-4 bg-[#1a1c23] border border-[#2a2d39] text-white rounded-2xl focus:ring-2 focus:ring-[#d4f870] outline-none resize-none h-32"
                  />
                  <div className="flex space-x-4">
                    <select 
                      value={targetLang}
                      onChange={(e) => setTargetLang(e.target.value)}
                      className="flex-1 p-3 bg-[#1a1c23] border border-[#2a2d39] text-white rounded-xl focus:ring-2 focus:ring-[#d4f870] outline-none"
                    >
                      <option value="French">French</option>
                      <option value="Spanish">Spanish</option>
                      <option value="Japanese">Japanese</option>
                      <option value="Hindi">Hindi</option>
                      <option value="German">German</option>
                      <option value="Italian">Italian</option>
                    </select>
                    <button 
                      onClick={handleTranslate}
                      disabled={translating || !translateInput.trim()}
                      className="px-6 py-3 bg-[#d4f870] hover:bg-[#c2e65d] text-[#1a1c23] rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center space-x-2"
                    >
                      {translating ? <Loader2 className="animate-spin" size={18} /> : <Languages size={18} />}
                      <span>Translate</span>
                    </button>
                  </div>
                </div>
                <div className="bg-[#1a1c23] rounded-2xl p-6 border border-[#2a2d39] flex flex-col justify-center items-center text-center">
                  {translatedText ? (
                    <>
                      <p className="text-gray-400 text-sm mb-2">Translation ({targetLang}):</p>
                      <h4 className="text-2xl font-bold text-white mb-6">{translatedText}</h4>
                      {audioUrl && (
                        <button 
                          onClick={() => audioRef.current?.play()}
                          className="w-16 h-16 bg-[#d4f870] rounded-full flex items-center justify-center text-[#1a1c23] hover:scale-110 transition-transform shadow-lg shadow-[#d4f870]/20"
                        >
                          <Volume2 size={32} />
                        </button>
                      )}
                      <audio ref={audioRef} className="hidden" />
                    </>
                  ) : (
                    <div className="text-gray-500">
                      <Languages size={48} className="mx-auto mb-4 opacity-20" />
                      <p>Your translation will appear here.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
