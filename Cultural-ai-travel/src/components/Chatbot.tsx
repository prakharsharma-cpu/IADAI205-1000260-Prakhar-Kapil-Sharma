import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { getChatbotResponse, generateSpeech } from '../services/gemini';
import { Send, Bot, User, Link as LinkIcon, Volume2, VolumeX } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, limit } from 'firebase/firestore';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  links?: { title: string, uri: string }[];
}

export function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, `chats/${auth.currentUser.uid}/messages`),
      orderBy('timestamp', 'asc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      
      if (msgs.length === 0) {
        setMessages([{ id: 'welcome', text: 'Hello! I am your Cultural AI assistant. How can I help you plan your trip today?', sender: 'bot' }]);
      } else {
        setMessages(msgs);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `chats/${auth.currentUser?.uid}/messages`);
    });

    return () => unsubscribe();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !auth.currentUser) return;

    const userText = input;
    setInput('');
    setLoading(true);

    try {
      // Save user message to Firestore
      await addDoc(collection(db, `chats/${auth.currentUser.uid}/messages`), {
        userId: auth.currentUser.uid,
        text: userText,
        sender: 'user',
        timestamp: serverTimestamp()
      }).catch(err => handleFirestoreError(err, OperationType.CREATE, `chats/${auth.currentUser?.uid}/messages`));

      const response = await getChatbotResponse(userText, messages);
      
      // Save bot message to Firestore
      await addDoc(collection(db, `chats/${auth.currentUser.uid}/messages`), {
        userId: auth.currentUser.uid,
        text: response.text,
        sender: 'bot',
        links: response.links || [],
        timestamp: serverTimestamp()
      }).catch(err => handleFirestoreError(err, OperationType.CREATE, `chats/${auth.currentUser?.uid}/messages`));
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = async (text: string, id: string) => {
    if (isSpeaking === id) {
      audioRef.current?.pause();
      setIsSpeaking(null);
      return;
    }

    setIsSpeaking(id);
    const audioUrl = await generateSpeech(text);
    if (audioUrl) {
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
      } else {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.play();
      }
      audioRef.current!.onended = () => setIsSpeaking(null);
    } else {
      setIsSpeaking(null);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto h-screen flex flex-col pb-24">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">AI Travel Assistant</h2>
        <p className="text-gray-400">Ask questions, get recommendations, or modify your itinerary.</p>
      </div>

      <div className="flex-1 bg-[#242731] rounded-3xl shadow-sm border border-[#2a2d39] flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.sender === 'user' ? 'bg-[#d4f870] ml-3' : 'bg-[#1a1c23] border border-[#2a2d39] mr-3'
                }`}>
                  {msg.sender === 'user' ? <User size={16} className="text-[#1a1c23]" /> : <Bot size={16} className="text-[#d4f870]" />}
                </div>
                <div className={`p-4 rounded-2xl relative group ${
                  msg.sender === 'user' 
                    ? 'bg-[#d4f870] text-[#1a1c23] rounded-tr-none' 
                    : 'bg-[#1a1c23] text-gray-300 rounded-tl-none border border-[#2a2d39]'
                }`}>
                  <div className="markdown-body text-sm">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                  
                  {msg.sender === 'bot' && (
                    <button 
                      onClick={() => handleSpeak(msg.text, msg.id)}
                      className="absolute -right-10 top-0 p-2 text-gray-400 hover:text-[#d4f870] transition-colors opacity-0 group-hover:opacity-100"
                    >
                      {isSpeaking === msg.id ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                  )}

                  {msg.links && msg.links.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[#2a2d39]">
                      <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Sources & Links</p>
                      <div className="flex flex-col space-y-2">
                        {msg.links.map((link, idx) => (
                          <a 
                            key={idx} 
                            href={link.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-xs text-[#d4f870] hover:underline"
                          >
                            <LinkIcon size={12} />
                            <span className="truncate">{link.title}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex flex-row max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-[#1a1c23] border border-[#2a2d39] mr-3 flex items-center justify-center shrink-0">
                  <Bot size={16} className="text-[#d4f870]" />
                </div>
                <div className="p-4 rounded-2xl bg-[#1a1c23] text-gray-300 rounded-tl-none border border-[#2a2d39] flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-[#242731] border-t border-[#2a2d39]">
          <div className="flex items-center space-x-2 bg-[#1a1c23] p-2 rounded-2xl border border-[#2a2d39]">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about destinations, weather, or cultural tips..."
              className="flex-1 bg-transparent border-none focus:ring-0 px-4 py-2 outline-none text-white placeholder-gray-500"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="p-3 bg-[#d4f870] hover:bg-[#c2e65d] text-[#1a1c23] rounded-xl transition-colors disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
