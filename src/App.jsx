import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { AuthProvider } from "./Auth/AuthContext";

// Layout + Components
import Layout from "./Components/Layout";
import Dashboard from "./Components/Dashboard";
import UserManagement from "./Components/UserManagement";
import ContentManagement from "./Components/ContentManagement";

import { useEffect } from "react";
import { auth } from "./firebaseConfig";
// Auth Pages
import SignIn from "./Auth/SignIn";
import ForgetPassword from "./Auth/ForgetPassword";
import { AuthProvider } from "./Auth/AuthContext";
import PrivateRoute from "./Auth/PrivateRoute";
import NotFound from "./NotFound";

function App() {



 useEffect(() => {
    console.log("Firebase Auth object:", auth);

    if (auth) {
      console.log(" Firebase is connected!");
    } else {
      console.log("❌ Firebase is NOT connected!");
    }
  }, []);


  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<SignIn />} />
          <Route path="forget-password" element={<ForgetPassword />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="user-management" element={<UserManagement />} />
            <Route path="content-management" element={<ContentManagement />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFound to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
