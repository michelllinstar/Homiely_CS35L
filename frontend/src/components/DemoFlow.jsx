import "./DemoFlow.css";
import Button from "./Button";

export default function DemoFlow() {
  const demoPages = [
    { name: "Landing", route: "/" },
    { name: "Signup", route: "/signup" },
    { name: "Login", route: "/login" },
    { name: "Home", route: "/home" },
    { name: "Chores", route: "/chores" },
    { name: "Expenses", route: "/expenses" },
  ];

  return (
    <div className="demo-flow">
      <h3>DEMO FLOW</h3>

      {demoPages.map((page) => (
        <Button
          key={page.route}
          label={page.name}
          to={page.route}
        />
      ))}
    </div>
  );
}