import React, { useContext } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import BlogDetailsPage from "./pages/BlogDetailsPage";
import CreateBlogPage from "./pages/CreateBlogPage";
import ReplyThreadPage from "./pages/ReplyThreadPage";
import NotificationsPage from "./pages/NotificationsPage";
import SearchPage from "./pages/SearchPage";
import UsersPage from "./pages/UsersPage";
import { AuthContext } from "./context/AuthContext";
import Header from "./components/Header";
import ForgotPasswordPage from "./pages/ForgetPasswordPage";

function App() {
  const { user, logout } = useContext(AuthContext);

  return (
    <Router>
      {<Header user={user} logout={logout} />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/blogs/:id" element={<BlogDetailsPage />} />
        <Route path="/create-blog" element={<CreateBlogPage />} />
        <Route path="/thread/:postId" element={<ReplyThreadPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Routes>
    </Router>
  );
}

export default App;
