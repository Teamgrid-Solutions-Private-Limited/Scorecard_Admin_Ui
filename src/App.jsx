import * as React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import SaveSenators from '../src/Senator/Addsenator';
import Senator from '../src/Senator/Senator';
import Representative from '../src/Representative/Representative';
import SaveRepresentative from '../src/Representative/Addrepresentative';
import Vote from './votes/Votes';
import SignIn from '../src/Authentication/components/SignIn';
import AddVote from './votes/AddVote';
import SearchVote from './votes/SearchVotes';
import ManageTerm from "../src/Manageterm/ManageTerm";
import Activity from '../src/Activity/Activity';
import AddActivity from '../src/Activity/AddActivity';
import AddUser from "../src/Authentication/components/AddUser";
import ManageUser from "../src/Authentication/components/ManageUser";
import LoginPage from './Authentication/components/LoginPage';
import ActivateAccount from './Authentication/components/ActivateAccount';
import SearchActivity from "../src/Activity/SearchActivity";
import { isAuthenticated } from './utils/auth';

const PrivateRoute = ({ element }) => {
  return isAuthenticated() ? element : <Navigate to="/login" />;
};

export default function App() {
  return (
    <Router basename="/scorecard/admin">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<PrivateRoute element={<Senator />} />} />
        <Route
          path="add-senator"
          element={<PrivateRoute element={<SaveSenators />} />}
        />
        <Route
          path="edit-senator/:id"
          element={<PrivateRoute element={<SaveSenators />} />}
        />
        <Route
          path="representative"
          element={<PrivateRoute element={<Representative />} />}
        />
        <Route
          path="add-representative"
          element={<PrivateRoute element={<SaveRepresentative />} />}
        />
        <Route
          path="edit-representative/:id"
          element={<PrivateRoute element={<SaveRepresentative />} />}
        />
        <Route path="votes" element={<PrivateRoute element={<Vote />} />} />
        <Route
          path="/add-vote"
          element={<PrivateRoute element={<AddVote />} />}
        />
        <Route
          path="/edit-vote/:id"
          element={<PrivateRoute element={<AddVote />} />}
        />
        <Route
          path="/search-votes"
          element={<PrivateRoute element={<SearchVote />} />}
        />
        <Route
          path="/manage-term"
          element={<PrivateRoute element={<ManageTerm />} />}
        />
        <Route
          path="/activities"
          element={<PrivateRoute element={<Activity />} />}
        />
        <Route
          path="/add-activity"
          element={<PrivateRoute element={<AddActivity />} />}
        />
        <Route
          path="/search-activities"
          element={<PrivateRoute element={<SearchActivity />} />}
        />
        <Route
          path="/edit-activity/:id"
          element={<PrivateRoute element={<AddActivity />} />}
        />
        <Route
          path="/add-user"
          element={<PrivateRoute element={<AddUser />} />}
        />
        <Route
          path="/manage-user"
          element={<PrivateRoute element={<ManageUser />} />}
        />
        <Route path="/activate-account" element={<ActivateAccount />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
