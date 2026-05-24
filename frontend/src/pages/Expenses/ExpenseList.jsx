import "./Expenses.css";
import Button from "../../components/Button";

export default function ExpenseList({expenses, roommates, onDelete}) {
  
  
  return (
  <div className="expense-list">
    <h2>Expense List</h2>
    <ul>
      {expenses.map(e => (
        <li key={e.id} className="expense-item">
          <span className="expense-description">{e.description}</span>
          <span className="expense-amount">${e.amount.toFixed(2)}</span>
          <p>Paid by: {roommates.find(r => r.id === e.paid_by)?.name || "Unknown"}</p>
          <p>Split: {e.split_between.map(id => roommates.find(r => r.id === id)?.name).join(", ")}</p>
          <Button label="Delete" onClick={() => onDelete(e.id)} />
        </li>
      ))}
    </ul>
  </div>
);
}
