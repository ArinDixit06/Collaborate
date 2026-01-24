import React from 'react';
import './HomeScreen.css';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaProjectDiagram, FaUsers, FaMagic, FaArrowRight, FaBolt, FaSyncAlt } from 'react-icons/fa';

const HomeScreen = () => {
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  return (
    <div className="home-page">
      <div className="home-content">
        <section className="hero-section">
          <h1 className="hero-headline">Collaborate, Plan, and Execute with Precision</h1>
          <p className="hero-subheadline">
            A unified platform for modern teams to manage projects, track progress, and build momentum.
            Inspired by the best, built for you.
          </p>
          <Link to={userInfo ? "/projects/ongoing" : "/login"}>
            <button className="cta-button">
              {userInfo ? 'Go to Your Projects' : 'Get Started'} <FaArrowRight />
            </button>
          </Link>
        </section>

        <section className="features-section">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon"><FaMagic /></div>
              <h3 className="feature-title">AI-Powered Planning</h3>
              <p className="feature-description">
                Leverage our AI to automatically generate project plans, tasks, and timelines from a simple prompt.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><FaUsers /></div>
              <h3 className="feature-title">Seamless Collaboration</h3>
              <p className="feature-description">
                Organize your work into teams, assign roles, and keep everyone in sync with a single source of truth.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><FaProjectDiagram /></div>
              <h3 className="feature-title">Modern Progress Tracking</h3>
              <p className="feature-description">
                Visualize your project’s progress with clean, intuitive dashboards and progress bars.
              </p>
            </div>
          </div>
        </section>

        <section className="final-cta-section">
          <h2 className="hero-headline" style={{ fontSize: '2.5rem' }}>Ready to Build Better?</h2>
          <p className="hero-subheadline">
            Join thousands of teams shipping faster and collaborating smarter.
          </p>
          <Link to={userInfo ? "/project/create" : "/register"}>
            <button className="cta-button">
              {userInfo ? 'Create a New Project' : 'Sign Up for Free'} <FaArrowRight />
            </button>
          </Link>
        </section>
      </div>
    </div>
  );
};

export default HomeScreen;
