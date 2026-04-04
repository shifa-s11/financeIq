import React from 'react';
import ReactDOM from 'react-dom/client';
import '@/index.css'
import mockTransactions from '@/data/mockData';
import { getMonthlyData, getCurrentMonthSummary, getInsights } from '@/utils/calculations';

const monthly = getMonthlyData(mockTransactions);
const summary = getCurrentMonthSummary(mockTransactions);
const insights = getInsights(mockTransactions);

console.log('✅ Transactions loaded:', mockTransactions.length);
console.log('✅ Monthly data:', monthly);
console.log('✅ Summary:', summary);
console.log('✅ Insights:', insights);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div className="p-8 space-y-2">
      <p className="text-2xl font-bold">Steps 2 & 3 ✅</p>
      <p>Transactions: {mockTransactions.length}</p>
      <p>Months tracked: {monthly.length}</p>
      <p>June income: ${summary.income}</p>
      <p>Top category: {insights.topCategory.category}</p>
      <p>Best savings month: {insights.bestSavingsMonth.month}</p>
    </div>
  </React.StrictMode>
);
