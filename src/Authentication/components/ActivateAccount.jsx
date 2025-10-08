import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { API_URL } from "../../redux/API";
import "../../ActivateAccount.css";
import PersonIcon from "@mui/icons-material/Person";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const ActivateAccount = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const token = searchParams.get("token");

  useEffect(() => {
    verifyToken();
  }, []);

  const verifyToken = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/verify-activation?token=${token}`
      );
      const data = await response.json();

      if (data.valid) {
        setUserInfo(data.user);
      } else {
        setError(
          data.message || "This activation link is invalid or has expired."
        );
      }
    } catch (error) {
      setError("Unable to verify your link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password) return setError("Please create a password");
    if (password.length < 8)
      return setError("Password must be at least 8 characters");
    if (password !== confirmPassword) return setError("Passwords don't match");

    try {
      const response = await fetch(`${API_URL}/api/activate-account`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Account activated successfully!");
        setTimeout(() => navigate("/scorecard/admin/login"), 2000);
      } else {
        setError(data.message || "Unable to activate account");
      }
    } catch (error) {
      setError("Connection error. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="spinner-wrapper">
        <div style={{ textAlign: "center" }}>
          <div className="spinner"></div>
          <p style={{ color: "#666", fontSize: "16px" }}>
            Verifying your invitation...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="activate-account-container">
      <div className="activate-account-card">
        <div className="activate-header">
          <div className="activate-header-icon">
            <PersonIcon style={{ color: "white", fontSize: 28 }} />
          </div>

          <h1>Join SBA Scorecard System</h1>
          {userInfo && (
            <p className="activate-user-info">
              {userInfo.fullName} • {userInfo.role}
            </p>
          )}
        </div>

        {error && (
          <div className="activate-error">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#d93025">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="activate-success">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#2e7d32">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <span>{success}</span>
          </div>
        )}

        {userInfo && !success && (
          <form onSubmit={handleSubmit} className="activate-form">
            <div style={{ marginBottom: "24px", position: "relative" }}>
              <label>Create password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <VisibilityOff fontSize="small" />
                ) : (
                  <Visibility fontSize="small" />
                )}
              </button>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label>Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
              />
            </div>

            <button type="submit" className="activate-btn">
              Create Account
            </button>

            <p className="activate-terms">
              By creating an account, you agree to our Terms of Service and
              Privacy Policy.
            </p>
          </form>
        )}

        <div className="activate-footer">
          <p>
            Already have an account?{" "}
            <button onClick={() => navigate("/scorecard/admin/login")}>
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ActivateAccount;
