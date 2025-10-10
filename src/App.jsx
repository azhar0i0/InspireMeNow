import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { AuthProvider } from "./Auth/AuthContext";

// Layout + Components
import Layout from "./Components/Layout";
import Dashboard from "./Components/Dashboard";
import UserManagement from "./Components/UserManagement";
import ContentManagement from "./Components/ContentManagement";
import Meditation from "./Components/Meditation";

import { useEffect } from "react";
import { auth } from "./firebaseConfig";
// Auth Pages
import SignIn from "./Auth/SignIn";
import { AuthProvider } from "./Auth/AuthContext";
import PrivateRoute from "./Auth/PrivateRoute";
import NotFound from "./Components/NotFound";

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
            <Route path="meditation" element={<Meditation />} />
            
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
