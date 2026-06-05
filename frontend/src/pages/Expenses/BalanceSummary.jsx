import { useState } from "react";
import { useAuth } from "../../pages/AuthContext";
import "./Expenses.css";
import { getBalanceSummaries } from "../../utils/balances";

export default function BalanceSummary({ expenses, roommates }) {
  const { user } = useAuth();
  const [onlyOwedToMe, setOnlyOwedToMe] = useState(false);

  const getName = (id) => roommates.find((r) => r.id === id)?.name || "Unknown";
  const sortedSummaries = getBalanceSummaries(expenses)
    .filter((summary) => (onlyOwedToMe ? summary.owedId === user?.id : true))
    .sort((a, b) => {
      const nameA = getName(a.owedId).toLowerCase();
      const nameB = getName(b.owedId).toLowerCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return getName(a.owerId).localeCompare(getName(b.owerId));
    });

  const groupedSummaries = sortedSummaries.reduce((groups, summary) => {
    const group = groups[summary.owedId] || { owedId: summary.owedId, items: [] };
    group.items.push(summary);
    groups[summary.owedId] = group;
    return groups;
  }, {});

  const summaryGroups = Object.values(groupedSummaries);

  return (
    <div className="balance-summary">
      <div className="balance-summary-header">
        <h2>Who Owes What</h2>
        <label className="balance-filter">
          <input
            type="checkbox"
            checked={onlyOwedToMe}
            onChange={(e) => setOnlyOwedToMe(e.target.checked)}
          />
          Only show what is owed to me
        </label>
      </div>
      {summaryGroups.length === 0 ? (
        <p className="settled">✓ All settled up!</p>
      ) : (
        summaryGroups.map(({ owedId, items }) => (
          <div key={owedId} className="balance-group">
            <div className="balance-group-header">
              Money owed by {getName(owedId)}
            </div>
            <div className="balance-group-list">
              {items.map(({ owerId, owedId: groupOwedId, amount }) => (
                <div key={`${owerId}-${groupOwedId}`} className="balance-row">
                  <span>{getName(groupOwedId)} owes {getName(owerId)}</span>
                  <span className="balance-amount">${amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
