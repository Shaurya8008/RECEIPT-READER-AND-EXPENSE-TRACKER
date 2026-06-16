'use client';

import React, { useState } from 'react';
import { FileText, Trash2, Calendar, ShoppingBag, ArrowRight, X, Eye, Download } from 'lucide-react';
import { Transaction, ExpenseCategory } from '../utils/db';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  searchQuery: string;
}

export default function TransactionList({ transactions, onDelete, searchQuery }: TransactionListProps) {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  const categories: ExpenseCategory[] = ['Food', 'Tech', 'Travel', 'Health', 'Luxury', 'Utilities', 'Misc'];

  // Apply search query & filters
  const filtered = transactions.filter((tx) => {
    const matchesSearch =
      tx.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.amount.toString().includes(searchQuery);

    const matchesCategory = categoryFilter === 'all' || tx.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
    const matchesDateFrom = dateFrom ? new Date(tx.date) >= new Date(dateFrom) : true;
    const matchesDateTo = dateTo ? new Date(tx.date) <= new Date(dateTo) : true;

    return matchesSearch && matchesCategory && matchesStatus && matchesDateFrom && matchesDateTo;
  });

  const exportToCSV = () => {
    const headers = ['Merchant', 'Date', 'Category', 'Amount', 'Status'];
    const rows = filtered.map(tx => [
      `"${tx.merchant.replace(/"/g, '""')}"`,
      tx.date,
      tx.category,
      tx.amount,
      tx.status
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'receiptify_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Style helper for Category badges
  const categoryStyles: Record<ExpenseCategory, { bg: string; text: string }> = {
    Food: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
    Tech: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
    Travel: { bg: 'bg-amber-500/10', text: 'text-amber-400' },
    Health: { bg: 'bg-cyan-500/10', text: 'text-cyan-400' },
    Luxury: { bg: 'bg-purple-500/10', text: 'text-purple-400' },
    Utilities: { bg: 'bg-orange-500/10', text: 'text-orange-400' },
    Misc: { bg: 'bg-slate-500/10', text: 'text-slate-400' },
  };

  const getCategoryBadge = (cat: ExpenseCategory) => {
    const style = categoryStyles[cat] || categoryStyles.Misc;
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${style.bg} ${style.text}`}>
        {cat}
      </span>
    );
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden mt-6">
      {/* Title & Filter Header */}
      <div className="px-6 py-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-lg text-foreground">Transactions Registry</h3>
          <p className="text-xs text-muted-foreground mt-0.5">List of scanned receipts & logged expenses</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date Range Filters */}
          <input 
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="bg-[#0d122d]/60 border border-white/5 text-xs text-foreground px-3 py-1.5 rounded-lg focus:outline-none focus:border-primary cursor-pointer transition-colors"
          />
          <span className="text-muted-foreground text-xs">-</span>
          <input 
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="bg-[#0d122d]/60 border border-white/5 text-xs text-foreground px-3 py-1.5 rounded-lg focus:outline-none focus:border-primary cursor-pointer transition-colors"
          />

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#0d122d]/60 border border-white/5 text-xs text-foreground px-3 py-1.5 rounded-lg focus:outline-none focus:border-primary cursor-pointer transition-colors"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0d122d]/60 border border-white/5 text-xs text-foreground px-3 py-1.5 rounded-lg focus:outline-none focus:border-primary cursor-pointer transition-colors"
          >
            <option value="all">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
          </select>

          {/* Export Button */}
          <button 
            onClick={exportToCSV}
            className="bg-primary/20 text-primary border border-primary/20 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-primary/30 transition-colors flex items-center gap-1 cursor-pointer ml-1"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.01] border-b border-white/5">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Merchant</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Date</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Category</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Amount</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</th>
              <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-muted-foreground">
                  No transactions found. Scan a receipt to get started!
                </td>
              </tr>
            ) : (
              filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center font-bold text-xs text-primary">
                        {tx.merchant.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-semibold text-foreground text-sm">{tx.merchant}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-xs">{tx.date}</td>
                  <td className="px-6 py-4">{getCategoryBadge(tx.category)}</td>
                  <td className="px-6 py-4 font-mono text-foreground text-sm font-semibold">
                    ${tx.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider ${
                        tx.status === 'Completed'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-zinc-800 text-muted-foreground'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedTx(tx)}
                        className="p-1.5 hover:bg-white/5 rounded text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete transaction from ${tx.merchant}?`)) {
                            onDelete(tx.id);
                          }
                        }}
                        className="p-1.5 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive cursor-pointer transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Details View Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedTx(null)}
              className="absolute top-4 right-4 p-1 hover:bg-white/5 rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-lg text-foreground">{selectedTx.merchant}</h4>
                <p className="text-xs text-muted-foreground">{selectedTx.date}</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-xs text-muted-foreground uppercase font-bold">Category</span>
                {getCategoryBadge(selectedTx.category)}
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-xs text-muted-foreground uppercase font-bold">Status</span>
                <span className={`text-xs font-bold ${selectedTx.status === 'Completed' ? 'text-primary' : 'text-slate-400'}`}>
                  {selectedTx.status}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-xs text-muted-foreground uppercase font-bold">Total Charged</span>
                <span className="font-mono text-base font-bold text-foreground">${selectedTx.amount.toFixed(2)}</span>
              </div>
            </div>

            {/* Line Items extracted from OCR */}
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-3">Extracted Receipt Items</p>
              {selectedTx.items.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No line items parsed.</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {selectedTx.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-white/[0.02] p-2.5 rounded-lg border border-white/5 text-xs">
                      <div>
                        <p className="font-medium text-foreground">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-mono font-semibold text-foreground">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedTx(null)}
                className="bg-primary text-background font-bold px-5 py-2 rounded-lg hover:opacity-90 active:scale-95 transition-all text-sm cursor-pointer"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
