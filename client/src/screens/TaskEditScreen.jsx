import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom'; // Import useParams and useNavigate
import { Form, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import FormContainer from '../components/FormContainer';
import { createTask, updateTask, getTaskDetails } from '../actions/taskActions';
import { listTeams } from '../actions/teamActions';
import { listUsers } from '../actions/userActions';
import { TASK_CREATE_RESET, TASK_UPDATE_RESET } from '../constants/taskConstants';

const TaskEditScreen = () => { // Remove match and history props
  const { id: taskId } = useParams(); // Use useParams hook
  const navigate = useNavigate(); // Use useNavigate hook

  const [name, setName] = useState('');
  const [duration, setDuration] = useState(0);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('To Do');
  const [assignedTo, setAssignedTo] = useState('');
  const [assignedToModel, setAssignedToModel] = useState('User');

  const dispatch = useDispatch();

  const taskDetails = useSelector((state) => state.taskDetails);
  const { loading, error, task } = taskDetails;

  const taskUpdate = useSelector((state) => state.taskUpdate);
  const {
    loading: loadingUpdate,
    error: errorUpdate,
    success: successUpdate,
  } = taskUpdate;

  const taskCreate = useSelector((state) => state.taskCreate);
  const {
    loading: loadingCreate,
    error: errorCreate,
    success: successCreate,
  } = taskCreate;

  const teamList = useSelector((state) => state.teamList);
  const { teams } = teamList;

  const userList = useSelector((state) => state.userList);
  const { users } = userList;


  useEffect(() => {
    dispatch(listTeams());
    dispatch(listUsers());
    if (successUpdate) {
      dispatch({ type: TASK_UPDATE_RESET });
      navigate('/tasks'); // Use navigate instead of history.push
    } else {
      if (taskId) { // Only dispatch if taskId exists (editing existing task)
        if (!task || !task.name || task._id !== taskId) {
          dispatch(getTaskDetails(taskId));
        } else {
          setName(task.name);
          setDuration(task.duration);
          setDescription(task.description);
          setStatus(task.status);
          setAssignedTo(task.assignee ? task.assignee._id : ''); // Use task.assignee
          setAssignedToModel(task.assignedToModel || 'User'); // Default to 'User'
        }
      } else { // For new task creation, ensure fields are reset
          setName('');
          setDuration(0);
          setDescription('');
          setStatus('To Do');
          setAssignedTo('');
          setAssignedToModel('User');
      }
    }
  }, [dispatch, navigate, taskId, task, successUpdate]); // Update dependencies

  useEffect(() => {
    if (successCreate) {
      dispatch({ type: TASK_CREATE_RESET });
      navigate('/tasks');
    }
  }, [dispatch, navigate, successCreate]);

  const submitHandler = (e) => {
    e.preventDefault();
    if (taskId) {
      dispatch(updateTask({ _id: taskId, name, duration, description, status, assignedTo, assignedToModel }));
    } else {
      dispatch(createTask({ name, duration, description, status, assignedTo, assignedToModel }));
    }
  };

  return (
    <>
      <Link to="/tasks" className="btn btn-light my-3">
        Go Back
      </Link>
      <FormContainer>
        <h1>{taskId ? 'Edit Task' : 'Create Task'}</h1>
        {loadingUpdate && <h3>Loading...</h3>}
        {errorUpdate && <h3>{errorUpdate}</h3>}
        {loading ? (
          <h3>Loading...</h3>
        ) : error ? (
          <h3>{error}</h3>
        ) : (
          <Form onSubmit={submitHandler}>
            <Form.Group controlId="name">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId="duration">
              <Form.Label>Duration (in days)</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId="description">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId="status">
              <Form.Label>Status</Form.Label>
              <Form.Control
                as="select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option>To Do</option>
                <option>In Progress</option>
                <option>Done</option>
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="assignedToModel">
              <Form.Label>Assign To</Form.Label>
              <Form.Control
                as="select"
                value={assignedToModel}
                onChange={(e) => setAssignedToModel(e.target.value)}
              >
                <option value="User">User</option>
                <option value="Team">Team</option>
              </Form.Control>
            </Form.Group>

            {assignedToModel === 'User' ? (
              <Form.Group controlId="assignedTo">
                <Form.Label>User</Form.Label>
                <Form.Control
                  as="select"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                >
                  <option value="">Select User</option>
                  {users && users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            ) : (
              <Form.Group controlId="assignedTo">
                <Form.Label>Team</Form.Label>
                <Form.Control
                  as="select"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                >
                  <option value="">Select Team</option>
                  {teams && teams.map((team) => (
                    <option key={team._id} value={team._id}>
                      {team.name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            )}

            <Button type="submit" variant="primary">
              {taskId ? 'Update' : 'Create'}
            </Button>
          </Form>
        )}
      </FormContainer>
    </>
  );
};

export default TaskEditScreen;
