import { useNavigate } from 'react-router-dom';
import "./Button.css";

function Button({ label, to, onClick, disabled = false }) {
    //navigation
  const navigate = useNavigate();

  //handle click
  const handleClick = async () => {
    if (onClick) {
      const shouldNavigate = await onClick();
      if (shouldNavigate === false) return;
    }
    if (to) navigate(to);
  };

  return (
    <button onClick={handleClick} disabled={disabled} className="button">
      {label}
    </button>
  );
}

export default Button;

// Usage:
//<Button label="Submit" to="/dashboard" onClick={validateForm} />