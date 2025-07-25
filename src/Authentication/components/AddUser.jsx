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
  Alert as MuiAlert,
  Dialog,
  DialogTitle,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import axios from 'axios';
import { API_URL } from '../../redux/API';
import { useDispatch } from 'react-redux';
import { addUser } from '../../redux/reducer/loginSlice';

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

function AddUser({ open = false, onClose }) {
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
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  // Validation function
  const validate = () => {
    const newErrors = {};
    if (!form.fullName || form.fullName.trim().length < 3) {
      newErrors.fullName = "Full name is required (min 3 characters)";
    }
    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.email)) {
      newErrors.email = "Invalid email address";
    }
    if (!form.password || form.password.length < 6) {
      newErrors.password = "Password is required (min 6 characters)";
    }
    if (!form.role || !['admin', 'editor', 'contributor'].includes(form.role)) {
      newErrors.role = "Role is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validate()) return;
  setLoading(true);

  try {
    await dispatch(addUser(form)).unwrap();
    
    setSnackbarMessage('Invite sent successfully!');
    setSnackbarSeverity('success');
    setOpenSnackbar(true);

    if (onClose) onClose();
  } catch (error) {
    let message = "Failed to send invite. Please try again.";
    if (typeof error === "string") {
      message = error;
    } else if (error && error.message) {
      message = error.message;
    } else if (error && error.data && error.data.message) {
      message = error.data.message;
    }
    setSnackbarMessage(message);
    setSnackbarSeverity('error');
    setOpenSnackbar(true);
  } finally {
    setLoading(false);
  }
};


  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpenSnackbar(false);
  };

  return (
    <>
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
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth scroll="body">
        <DialogTitle sx={{ p: 0 }}>
          <Header>
            <PersonAddAltRoundedIcon sx={{ fontSize: 48, color: 'white', mb: 1 }} />
            <Typography variant="h6" fontWeight="bold" color="white" fontSize={18}>
              Add New User
            </Typography>
            <Typography variant="body1" color="white" sx={{ mb: 1, fontSize: 15 }}>
              Fill in the details below
            </Typography>
          </Header>
        </DialogTitle>
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
            pb: 3,
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
              error={!!errors.fullName}
              helperText={errors.fullName}
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
              error={!!errors.email}
              helperText={errors.email}
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
              error={!!errors.password}
              helperText={errors.password}
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
                      sx={{border:'none'}}
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
              error={!!errors.role}
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
            {errors.role && (
              <Typography color="error" variant="caption">{errors.role}</Typography>
            )}
          </FormControl>
          <StyledButton
            type="submit"
            fullWidth
            endIcon={<PersonAddAltRoundedIcon />}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : "Add User"}
          </StyledButton>
        </Box>
      </Dialog>
    </>
  );
}

export default AddUser;