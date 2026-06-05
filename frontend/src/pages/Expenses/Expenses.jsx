// [GenAI Use] Prompt: "Show the shared EmptyState when logged out or not in a roommate group, keeping AppNavbar outside the page container so its styles are not clobbered."
// [GenAI Use] Reflection: The response handled a subtle requirement well — keeping AppNavbar outside the page container so its styles aren't clobbered, which I'd specifically asked for and it respected. I verified the navbar renders correctly and the empty states route appropriately. The only thing I watched for was that the guard order didn't break the hooks, and it didn't.

import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import AddExpenseForm from "./AddExpenseForm";
import ExpenseList from "./ExpenseList";
import BalanceSummary from "./BalanceSummary";
import ExpensesSlider from "./ExpensesSlider";
import "./Expenses.css";

import AppNavbar from "../../components/Home_components/AppNavbar";
import EmptyState from "../../components/EmptyState";
// import App from "../../app";


export default function Expenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [roommates, setRoommates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("access_token");
  const groupId = user?.roommate_group_id;

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    if (!groupId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [expensesRes, roommatesRes] = await Promise.all([
          fetch(`/api/expenses/${groupId}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`/api/groups/${groupId}/members`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (!expensesRes.ok || !roommatesRes.ok) {
          setError("Could not load expenses. Please try logging in again.");
          return;
        }

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
  }, [groupId, token, user]);

  const addExpense = async (newExpense) => {
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ ...newExpense, group_id: groupId })
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.message || data.error || "Could not add expense.");
      return;
    }

    // refetch expenses so splits are calculated server-side
    const updated = await fetch(`/api/expenses/${groupId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setExpenses(await updated.json());
  };

  const deleteExpense = async (id) => {
    await fetch(`/api/expenses/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    setExpenses(expenses.filter(e => e.id !== id));
  };

  if (loading) return <div className="expenses-page"><p>Loading...</p></div>;

  if (!user) {
    return (
      <div className="expenses-page">
        <EmptyState
          title="Expenses"
          message="Please log in to view expenses."
          actionLabel="Log in"
          actionTo="/login"
        />
      </div>
    );
  }

  if (!groupId) {
    return (
      <div>
        {/* Keep AppNavbar outside .expenses-page — the page's descendant
            styles (.expenses-page .button, h2, etc.) would otherwise clobber
            the navbar. This mirrors the main render below. */}
        <AppNavbar />
        <div className="expenses-page">
          <EmptyState
            title="Expenses"
            message="You need to create or join a roommate group before tracking expenses."
            actionLabel="Set up roommate group"
            actionTo="/group-setup"
          />
        </div>
      </div>
    );
  }

  return (
   <div>
    {/* 6/3 12:48 am: added navbar to expenses page */}
    <AppNavbar />
    <div className="expenses-page">
      <header className="expenses-header">
        <h1 className="expenses-title">Expenses</h1>
        <p className="expenses-subtitle">Track shared costs with your roommates</p>
      </header>
      {error && <p className="expenses-error">{error}</p>}
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
   </div>
  );
}
