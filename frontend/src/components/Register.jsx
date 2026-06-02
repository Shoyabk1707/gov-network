import { useState } from 'react';
import { API_BASE_URL } from '../config';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', department: '', jobTitle: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Use the live cloud URL
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, department, jobTitle }) // your existing state variables
      });

      if (response.ok) {
        // 2. Redirect the user to the login page so they can sign in
        window.location.href = '/'; // Or '/login' depending on your route setup
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
      alert('Server connection failed!');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">GovNetwork Signup</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="name" placeholder="Full Name" onChange={handleChange} className="w-full p-2 border rounded" required />
        <input type="email" name="email" placeholder="Official Email" onChange={handleChange} className="w-full p-2 border rounded" required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} className="w-full p-2 border rounded" required />
        <input type="text" name="department" placeholder="Department (e.g., Finance)" onChange={handleChange} className="w-full p-2 border rounded" required />
        <input type="text" name="jobTitle" placeholder="Job Title" onChange={handleChange} className="w-full p-2 border rounded" required />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Register</button>
      </form>
    </div>
  );
}