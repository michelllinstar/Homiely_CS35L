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
import User_Profile from "./pages/User_Profile/User_Profile";

// 6/3 1:24 am: import protected routes component to wrap protected pages
import ProtectedRoute from "./components/ProtectedRoutes";


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/group-setup" element={
            <ProtectedRoute>
              <GroupSetup />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verification" element={<Verification />} />
          <Route path="/home" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/chores" element={
            <ProtectedRoute>
              <Chores />
            </ProtectedRoute>
          } />
          <Route path="/calendar" element={
            <ProtectedRoute>
              <Calendar />
            </ProtectedRoute>
          } />
          <Route path="/expenses" element={
            <ProtectedRoute>
              <Expenses />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <User_Profile />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
