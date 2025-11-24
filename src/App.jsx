import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layout + Components
import Layout from "./Components/Layout";
import Dashboard from "./Components/Dashboard";
import UserManagement from "./Components/UserManagement";
import ContentManagement from "./Components/ContentManagement";
import Meditation from "./Components/Meditation";
import NotFound from "./Components/NotFound";

// Auth
import SignIn from "./Auth/SignIn";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public login page */}
        <Route path="/" element={<SignIn />} />

        {/* Dashboard + nested routes */}
        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="user-management" element={<UserManagement />} />
          <Route path="content-management" element={<ContentManagement />} />
          <Route path="meditation" element={<Meditation />} />
        </Route>

        {/* Catch-all 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
