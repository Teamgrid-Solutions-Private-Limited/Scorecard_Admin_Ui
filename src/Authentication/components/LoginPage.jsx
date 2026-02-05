import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Grid,
  Paper,
  TextField,
  Typography,
  FormLabel,
  IconButton,
  InputAdornment,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import logo from "../../assets/image/logos/sba-logo3.svg";
import bgImage from "../../assets/image/Rectangle.jpg";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/apiClient";
import { setToken, setUser, setRefreshToken } from "../../utils/auth";
import MuiAlert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import {
  Visibility,
  VisibilityOff,
  ContentCopy,
  CheckCircle,
} from "@mui/icons-material";
import { useSnackbar } from "../../hooks"; // Make sure this hook exists
import "../../styles/LoginPage.css";
import TwoFactorAuthModal from "./TwoFactorAuthModal";

export default function LoginPage() {
  const nav = useNavigate();

  const [info, setInfo] = useState({
    email: "",
    password: "",
  });
  const [step, setStep] = useState("LOGIN");
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState(null);
  const [manualEntryKey, setManualEntryKey] = useState("");
  const [otp, setOtp] = useState("");
  const [tempToken, setTempToken] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [backupCodes, setBackupCodes] = useState([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [is2FAModalOpen, set2FAModalOpen] = useState(false);

  // Local snackbar state (if the hook doesn't work properly)
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");

  // Use centralized snackbar hook if it exists, otherwise use local state
  let snackbarHook;
  try {
    snackbarHook = useSnackbar();
  } catch (error) {
    console.warn("useSnackbar hook not available, using local state");
  }

  // Helper function to show snackbar
  const showSnackbar = (message, severity = "info") => {
    if (snackbarHook && snackbarHook.showSnackbar) {
      snackbarHook.showSnackbar(message, severity);
    } else {
      setSnackbarMessage(message);
      setSnackbarSeverity(severity);
      setSnackbarOpen(true);
    }
  };

  // Handle local snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const valupd = (e) => {
    setInfo({ ...info, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/user/login", info);

      // Force 2FA setup
      if (res.data.requires2FASetup) {
        setTempToken(res.data.tempToken);
        setStep("SETUP_2FA");
        showSnackbar("Two-factor authentication setup required", "info");
        return;
      }

      // 2FA already enabled → verify
      if (res.data.requires2FA) {
        setTempToken(res.data.tempToken);
        setStep("VERIFY_2FA");
        showSnackbar("Enter code from Authenticator app", "info");
        return;
      }

      // Normal login (fallback)
      if (res.data.token) {
        setToken(res.data.token);
        setUser(res.data.user.fullName);
        if (res.data.refreshToken) {
          setRefreshToken(res.data.refreshToken);
        }
        showSnackbar("Login successful", "success");
        setTimeout(() => nav("/"), 1000);
      }
    } catch (err) {
      showSnackbar(
        err?.response?.data?.message || "Invalid credentials",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (step === "SETUP_2FA" && tempToken) {
      const fetchQr = async () => {
        setLoading(true);
        try {
          const res = await api.get("/auth/2fa/setup", {
            headers: {
              Authorization: `Bearer ${tempToken}`,
            },
          });

          // Extract data from response structure
          if (res.data.data) {
            setQrCode(res.data.data.qrCode);
            setSecret(res.data.data.manualEntryKey);
            setManualEntryKey(res.data.data.manualEntryKey);
          } else {
            // Fallback for different response structure
            setQrCode(res.data.qrCode);
            setSecret(res.data.secret);
            setManualEntryKey(res.data.secret || res.data.manualEntryKey);
          }
        } catch (err) {
          showSnackbar(
            err?.response?.data?.message || "Failed to load QR code",
            "error",
          );
          // setStep("LOGIN");
        } finally {
          setLoading(false);
        }
      };

      fetchQr();
    }
  }, [step, tempToken]);

  const handleCopySecret = () => {
    navigator.clipboard.writeText(manualEntryKey);
    setCopied(true);
    showSnackbar("Secret key copied to clipboard", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();

    // Validate OTP format
    if (otp.length !== 6 || isNaN(otp)) {
      showSnackbar("Please enter a valid 6-digit code", "error");
      return;
    }

    setLoading(true);

    try {
      let res;

      if (step === "SETUP_2FA") {
        // First-time setup
        res = await api.post(
          "/auth/2fa/setup",
          {
            token: otp,
            secret: manualEntryKey,
          },
          {
            headers: {
              Authorization: `Bearer ${tempToken}`,
            },
          },
        );

        // Check if backup codes are returned
        if (res.data.data && res.data.data.backupCodes) {
          setBackupCodes(res.data.data.backupCodes);

          // ✅ Save tokens if they're included
          if (res.data.data.accessToken) {
            setToken(res.data.data.accessToken);
            if (res.data.data.refreshToken) {
              setRefreshToken(res.data.data.refreshToken);
            }
          }

          set2FAModalOpen(false); // Close 2FA modal
          setTimeout(() => {
            setShowBackupCodes(true); // Show backup codes modal
          }, 300);
        } else if (res.data.backupCodes) {
          setBackupCodes(res.data.backupCodes);

          // ✅ Save tokens if they're included
          if (res.data.accessToken) {
            setToken(res.data.accessToken);
            if (res.data.refreshToken) {
              setRefreshToken(res.data.refreshToken);
            }
          }

          set2FAModalOpen(false); // Close 2FA modal
          setTimeout(() => {
            setShowBackupCodes(true); // Show backup codes modal
          }, 300);
        }
      } else {
        // Regular verification
        res = await api.post(
          "/auth/2fa/verify",
          { token: otp },
          {
            headers: {
              Authorization: `Bearer ${tempToken}`,
            },
          },
        );

        // ✅ Handle successful regular verification
        if (res.data.success && res.data.data?.accessToken) {
          const accessToken = res.data.data.accessToken;
          const refreshToken = res.data.data.refreshToken;

          setToken(accessToken);
          if (refreshToken) {
            setRefreshToken(refreshToken);
          }

          // Decode token to get user info
          try {
            const tokenParts = accessToken.split(".");
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              if (payload.fullName) {
                setUser(payload.fullName);
              } else if (payload.email) {
                setUser(payload.email);
              }
            }
          } catch (error) {
            console.error("Failed to decode token:", error);
            setUser("User");
          }

          showSnackbar("Login successful", "success");
          setTimeout(() => {
            nav("/");
          }, 1000);
        }
      }

      // Check the response structure based on your API
      if (res.data.success) {
        // For 2FA setup, tokens might already be saved above
        if (step === "SETUP_2FA" && res.data.data?.accessToken) {
          // Tokens already saved above, just show success message
          showSnackbar(
            "2FA setup complete! Save your backup codes.",
            "success",
          );
        } else if (step === "SETUP_2FA") {
          // Handle case where tokens might not be in response (shouldn't happen with updated backend)
          showSnackbar(
            "2FA setup complete! Save your backup codes.",
            "success",
          );
        }
      } else {
        showSnackbar(res.data.message || "Verification failed", "error");
      }
    } catch (err) {
      showSnackbar(
        err?.response?.data?.message || "Invalid authentication code",
        "error",
      );
      if (step === "VERIFY_2FA") {
        setStep("VERIFY_2FA");
      }
    } finally {
      setLoading(false);
      setOtp(""); // Clear OTP for retry
    }
  };

  const handleProceedWithoutSaving = () => {
    setShowBackupCodes(false);
    showSnackbar("Proceeding without saving backup codes", "warning");
    setTimeout(() => nav("/"), 500);
  };
  const handleProceedToDashboard = () => {
    // Make sure tokens are saved before navigating
    if (localStorage.getItem("token")) {
      setShowBackupCodes(false);
      showSnackbar("Proceeding to dashboard", "success");
      setTimeout(() => nav("/"), 500);
    } else {
      // If tokens aren't saved, show an error
      showSnackbar(
        "Authentication error. Please try logging in again.",
        "error",
      );
      setShowBackupCodes(false);
      setStep("LOGIN");
    }
  };
  // Open 2FA modal
  const open2FAModal = () => set2FAModalOpen(true);
  const close2FAModal = () => set2FAModalOpen(false);

  // Trigger the modal to open when needed
  useEffect(() => {
    if (step === "SETUP_2FA") {
      open2FAModal();
    }
  }, [step]);

  return (
    <>
      {/* Snackbar component - using either hook state or local state */}
      <Snackbar
        open={snackbarHook ? snackbarHook.open : snackbarOpen}
        autoHideDuration={6000}
        onClose={snackbarHook ? snackbarHook.hideSnackbar : handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MuiAlert
          onClose={
            snackbarHook ? snackbarHook.hideSnackbar : handleSnackbarClose
          }
          severity={snackbarHook ? snackbarHook.severity : snackbarSeverity}
          sx={{
            width: "100%",
            backgroundColor:
              (snackbarHook ? snackbarHook.severity : snackbarSeverity) ===
              "success"
                ? "#173A5E"
                : undefined,
            color: "#fff",
          }}
          elevation={6}
          variant="filled"
        >
          {snackbarHook ? snackbarHook.message : snackbarMessage}
        </MuiAlert>
      </Snackbar>

      {/* Backup Codes Modal */}
      {showBackupCodes && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.8)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Paper
            sx={{
              p: 4,
              maxWidth: 500,
              maxHeight: "80vh",
              overflow: "auto",
            }}
          >
            <Typography variant="h6" gutterBottom align="center">
              🔒 Save Your Backup Codes
            </Typography>

            <Alert severity="warning" sx={{ mb: 3 }}>
              These codes are shown only once. Save them in a secure location.
              You will need them if you lose access to your authenticator app.
            </Alert>

            <Box
              sx={{
                backgroundColor: "#f5f5f5",
                p: 2,
                borderRadius: 1,
                mb: 3,
                maxHeight: 300,
                overflow: "auto",
              }}
            >
              <Grid container spacing={1}>
                {backupCodes.map((code, index) => (
                  <Grid item xs={6} key={index}>
                    <Chip
                      label={code}
                      sx={{
                        fontFamily: "monospace",
                        width: "100%",
                        justifyContent: "center",
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
            <Button
              variant="contained"
              fullWidth
              onClick={() => {
                // Create a text file with backup codes
                const text = `SBA Scorecard - Backup Codes\n\nIMPORTANT: Save these codes in a secure location.\nYou will need them if you lose access to your authenticator app.\n\n${backupCodes.join("\n")}\n\nGenerated on: ${new Date().toLocaleString()}`;
                const blob = new Blob([text], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "sba-backup-codes.txt";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                showSnackbar("Backup codes downloaded", "success");
                setShowBackupCodes(false);
                handleProceedToDashboard();
                // Don't navigate immediately, let user save codes first
              }}
              sx={{ mb: 2 }}
            >
              📥 Download Backup Codes
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => {
                // Copy to clipboard
                const text = backupCodes.join("\n");
                navigator.clipboard.writeText(text);
                showSnackbar("Backup codes copied to clipboard", "success");
                handleProceedToDashboard();
              }}
              sx={{ mb: 2 }}
            >
              📋 Copy to Clipboard
            </Button>

            <Button
              variant="text"
              fullWidth
              onClick={handleProceedToDashboard}
              color="warning"
            >
              I've saved them, proceed to dashboard
            </Button>
          </Paper>
        </Box>
      )}

      {/* Two-Factor Authentication Modal */}
      {/* Two-Factor Authentication Modal */}
      {step === "SETUP_2FA" &&
        !showBackupCodes && ( // ✅ Add !showBackupCodes check
          <TwoFactorAuthModal
            open={is2FAModalOpen}
            onClose={close2FAModal}
            qrCode={qrCode}
            manualEntryKey={manualEntryKey}
            otp={otp}
            setOtp={setOtp}
            handleVerify2FA={handleVerify2FA}
            loading={loading}
            handleCopySecret={handleCopySecret}
            copied={copied}
          />
        )}

      <Grid container className="login-main-container">
        <Grid
          item
          xs={12}
          sm={8}
          md={8}
          lg={7}
          component={Paper}
          elevation={6}
          square
          className="login-paper-container"
        >
          {/* Left Side with Image + Overlay */}
          <Box
            sx={{
              display: "flex",
              flex: 1,
              backgroundImage: `url(${bgImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative",
            }}
          >
            <Box className="login-image-overlay">
              {/* Logo top-left */}
              <Box className="login-logo-wrapper">
                <img src={logo} alt="SBA Logo" className="login-logo-image" />
              </Box>

              {/* Center Quote */}
              <Typography className="login-quote-text">
                "Senators and Representatives are the pillars of democracy,
                shaping the nation's future with every decision they make."
              </Typography>
            </Box>
          </Box>

          {/* Right Side - Login Form */}
          {step === "LOGIN"  && (
            <Box
              component="form"
              onSubmit={handleSubmit}
              className="login-form-side"
            >
              <Box className="login-form-inner">
                {/* Heading */}
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  gutterBottom
                  align="center"
                >
                  SBA Scorecard Management System
                </Typography>

                {/* Subtitle */}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  mb={3}
                  align="center"
                >
                  Sign in to continue
                </Typography>

                {/* Username */}
                <FormLabel sx={{ fontWeight: 600, color: "#173A5E" }}>
                  Username
                </FormLabel>
                <TextField
                  name="email"
                  value={info.email}
                  onChange={valupd}
                  placeholder="Enter username"
                  fullWidth
                  margin="dense"
                  variant="outlined"
                  size="small"
                  disabled={loading}
                  InputProps={{
                    sx: {
                      borderRadius: "10px",
                      backgroundColor: "#fafafa",
                      "& input:-webkit-autofill": {
                        WebkitBoxShadow: "0 0 0 100px #fafafa inset",
                        WebkitTextFillColor: "#000",
                      },
                    },
                  }}
                />

                {/* Password */}
                <FormLabel sx={{ fontWeight: 600, color: "#173A5E", mt: 2 }}>
                  Password
                </FormLabel>
                <TextField
                  name="password"
                  value={info.password}
                  onChange={valupd}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  fullWidth
                  margin="dense"
                  variant="outlined"
                  size="small"
                  disabled={loading}
                  InputProps={{
                    sx: {
                      borderRadius: "10px",
                      backgroundColor: "#fafafa",
                      "& input:-webkit-autofill": {
                        WebkitBoxShadow: "0 0 0 100px #fafafa inset",
                        WebkitTextFillColor: "#000",
                      },
                    },
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          disabled={loading}
                        >
                          {showPassword ? (
                            <VisibilityOff fontSize="small" />
                          ) : (
                            <Visibility fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Sign In Button */}
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{
                    mt: 3,
                    bgcolor: "#173A5E",
                    "&:hover": { bgcolor: "#1E4C80" },
                    textTransform: "none",
                    fontWeight: "bold",
                    borderRadius: "10px",
                    py: 1.2,
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : "Sign In"}
                </Button>
              </Box>
            </Box>
          )}

          {step === "VERIFY_2FA" && (
            <Box
              component="form"
              onSubmit={handleVerify2FA}
              className="login-form-side"
            >
              <Box className="login-form-inner">
                <Typography variant="h6" fontWeight="bold" align="center">
                  Two-Factor Authentication
                </Typography>

                <Typography
                  align="center"
                  mb={3}
                  variant="body2"
                  color="text.secondary"
                >
                  Open your authenticator app and enter the 6-digit code
                </Typography>

                <TextField
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 6-digit code"
                  fullWidth
                  size="small"
                  inputProps={{
                    maxLength: 6,
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                  }}
                  sx={{ mb: 3 }}
                  disabled={loading}
                  autoFocus
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={otp.length !== 6 || loading}
                  sx={{
                    bgcolor: "#173A5E",
                    "&:hover": { bgcolor: "#1E4C80" },
                    borderRadius: "10px",
                    py: 1.2,
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    "Verify & Continue"
                  )}
                </Button>

                <Button
                  onClick={() => {
                    setStep("LOGIN");
                    setOtp("");
                    setLoading(false);
                  }}
                  variant="text"
                  fullWidth
                  sx={{ mt: 2 }}
                  disabled={loading}
                >
                  Back to Login
                </Button>

                <Typography
                  variant="caption"
                  align="center"
                  sx={{
                    mt: 3,
                    display: "block",
                    color: "text.secondary",
                  }}
                >
                  Having trouble? Make sure your device time is synchronized.
                </Typography>
              </Box>
            </Box>
          )}
        </Grid>
      </Grid>
    </>
  );
}
