'use client';

import React, { useState } from 'react';
import { Settings, Save, Plus, ArrowRight, ShieldAlert, RotateCcw } from 'lucide-react';
import { BudgetConfig, ExpenseCategory, Transaction } from '../utils/db';

interface SettingsProps {
  budget: BudgetConfig;
  onSaveBudget: (budget: BudgetConfig) => void;
  onAddManualTx: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onResetDb: () => void;
}

export default function SettingsView({ budget, onSaveBudget, onAddManualTx, onResetDb }: SettingsProps) {
  // Budget Form State
  const [monthlyLimit, setMonthlyLimit] = useState(budget.monthlyLimit);
  const [categoryBudgets, setCategoryBudgets] = useState<Record<ExpenseCategory, number>>({
    ...budget.categoryBudgets
  });

  // Manual Transaction Form State
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<ExpenseCategory>('Misc');

  const categories: ExpenseCategory[] = ['Food', 'Tech', 'Travel', 'Health', 'Luxury', 'Utilities', 'Misc'];

  // Handle saving budget configuration
  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveBudget({
      monthlyLimit: parseFloat(monthlyLimit.toString()) || 0,
      categoryBudgets
    });
    alert('Budget settings saved successfully!');
  };

  // Handle saving manual expense
  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchant || !amount) {
      alert('Please fill out merchant name and amount');
      return;
    }
    
    onAddManualTx({
      merchant,
      amount: parseFloat(amount) || 0,
      date,
      category,
      items: [{ name: `${merchant} Expense`, price: parseFloat(amount) || 0, quantity: 1 }],
      status: 'Completed'
    });

    alert('Manual expense logged successfully!');
    setMerchant('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setCategory('Misc');
  };

  // Handle resetting database
  const handleReset = () => {
    if (confirm('Are you sure you want to reset the database? This will clear all custom transactions and reload the premium mock datasets.')) {
      onResetDb();
      alert('Database reset complete.');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto py-6 px-6 lg:px-10 space-y-8">
      <div>
        <h2 className="font-semibold text-2xl text-foreground">App Preferences & Budgeting</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure expense thresholds, log manual items, or manage database persistence.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Side: Budget Thresholds */}
        <div className="glass-card rounded-xl p-6 lg:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-white/5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Settings className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-foreground">Monthly Threshold Limit</h3>
              <p className="text-xs text-muted-foreground">Adjust maximum spending limit & category budgets</p>
            </div>
          </div>

          <form onSubmit={handleSaveBudget} className="space-y-5">
            {/* Total Monthly Limit */}
            <div>
              <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground block mb-1.5">
                Total Monthly Limit ($)
              </label>
              <input
                type="number"
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#0d122d]/60 border border-white/5 rounded-lg px-3 py-2.5 text-sm focus:border-primary transition-all outline-none text-foreground font-mono font-semibold"
              />
            </div>

            {/* Category Limits */}
            <div>
              <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground block mb-3">
                Category Spending Caps ($)
              </label>
              <div className="grid grid-cols-2 gap-4">
                {categories.map((cat) => (
                  <div key={cat}>
                    <span className="text-[11px] font-semibold text-muted-foreground block mb-1">{cat}</span>
                    <input
                      type="number"
                      value={categoryBudgets[cat] ?? 0}
                      onChange={(e) =>
                        setCategoryBudgets({
                          ...categoryBudgets,
                          [cat]: parseFloat(e.target.value) || 0
                        })
                      }
                      className="w-full bg-[#0d122d]/60 border border-white/5 rounded-lg px-3 py-2 text-xs focus:border-primary transition-all outline-none text-foreground font-mono"
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-background font-bold py-3 rounded-lg hover:opacity-90 active:scale-98 transition-all text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 primary-glow"
            >
              <Save className="h-4 w-4 stroke-[2.5]" />
              <span>Save Budget Caps</span>
            </button>
          </form>
        </div>

        {/* Right Side: Manual Expense & Database Management */}
        <div className="space-y-8">
          {/* Manual Logger */}
          <div className="glass-card rounded-xl p-6 lg:p-8 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-white/5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Plus className="h-4 w-4 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-semibold text-base text-foreground">Log Manual Expense</h3>
                <p className="text-xs text-muted-foreground">Add transaction without receipt scanning</p>
              </div>
            </div>

            <form onSubmit={handleAddManual} className="space-y-4">
              {/* Merchant */}
              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground block mb-1.5">
                  Merchant Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Netflix Premium"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  className="w-full bg-[#0d122d]/60 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-primary transition-all outline-none text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Amount */}
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground block mb-1.5">
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 19.99"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-[#0d122d]/60 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-primary transition-all outline-none text-foreground font-mono font-semibold"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground block mb-1.5">
                    Transaction Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#0d122d]/60 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-primary transition-all outline-none text-foreground cursor-pointer"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground block mb-1.5">
                  Expense Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full bg-[#0d122d]/60 border border-white/5 rounded-lg px-3 py-2.5 text-sm focus:border-primary transition-all outline-none text-foreground cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-primary/10 text-primary border border-primary/20 font-bold py-3 rounded-lg hover:bg-primary/20 active:scale-98 transition-all text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Record Expense</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* Database Reset Section */}
          <div className="glass-card rounded-xl p-6 lg:p-8 space-y-4 border-red-500/10">
            <div className="flex items-center gap-3 pb-2">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-base text-foreground">Database Reset</h3>
                <p className="text-xs text-muted-foreground">Clear all storage data & seed reset</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              If you want to clear your custom data and reload the mock transactions, you can perform a full reset. This resets the LocalStorage cache.
            </p>

            <button
              onClick={handleReset}
              className="bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 text-xs font-bold px-4 py-2.5 rounded-lg cursor-pointer transition-colors flex items-center gap-2"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Local Database</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
