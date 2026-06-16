# 🧾 Receiptify - AI Receipt Reader & Expense Tracker

Receiptify is a modern, AI-powered financial dashboard built with **Next.js 16**, **React 19**, and **TailwindCSS v4**. It leverages the power of Google's **Gemini 2.5 Flash** to instantly parse physical receipts, extract key financial metadata, and categorize your expenses in a sleek, glassmorphic UI.

## ✨ Features

- **🧠 AI-Powered Receipt OCR:** Upload any receipt image, and the Gemini API automatically extracts the Merchant Name, Date, Total Amount, and Category.
- **🛡️ Smart Mock Fallback:** If no API key is configured, the app simulates a high-fidelity parsing experience for testing purposes.
- **📊 Dynamic Dashboard & Analytics:** View your financial overview with beautiful category charts, interactive tooltips, and budget metrics.
- **💡 Intelligent Insights:** Get automatic recommendations and notifications based on your spending trends.
- **💾 Local Storage Database:** All transactions and budget limits are safely saved to your browser's local storage.
- **🎨 Glassmorphic Design:** A premium dark-mode aesthetic with custom animations and interactive UI elements.

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js installed.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Shaurya8008/RECEIPT-READER-AND-EXPENSE-TRACKER.git
   cd RECEIPT-READER-AND-EXPENSE-TRACKER
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_google_gemini_api_key_here
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🛠️ Technology Stack

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **AI Integration:** `@google/generative-ai`

## 📝 License
This project is for educational and portfolio purposes.
