import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, NavLink, Navigate } from "react-router-dom";
import ReceiptUpload from "./components/ReceiptUpload";
import ReceiptsList from "./components/ReceiptsList";
import ReceiptEdit from "./components/ReceiptEdit";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import 'bootstrap/dist/css/bootstrap.min.css';

// ProtectedRoute component
const ProtectedRoute = ({ isLoggedIn, children }) => {
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem("access_token");
  });

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("name");
    localStorage.removeItem("surname");
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <div className="container-fluid min-vh-100 d-flex flex-column" style={{padding: 0}}>
        <nav className="navbar navbar-expand-lg navbar-dark bg-secondary shadow-sm py-3">
          <div className="container-fluid px-4">
            <Link className="navbar-brand fw-bold" to="/">Систем за сметки</Link>
            <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarContent"
                aria-controls="navbarContent"
                aria-expanded="false"
                aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarContent">
              <ul className="navbar-nav ms-auto align-items-center gap-2">
                {isLoggedIn ? (
                    <>
                      <li className="nav-item">
                        <NavLink className="nav-link text-light fw-semibold" to="/upload">Скенирај сметка</NavLink>
                      </li>
                      <li className="nav-item">
                        <NavLink className="nav-link text-light fw-semibold" to="/receipts">Мои сметки</NavLink>
                      </li>
                      <li className="nav-item">
                        <button
                            className="btn btn-outline-light btn-sm fw-semibold"
                            onClick={handleLogout}
                        >
                          Logout
                        </button>
                      </li>
                    </>
                ) : (
                    <>
                      <li className="nav-item">
                        <NavLink className="nav-link text-light fw-semibold" to="/login">Login</NavLink>
                      </li>
                      <li className="nav-item">
                        <NavLink className="nav-link text-light fw-semibold" to="/register">Register</NavLink>
                      </li>
                    </>
                )}
              </ul>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route
              path="/upload"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <ReceiptUpload/>
                </ProtectedRoute>
              }
          />
          <Route
              path="/receipts"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <ReceiptsList/>
                </ProtectedRoute>
              }
          />
          <Route
              path="/receipts/:id"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <ReceiptEdit/>
                </ProtectedRoute>
              }
          />
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn}/>}/>
          <Route path="/register" element={<Register/>}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
