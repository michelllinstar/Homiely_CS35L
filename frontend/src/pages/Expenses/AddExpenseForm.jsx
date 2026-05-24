import "./Expenses.css";
import Button from "../../components/Button";
import { useEffect, useState } from "react";

export default function AddExpenseForm({roommates, onAdd}) {
  const [ description, setDescription ] = useState("");
  const [ amount, setAmount ] = useState(0);
  const [ paidBy, setPaidBy ] = useState("");
  const [ splitBetween, setSplitBetween ] = useState([]);

  useEffect(() => {
    setPaidBy(roommates[0]?.id || "");
    setSplitBetween(roommates.map(r => r.id));
  }, [roommates]);

  // if the
  const toggleSplit = (id) => {
    setSplitBetween(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // return early if details are invalid. else do onAdd and reset fields.
  const handleSubmit = () => {
    if (!description || amount <= 0 || !paidBy || splitBetween.length === 0) {
        return;
    }

    onAdd({
        description,
        amount: parseFloat(amount),
        paid_by: paidBy, 
        split_between: splitBetween 
    });

    setDescription("");
    setAmount(0);
  }
  
  return (
    <div className="add-expense-form">
      <h2>Add Expense</h2>
      <input placeholder="Description of Expense" value={description} onChange={e => setDescription(e.target.value)}/>
      <input placeholder="Amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} />

      <label>Paid by: </label>
      <select value={paidBy} onChange={e => setPaidBy(Number(e.target.value))}>{roommates.map(r=> <option key={r.id} value={r.id}>{r.name}</option>)}</select>
      <label>Split between:</label>
        <div className="checkbox-group">
        {roommates.map(r => (
            <label key={r.id}>
            <input type="checkbox" checked={splitBetween.includes(r.id)}
                onChange={() => toggleSplit(r.id)} />
            {r.name}
            </label>
        ))}
        </div>

      <Button onClick={handleSubmit} label="Add Expense" />
    </div>
  );
}
