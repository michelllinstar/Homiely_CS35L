import { BrowserRouter, Routes, Route } from "react-router-dom";
import DemoFlow from "./components/DemoFlow";

import Landing from "./pages/Landing/Landing";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import Home from "./pages/Home/Home";
import Calendar from "./pages/Calendar/Calendar";
import { AuthProvider } from "./pages/AuthContext";
import Chores from "./pages/Chores/Chores";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/home" element={<Home />} />
          <Route path="/chores" element={<Chores />} />
          <Route path="/calendar" element={<Calendar />} />
        </Routes>
        <DemoFlow />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
