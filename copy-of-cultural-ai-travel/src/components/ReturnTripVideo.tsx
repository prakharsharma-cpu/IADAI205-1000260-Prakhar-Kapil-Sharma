import React, { useState } from 'react';
import { motion } from 'motion/react';
import { generateTripVideo } from '../services/gemini';
import { Video, Loader2, Download } from 'lucide-react';

export function ReturnTripVideo() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(0);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    setVideoUrl(null);
    
    try {
      const url = await generateTripVideo(prompt);
      if (url) {
        setVideoUrl(url);
      } else {
        setError("Failed to generate video. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while generating the video.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Your Return Trip Video</h2>
        <p className="text-gray-400">Generate a cinematic video memory of your trip using Veo AI.</p>
      </div>

      <div className="bg-[#242731] rounded-3xl p-8 shadow-sm border border-[#2a2d39] mb-8">
        <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-start space-x-3">
          <div className="p-1 bg-yellow-500/20 rounded-lg">
            <Video size={16} className="text-yellow-500" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-yellow-500">Paid API Key Required</h4>
            <p className="text-xs text-gray-400 mt-1">
              Video generation uses the Veo model, which requires a paid Google Cloud project and a selected API key in AI Studio.
            </p>
          </div>
        </div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Describe your trip memory</label>
        <div className="flex space-x-4">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A cinematic video of a serene beach in Bali at sunset..."
            className="flex-1 p-4 bg-[#1a1c23] border border-[#2a2d39] text-white rounded-xl focus:ring-2 focus:ring-[#d4f870] outline-none"
            disabled={isGenerating}
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="px-8 py-4 bg-[#d4f870] hover:bg-[#c2e65d] text-[#1a1c23] rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Video size={20} />
                <span>Generate</span>
              </>
            )}
          </button>
        </div>
        {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}
      </div>

      {isGenerating && (
        <div className="bg-[#242731] rounded-3xl p-12 shadow-sm border border-[#2a2d39] text-center flex flex-col items-center justify-center aspect-video">
          <Loader2 className="animate-spin text-[#d4f870] mb-4" size={48} />
          <h3 className="text-xl font-bold text-white mb-2">Creating your memory...</h3>
          <p className="text-gray-400">This may take a few minutes as Veo AI generates your high-quality video.</p>
        </div>
      )}

      {videoUrl && !isGenerating && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#242731] rounded-3xl overflow-hidden shadow-2xl border border-[#2a2d39] flex flex-col"
        >
          <video 
            src={videoUrl} 
            controls 
            autoPlay 
            loop 
            className="w-full aspect-video object-cover bg-black"
          />
          
          <div className="p-6 flex items-center justify-between border-t border-[#2a2d39]">
            <div className="flex items-center space-x-4">
              <h4 className="text-lg font-semibold text-white">Rate your video experience</h4>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-2xl transition-transform hover:scale-110 ${star <= rating ? 'text-[#d4f870]' : 'text-gray-600'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <a 
              href={videoUrl} 
              download="trip-memory.mp4"
              className="px-4 py-2 bg-[#1a1c23] hover:bg-[#2a2d39] text-white rounded-lg font-medium transition-colors flex items-center space-x-2 border border-[#2a2d39]"
            >
              <Download size={18} />
              <span>Download</span>
            </a>
          </div>
          {rating > 0 && <p className="px-6 pb-6 text-[#d4f870] font-medium text-sm">Thank you for your feedback!</p>}
        </motion.div>
      )}
    </div>
  );
}
