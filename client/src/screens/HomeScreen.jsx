import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';

const HomeScreen = () => {
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  return (
    <Container className="text-center mt-5">
      <h1>Welcome to Collaborate</h1>
      <p>The collaborative task management tool.</p>
      <div>
        <Link to="/tasks">
          <Button variant="primary" className="m-2">
            View Tasks
          </Button>
        </Link>
        <Link to="/teams">
          <Button variant="secondary" className="m-2">
            View Teams
          </Button>
        </Link>
        {userInfo && (
          <Link to="/project/create">
            <Button variant="info" className="m-2">
              Create Project with AI
            </Button>
          </Link>
        )}
      </div>
    </Container>
  );
};

export default HomeScreen;
