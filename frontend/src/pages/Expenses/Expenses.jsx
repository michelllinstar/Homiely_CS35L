import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import AddExpenseForm from "./AddExpenseForm";
import ExpenseList from "./ExpenseList";
import BalanceSummary from "./BalanceSummary";
import ExpensesSlider from "./ExpensesSlider";

export default function Expenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [roommates, setRoommates] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("access_token");
  const groupId = user?.group_id; // make sure group_id is stored on user in AuthContext

  useEffect(() => {
    if (!groupId) return;

    const fetchData = async () => {
      try {
        const [expensesRes, roommatesRes] = await Promise.all([
          fetch(`http://localhost:5000/api/expenses/${groupId}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`http://localhost:5000/api/groups/${groupId}/members`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const expensesData = await expensesRes.json();
        const roommatesData = await roommatesRes.json();

        setExpenses(expensesData);
        setRoommates(roommatesData);
      } catch (err) {
        console.error("Failed to fetch expenses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [groupId]);

  const addExpense = async (newExpense) => {
    const res = await fetch("http://localhost:5000/api/expenses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ ...newExpense, group_id: groupId })
    });
    const data = await res.json();
    // refetch expenses so splits are calculated server-side
    const updated = await fetch(`http://localhost:5000/api/expenses/${groupId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setExpenses(await updated.json());
  };

  const deleteExpense = async (id) => {
    await fetch(`http://localhost:5000/api/expenses/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    setExpenses(expenses.filter(e => e.id !== id));
  };

  if (loading) return <div className="expenses-page"><p>Loading...</p></div>;

  return (
    <div className="expenses-page">
      <h1>Expenses</h1>
      <div className="expenses-grid">
        <div className="expenses-col">
          <AddExpenseForm roommates={roommates} onAdd={addExpense} />
          <ExpenseList expenses={expenses} roommates={roommates} onDelete={deleteExpense} />
        </div>
        <div className="expenses-col">
          <BalanceSummary expenses={expenses} roommates={roommates} />
          <ExpensesSlider expenses={expenses} roommates={roommates} />
        </div>
      </div>
    </div>
  );
}