import React, { useState } from 'react';
import {
  Box,
  Button,
  FormLabel,
  FormControl,
  TextField,
  Typography,
  Stack,
  Select,
  MenuItem,
  Card as MuiCard,
  Snackbar,
  Alert as MuiAlert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  paddingBottom: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  borderRadius: '10px',
  maxWidth: '420px',
  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
  background: 'white',
  overflow: 'hidden',
}));

const AddUserContainer = styled(Stack)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#f4f6f8',
  padding: theme.spacing(2),
}));

const Header = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  backgroundColor: '#739ACE',
  padding: '32px 20px 24px 20px',
  position: 'relative',
  marginBottom: '10px',
  height: '95px',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  background: '#CBA246',
  color: 'white',
  fontSize: '13px',
  padding: '10px',
  height: '37px',
  borderRadius: '6px',
  textTransform: 'none',
  '&:hover': {
    background: '#B28E3D',
    color: 'white',
  },
}));

function AddUser() {
  const [form, setForm] = useState({
    fullName: '',
    nickName: '',
    email: '',
    password: '',
    role: 'admin',
  });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Connect to backend API
    setSnackbarMessage('User form submitted!');
    setSnackbarSeverity('success');
    setOpenSnackbar(true);
    console.log('Form submitted:', form);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpenSnackbar(false);
  };

  return (
    <AddUserContainer>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MuiAlert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: '100%', backgroundColor: snackbarSeverity === 'success' ? '#90EE90' : undefined, color: '#000' }}
          elevation={6}
          variant="filled"
        >
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
      <Card variant="outlined">
        <Header>
          <PersonAddAltRoundedIcon sx={{ fontSize: 48, color: 'white', mb: 1 }} />
          <Typography variant="h6" fontWeight="bold" color="white" fontSize={18}>
            Add New User
          </Typography>
          <Typography variant="body1" color="white" sx={{ mb: 1, fontSize: 15 }}>
            Fill in the details below
          </Typography>
        </Header>
        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            paddingX: 3,
            pt: 0,
          }}
        >
          <FormControl>
            <FormLabel sx={{ color: '#656D9A', pb: 1, fontSize: 13, fontWeight: 'bold' }}>Full Name</FormLabel>
            <TextField
              name="fullName"
              placeholder="Enter full name"
              value={form.fullName}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '6px',
                  height: '37px',
                  overflow: 'hidden',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#bdbdbd',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'gray !important',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#CC9A3A !important',
                  },
                },
              }}
            />
          </FormControl>
          <FormControl>
            <FormLabel sx={{ color: '#656D9A', pb: 1, fontSize: 13, fontWeight: 'bold' }}>Nick Name</FormLabel>
            <TextField
              name="nickName"
              placeholder="Enter nick name"
              value={form.nickName}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '6px',
                  height: '37px',
                  overflow: 'hidden',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#bdbdbd',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'gray !important',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#CC9A3A !important',
                  },
                },
              }}
            />
          </FormControl>
          <FormControl>
            <FormLabel sx={{ color: '#656D9A', pb: 1, fontSize: 13, fontWeight: 'bold' }}>Email</FormLabel>
            <TextField
              name="email"
              type="email"
              placeholder="Enter email address"
              value={form.email}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '6px',
                  height: '37px',
                  overflow: 'hidden',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#bdbdbd',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'gray !important',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#CC9A3A !important',
                  },
                },
              }}
            />
          </FormControl>
          <FormControl>
            <FormLabel sx={{ color: '#656D9A', pb: 1, fontSize: 13, fontWeight: 'bold' }}>Password</FormLabel>
            <TextField
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter password"
              value={form.password}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '6px',
                  height: '37px',
                  overflow: 'hidden',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#bdbdbd',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'gray !important',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#CC9A3A !important',
                  },
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </FormControl>
          <FormControl>
            <FormLabel sx={{ color: '#656D9A', pb: 1, fontSize: 13, fontWeight: 'bold' }}>Role</FormLabel>
            <Select
              name="role"
              value={form.role}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
              sx={{
                borderRadius: '6px',
                height: '37px',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#bdbdbd',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'gray !important',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#CC9A3A !important',
                },
              }}
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="editor">Editor</MenuItem>
              <MenuItem value="contributor">Contributor</MenuItem>
            </Select>
          </FormControl>
          <StyledButton type="submit" fullWidth endIcon={<PersonAddAltRoundedIcon />}>
            Add User
          </StyledButton>
        </Box>
      </Card>
    </AddUserContainer>
  );
}

export default AddUser;