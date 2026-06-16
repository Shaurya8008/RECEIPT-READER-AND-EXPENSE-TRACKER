'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Receipt, Scan, Settings } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export default function BottomNav({ currentTab, setCurrentTab }: BottomNavProps) {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'transactions', label: 'List', icon: Receipt },
    { id: 'scanner', label: 'Scan', icon: Scan },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-white/5 flex justify-around items-center py-3 z-40 pb-5">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setCurrentTab(item.id)}
            className={`relative flex flex-col items-center gap-1 active:scale-95 transition-transform p-2 px-4 rounded-xl cursor-pointer ${
              isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="bottom-nav-pill"
                className="absolute inset-0 bg-primary/10 rounded-xl"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <Icon className="relative z-10 h-5 w-5" />
            <span className="relative z-10 text-[10px] font-bold">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
