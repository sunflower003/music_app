// src/components/AuthForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const API_BASE = 'http://localhost:5000/api/auth';

export default function AuthForm() {
  const [tab, setTab] = useState('signin');
  const navigate = useNavigate();
  const [signinData, setSigninData] = useState({ username: '', password: '' });
  const [signupData, setSignupData] = useState({ username: '', password: '', confirmPassword: '' });

  const switchTab = (tabName) => setTab(tabName);


  // Hàm xử lý đăng ký
  const handleSignup = async (e) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: signupData.username, password: signupData.password }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Registration successful! Please sign in.');
        setTab('signin');
      } else {
        toast.error(data.msg || 'Registration failed');
      }
    } catch {
      toast.error('An error occurred');
    }
  };

  // Hàm xử lý đăng nhập
  const handleSignin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signinData),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Login successful!');
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/home');
      } else {
        toast.error(data.msg || 'Login failed');
      }
    } catch {
      toast.error('An error occurred');
    }
  };

  return (
    <div className="body_signin">
      <div className="justify_sisu_auth-container">
        <div className="justify_sisu_spotify-logo">
          <img src="https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg" alt="Spotify" />
        </div>
        <div className="justify_sisu_tab-switch">
          <button
            className={tab === 'signin' ? 'justify_sisu_active' : ''}
            onClick={() => switchTab('signin')}
          >
            SIGN IN
          </button>
          <button
            className={tab === 'signup' ? 'justify_sisu_active' : ''}
            onClick={() => switchTab('signup')}
          >
            SIGN UP
          </button>
        </div>

        {tab === 'signin' && (
          <form className="justify_sisu_form" onSubmit={handleSignin}>
            <input
              type="text"
              placeholder="Username"
              required
              value={signinData.username}
              onChange={(e) => setSigninData({ ...signinData, username: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              required
              value={signinData.password}
              onChange={(e) => setSigninData({ ...signinData, password: e.target.value })}
            />
            
            <button type="submit" className="justify_sisu_submit-btn">SIGN IN</button>
            <button
              type="button"
              className="justify_sisu_forgot"
              onClick={() => toast.info('Tính năng quên mật khẩu đang phát triển')}
              style={{ background: "none", border: "none", color: "inherit", textDecoration: "underline", cursor: "pointer", padding: 0 }}
            >
              Forgot Password?
            </button>
          </form>
        )}

        {tab === 'signup' && (
          <form className="justify_sisu_form" onSubmit={handleSignup}>
            <input
              type="text"
              placeholder="Username"
              required
              value={signupData.username}
              onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              required
              value={signupData.password}
              onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              required
              value={signupData.confirmPassword}
              onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
            />
            <button type="submit" className="justify_sisu_submit-btn">SIGN UP</button>
          </form>
        )}
      </div>
    </div>
  );
}
