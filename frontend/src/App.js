import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, NavLink } from "react-router-dom";
import ReceiptUpload from "./components/ReceiptUpload";
import ReceiptsList from "./components/ReceiptsList";
import ReceiptEdit from "./components/ReceiptEdit";
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <div className="container my-4">
        <nav className="navbar navbar-expand-lg navbar-light bg-light rounded mb-4">
          <Link className="navbar-brand" to="/">Shopping Receipts</Link>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <NavLink className="nav-link" to="/" end>
                  Upload Receipt
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/receipts">
                  All Receipts
                </NavLink>
              </li>
            </ul>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<ReceiptUpload />} />
          <Route path="/receipts" element={<ReceiptsList />} />
          <Route path="/receipts/:id" element={<ReceiptEdit />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
