'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Eye, FileText, CheckCircle, RefreshCw, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { Transaction, ExpenseCategory, TransactionItem } from '../utils/db';

interface ScannerProps {
  onAddTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  setCurrentTab: (tab: string) => void;
}

export default function Scanner({ onAddTransaction, setCurrentTab }: ScannerProps) {
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [parsedData, setParsedData] = useState<Omit<Transaction, 'id' | 'createdAt'> | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories: ExpenseCategory[] = ['Food', 'Tech', 'Travel', 'Health', 'Luxury', 'Utilities', 'Misc'];

  // Handle file select & base64 encoding
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setParsedData(null);
    setMimeType(file.type);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.onerror = () => {
      setError('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  // Trigger file selection
  const handleDropzoneClick = () => {
    fileInputRef.current?.click();
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setError(null);
      setParsedData(null);
      setMimeType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Start parsing receipt via API
  const startScan = async () => {
    if (!image) return;

    setIsScanning(true);
    setParsedData(null);
    setError(null);

    // Simulate scanning steps for premium UX
    setScanStep('Uploading receipt data...');
    await new Promise(r => setTimeout(r, 600));
    setScanStep('Initializing Gemini OCR Engine...');
    await new Promise(r => setTimeout(r, 600));
    setScanStep('Extracting merchant, prices, and line items...');

    try {
      const response = await fetch('/api/parse-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, mimeType }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setParsedData({
          merchant: result.data.merchant,
          date: result.data.date,
          amount: result.data.amount,
          category: result.data.category as ExpenseCategory,
          items: result.data.items || [],
          status: 'Completed',
        });
      } else {
        throw new Error(result.error || 'Failed to parse receipt');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during scanning. Please try again.');
    } finally {
      setIsScanning(false);
      setScanStep('');
    }
  };

  // Add line item to draft
  const addLineItem = () => {
    if (!parsedData) return;
    const items = [...parsedData.items, { name: '', price: 0, quantity: 1 }];
    setParsedData({ ...parsedData, items });
  };

  // Remove line item from draft
  const removeLineItem = (index: number) => {
    if (!parsedData) return;
    const items = parsedData.items.filter((_, i) => i !== index);
    
    // Re-calculate total based on remaining items
    const newTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    setParsedData({
      ...parsedData,
      items,
      amount: parseFloat(newTotal.toFixed(2))
    });
  };

  // Update line item details
  const updateLineItem = (index: number, field: keyof TransactionItem, value: any) => {
    if (!parsedData) return;
    const items = parsedData.items.map((item, i) => {
      if (i === index) {
        const updated = { ...item, [field]: value };
        // Ensure numbers are handled properly
        if (field === 'price') updated.price = parseFloat(value) || 0;
        if (field === 'quantity') updated.quantity = parseInt(value) || 1;
        return updated;
      }
      return item;
    });

    // Re-calculate total
    const newTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    setParsedData({
      ...parsedData,
      items,
      amount: parseFloat(newTotal.toFixed(2))
    });
  };

  // Save parsed receipt to local database
  const saveTransaction = () => {
    if (!parsedData) return;
    onAddTransaction(parsedData);
    alert('Transaction successfully saved to database!');
    setCurrentTab('dashboard');
  };

  return (
    <div className="max-w-[1440px] mx-auto py-6 px-6 lg:px-10">
      <div className="mb-6">
        <h2 className="font-semibold text-2xl text-foreground">AI Receipt Scanner</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Upload any receipt image. Gemini AI will automatically parse the total amount, categories, and items.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Upload & Scanning Stage */}
        <div className="space-y-6">
          <div
            onClick={!isScanning ? handleDropzoneClick : undefined}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`glass-card rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[350px] transition-all border-dashed relative overflow-hidden ${
              !image ? 'hover:border-primary/50 hover:bg-white/[0.01] cursor-pointer' : ''
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
              disabled={isScanning}
            />

            {/* Laser Line Overlay for Scanning */}
            {isScanning && image && (
              <div className="absolute inset-x-0 top-0 h-32 scanner-beam z-20 pointer-events-none" />
            )}

            {image ? (
              <div className="relative w-full h-[320px] flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt="Receipt Preview"
                  className={`max-w-full max-h-full object-contain rounded-lg transition-all ${
                    isScanning ? 'opacity-40 blur-[1px]' : ''
                  }`}
                />
                {!isScanning && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setImage(null);
                      setParsedData(null);
                    }}
                    className="absolute top-2 right-2 bg-black/70 border border-white/10 p-1.5 rounded-full hover:bg-red-500/20 hover:text-red-400 transition-colors z-10 cursor-pointer text-muted-foreground"
                    title="Remove image"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 primary-glow">
                  <Upload className="h-6 w-6 stroke-[2]" />
                </div>
                <h4 className="font-semibold text-base text-foreground mb-1">Upload Receipt Image</h4>
                <p className="text-xs text-muted-foreground max-w-xs leading-relaxed mb-4">
                  Drag and drop your receipt image here, or browse from your device. Supports PNG, JPEG, WebP.
                </p>
                <span className="text-xs bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg text-muted-foreground font-semibold hover:text-foreground transition-colors">
                  Select File
                </span>
              </div>
            )}
          </div>

          {/* Action Trigger Buttons */}
          {image && !isScanning && !parsedData && (
            <button
              onClick={startScan}
              className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-lg hover:opacity-90 active:scale-98 transition-all primary-glow cursor-pointer uppercase tracking-wider text-xs"
            >
              Analyze Receipt with Gemini AI
            </button>
          )}

          <AnimatePresence>
            {isScanning && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card rounded-xl p-6 flex items-center gap-4 border-primary/20"
              >
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground text-sm">Processing Receipt Image</p>
                  <p className="text-xs text-primary font-medium mt-1 pulse-glow-effect">{scanStep}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">OCR Execution Failed</p>
                <p className="mt-1 leading-normal opacity-90">{error}</p>
                <button
                  onClick={startScan}
                  className="mt-2 text-[10px] underline font-bold hover:text-white uppercase tracking-wider"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Parsed Verification Panel */}
        <div>
          {parsedData ? (
            <div className="glass-card rounded-xl p-6 lg:p-8 space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <div>
                  <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    Verify Details
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Edit fields if AI OCR made any errors</p>
                </div>
                <button
                  onClick={startScan}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-white/5 hover:border-white/10 px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Re-scan</span>
                </button>
              </div>

              {/* Main Fields Form */}
              <div className="space-y-4">
                {/* Merchant */}
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground block mb-1.5">
                    Merchant Name
                  </label>
                  <input
                    type="text"
                    value={parsedData.merchant}
                    onChange={(e) => setParsedData({ ...parsedData, merchant: e.target.value })}
                    className="w-full bg-[#0d122d]/60 border border-white/5 rounded-lg px-3 py-2.5 text-sm focus:border-primary transition-all outline-none text-foreground"
                  />
                </div>

                {/* Date and Amount Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Date */}
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground block mb-1.5">
                      Transaction Date
                    </label>
                    <input
                      type="date"
                      value={parsedData.date}
                      onChange={(e) => setParsedData({ ...parsedData, date: e.target.value })}
                      className="w-full bg-[#0d122d]/60 border border-white/5 rounded-lg px-3 py-2.5 text-sm focus:border-primary transition-all outline-none text-foreground"
                    />
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground block mb-1.5">
                      Total Amount ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={parsedData.amount}
                      onChange={(e) => setParsedData({ ...parsedData, amount: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[#0d122d]/60 border border-white/5 rounded-lg px-3 py-2.5 text-sm focus:border-primary transition-all outline-none text-foreground font-mono font-semibold"
                    />
                  </div>
                </div>

                {/* Category Selection */}
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground block mb-1.5">
                    Expense Category
                  </label>
                  <select
                    value={parsedData.category}
                    onChange={(e) => setParsedData({ ...parsedData, category: e.target.value as ExpenseCategory })}
                    className="w-full bg-[#0d122d]/60 border border-white/5 rounded-lg px-3 py-2.5 text-sm focus:border-primary transition-all outline-none text-foreground cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Line Items Editor */}
              <div className="pt-4 border-t border-white/5">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Receipt Items</span>
                  <button
                    onClick={addLineItem}
                    className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-primary hover:underline cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                  {parsedData.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-white/[0.01] border border-white/5 p-2 rounded-lg"
                    >
                      <input
                        type="text"
                        value={item.name}
                        placeholder="Item name"
                        onChange={(e) => updateLineItem(index, 'name', e.target.value)}
                        className="flex-1 bg-transparent border-none text-xs text-foreground focus:outline-none placeholder:text-muted-foreground/50"
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(index, 'quantity', e.target.value)}
                        className="w-12 bg-white/5 border border-white/5 rounded px-1.5 py-0.5 text-center text-xs text-foreground focus:outline-none"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Price"
                        value={item.price || ''}
                        onChange={(e) => updateLineItem(index, 'price', e.target.value)}
                        className="w-16 bg-white/5 border border-white/5 rounded px-1.5 py-0.5 text-right text-xs text-foreground focus:outline-none font-mono"
                      />
                      <button
                        onClick={() => removeLineItem(index)}
                        className="text-muted-foreground hover:text-destructive p-1 rounded hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  {parsedData.items.length === 0 && (
                    <p className="text-xs text-muted-foreground italic text-center py-2">
                      No line items. Click &quot;Add Item&quot; to log individual items.
                    </p>
                  )}
                </div>
              </div>

              {/* Confirm Save CTA */}
              <button
                onClick={saveTransaction}
                className="w-full bg-primary text-background font-bold py-3.5 rounded-lg hover:opacity-90 active:scale-98 transition-all primary-glow cursor-pointer uppercase tracking-wider text-xs"
              >
                Approve & Save Expense
              </button>
            </div>
          ) : (
            <div className="glass-card rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[350px] text-muted-foreground">
              <FileText className="h-12 w-12 stroke-[1.5] mb-4 opacity-45" />
              <h4 className="font-semibold text-base text-foreground mb-1">OCR Review Panel</h4>
              <p className="text-xs max-w-xs leading-relaxed">
                Choose a receipt image on the left and trigger analysis. The extracted details will appear here for audit.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
