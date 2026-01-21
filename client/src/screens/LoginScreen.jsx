import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Import useLocation and useNavigate
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../actions/userActions';
// import FormContainer from '../components/FormContainer'; // Removed
import AuthLayout from '../components/AuthLayout'; // New import

const LoginScreen = () => { // Remove location and history props
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const location = useLocation(); // Use useLocation hook
  const navigate = useNavigate(); // Use useNavigate hook

  const userLogin = useSelector((state) => state.userLogin);
  const { loading, error, userInfo } = userLogin;

  const redirect = location.search ? location.search.split('=')[1] : '/';

  useEffect(() => {
    if (userInfo) {
      navigate(redirect); // Use navigate instead of history.push
    }
  }, [navigate, userInfo, redirect]); // Update dependencies

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(login(email, password));
  };

  return (
    <AuthLayout>
      <div className="auth-form-content">
        <h1 className="auth-title">Sign In</h1>
        {error && <h3 className="auth-error-message">{error}</h3>}
        {loading && <h3 className="auth-loading-message">Loading...</h3>}
        <form onSubmit={submitHandler} className="auth-form">
          <div className="form-group floating-label">
            <input
              type="email"
              id="email"
              placeholder=" " /* Important for floating label */
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
            />
            <label htmlFor="email">Email Address</label>
          </div>
          <div className="form-group floating-label">
            <input
              type="password"
              id="password"
              placeholder=" " /* Important for floating label */
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
            />
            <label htmlFor="password">Password</label>
          </div>
          <button type="submit" className="btn btn-primary btn-full-width">Sign In</button>
        </form>
        <div className="auth-link-container">
          New Customer?{' '}
          <Link to={redirect ? `/register?redirect=${redirect}` : '/register'} className="auth-link">
            Register
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginScreen;
