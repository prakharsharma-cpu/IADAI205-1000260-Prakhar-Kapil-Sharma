import React from 'react';
import { Map, Compass, Video, MessageSquare, LayoutDashboard, LogOut, ArrowRight, Briefcase } from 'lucide-react';
import { logout } from '../firebase';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export function Sidebar({ currentView, setCurrentView }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'itinerary', label: 'Trip Planner', icon: Compass },
    { id: 'recommendations', label: 'Smart Recommendations', icon: Map },
    { id: 'toolbox', label: 'Travel Toolbox', icon: Briefcase },
    { id: 'video', label: 'Return Trip Video', icon: Video },
    { id: 'chatbot', label: 'AI Chatbot', icon: MessageSquare },
  ];

  return (
    <div className="w-64 bg-[#1a1c23] border-r border-[#2a2d39] h-screen flex flex-col py-8 px-4">
      <div className="flex items-center space-x-2 px-4 mb-12">
        <div className="text-2xl font-bold tracking-tight text-[#d4f870]">Cultural AI</div>
      </div>
      
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center space-x-4 px-4 py-4 rounded-2xl transition-colors ${
                isActive
                  ? 'bg-[#d4f870] text-[#1a1c23] font-semibold'
                  : 'text-gray-400 hover:bg-[#242731] hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto">
        <div className="bg-[#d4f870] rounded-3xl p-6 text-[#1a1c23] mb-6 relative overflow-hidden">
          <h3 className="text-xl font-bold mb-2">Plan Smart!</h3>
          <p className="text-sm font-medium mb-4">Get AI-driven insights for your next trip.</p>
          <button className="w-10 h-10 bg-[#1a1c23] text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
            <ArrowRight size={18} />
          </button>
        </div>
        
        <button 
          onClick={logout}
          className="w-full flex items-center space-x-4 px-4 py-4 text-gray-400 hover:text-white transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
