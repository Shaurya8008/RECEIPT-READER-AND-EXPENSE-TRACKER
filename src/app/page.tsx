'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getTransactions, 
  addTransaction, 
  deleteTransaction, 
  getBudgetConfig, 
  saveBudgetConfig,
  Transaction, 
  BudgetConfig 
} from '../utils/db';

import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';
import Header from '../components/Header';
import MetricCard from '../components/MetricCard';
import CategoryChart from '../components/CategoryChart';
import SpendingTrendChart from '../components/SpendingTrendChart';
import TransactionList from '../components/TransactionList';
import SettingsView from '../components/Settings';
import Scanner from '../components/Scanner';

import { Scan, Sparkles, AlertCircle } from 'lucide-react';

// Framer Motion Variants
const pageVariants = {
  initial: { opacity: 0, y: 15, filter: 'blur(10px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, staggerChildren: 0.1, ease: 'easeOut' } },
  exit: { opacity: 0, y: -15, filter: 'blur(10px)', transition: { duration: 0.3, ease: 'easeIn' } }
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

export default function Home() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budget, setBudget] = useState<BudgetConfig | null>(null);
  const [isDbLoaded, setIsDbLoaded] = useState(false);

  // Load transactions and budget configurations from local storage on client mount
  useEffect(() => {
    setTransactions(getTransactions());
    setBudget(getBudgetConfig());
    setIsDbLoaded(true);
  }, []);

  // Handlers for modifying state & local storage database
  const handleAddTransaction = (newTxData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx = addTransaction(newTxData);
    setTransactions(getTransactions()); // reload
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = deleteTransaction(id);
    setTransactions(updated);
  };

  const handleSaveBudget = (updatedBudget: BudgetConfig) => {
    saveBudgetConfig(updatedBudget);
    setBudget(updatedBudget);
  };

  const handleResetDb = () => {
    localStorage.removeItem('receiptify_transactions');
    localStorage.removeItem('receiptify_budget');
    // Page will reload in the Settings callback
  };

  if (!isDbLoaded || !budget) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-foreground">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent animate-spin rounded-full mb-3" />
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold opacity-70">Loading Vault...</p>
      </div>
    );
  }

  // Filter 3 most recent transactions for dashboard preview
  const recentTransactions = transactions.slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#020617] text-[#f8fafc] select-none">
      {/* Sidebar Desktop Navigation */}
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Panel */}
      <div className="flex-1 lg:ml-64 min-h-screen flex flex-col pb-24 lg:pb-10">
        {/* Header containing search & quick action */}
        <Header 
          currentTab={currentTab} 
          setCurrentTab={setCurrentTab} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
        />

        {/* Dynamic Tab Renderer */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {currentTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="max-w-[1440px] mx-auto py-6 px-6 lg:px-10 space-y-6"
              >
                {/* Header Title */}
                <motion.div variants={itemVariants}>
                  <h2 className="font-semibold text-2xl text-foreground">Financial Overview</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Precision tracking for your digital assets and recurring expenses.
                  </p>
                </motion.div>

                {/* Top Row Stats */}
                <motion.div variants={itemVariants}>
                  <MetricCard transactions={transactions} budget={budget} />
                </motion.div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                  {/* Category Chart (spans 1 col on desktop) */}
                  <motion.div variants={itemVariants} className="lg:col-span-1">
                    <CategoryChart transactions={transactions} />
                  </motion.div>

                  {/* Spending Trend Chart (spans 2 cols on desktop) */}
                  <motion.div variants={itemVariants} className="lg:col-span-2">
                    <SpendingTrendChart transactions={transactions} />
                  </motion.div>
                </div>

                {/* Info Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  {/* Intelligent Insight Card */}
                  <motion.div variants={itemVariants} className="glass-card rounded-xl p-6 border-primary/15 h-full">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-3">
                      <Sparkles className="h-4 w-4" />
                      <span>Intelligent Insight</span>
                    </div>
                    <p className="text-xs text-foreground leading-relaxed">
                      Your <strong className="text-primary">Tech</strong> spending is <strong className="text-primary">14% lower</strong> than last month. Consider allocating the surplus to your category budget caps.
                    </p>
                  </motion.div>

                  <div className="space-y-6">

                    {/* API Key Missing Alert if applicable */}
                    {(!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'PLACEHOLDER_GEMINI_API_KEY') && (
                      <motion.div variants={itemVariants} className="glass-card rounded-xl p-5 border-amber-500/20 bg-amber-500/5">
                        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-widest mb-2">
                          <AlertCircle className="h-4.5 w-4.5" />
                          <span>OCR Notice</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          No <code className="text-amber-400">GEMINI_API_KEY</code> detected in `.env.local`. Using local high-fidelity simulated parser.
                        </p>
                      </motion.div>
                    )}

                    {/* Scanned Receipt Queue indicator */}
                    <motion.div variants={itemVariants} className="glass-card rounded-xl p-6">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">SCANNING QUEUE</span>
                        <span className="bg-primary/20 text-primary text-[9px] font-bold px-2 py-0.5 rounded">ONLINE</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-primary">
                          <Scan className="h-4.5 w-4.5 animate-pulse" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground">Scanner Status</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Ready to scan and parse new documents</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Recent Transactions list summary */}
                <motion.div variants={itemVariants} className="glass-card rounded-xl overflow-hidden mt-6">
                  <div className="px-6 py-4 flex justify-between items-center border-b border-white/5">
                    <h3 className="font-semibold text-base text-foreground">Recent Transactions</h3>
                    <button 
                      onClick={() => setCurrentTab('transactions')}
                      className="text-primary text-xs font-semibold hover:underline cursor-pointer uppercase tracking-wider text-[10px]"
                    >
                      View All Registry
                    </button>
                  </div>
                  
                  {/* Embedded compact list */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <tbody className="divide-y divide-white/5">
                        {recentTransactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center font-bold text-xs text-primary">
                                  {tx.merchant.slice(0,2).toUpperCase()}
                                </div>
                                <span className="font-semibold text-foreground text-sm">{tx.merchant}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-muted-foreground text-xs">{tx.date}</td>
                            <td className="px-6 py-4 text-xs font-semibold text-muted-foreground">{tx.category}</td>
                            <td className="px-6 py-4 font-mono text-foreground text-sm font-semibold">${tx.amount.toFixed(2)}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider ${
                                tx.status === 'Completed' ? 'bg-primary/10 text-primary' : 'bg-zinc-800 text-muted-foreground'
                              }`}>
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {recentTransactions.length === 0 && (
                          <tr>
                            <td className="px-6 py-8 text-center text-sm text-muted-foreground">
                              No records found. Upload a receipt!
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {currentTab === 'transactions' && (
              <motion.div 
                key="transactions"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="max-w-[1440px] mx-auto py-6 px-6 lg:px-10"
              >
                <TransactionList 
                  transactions={transactions} 
                  onDelete={handleDeleteTransaction}
                  searchQuery={searchQuery}
                />
              </motion.div>
            )}

            {currentTab === 'scanner' && (
              <motion.div
                key="scanner"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Scanner 
                  onAddTransaction={handleAddTransaction} 
                  setCurrentTab={setCurrentTab} 
                />
              </motion.div>
            )}

            {currentTab === 'settings' && (
              <motion.div
                key="settings"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <SettingsView 
                  budget={budget} 
                  onSaveBudget={handleSaveBudget} 
                  onAddManualTx={handleAddTransaction}
                  onResetDb={handleResetDb}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Action Scanner Button (Dashboard only) */}
      {currentTab === 'dashboard' && (
        <button
          onClick={() => setCurrentTab('scanner')}
          className="fixed bottom-8 right-8 lg:bottom-10 lg:right-10 flex items-center gap-3 bg-primary text-background font-bold px-6 py-4 rounded-full shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:scale-105 hover:shadow-[0_0_35px_rgba(34,197,94,0.45)] active:scale-95 transition-all z-50 cursor-pointer"
        >
          <Scan className="h-5 w-5 stroke-[2.5]" />
          <span className="text-xs uppercase font-bold tracking-wider">Scan New Receipt</span>
        </button>
      )}

      {/* Bottom Nav Mobile Dock */}
      <BottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} />
    </div>
  );
}
