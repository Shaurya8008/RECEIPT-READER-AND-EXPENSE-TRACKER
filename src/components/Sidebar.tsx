'use client';

import React from 'react';
import { LayoutDashboard, Receipt, Scan, Settings, HelpCircle, LogOut } from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export default function Sidebar({ currentTab, setCurrentTab }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'scanner', label: 'Scanner', icon: Scan },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col h-screen w-64 fixed left-0 top-0 bg-[#070b19] border-r border-white/5 z-40 py-6">
      <div className="px-6 mb-10 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center primary-glow">
          <Receipt className="text-background h-5 w-5 stroke-[2.5]" />
        </div>
        <div>
          <h1 className="font-semibold text-foreground text-lg tracking-tight">Receiptify</h1>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold opacity-80">WEALTH TRACKER</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 active:scale-98 group cursor-pointer ${
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              }`}
            >
              <Icon className={`h-5 w-5 transition-transform duration-200 ${isActive ? 'stroke-[2.2]' : 'group-hover:scale-105'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto px-4 space-y-1 pt-6 border-t border-white/5">
        <button
          onClick={() => setCurrentTab('settings')}
          className="w-full flex items-center gap-3 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 cursor-pointer"
        >
          <HelpCircle className="h-5 w-5" />
          <span>Help Center</span>
        </button>
        <button
          onClick={() => alert('Signing out (Simulated)')}
          className="w-full flex items-center gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 cursor-pointer"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
