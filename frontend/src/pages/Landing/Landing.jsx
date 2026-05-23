import "./Landing.css";
import Button from "../../components/Button";
import Navbar from "../../components/Navbar";

const features = [
  { bg: '#EAF3DE', icon: '🧹', title: 'Smart chore charts', desc: 'Auto-rotating weekly assignments, reminders, and a one-tap check-off everyone can see.' },
  { bg: '#fbeaf0', icon: '🧾', title: 'Group expense tab', desc: 'Log shared purchases by photo or amount. Homiely figures out who owes whom — no math.' },
  { bg: '#E6F1FB', icon: '📅', title: 'Shared availability', desc: "See at a glance who's home, in class, or heads-down. Plan dinners and movie nights easily." },
  { bg: '#FAEEDA', icon: '🔔', title: 'Gentle reminders', desc: 'No more passive-aggressive sticky notes. Homiely nudges the right person at the right time.' },
];

const steps = [
  { num: '1', bg: '#f5c4b3', color: '#712B13', title: 'Create your home', desc: 'Sign up with your email and give your place a name. Takes about 30 seconds.' },
  { num: '2', bg: '#9FE1CB', color: '#085041', title: 'Invite your roommates', desc: 'Send a link or enter their emails. They join in one tap — no account needed to start.' },
  { num: '3', bg: '#B5D4F4', color: '#0C447C', title: 'Set up your home', desc: "Add chores, recurring expenses, and each person's schedule. Homiely handles the rest." },
  { num: '4', bg: '#FAEEDA', color: '#633806', title: 'Live in harmony', desc: "Check off tasks, log groceries, and stop wondering whose turn it is to take out the trash." },
];

const stats = [
  { num: '2,400+', color: '#D4537E', desc: 'Shared homes using Homiely to stay organized and drama-free.' },
  { num: '$180k',  color: '#1D9E75', desc: 'In shared expenses tracked and split fairly — without a single argument.' },
  { num: '12k',    color: '#534AB7', desc: "Chores checked off. That's a lot of clean kitchens and taken-out trash." },
];
export default function Landing() {
  return (
    <div className="landing-page">
      <Navbar />
      <div className="landing-content">
        <h1 className="title">Welcome to Homiely</h1>
        <p style={{ fontSize: 19, maxWidth: 580, margin: '0 auto 36px', lineHeight: 1.5 }}>
          Homily is the cozy way to share a home. Track chores, split expenses, and stay in sync —
          without the awkward group chat or the mystery of who bought soap last.
        </p>
        <div className="button-row">
          <Button label="Sign up" to="/Signup" />
          <Button label="Log in" to="/login" />
        </div>
      </div>

      <section id="features" className="section section-pink">
        <span className="section-label" style={{ background: '#f5c4b3', color: '#712B13' }}>Features</span>
        <h2>Everything a shared home needs.</h2>
        <p className="section-subtitle">Four roommates, one tidy app. Less arguing, more game nights.</p>
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
        <h2>Up and running in 60 seconds.</h2>
        <p className="section-subtitle">No spreadsheets, no group chats, no drama.</p>
        <div className="steps-grid">
          {steps.map(({ num, bg, color, title, desc }) => (
            <div key={num} className="step">
              <div className="step-number" style={{ background: bg, color }}>{num}</div>
              <div><h3>{title}</h3><p>{desc}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section id="about" className="section section-pink">
        <span className="section-label" style={{ background: '#CECBF6', color: '#3C3489' }}>About</span>
        <h2>Built by roommates, for roommates.</h2>
        <p className="section-subtitle">We got tired of the awkward Venmo requests and forgotten dish duties. So we built the app we always wished existed.</p>
        <div className="about-grid">
          {stats.map(({ num, color, desc }) => (
            <div key={num} className="about-stat">
              <div className="about-stat-number" style={{ color }}>{num}</div>
              <p>{desc}</p>
            </div>
          ))}
        </div>
        <p className="about-footnote">Made with love in Los Angeles. Started at UCLA.</p>
      </section>
    </div>
  );
}