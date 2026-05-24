import "./Home.css";
import { useAuth } from "../AuthContext"
import Button from "../../components/Button";

export default function Home() {
  const { user, logout } = useAuth();
  
  // console.log(user.name);
  // console.log(user.email);
  return (
    <div className="home-page">
      {user ? (
        <>
          <h1>Welcome, {user.name}!</h1>
          <p>Email: {user.email}</p>
          <Button to="/expenses" label="Expenses" />
          <Button to="/chores" label="Chores" />
          <Button to="/calendar" label="Calendar" />
          <Button onClick={logout} label="Logout" />
        </>
      ) : (
        <>
          <h1>No user is currently logged in!</h1>
          <Button to="/login" label="Login" />
        </>
      )}
    </div>
  );
}
