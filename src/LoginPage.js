import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from './supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else navigate('/');
  };

  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert('Signup successful! Please check your email to confirm.');
  };

  return (
    <div className="p-4 max-w-md mx-auto space-y-3">
      <h2 className="text-xl font-bold mb-2">Login / Sign Up</h2>
      <input
        className="border p-2 w-full"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="border p-2 w-full"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        onClick={handleLogin}
        className="bg-blue-500 text-white w-full p-2 rounded"
      >
        Login
      </button>
      <button
        onClick={handleSignup}
        className="bg-gray-500 text-white w-full p-2 rounded"
      >
        Sign Up
      </button>
    </div>
); }
