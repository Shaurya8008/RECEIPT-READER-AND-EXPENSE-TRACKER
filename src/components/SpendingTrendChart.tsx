'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction } from '../utils/db';

interface SpendingTrendChartProps {
  transactions: Transaction[];
}

export default function SpendingTrendChart({ transactions }: SpendingTrendChartProps) {
  // Aggregate spending by date
  const dateTotals = transactions
    .filter(t => t.status === 'Completed')
    .reduce((acc, t) => {
      acc[t.date] = (acc[t.date] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  // Sort dates chronologically
  const sortedDates = Object.keys(dateTotals).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  // Create cumulative data for the area chart
  let cumulative = 0;
  const chartData = sortedDates.map(date => {
    cumulative += dateTotals[date];
    return {
      date: date.substring(5), // MM-DD
      amount: dateTotals[date],
      cumulative: cumulative,
    };
  });

  return (
    <div className="glass-card rounded-xl p-6 lg:p-8">
      <div className="mb-6">
        <h3 className="font-semibold text-lg text-foreground">Spending Trend</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Cumulative expenses over time</p>
      </div>

      <div className="h-64 w-full">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818CF8" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#818CF8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                stroke="#475569" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="#475569" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cumulative Spend']}
                contentStyle={{ backgroundColor: '#070b19', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Area 
                type="monotone" 
                dataKey="cumulative" 
                stroke="#818CF8" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorCumulative)" 
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            Not enough data to map trends.
          </div>
        )}
      </div>
    </div>
  );
}
