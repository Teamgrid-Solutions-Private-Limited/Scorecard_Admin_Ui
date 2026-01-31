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
} from "@mui/material";
import logo from "../../assets/image/logos/sba-logo3.svg";
import bgImage from "../../assets/image/Rectangle.jpg";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/apiClient";
import { setToken, setUser } from "../../utils/auth";
import MuiAlert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useSnackbar } from "../../hooks";
import "../../styles/LoginPage.css";

export default function LoginPage() {
  const nav = useNavigate();

  const [info, setInfo] = useState({
    email: "",
    password: "",
  });
  const [step, setStep] = useState("LOGIN"); // LOGIN | OTP
  const [otp, setOtp] = useState("");
  const [tempToken, setTempToken] = useState(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [resending, setResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const valupd = (e) => {
    setInfo({ ...info, [e.target.name]: e.target.value });
  };

  // Use centralized snackbar hook
  const {
    open: openSnackbar,
    message: snackbarMessage,
    severity: snackbarSeverity,
    showSnackbar,
    hideSnackbar: handleSnackbarClose,
  } = useSnackbar();
  useEffect(() => {
    if (step === "OTP" && resendTimer === 0) {
      setResendTimer(30); // must match backend cooldown
    }
  }, [step]);

  useEffect(() => {
    if (resendTimer <= 0) return;

    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [resendTimer]);
  //   const handleSubmit = async (e) => {
  //     e.preventDefault();
  //     try {
  //       const res = await api.post("/user/login", info);
  //       // if (res.data.message === "Login successful" && res.data.token) {
  //       if (res.data.tempToken) {
  //         setToken(res.data.token);
  //         setUser(res.data.user.fullName);
  // setStep("OTP");
  // setTempToken(res.data.tempToken);
  //         // showSnackbar("Logged in Successfully", "success");
  //         // setTimeout(() => {
  //         //   nav("/");
  //         // }, 1500);
  //       }
  //     } catch (err) {
  //       showSnackbar("Invalid username or password", "warning");
  //     }
  //   };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/user/login", info);

      if (res.data.tempToken) {
        setTempToken(res.data.tempToken);
        setStep("OTP");
        showSnackbar("OTP sent to your email", "success");
      }
    } catch (err) {
      showSnackbar(
        err?.response?.data?.message || "Invalid username or password",
        "error",
      );
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/otp/verify-otp", {
        otp,
        tempToken,
      });
      setToken(res.data.token);
      setUser(res.data.user.fullName);

      showSnackbar("Login successful", "success");

      setTimeout(() => {
        nav("/");
      }, 1500);
    } catch (err) {
      console.error(err);
      showSnackbar(err?.message || "OTP verification failed", "error");
    }
  };
  const handleResendOtp = async () => {
    try {
      setResending(true);

      const res = await api.post("/otp/resend-otp", { tempToken });

      showSnackbar(res.data.message || "OTP resent", "success");
      setResendTimer(60);
    } catch (err) {
      showSnackbar(
        err?.response?.data?.message || "Please wait before resending OTP",
        "warning",
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MuiAlert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{
            width: "100%",
            backgroundColor:
              snackbarSeverity === "success" ? "#173A5E" : undefined,
            color: "#fff",
          }}
          elevation={6}
          variant="filled"
        >
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>

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
          {step === "LOGIN" && (
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
                  InputProps={{
                    sx: {
                      borderRadius: "10px",
                      backgroundColor: "#fafafa",
                      "& input:-webkit-autofill": {
                        WebkitBoxShadow: "0 0 0 100px #fafafa inset", // background same as your input bg
                        WebkitTextFillColor: "#000", // text color
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
                  Sign In
                </Button>
              </Box>
            </Box>
          )}
          {step === "OTP" && (
            <Box
              component="form"
              onSubmit={handleVerifyOtp}
              className="login-form-side"
            >
              <Box className="login-form-inner">
                <Typography variant="h6" fontWeight="bold" align="center">
                  Verify OTP
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  mb={2}
                  align="center"
                >
                  Enter the 6-digit code sent to your email
                </Typography>

                <TextField
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  fullWidth
                  size="small"
                  inputProps={{ maxLength: 6 }}
                  sx={{ mb: 2 }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={otp.length !== 6}
                  sx={{
                    bgcolor: "#173A5E",
                    "&:hover": { bgcolor: "#1E4C80" },
                    borderRadius: "10px",
                    py: 1.2,
                    opacity: otp.length !== 6 ? 0.6 : 1,
                    cursor: otp.length !== 6 ? "not-allowed" : "pointer",
                  }}
                >
                  Verify OTP
                </Button>

                <Typography
                  align="center"
                  mt={2}
                  variant="body2"
                  color="text.secondary"
                >
                  Didn’t receive the code?
                </Typography>

                <Button
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0 || resending}
                  fullWidth
                  sx={{
                    mt: 1,
                    textTransform: "none",
                    fontWeight: "bold",
                  }}
                >
                  {resendTimer > 0
                    ? `Resend OTP in ${resendTimer}s`
                    : "Resend OTP"}
                </Button>
              </Box>
            </Box>
          )}
        </Grid>
      </Grid>
    </>
  );
}
