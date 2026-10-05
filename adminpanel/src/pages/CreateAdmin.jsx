import React, { useState } from "react";
import axios from "axios";

const CreateAdmin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/create-admin`,
        { username, password }
      );

      alert(res.data.message);
      setUsername("");
      setPassword("");

    } catch (error) {
      alert(error.response?.data?.message || "Error creating admin");
    }
  };

  return (
    <div className="container mt-5">
      <h2>Create Admin</h2>

      <form onSubmit={handleSubmit} style={{ maxWidth: "400px" }}>
        
        <div className="mb-3">
          <label>Username</label>
          <input
            type="text"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label>Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Create Admin
        </button>

      </form>
    </div>
  );
};

export default CreateAdmin;