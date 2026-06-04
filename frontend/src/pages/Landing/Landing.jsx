import "./Landing.css";
import Button from "../../components/Button";
import Navbar from "../../components/Navbar";
import { useEffect, useState } from "react";


const features = [
  { bg: '#EAF3DE', icon: '🧹', title: 'Chores', desc: 'Add chores for the week and mark them done when someone finishes them.' },
  { bg: '#fbeaf0', icon: '🧾', title: 'Expenses', desc: 'Keep track of shared stuff like groceries, paper towels, or rent extras.' },
  { bg: '#E6F1FB', icon: '📅', title: 'Calendar', desc: "See when people are free, busy, or just don't want to be bothered." },
  { bg: '#FAEEDA', icon: '🔔', title: 'House info', desc: 'Keep the important roommate things in one place instead of losing them in texts.' },
];

const steps = [
  { num: '1', bg: '#f5c4b3', color: '#712B13', title: 'Make an account', desc: 'Sign up and log in with your email.' },
  { num: '2', bg: '#9FE1CB', color: '#085041', title: 'Create or join a group', desc: 'Start a roommate group or join one with a code.' },
  { num: '3', bg: '#B5D4F4', color: '#0C447C', title: 'Add your house stuff', desc: 'Put in chores, expenses, and availability.' },
  { num: '4', bg: '#FAEEDA', color: '#633806', title: 'Use it during the week', desc: "Check things off and update the group when something changes." },
];
export default function Landing() {
  const [isNight, setIsNight] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    setIsNight(hour >= 20 || hour < 6); // night = 8pm to 6am
  }, []);

  return (
    <div className="landing-page">
      <Navbar />
      <div className={`landing-content landing-hero ${isNight ? "night" : ""}`}>
        <p className="hero-eyebrow">For shared apartments and dorms</p>
        <h1 className="title">Welcome to Homiely</h1>
        <p className="hero-subtitle">
          A simple place for roommates to keep track of chores, money, and schedules
          without digging through the group chat.
        </p>
        <div className="button-row">
          <Button label="Sign up" to="/Signup" className="hero-button hero-signup" />
          <Button label="Log in" to="/login" className="hero-button hero-login" />
        </div>
      </div>

      <section id="features" className="section section-pink">
        <span className="section-label" style={{ background: '#f5c4b3', color: '#712B13' }}>Features</span>
        <h2>The main roommate stuff.</h2>
        <p className="section-subtitle">Chores, expenses, and schedules in one spot.</p>
        <div className="feature-grid">
          {features.map(({ bg, icon, title, desc }) => (
            <div key={title} className="feature-card">
              <div className="feature-card-icon" style={{ background: bg }}>{icon}</div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="section section-green">
        <span className="section-label" style={{ background: '#9FE1CB', color: '#085041' }}>How it works</span>
        <h2>How to get started.</h2>
        <p className="section-subtitle">Make a group, invite roommates, and start adding what your home needs.</p>
        <div className="steps-grid">
          {steps.map(({ num, bg, color, title, desc }) => (
            <div key={num} className="step">
              <div className="step-number" style={{ background: bg, color }}>{num}</div>
              <div><h3>{title}</h3><p>{desc}</p></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
