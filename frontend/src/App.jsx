import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";

import Login from "./pages/Auth/Login.jsx";
import SignUp from "./pages/Auth/Signup.jsx";

import { Navigate } from "react-router-dom";

import AdminDashboard from "./pages/Admin/AdminDashboard.jsx";
import ManageBugs from "./pages/Admin/ManageBugs.jsx";
import CreateBug from "./pages/Admin/CreateBug.jsx";
import ManageUsers from "./pages/Admin/ManageUsers.jsx";

import TesterDashboard from "./pages/Tester/TesterDashboard.js";
import ReportBug from "./pages/Tester/CreateBug.js";
import ViewBugDetails from "./pages/Tester/ViewBugDetails.jsx";

import DeveloperDashboard from './pages/Developer/DeveloperDashboard.jsx';
import ViewAssignedBug from './pages/Developer/ViewAssignedBug.jsx';       

import PrivateRoute from "./routes/PrivateRoute.jsx";
import UserProvider, { UserContext } from "./context/userContext.jsx";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <UserProvider>
      <div>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signUp" element={<SignUp />} />

            {/*Admin Routes*/}
            <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/bugs" element={<ManageBugs />} />
              <Route path="/admin/create-bug" element={<CreateBug />} />
              <Route path="/admin/users" element={<ManageUsers />} />
            </Route>

            {/* Tester Routes */}
            <Route element={<PrivateRoute allowedRoles={["tester"]}/>}>
              <Route path="/tester/dashboard" element={<TesterDashboard/>} />
              <Route path="/tester/report-bug" element={<ReportBug/>} />
              <Route path="/tester/bug/:id" element={<ViewBugDetails/>} />
            </Route>

          {/* Developer Routes */}
          <Route element={<PrivateRoute allowedRoles={["developer"]}/>}>
            <Route path="/developer/dashboard" element={<DeveloperDashboard/>} />
            <Route path="/developer/bug/:id" element={<ViewAssignedBug/>} />
          </Route>

            {/*Default Route*/}
            <Route path="/" element={<Root />} />
          </Routes>
        </Router>
      </div>

      <Toaster
        toastOptions={{
          className: "",
          style: {
            fontSize: "13px",
          },
        }}
      />
    </UserProvider>
  );
};

export default App;

const Root = () => {
  const {user, loading} = useContext(UserContext);

  if (loading) return <Outlet/>;

  if (!user) return <Navigate to="/login" />;

  if (user.role === "admin") return <Navigate to="/admin/dashboard" />;
  if (user.role === "tester") return <Navigate to="/tester/dashboard" />;
  if (user.role === "developer") return <Navigate to="/developer/dashboard" />;
  
  return <Navigate to="/login" />;
};
