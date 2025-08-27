import * as React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import SaveSenetors from '../src/Senator/Addsenator';
import Senator from '../src/Senator/Senator';
import Representative from '../src/Representative/Representative';
import SaveRepresentative from '../src/Representative/Addrepresentative';
import Bill from '../src/Bills/Bills';
import SignIn from '../src/Authentication/components/SignIn';
import AddBill from '../src/Bills/AddBill';
import SearchBill from '../src/Bills/SearchBill';
import ManageTerm from "../src/Manageterm/ManageTerm";
import Activity from '../src/Activity/Activity';
import AddActivity from '../src/Activity/AddActivity';
import AddUser from "../src/Authentication/components/AddUser";
import ManageUser from "../src/Authentication/components/ManageUser";
import LoginPage from './Authentication/components/LoginPage';

const PrivateRoute = ({ element }) => {
  const token = localStorage.getItem('token');
  return token ? element : <Navigate to="/login" />;
};

export default function App() {
  return (
    <Router basename="/scorecard/admin">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<PrivateRoute element={<Senator />} />} />
        <Route path="add-senator" element={<PrivateRoute element={<SaveSenetors />} />} />
        <Route path="edit-senator/:id" element={<PrivateRoute element={<SaveSenetors />} />} />
        <Route path="representative" element={<PrivateRoute element={<Representative />} />} />
        <Route path="add-representative" element={<PrivateRoute element={<SaveRepresentative />} />} />
        <Route path="edit-representative/:id" element={<PrivateRoute element={<SaveRepresentative />} />} />
        <Route path="bills" element={<PrivateRoute element={<Bill />} />} />
        <Route path="/add-bill" element={<PrivateRoute element={<AddBill />} />} />
        <Route path="bills/edit-bill/:id" element={<PrivateRoute element={<AddBill />} />} />
        <Route path="/search-bills" element={<PrivateRoute element={<SearchBill />} />} />
        <Route path="/manage-term" element={<PrivateRoute element={<ManageTerm />} />} />
        <Route path="/activities" element={<PrivateRoute element={<Activity />} />} />
        <Route path="/add-activity" element={<PrivateRoute element={<AddActivity />} />} />
        <Route path="/edit-activity/:id" element={<PrivateRoute element={<AddActivity />} />} />
        <Route path="/add-user" element={<PrivateRoute element={<AddUser />} />} />
        <Route path="/manage-user" element={<PrivateRoute element={<ManageUser />} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
