'use client';

import React from 'react';
import { TrendingUp, TrendingDown, FileText, Compass } from 'lucide-react';
import { Transaction, BudgetConfig } from '../utils/db';

interface MetricCardProps {
  transactions: Transaction[];
  budget: BudgetConfig;
}

export default function MetricCard({ transactions, budget }: MetricCardProps) {
  // Calculations
  const totalSpend = transactions
    .filter(t => t.status === 'Completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const scannedCount = transactions.length;
  const monthlyLimit = budget.monthlyLimit;
  const remainingBudget = Math.max(0, monthlyLimit - totalSpend);
  const remainingPercent = Math.min(100, Math.round((remainingBudget / monthlyLimit) * 100));

  // Scanned receipts percent limit (e.g. max 50 free scans)
  const SCAN_LIMIT = 50;
  const scanPercent = Math.min(100, Math.round((scannedCount / SCAN_LIMIT) * 100));

  // Mock comparison (e.g. compared to last month)
  const isUp = true;
  const trendPercent = 8.2;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {/* Spend Card */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex justify-between items-start mb-3">
          <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">MONTHLY SPEND</p>
          <div className={`flex items-center gap-0.5 text-xs font-bold ${isUp ? 'text-primary' : 'text-destructive'}`}>
            {isUp ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            <span>{isUp ? '+' : ''}{trendPercent}%</span>
          </div>
        </div>
        
        <div className="flex items-baseline">
          <span className="font-bold text-3xl tracking-tight text-foreground">
            ${totalSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Micro Sparkline Chart */}
        <div className="mt-5 h-10 w-full flex items-end gap-1 px-1">
          {Array.from({ length: 14 }).map((_, i) => {
            // Generate heights that look like spending days
            const heights = ['25%', '40%', '30%', '55%', '85%', '60%', '45%', '30%', '70%', '90%', '50%', '35%', '65%', '100%'];
            const height = heights[i % heights.length];
            return (
              <div
                key={i}
                style={{ height }}
                className="flex-1 bg-primary/20 hover:bg-primary/50 transition-colors rounded-t-sm"
              />
            );
          })}
        </div>
      </div>

      {/* Scanned Receipts Card */}
      <div className="glass-card rounded-xl p-6 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">SCANNED RECEIPTS</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Current billing cycle</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-primary">
            <FileText className="h-4 w-4" />
          </div>
        </div>

        <div className="flex items-baseline mb-2">
          <span className="font-bold text-3xl tracking-tight text-foreground">{scannedCount}</span>
          <span className="text-xs text-muted-foreground ml-1">/ {SCAN_LIMIT} items</span>
        </div>

        <div className="mt-3">
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div 
              style={{ width: `${scanPercent}%` }} 
              className="bg-primary h-full rounded-full transition-all duration-500"
            />
          </div>
          <div className="flex justify-between items-center mt-2 text-[10px] text-muted-foreground">
            <span>{scanPercent}% of scan quota used</span>
            <span className="text-primary font-semibold">Upgrade Tier</span>
          </div>
        </div>
      </div>

      {/* Remaining Budget Card */}
      <div className="glass-card rounded-xl p-6 flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-1">REMAINING BUDGET</p>
          <span className="font-bold text-2xl tracking-tight text-foreground">
            ${remainingBudget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <p className="text-xs text-muted-foreground mt-1.5 italic font-medium leading-tight">
            Of ${monthlyLimit.toLocaleString('en-US')} total budget limit
          </p>
        </div>

        {/* Circular Progress Gauge */}
        <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            {/* Background Ring */}
            <circle
              className="text-white/5"
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="7"
            />
            {/* Foreground Progress Ring */}
            <circle
              className="text-primary transition-all duration-500"
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="7"
              strokeDasharray="251.2"
              strokeDashoffset={251.2 - (251.2 * remainingPercent) / 100}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-xs font-bold text-foreground leading-none">{remainingPercent}%</span>
            <span className="text-[8px] uppercase tracking-wider text-muted-foreground mt-0.5">Left</span>
          </div>
        </div>
      </div>
    </div>
  );
}
