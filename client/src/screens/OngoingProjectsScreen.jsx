import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap'; // Import Button
import Message from '../components/Message';
import Loader from '../components/Loader';
import { listProjects, deleteProject } from '../actions/projectActions'; // Import deleteProject action
import { PROJECT_DELETE_SUCCESS } from '../constants/projectConstants'; // Import PROJECT_DELETE_SUCCESS

const OngoingProjectsScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const projectList = useSelector(state => state.projectList);
  const { loading, error, projects } = projectList;

  const projectDelete = useSelector(state => state.projectDelete); // Add projectDelete state
  const { loading: loadingDelete, error: errorDelete, success: successDelete } = projectDelete;

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
      if (successDelete) { // Handle successful deletion
        dispatch({ type: PROJECT_DELETE_SUCCESS }); // Reset success state
        dispatch(listProjects()); // Refresh project list
      } else {
        dispatch(listProjects());
      }
    }
  }, [dispatch, navigate, userInfo, successDelete]); // Add successDelete to dependencies

  const deleteHandler = (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      dispatch(deleteProject(id));
    }
  };

  return (
    <>
      <h1>Ongoing Projects</h1>
      {loadingDelete && <Loader />}
      {errorDelete && <Message variant='danger'>{errorDelete}</Message>}
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <Row>
          {projects.length === 0 ? (
            <Message variant='info'>No ongoing projects found.</Message>
          ) : (
            projects.map((project) => (
              <Col key={project._id} sm={12} md={6} lg={4} xl={3}>
                <Card className='my-3 p-3 rounded'>
                  <Card.Body>
                    <Card.Title as='div'>
                      <strong>{project.name}</strong>
                    </Card.Title>
                    <Card.Text as='p'>{project.goal}</Card.Text>
                    <Card.Text as='div'>
                        <strong>Due Date: </strong>
                        {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'N/A'}
                    </Card.Text>
                    {project.team && (
                      <Card.Text as='div'>
                        <strong>Team: </strong> {project.team.name}
                      </Card.Text>
                    )}
                    <Card.Text as='div'>
                      <strong>Owner: </strong> {project.owner.name}
                    </Card.Text>
                    <Card.Text as='div'>
                      <strong>Tasks: </strong> {project.tasks.length}
                    </Card.Text>
                    <Card.Link href={`/project/${project._id}`}>View Project</Card.Link>
                    {userInfo && project.owner._id === userInfo._id && (
                      <Button
                        variant="danger"
                        className="btn-sm ms-2" // Add ms-2 for margin-left
                        onClick={() => deleteHandler(project._id)}
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))
          )}
        </Row>
      )}
    </>
  );
};

export default OngoingProjectsScreen;