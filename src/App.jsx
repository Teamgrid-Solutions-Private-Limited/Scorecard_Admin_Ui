import * as React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ProTip from './ProTip';
import Copyright from './Copyright';
import SaveSenetors from "/dashboard/AddSenator";
import Senator from "/dashboard/Senator";
import Representative from "/dashboard/Representative";
import SaveRepresentative from "/dashboard/AddRepresentative";

export default function App() {
  return (
    <Router basename="/scorecard/admin">
     <Routes>
       {/* <Route path="/login" element={<Login />} /> */}
       {/* <Route
         index
         element={
           token ? <Navigate to="/senator" /> : <Navigate to="/login" />
         }
       /> */}

       <Route
         path="/"
         element={
           <Senator/>
           
         }
       />
       <Route
         path="add-senator"
         element={
           
               <SaveSenetors />
              
         }
       />
       {/* <Route
         path="edit-senator/:id"
         element={
           <PrivateRoute>
             <Layout>
               <SaveSenetors />
             </Layout>
           </PrivateRoute>
         }
       /> */}

<Route
         path="representative"
         element={
           <Representative/>
           
         }
       />

<Route
         path="add-representative"
         element={
           <SaveRepresentative/>
           
         }
       />

       
 
     </Routes>
   </Router>
  );
}
