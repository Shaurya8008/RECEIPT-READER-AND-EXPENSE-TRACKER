'use client';

import React, { useState } from 'react';
import { Transaction, ExpenseCategory } from '../utils/db';

interface CategoryChartProps {
  transactions: Transaction[];
}

export default function CategoryChart({ transactions }: CategoryChartProps) {
  const [timeframe, setTimeframe] = useState<'day' | 'month' | 'year'>('month');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Group transactions by category
  const categoryTotals = transactions
    .filter((t) => t.status === 'Completed')
    .reduce((totals, t) => {
      totals[t.category] = (totals[t.category] || 0) + t.amount;
      return totals;
    }, {} as Record<ExpenseCategory, number>);

  const categories: ExpenseCategory[] = ['Food', 'Tech', 'Travel', 'Health', 'Luxury', 'Utilities', 'Misc'];

  // Ensure all categories exist in output
  const chartData = categories.map((cat) => {
    return {
      category: cat,
      amount: categoryTotals[cat] || 0,
    };
  });

  const maxAmount = Math.max(...chartData.map((d) => d.amount), 10);
  const totalCompletedSpend = chartData.reduce((sum, d) => sum + d.amount, 0);

  // Map category to aesthetic CSS indicators or icons
  const categoryColors: Record<ExpenseCategory, string> = {
    Food: 'bg-primary/70',
    Tech: 'bg-primary',
    Travel: 'bg-primary/50',
    Health: 'bg-emerald-400',
    Luxury: 'bg-emerald-600',
    Utilities: 'bg-primary/30',
    Misc: 'bg-primary/20',
  };

  return (
    <div className="glass-card rounded-xl p-6 lg:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="font-semibold text-lg text-foreground">Spending by Category</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Distribution of completed transactions</p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-lg border border-white/5">
          {(['day', 'month', 'year'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`text-xs px-3 py-1.5 rounded-md font-semibold capitalize cursor-pointer transition-all ${
                timeframe === t
                  ? 'bg-primary text-background'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Main Bar Chart */}
      <div className="flex items-end justify-between h-64 gap-3 sm:gap-4 px-2 pt-8">
        {chartData.map((d) => {
          const heightPercent = `${Math.max(5, Math.round((d.amount / maxAmount) * 85))}%`;
          const sharePercent = totalCompletedSpend > 0 ? Math.round((d.amount / totalCompletedSpend) * 100) : 0;
          const isHovered = hoveredCategory === d.category;

          return (
            <div
              key={d.category}
              className="flex-1 flex flex-col items-center gap-3 h-full justify-end group cursor-pointer"
              onMouseEnter={() => setHoveredCategory(d.category)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              {/* Tooltip & Bar container */}
              <div className="w-full flex flex-col items-center justify-end relative h-full">
                {/* Floating tooltip */}
                <div
                  className={`absolute -top-10 bg-muted border border-white/10 text-[10px] px-2 py-1.5 rounded-lg shadow-xl flex flex-col items-center transition-all duration-200 pointer-events-none z-10 ${
                    isHovered ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-1 scale-95'
                  }`}
                >
                  <span className="font-bold text-foreground">${d.amount.toFixed(2)}</span>
                  <span className="text-primary font-medium text-[8px] mt-0.5">{sharePercent}% Share</span>
                </div>

                {/* Animated Bar */}
                <div
                  style={{ height: heightPercent }}
                  className={`w-full rounded-t-lg transition-all duration-500 ease-out relative overflow-hidden ${
                    categoryColors[d.category]
                  } ${isHovered ? 'brightness-125 scale-x-105' : ''}`}
                >
                  {/* Subtle inner linear gradient glow */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10" />
                </div>
              </div>

              {/* Label */}
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
                {d.category}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend & Breakdown summary */}
      <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {chartData
          .filter((d) => d.amount > 0)
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 4)
          .map((d) => {
            const share = totalCompletedSpend > 0 ? Math.round((d.amount / totalCompletedSpend) * 100) : 0;
            return (
              <div key={d.category} className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{d.category}</span>
                <span className="text-sm font-semibold text-foreground mt-0.5">${d.amount.toFixed(2)}</span>
                <span className="text-[10px] text-primary mt-0.5 font-medium">{share}% share</span>
              </div>
            );
          })}
      </div>
    </div>
  );
}
