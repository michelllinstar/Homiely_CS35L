import "./Home.css";

export default function Home() {
  return (
    <div className="home-page">
      <h1>Homily</h1>
      <p>
        A roommate management app for chores, shared expenses, and household accountability.
      </p>

      <div className="card-row">
        <div className="card">
          <h2>Chores</h2>
          <p>Assign, schedule, and verify roommate responsibilities.</p>
        </div>

        <div className="card">
          <h2>Expenses</h2>
          <p>Track who paid for utilities, soap, groceries, and more.</p>
        </div>

        <div className="card">
          <h2>Household</h2>
          <p>Keep everyone on the same page without awkward reminders.</p>
        </div>
      </div>
    </div>
  );
}