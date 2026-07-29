import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="topbar">
      <div className="brand">
        <span className="dot" />
        Task Board
      </div>
      {user && (
        <div className="user-info">
          <span>{user.name}</span>
          <button className="btn btn-ghost on-dark" onClick={handleLogout}>
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
