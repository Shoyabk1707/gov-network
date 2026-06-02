import { useState } from 'react';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Save the digital ID badge in the browser's memory
        localStorage.setItem('token', data.token);
        window.location.reload();
        alert('Login Successful! Badge secured.');
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      alert('Server connection failed!');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">GovNetwork Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" name="email" placeholder="Official Email" onChange={handleChange} className="w-full p-2 border rounded" required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} className="w-full p-2 border rounded" required />
        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">Login</button>
      </form>
    </div>
  );
}