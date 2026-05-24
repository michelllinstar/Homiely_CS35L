import "./Expenses.css";
import { useAuth } from "../AuthContext"
import Button from "../../components/Button";
import { useState } from "react";


export default function BalanceSummary({ expenses, roommates }) {
  const getName = (id) => roommates.find(r => r.id === id)?.name || "Unknown";

  // calculate net balance per pair
  const balances = {};
  
  console.log(balances);

  expenses.forEach(expense => {
    const share = expense.amount / expense.split_between.length;
    expense.split_between.forEach(uid => {
      if (uid === expense.paid_by) return; // payer doesn't owe themselves
      // uid owes expense.paid_by `share` amount
      const key = `${uid}-${expense.paid_by}`;
      const reverseKey = `${expense.paid_by}-${uid}`;
      if (balances[reverseKey]) {
        balances[reverseKey] -= share; // offset against what they're already owed
      } else {
        balances[key] = (balances[key] || 0) + share;
      }
    });
  });

  const summaries = Object.entries(balances)
    .filter(([_, amount]) => amount > 0.01) // ignore tiny rounding differences
    .map(([key, amount]) => {
      const [owerId, owedId] = key.split("-").map(Number);
      return { owerId, owedId, amount };
    });

  return (
  <div className="balance-summary">
    <h2>Who Owes What</h2>
    {summaries.length === 0 ? (
      <p className="settled">✓ All settled up!</p>
    ) : (
      summaries.map(({ owerId, owedId, amount }) => (
        <div key={`${owerId}-${owedId}`} className="balance-row">
          <span>{getName(owerId)} owes {getName(owedId)}</span>
          <span className="balance-amount">${amount.toFixed(2)}</span>
        </div>
      ))
    )}
  </div>
);
}