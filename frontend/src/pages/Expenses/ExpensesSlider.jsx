import "./Expenses.css";

export default function ExpensesSlider ({ expenses, roommates }) {

  return (
    <div className="expenses-slider">
      <h2>Who Has Contributed What?</h2>
        <div className="roommate-expense-bar">
             <ul>
                {roommates.map(roommate => (
                  <li key={roommate.id}>
                    <h3>{roommate.name}</h3>
                    <p>{expenses.reduce((total, expense) => {
                        if (expense.paid_by === roommate.id) {
                            return total + expense.amount;
                        } return total;
                        }, 0).toFixed(2)} / {expenses.reduce((total, expense) => total + expense.amount, 0).toFixed(2)}</p>
                    <progress value={expenses.reduce((total, expense) => {
                        if (expense.paid_by === roommate.id) {
                            return total + expense.amount;
                        }
                        return total;
                    }, 0)} max={expenses.reduce((total, expense) => total + expense.amount, 0)}></progress>
                  </li>
                ))}
             </ul>
        </div>
    </div>
  );
}
