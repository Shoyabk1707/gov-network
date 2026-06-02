import { useState } from 'react';

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
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('Registration Successful!');
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
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