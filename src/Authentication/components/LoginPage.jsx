import React, { useState } from "react";
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
import axios from "axios";
import { API_URL } from "../../redux/API";
import MuiAlert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { Visibility, VisibilityOff } from "@mui/icons-material";

export default function LoginPage() {
  const nav = useNavigate();

 
  const [info, setInfo] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false); 

  const valupd = (e) => {
    setInfo({ ...info, [e.target.name]: e.target.value });
  };


  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleSnackbarOpen = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setOpenSnackbar(false);
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post(`${API_URL}/user/login`, info)
      .then((res) => {
        if (res.data.message === "Login successful" && res.data.token) {
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("user", JSON.stringify(res.data.user.fullName));
          handleSnackbarOpen("Logged in Successfully", "success");
          setTimeout(() => {
            nav("/");
          }, 1500);
        }
      })
      .catch((err) => {
        handleSnackbarOpen("Invalid username or password", "warning");
      });
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
            backgroundColor: snackbarSeverity === "success" ? "#173A5E" : undefined,
            color: "#fff",
          }}
          elevation={6}
          variant="filled"
        >
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>

     
      <Grid
        container
        sx={{
          minHeight: "100vh",
          bgcolor: "#f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: { xs: 0, sm: 2 },
        }}
      >
        <Grid
          item
          xs={12}
          sm={8}
          md={8}
          lg={7}
          component={Paper}
          elevation={6}
          square
          sx={{
            borderRadius: "12px",
            overflow: "hidden",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            height: { xs: "100vh", md: "70vh",lg:"65vh" }, 
      width: { xs: "100%", sm: "auto" },  
          }}
        >
          {/* Left Side with Image + Overlay */}
          <Box
            sx={{
              display: "flex" ,
              flex: 1,
              backgroundImage: `url(${bgImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                bgcolor: "rgba(23,58,94,0.7)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                px: 3,
                textAlign: "center",
              }}
            >
              {/* Logo top-left */}
              <Box
                sx={{
                  position: "absolute",
                  top: 20,
                  left: 20,
                }}
              >
                <img
                  src={logo}
                  alt="SBA Logo"
                  style={{ width: "120px", height: "auto" }}
                />
              </Box>

              {/* Center Quote */}
              <Typography color="#dfdfdfff" fontSize={14} mt={8 } sx={{ fontStyle: "italic" }}>
                "Senators and Representatives are the pillars of democracy,
                shaping the nation's future with every decision they make."
              </Typography>
            </Box>
          </Box>

          {/* Right Side - Login Form */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              flex: 1,
              p: { xs: 3, sm: 0 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Box sx={{ mx: { xs: 1, sm: 2, md: 4 },height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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
                  }
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
                      {showPassword ? <VisibilityOff  fontSize="small"/> : <Visibility  fontSize="small"/>}
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
        </Grid>
      </Grid>
    </>
  );
}
