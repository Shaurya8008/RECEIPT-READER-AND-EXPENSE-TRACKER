'use client';

import React from 'react';
import { Search, Bell, Upload, HelpCircle } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function Header({ currentTab, setCurrentTab, searchQuery, setSearchQuery }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex justify-between items-center w-full px-6 lg:px-10 py-4 bg-[#020617]/80 backdrop-blur-md border-b border-white/5">
      {/* Search Input Box */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (currentTab !== 'transactions' && currentTab !== 'dashboard') {
                setCurrentTab('transactions');
              }
            }}
            placeholder="Search transactions, merchants, categories..."
            className="w-full bg-[#0d122d]/60 border border-white/5 hover:border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Profile and Quick Actions */}
      <div className="flex items-center gap-4 lg:gap-6">
        <button
          onClick={() => setCurrentTab('scanner')}
          className="hidden md:flex items-center gap-2 bg-primary text-primary-foreground font-bold px-4 py-2 rounded-lg hover:opacity-90 active:scale-95 transition-all primary-glow cursor-pointer text-xs uppercase tracking-wider"
        >
          <Upload className="h-4 w-4 stroke-[2.5]" />
          <span>Upload & Parse</span>
        </button>

        <div className="flex items-center gap-2 lg:gap-4 text-muted-foreground">
          <button
            onClick={() => alert('Notifications (0 unread)')}
            className="p-2 hover:bg-white/5 rounded-full relative cursor-pointer hover:text-foreground transition-colors"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border border-[#020617]"></span>
          </button>
          
          <button
            onClick={() => setCurrentTab('settings')}
            className="p-2 hover:bg-white/5 rounded-full cursor-pointer hover:text-foreground transition-colors"
          >
            <HelpCircle className="h-5 w-5" />
          </button>

          <div className="h-6 w-[1px] bg-white/10 mx-1"></div>

          <div 
            onClick={() => setCurrentTab('settings')}
            className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <div className="text-right hidden sm:block">
              <p className="text-foreground font-semibold text-xs leading-none">Shaurya Singh</p>
              <p className="text-[9px] uppercase text-primary font-bold tracking-widest mt-1">Premium Tier</p>
            </div>
            <div className="w-9 h-9 rounded-lg overflow-hidden border border-white/10 bg-[#1e293b] flex items-center justify-center font-bold text-sm text-primary">
              SS
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
