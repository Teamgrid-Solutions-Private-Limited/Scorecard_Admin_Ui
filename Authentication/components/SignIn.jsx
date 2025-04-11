import * as React from "react";
import {
  Box,
  Button,
  FormLabel,
  FormControl,
  TextField,
  Typography,
  Stack,
} from "@mui/material";
import MuiCard from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import LoginIcon from "@mui/icons-material/Login";
import logo from "../../src/assets/image/logo-sm.png";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { API_URL } from "../../redux/api/API";
import MuiAlert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  paddingBottom: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  borderRadius: "10px",
  maxWidth: "420px",
  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
  background: "white",
  overflow: "hidden",
  maxHeight:"460px"
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#f4f6f8",
  padding: theme.spacing(2),
}));

const Header = styled(Box)(({ theme }) => ({
  textAlign: "center",
  backgroundColor: "#739ACE",
  padding: "40px 20px",
  position: "relative",
  marginBottom: "10px",
  height: "95px",
  "&::after": {
    content: '""',
    display: "block",
    width: "100%",
    backgroundColor: "#6d8ec9",
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  background: "#CBA246",
  color: "white",
  fontSize: "13px",
  padding: "10px",
  height: "37px",
  borderRadius: "6px",
  textTransform: "none",
  "&:hover": {
    background: "#black",
    backgroundColor: "#B28E3D",
    color: "white",
  },
}));

export default function SignIn() {
  const nav = useNavigate();

  const [info, setInfo] = useState({
    email: "",
    password: "",
  });

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
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post(`${API_URL}/user/login`, info)
      .then((res) => {
        console.log(res.data);

        if (res.data.message === "Login successful" && res.data.token) {
          localStorage.setItem("token", res.data.token);
          handleSnackbarOpen("logged in Successfully","success")
          nav("/");
        }
      })
      .catch((err) => {
        console.log(err);
        handleSnackbarOpen("Invalid username or password","warning")
      });
  };

  return (
    <SignInContainer>
      <Snackbar
              open={openSnackbar}
              autoHideDuration={6000}
              onClose={handleSnackbarClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
              <MuiAlert
                onClose={handleSnackbarClose}
                severity={snackbarSeverity}
                sx={{ width: "100%" }}
                elevation={6}
                variant="filled"
              >
                {snackbarMessage}
              </MuiAlert>
            </Snackbar>
      <Card variant="outlined" sx={{ height: "500px", pb: 1 }}>
        <Header>
          <img
            src={logo}
            alt="SBA Logo"
            style={{
              width: "60px",
              height: "60px",
              marginBottom: "4px",
              borderRadius: "50%",
              objectFit: "cover",
              overflow: "hidden",
              //   filter: "invert(100%)",
            }}
          />

          <Typography variant="h6" fontWeight="bold" color="white" fontSize={18}>
            SBA Scorecard Management System
          </Typography>
          <Typography variant="body1" color="white" sx={{ mb: 3 , fontSize:15}}>
            Sign in to continue
          </Typography>
        </Header>

        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            paddingX: 3,
            pt: 0,
            // height: "200px",
          }}
        >
          <FormControl>
            <FormLabel sx={{ color: "#656D9A", pb: 1 , fontSize:13 , fontWeight:"bold" }}>Username</FormLabel>
            <TextField
              id="email"
              type="text"
              name="email"
              placeholder="Enter username"
              autoComplete="username"
              autoFocus
              required
              fullWidth
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "6px",
                  backgroundColor: "#f9fafb",
                  border: "1 px solid grey",
                  height: "37px",
                
                }
              }}
              onChange={valupd}
            />
          </FormControl>

          <FormControl>
            <FormLabel sx={{ color: "#656D9A", pb: 1 , fontSize:13 , fontWeight:"bold" }}>Password</FormLabel>
            <TextField
              name="password"
              placeholder="Enter password"
              type="password"
              id="password"
              autoComplete="current-password"
              required
              fullWidth
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "6px",
                  backgroundColor: "#f9fafb",
                  border: "1 px solid grey",
                  height: "37px",
                  mb: 3,
                }
              }}
              onChange={valupd}
            />
          </FormControl>

          <StyledButton type="submit" fullWidth endIcon={<LoginIcon />}>
            Log In
          </StyledButton>
        </Box>
      </Card>
      
    </SignInContainer>
  );
}
