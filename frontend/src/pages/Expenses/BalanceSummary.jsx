import "./Expenses.css";
import { getBalanceSummaries } from "../../utils/balances";

export default function BalanceSummary({ expenses, roommates }) {
  const getName = (id) => roommates.find(r => r.id === id)?.name || "Unknown";
  const summaries = getBalanceSummaries(expenses);

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
