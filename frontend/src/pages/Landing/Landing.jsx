import "./Landing.css";
import Button from '../../components/Button';

export default function Landing() {
  return (
    
    <div className="landing-page">
      <h1 className="title">Welcome to Homiely</h1>

      <p className="subtitle">
        Track chores, split expenses, and keep roommate life peaceful.
      </p>

      <div className="button-row">
        <Button label="Sign in" to="/Signup"/>
        <Button label="Log in" to="/login" />
      </div>
    </div>
  );
}