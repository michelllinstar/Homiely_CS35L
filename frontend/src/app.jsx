import { useState } from "react";
import "./App.css";

import Home from "./pages/Home/Home";

function App() {
  const [showHome, setShowHome] = useState(false);

  if (showHome) {
    return <Home />;
  }

  return (
    <div className="landing-page">
      <h1 className="title">Welcome to Homiely</h1>

      <button
        className="enter-button"
        onClick={() => setShowHome(true)}
      >
        Enter Home Page
      </button>
    </div>
  );
}

export default App;