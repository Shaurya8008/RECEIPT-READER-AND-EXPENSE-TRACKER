'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
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

  // Map category to hex colors for Recharts
  const categoryColors: Record<ExpenseCategory, string> = {
    Food: '#818CF8',      // primary
    Tech: '#6366F1',      // indigo-500
    Travel: '#A5B4FC',    // indigo-300
    Health: '#34D399',    // emerald-400
    Luxury: '#059669',    // emerald-600
    Utilities: '#4F46E5', // indigo-600
    Misc: '#C7D2FE',      // indigo-200
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

      {/* Main Donut Chart */}
      <div className="h-64 mt-4 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData.filter(d => d.amount > 0)}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={5}
              dataKey="amount"
              nameKey="category"
              stroke="none"
              animationBegin={0}
              animationDuration={1000}
              animationEasing="ease-out"
            >
              {chartData.filter(d => d.amount > 0).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={categoryColors[entry.category]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
              contentStyle={{ backgroundColor: '#070b19', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
              itemStyle={{ color: '#fff', fontWeight: 'bold' }}
              labelStyle={{ color: '#94a3b8' }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Total</span>
          <span className="text-xl font-bold text-foreground mt-0.5">${totalCompletedSpend.toFixed(2)}</span>
        </div>
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
