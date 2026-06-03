import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing/Landing";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import Verification from "./pages/Verification/Verification";
import Home from "./pages/Home/Home";
import Calendar from "./pages/Calendar/Calendar";
import Expenses from "./pages/Expenses/Expenses"
import { AuthProvider } from "./pages/AuthContext";
import Chores from "./pages/Chores/Chores";
import GroupSetup from "./pages/GroupSetup/GroupSetup";


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/group-setup" element={<GroupSetup />} />
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verification" element={<Verification />} />
          <Route path="/home" element={<Home />} />
          <Route path="/chores" element={<Chores />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/expenses" element={<Expenses />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
