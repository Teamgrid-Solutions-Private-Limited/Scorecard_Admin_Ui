import * as React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import SaveSenetors from '/dashboard/AddSenator';
import Senator from '/dashboard/Senator';
import Representative from '/dashboard/Representative';
import SaveRepresentative from '/dashboard/AddRepresentative';
import Bill from '/dashboard/Bills';
import SignIn from '/Authentication/components/SignIn';
import AddBill from '../dashboard/AddBill';
import SearchBill from '../dashboard/SearchBill';

const PrivateRoute = ({ element }) => {
  const token = localStorage.getItem('token');
  return token ? element : <Navigate to="/login" />;
};
import ManageTerm from '../dashboard/ManageTerm';

export default function App() {
  return (
    <Router basename="/scorecard/admin">
      <Routes>
        <Route path="/login" element={<SignIn />} />

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
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
