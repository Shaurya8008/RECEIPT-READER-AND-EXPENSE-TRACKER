export type ExpenseCategory = 'Food' | 'Tech' | 'Travel' | 'Health' | 'Luxury' | 'Utilities' | 'Misc';

export interface TransactionItem {
  name: string;
  price: number;
  quantity: number;
}

export interface Transaction {
  id: string;
  merchant: string;
  date: string; // YYYY-MM-DD
  amount: number;
  category: ExpenseCategory;
  items: TransactionItem[];
  status: 'Completed' | 'Pending';
  createdAt: string;
}

export interface BudgetConfig {
  monthlyLimit: number;
  categoryBudgets: Record<ExpenseCategory, number>;
}

// Initial mock data for first-time premium look
const INITIAL_MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    merchant: 'Amazon US',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 day ago
    amount: 124.99,
    category: 'Tech',
    items: [
      { name: 'Mechanical Keyboard mechanical switches', price: 89.99, quantity: 1 },
      { name: 'USB-C Cable braided 6ft', price: 15.00, quantity: 2 }
    ],
    status: 'Completed',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'tx-2',
    merchant: 'Starbucks Coffee',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days ago
    amount: 6.50,
    category: 'Food',
    items: [
      { name: 'Venti Caramel Macchiato', price: 6.50, quantity: 1 }
    ],
    status: 'Completed',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'tx-3',
    merchant: 'Uber Rides',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days ago
    amount: 18.20,
    category: 'Travel',
    items: [
      { name: 'UberX Trip (Downtown to Airport)', price: 18.20, quantity: 1 }
    ],
    status: 'Pending',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'tx-4',
    merchant: 'Whole Foods Market',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days ago
    amount: 85.40,
    category: 'Food',
    items: [
      { name: 'Organic Atlantic Salmon', price: 24.50, quantity: 1 },
      { name: 'Fresh Organic Berries Trio', price: 15.90, quantity: 1 },
      { name: 'Avocado Bag (5-pack)', price: 6.99, quantity: 2 },
      { name: 'Pantry Groceries', price: 31.02, quantity: 1 }
    ],
    status: 'Completed',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'tx-5',
    merchant: 'PG&E Electric Utility',
    date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 8 days ago
    amount: 142.15,
    category: 'Utilities',
    items: [
      { name: 'Monthly Electricity & Gas Statement', price: 142.15, quantity: 1 }
    ],
    status: 'Completed',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'tx-6',
    merchant: 'Apple Store',
    date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 12 days ago
    amount: 899.00,
    category: 'Tech',
    items: [
      { name: 'iPhone 15 Pro Max 256GB Upgrade', price: 899.00, quantity: 1 }
    ],
    status: 'Completed',
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'tx-7',
    merchant: 'CVS Pharmacy',
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days ago
    amount: 32.50,
    category: 'Health',
    items: [
      { name: 'Prescription Refill', price: 15.00, quantity: 1 },
      { name: 'Multivitamins Gummies', price: 17.50, quantity: 1 }
    ],
    status: 'Completed',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const DEFAULT_BUDGET: BudgetConfig = {
  monthlyLimit: 2000.00,
  categoryBudgets: {
    Food: 500,
    Tech: 1000,
    Travel: 250,
    Health: 150,
    Luxury: 300,
    Utilities: 200,
    Misc: 100
  }
};

// Safe helper to check window object
const isClient = () => typeof window !== 'undefined';

export function getTransactions(): Transaction[] {
  if (!isClient()) return [];
  const stored = localStorage.getItem('receiptify_transactions');
  if (!stored) {
    localStorage.setItem('receiptify_transactions', JSON.stringify(INITIAL_MOCK_TRANSACTIONS));
    return INITIAL_MOCK_TRANSACTIONS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to parse transactions, resetting to initial', e);
    return INITIAL_MOCK_TRANSACTIONS;
  }
}

export function saveTransactions(transactions: Transaction[]) {
  if (!isClient()) return;
  localStorage.setItem('receiptify_transactions', JSON.stringify(transactions));
}

export function addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Transaction {
  const newTx: Transaction = {
    ...transaction,
    id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString()
  };
  const list = getTransactions();
  const updated = [newTx, ...list];
  saveTransactions(updated);
  return newTx;
}

export function deleteTransaction(id: string): Transaction[] {
  const list = getTransactions();
  const updated = list.filter(t => t.id !== id);
  saveTransactions(updated);
  return updated;
}

export function getBudgetConfig(): BudgetConfig {
  if (!isClient()) return DEFAULT_BUDGET;
  const stored = localStorage.getItem('receiptify_budget');
  if (!stored) {
    localStorage.setItem('receiptify_budget', JSON.stringify(DEFAULT_BUDGET));
    return DEFAULT_BUDGET;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to parse budget config, resetting to default', e);
    return DEFAULT_BUDGET;
  }
}

export function saveBudgetConfig(config: BudgetConfig) {
  if (!isClient()) return;
  localStorage.setItem('receiptify_budget', JSON.stringify(config));
}
