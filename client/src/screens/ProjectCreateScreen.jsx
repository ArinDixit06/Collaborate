import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import FormContainer from '../components/FormContainer';
import { createProjectWithAI } from '../actions/projectActions';
import { PROJECT_CREATE_WITH_AI_RESET } from '../constants/projectConstants';
import { listTeams } from '../actions/teamActions';
import { listTasks } from '../actions/taskActions';


const ProjectCreateScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [team, setTeam] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectGoal, setNewProjectGoal] = useState('');

  const teamList = useSelector((state) => state.teamList);
  const { teams = [] } = teamList;

  const taskList = useSelector((state) => state.taskList);
  const { tasks = [] } = taskList;

  const projectCreateWithAI = useSelector((state) => state.projectCreateWithAI);
  const { loading, error, success, project } = projectCreateWithAI;

  const userInfo = useSelector((state) => state.userLogin.userInfo); // Explicitly bring userInfo into scope here for useEffect

  useEffect(() => {
    if (!userInfo || !userInfo.token) {
      navigate('/login');
    } else {
      dispatch(listTeams());
      dispatch(listTasks());
    }
    if (success) {
      dispatch({ type: PROJECT_CREATE_WITH_AI_RESET });
      navigate(`/project/${project._id}`);
    }
  }, [dispatch, navigate, success, project, userInfo]);

  const submitHandler = (e) => {
    e.preventDefault();
    const finalName = name === 'CREATE_NEW' ? newProjectName : name;
    const finalGoal = goal === 'CREATE_NEW' ? newProjectGoal : goal;

    dispatch(createProjectWithAI({ name: finalName, goal: finalGoal, dueDate, teamId: team }));
  };

  return (
    <>
      <Link to="/" className="btn btn-light my-3">
        Go Back
      </Link>
      <FormContainer>
        <h1>Create Project with AI</h1>
        {loading && <h3>Loading...</h3>}
        {error && <h3>{error}</h3>}
        <Form onSubmit={submitHandler}>
          <Form.Group controlId="name">
            <Form.Label>Project Name</Form.Label>
            <Form.Control
              as="select"
              value={name}
              onChange={(e) => setName(e.target.value)}
            >
              <option value="">Select or Create New Project Name</option>
              <option value="CREATE_NEW">Create New Project Name</option>
              {tasks && tasks.map((taskOption) => (
                <option key={taskOption._id} value={taskOption.name}>
                  {taskOption.name}
                </option>
              ))}
            </Form.Control>
          </Form.Group>

          {name === 'CREATE_NEW' && (
            <Form.Group controlId="newProjectName">
              <Form.Label>New Project Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter new project name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              ></Form.Control>
            </Form.Group>
          )}

          <Form.Group controlId="goal">
            <Form.Label>Project Goal</Form.Label>
            <Form.Control
              as="select"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            >
              <option value="">Select or Create New Project Goal</option>
              <option value="CREATE_NEW">Create New Project Goal</option>
              {tasks && tasks.map((taskOption) => (
                <option key={taskOption._id} value={taskOption.description}>
                  {taskOption.description}
                </option>
              ))}
            </Form.Control>
          </Form.Group>

          {goal === 'CREATE_NEW' && (
            <Form.Group controlId="newProjectGoal">
              <Form.Label>New Project Goal</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Describe new project goal"
                value={newProjectGoal}
                onChange={(e) => setNewProjectGoal(e.target.value)}
              ></Form.Control>
            </Form.Group>
          )}

          <Form.Group controlId="dueDate">
            <Form.Label>Due Date</Form.Label>
            <Form.Control
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            ></Form.Control>
          </Form.Group>

          <Form.Group controlId="team">
            <Form.Label>Assign Team (Optional)</Form.Label>
            <Form.Control
              as="select"
              value={team}
              onChange={(e) => setTeam(e.target.value)}
            >
              <option value="">Select Team</option>
              {teams && teams.map((teamOption) => (
                <option key={teamOption._id} value={teamOption._id}>
                  {teamOption.name}
                </option>
              ))}
            </Form.Control>
          </Form.Group>

          <Button type="submit" variant="primary" className="mt-3">
            Generate Project
          </Button>
        </Form>
      </FormContainer>
    </>
  );
};

export default ProjectCreateScreen;
