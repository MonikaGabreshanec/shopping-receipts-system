import React from "react";

const Home = () => {
  const name = localStorage.getItem("name");
  const surname = localStorage.getItem("surname");

  return (
    <div className="mt-5 text-center">
      {name ? (
        <h2>Welcome, {name} {surname}!</h2>
      ) : (
        <h2>Welcome to the Shopping Receipts System</h2>
      )}
      <p>Please login or register to manage your receipts.</p>
    </div>
  );
};

export default Home;
