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

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  paddingBottom: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  borderRadius: "10px",
  maxWidth: "450px",
  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
  background: "white",
  overflow: "hidden",
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
  backgroundColor: "#F5F6FA",
  padding: "40px 20px",
  position: "relative",
  marginBottom: "10px",
  height: "120px",
  "&::after": {
    content: '""',
    display: "block",
    width: "100%",
    backgroundColor: "#6d8ec9",
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  background: "black",
  color: "white",
  fontWeight: "bold",
  fontSize: "16px",
  padding: "10px",
  height: "35px",
  textTransform: "none",
  "&:hover": {
    background: "#black",
  },
}));

export default function SignIn() {
  const nav = useNavigate();

  const [info, setInfo] = useState({
    username: "",
    password: "",
  });

  const valupd = (e) => {
    setInfo({ ...info, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (info.username === "admin" && info.password === "admin") {
      nav("/");
    }
  };

  return (
    <SignInContainer>
      <Card variant="outlined" sx={{ height: "500px", pb: 1 }}>
        <Header>
          <img
            src={logo}
            alt="SBA Logo"
            style={{
              width: "80px",
              height: "80px",
              marginBottom: "16px",
              borderRadius: "50%",
              objectFit: "cover",
              overflow: "hidden",
            //   filter: "invert(100%)",
            }}
          />

          <Typography variant="h5" fontWeight="bold" color="black">
            SBA Scorecard Management System
          </Typography>
          <Typography variant="body1" color="black">
            Sign in to continue.
          </Typography>
        </Header>

        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
            paddingX: 3,
            height: "200px",
          }}
        >
          <FormControl>
            <FormLabel sx={{ color: "#4b5563", pb: 1 }}>Username</FormLabel>
            <TextField
              id="username"
              type="text"
              name="username"
              placeholder="Enter username"
              autoComplete="username"
              autoFocus
              required
              fullWidth
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  backgroundColor: "#f9fafb",
                  border: "1px solid #d1d5db",
                  height: "35px",
                  transition:
                    "border-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                  "&:hover": {
                    borderColor: "#555", // Dark gray on hover
                  },
                  "&.Mui-focused": {
                    borderColor: "#777", // Light grayish-black on focus
                    boxShadow: "0 0 0 2px rgba(119, 119, 119, 0.2)", // Soft light gray glow
                  },
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#777", // Light gray focus border
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#555",
                },
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                  {
                    borderColor: "#777",
                  },
              }}
              onChange={valupd}
            />
          </FormControl>

          <FormControl>
            <FormLabel sx={{ color: "#4b5563", pb: 1 }}>Password</FormLabel>
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
                  borderRadius: "8px",
                  backgroundColor: "#f9fafb",
                  border: "1px solid #d1d5db",
                  height: "35px",
                  mb: 2,
                  "&:hover": {
                    borderColor: "#555",
                  },
                  "&.Mui-focused": {
                    borderColor: "#777",
                  },
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#777", 
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#555",
                },
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                  {
                    borderColor: "#777",
                  },
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
