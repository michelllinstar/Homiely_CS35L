import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import Button from "../../components/Button";
import AddExpenseForm from "./AddExpenseForm";
import ExpenseList from "./ExpenseList";
import BalanceSummary from "./BalanceSummary";
import ExpensesSlider from "./ExpensesSlider";
import "./Expenses.css";

import AppNavbar from "../../components/Home_components/AppNavbar";
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
        <h1>Expenses</h1>
        <p>Please log in to view expenses.</p>
        <Button to="/login" label="Log in" />
      </div>
    );
  }

  if (!groupId) {
    return (
      <div className="expenses-page">
        <h1>Expenses</h1>
        <p>You need to create or join a roommate group before tracking expenses.</p>
        <Button to="/group-setup" label="Set up roommate group" />
      </div>
    );
  }

  return (
   <div>
    {/* 6/3 12:48 am: added navbar to expenses page */}
    <AppNavbar />
    <div className="expenses-page">
      
      <h1>Expenses</h1>
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

// [GenAI Prompt] i want an expense page that allows roommates to add expenses and show what they owe each other. what information would i send to the backend, and how would you recommend i organize the information with what i currently have?
//  [GenAI Use] LLM Response Start

// Great feature! Here's how I'd think about it given your existing setup.

// What information to send to the backend:

// When a roommate adds an expense:

// json
// {
//   "description": "Groceries",
//   "amount": 84.50,
//   "paid_by": 1,          // user_id of who paid
//   "split_between": [1, 2, 3]  // user_ids of who owes a share
// }
// Database models to add:

// python
// class Expense(db.Model):
//     id = db.Column(db.Integer, primary_key=True)
//     description = db.Column(db.String(100), nullable=False)
//     amount = db.Column(db.Float, nullable=False)
//     paid_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
//     group_id = db.Column(db.Integer, db.ForeignKey('group.id'), nullable=False)
//     created_at = db.Column(db.DateTime, default=db.func.now())
//     splits = db.relationship('ExpenseSplit', backref='expense', lazy=True)

// class ExpenseSplit(db.Model):
//     id = db.Column(db.Integer, primary_key=True)
//     expense_id = db.Column(db.Integer, db.ForeignKey('expense.id'), nullable=False)
//     owed_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
//     amount = db.Column(db.Float, nullable=False)   # each person's share
//     is_paid = db.Column(db.Boolean, default=False)
// The reason for two tables is that one expense can have multiple splits — e.g. a $90 grocery bill split 3 ways creates one Expense row and three ExpenseSplit rows of $30 each.

// Flask endpoints:

// python
// @app.route('/api/expenses', methods=['POST'])
// @jwt_required()
// def add_expense():
//     data = request.get_json()
//     user_id = int(get_jwt_identity())

//     split_between = data.get("split_between", [])
//     share = round(data["amount"] / len(split_between), 2)

//     expense = Expense(
//         description=data["description"],
//         amount=data["amount"],
//         paid_by=user_id,
//         group_id=data["group_id"]
//     )
//     db.session.add(expense)
//     db.session.flush()

//     for uid in split_between:
//         split = ExpenseSplit(
//             expense_id=expense.id,
//             owed_by=uid,
//             amount=share
//         )
//         db.session.add(split)

//     db.session.commit()
//     return jsonify({"message": "Expense added", "expense_id": expense.id})


// @app.route('/api/expenses/<int:group_id>', methods=['GET'])
// @jwt_required()
// def get_expenses(group_id):
//     expenses = Expense.query.filter_by(group_id=group_id).all()
//     result = []
//     for e in expenses:
//         result.append({
//             "id": e.id,
//             "description": e.description,
//             "amount": e.amount,
//             "paid_by": e.paid_by,
//             "splits": [
//                 {"owed_by": s.owed_by, "amount": s.amount, "is_paid": s.is_paid}
//                 for s in e.splits
//             ]
//         })
//     return jsonify(result)


// @app.route('/api/expenses/settle', methods=['POST'])
// @jwt_required()
// def settle_split():
//     data = request.get_json()
//     split = ExpenseSplit.query.get(data["split_id"])
//     split.is_paid = True
//     db.session.commit()
//     return jsonify({"message": "Marked as paid"})
// How the data flows on the frontend:

// Expenses Page
// ├── Add Expense Form
// │     ├── description (text input)
// │     ├── amount (number input)
// │     └── split_between (checkboxes, one per roommate)
// │
// └── Expense List
//       └── per expense:
//             ├── who paid, total amount
//             └── per split: who owes what, paid/unpaid status
// Calculating who owes who (do this on the frontend from the splits data):

// js
// // build a summary like "Alice owes Bob $30"
// function calculateBalances(expenses, currentUserId) {
//   const balances = {}; // { userId: amount } positive = they owe you, negative = you owe them

//   expenses.forEach(expense => {
//     expense.splits.forEach(split => {
//       if (split.is_paid) return;

//       if (expense.paid_by === currentUserId && split.owed_by !== currentUserId) {
//         // someone owes you
//         balances[split.owed_by] = (balances[split.owed_by] || 0) + split.amount;
//       } else if (split.owed_by === currentUserId && expense.paid_by !== currentUserId) {
//         // you owe someone
//         balances[expense.paid_by] = (balances[expense.paid_by] || 0) - split.amount;
//       }
//     });
//   });

//   return balances;
// }
// How it fits into your existing system:

// User ──belongs to──► Group
//                        │
//                        ├──has many──► Expense (paid_by a User)
//                                         │
//                                         └──has many──► ExpenseSplit (owed_by a User)
// Everything is scoped to a group_id so roommates only see their group's expenses, which slots naturally into the group system you already built.
// [GenAI Use] LLM Response End
// [GenAI Use] Reflection: Since I started with Login, I had a good idea of how this page would pan out already, so I wanted Claude to give me only a small suggestion of what these pages could look like. I used the code as a reference and tried to come up with the code by memory. That being said, I think this structure allows for a lot of flexibility. For example, you could easily extend it to support features like recurring expenses, expense categories, or even integrating with payment APIs to allow roommates to settle up directly through the app. The key is that by breaking down expenses into a main Expense and individual ExpenseSplits, you can handle a wide variety of scenarios while keeping the data organized and easy to work with on both the frontend and backend. 