// [GenAI Use] Prompt: "Rename the Calendar route and component to Availability."
// [GenAI Use] Reflection: The response was reliable here — a rename touching the import, route path, and element is easy to do incompletely by hand, and the AI updated all three together so nothing dangled. I still checked there were no leftover 'Calendar' references elsewhere that would break the route, and there weren't, so the result held up well.

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing/Landing";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import Verification from "./pages/Verification/Verification";
import Home from "./pages/Home/Home";
// [GenAI Use] Generated code start
import Availability from "./pages/Availability/Availability";
// [GenAI Use] Generated code end
import Expenses from "./pages/Expenses/Expenses"
import { AuthProvider } from "./pages/AuthContext";
import Chores from "./pages/Chores/Chores";
import GroupSetup from "./pages/GroupSetup/GroupSetup";
import User_Profile from "./pages/User_Profile/User_Profile";

// 6/3 1:24 am: import protected routes component to wrap protected pages
import ProtectedRoute from "./components/ProtectedRoutes";
// 6/3 2:52 am: import logged in protected route to wrap login/signup pages
import LoggedInProtectedRoutes from "./components/LoggedInProtectedRoutes";


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
          <Route path="/" element={
            <LoggedInProtectedRoutes>
              <Landing />
            </LoggedInProtectedRoutes>
            } />
          <Route path="/login" element={
            <LoggedInProtectedRoutes>
              <Login />
            </LoggedInProtectedRoutes>
          } />
          <Route path="/signup" element={
            <LoggedInProtectedRoutes>
              <Signup />
            </LoggedInProtectedRoutes>
          } />
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
          {/* [GenAI Use] Generated code start */}
          <Route path="/availability" element={
            <ProtectedRoute>
              <Availability />
            </ProtectedRoute>
          } />
          {/* [GenAI Use] Generated code end */}
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
