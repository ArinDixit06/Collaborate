import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../actions/userActions';
import AuthLayout from '../components/AuthLayout';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { FaGoogle, FaGithub } from 'react-icons/fa';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const userLogin = useSelector((state) => state.userLogin);
  const { loading, error, userInfo } = userLogin;

  const redirect = location.search ? location.search.split('=')[1] : '/';

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, userInfo, redirect]);

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(login(email, password));
  };

  return (
    <AuthLayout>
      <div className="auth-header">
        <h1 className="auth-title">Sign In</h1>
        <p className="auth-subtitle">Welcome back to UniSync.</p>
      </div>

      {error && <Message variant="danger">{error}</Message>}
      {loading && <Loader />}

      <div className="social-login-buttons">
        <button className="social-btn">
          <FaGoogle /> Continue with Google
        </button>
        <button className="social-btn">
          <FaGithub /> Continue with GitHub
        </button>
      </div>

      <div className="social-login-divider">or</div>

      <form onSubmit={submitHandler} className="auth-form">
        <div className="form-group">
          <input
            type="email"
            id="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            id="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
          />
        </div>
        <button type="submit" className="btn btn-primary">Sign In</button>
      </form>
      <div className="auth-link-container">
        Don't have an account?{' '}
        <Link to={redirect ? `/register?redirect=${redirect}` : '/register'} className="auth-link">
          Sign Up
        </Link>
      </div>
    </AuthLayout>
  );
};

export default LoginScreen;
