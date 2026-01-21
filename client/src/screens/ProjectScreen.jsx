import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Card, ListGroup, Table } from 'react-bootstrap';
import { getProjectDetails } from '../actions/projectActions';
import Loader from '../components/Loader';
import Message from '../components/Message';

const ProjectScreen = () => {
  const { id: projectId } = useParams();
  const dispatch = useDispatch();

  const projectDetails = useSelector((state) => state.projectDetails);
  const { loading, error, project } = projectDetails;

  useEffect(() => {
    dispatch(getProjectDetails(projectId));
  }, [dispatch, projectId]);

  return (
    <>
      <Link to="/project/create" className="btn btn-light my-3">
        Create New Project
      </Link>
      <Link to="/" className="btn btn-light my-3">
        Go Back
      </Link>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <>
          <Card className="mb-3">
            <Card.Header>
              <h2>{project.name}</h2>
            </Card.Header>
            <Card.Body>
              <Card.Text>
                <strong>Goal:</strong> {project.goal}
              </Card.Text>
              <Card.Text>
                <strong>Due Date:</strong> {project.dueDate ? project.dueDate.substring(0, 10) : 'N/A'}
              </Card.Text>
              <Card.Text>
                <strong>Owner:</strong> {project.owner ? project.owner.name : 'N/A'}
              </Card.Text>
              <Card.Text>
                <strong>Team:</strong> {project.team ? project.team.name : 'N/A'}
              </Card.Text>
            </Card.Body>
          </Card>

          <h3>Generated Tasks</h3>
          {project.tasks && project.tasks.length === 0 ? (
            <Message variant="info">No tasks generated for this project.</Message>
          ) : (
            <Table striped bordered hover responsive className="table-sm">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>NAME</th>
                  <th>DURATION (days)</th>
                  <th>ASSIGNEE</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {project.tasks && project.tasks.map((task) => (
                  <tr key={task._id}>
                    <td>{task._id}</td>
                    <td>{task.name}</td>
                    <td>{task.duration}</td>
                    <td>{task.assignee ? task.assignee.name : 'Unassigned'}</td>
                    <td>{task.status}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </>
      )}
    </>
  );
};

export default ProjectScreen;
