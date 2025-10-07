// src/Authentication/ActivateAccount.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { API_URL } from "../../redux/API";

const ActivateAccount = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = searchParams.get("token");

  useEffect(() => {
    verifyToken();
  }, []);

  const verifyToken = async () => {
    try {
      const response = await fetch(`${API_URL}/api/verify-activation?token=${token}`);
      const data = await response.json();

      if (data.valid) {
        setUserInfo(data.user);
      } else {
        setError(data.message || "Invalid activation link");
      }
    } catch (error) {
      setError("Error verifying activation link");
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    try {
      const response = await fetch(`${API_URL}/api/activate-account`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setTimeout(() => {
          navigate("/scorecard/admin/login");
        }, 3000);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError("Error activating account");
    }
  };

  if (loading) {
    return <div>Verifying your activation link...</div>;
  }

  return (
    <div style={{ maxWidth: "500px", margin: "50px auto", padding: "20px" }}>
      <h2>Activate Your Account</h2>

      {error && <div style={{ color: "red" }}>{error}</div>}
      {success && <div style={{ color: "green" }}>{success}</div>}

      {userInfo && !success && (
        <>
          <div
            style={{
              background: "#f8f9fa",
              padding: "20px",
              borderRadius: "8px",
              borderLeft: "4px solid #3498db",
            }}
          >
            <p>
              <strong>Welcome, {userInfo.fullName}!</strong>
            </p>
            <p>Role: {userInfo.role}</p>
            <p>Email: {userInfo.email}</p>

          </div>

          <div
            style={{
              background: "#e7f3ff",
              padding: "15px",
              borderRadius: "4px",
              margin: "15px 0",
            }}
          >
            <p>
              <strong>
                Your administrator has already set up your account.
              </strong>
            </p>
            <p>
              Click the button below to activate your account and start using
              the system.
            </p>
          </div>

          <button
            onClick={handleActivate}
            style={{
              background: "#3498db",
              color: "white",
              padding: "12px 24px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Activate My Account
          </button>
        </>
      )}
    </div>
  );
};

export default ActivateAccount;
