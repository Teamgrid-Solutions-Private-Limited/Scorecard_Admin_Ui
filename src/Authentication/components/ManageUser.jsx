import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack
} from '@mui/material';
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';
import AddUser from './AddUser';
import SideMenu from '../../components/SideMenu';
import FixedHeader from '../../components/FixedHeader';
import AppTheme from '../../shared-theme/AppTheme';
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from '../../Themes/customizations';
import MainGrid from '../../components/MainGrid';

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

// Mock user data
const mockUsers = [
  { _id: 1, fullName: 'John Doe', nickName: 'Johnny', email: 'john@example.com', role: 'admin' },
  { _id: 2, fullName: 'Jane Smith', nickName: 'Janey', email: 'jane@example.com', role: 'editor' },
  { _id: 3, fullName: 'Bob Brown', nickName: 'Bobby', email: 'bob@example.com', role: 'contributor' },
];

export default function ManageUser(props) {
  const [openAddUser, setOpenAddUser] = useState(false);
  const [users, setUsers] = useState(mockUsers);

  const handleAddUserOpen = () => setOpenAddUser(true);
  const handleAddUserClose = () => setOpenAddUser(false);

  // Placeholder handlers for edit/delete
  const handleEditUser = (user) => {
    // Implement edit logic or open edit dialog
    alert(`Edit user: ${user.fullName}`);
  };
  const handleDeleteUser = (user) => {
    // Implement delete logic
    alert(`Delete user: ${user.fullName}`);
  };

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        <Box sx={{ flexGrow: 1, width: '80%', p: 2 }}>
          <FixedHeader />
          <Box sx={{ maxWidth: '100%', mx: 'auto', mt: 6 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5" fontWeight="bold">Manage Users</Typography>
              <Button
                // variant="contained"
                startIcon={<PersonAddAltRoundedIcon />}
                onClick={handleAddUserOpen}
                sx={{
                    backgroundColor: "#4a90e2 !important",
                    color: "white !important",
                    padding: "0.5rem 1rem",
                    marginLeft: "0.5rem",
                    "&:hover": {
                      backgroundColor: "#357ABD !important",
                    },
                  }}
              >
                Add User
              </Button>
            </Stack>
            <MainGrid
              type="user"
              data={users}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
            />
            <AddUser open={openAddUser} onClose={handleAddUserClose} />
          </Box>
        </Box>
      </Box>
    </AppTheme>
  );
} 