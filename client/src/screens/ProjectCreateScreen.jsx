import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createProjectWithAI } from '../actions/projectActions';
import { PROJECT_CREATE_WITH_AI_RESET } from '../constants/projectConstants';
import { listTeams } from '../actions/teamActions';
// Removed listTasks as per simplified input
import Loader from '../components/Loader';
import Message from '../components/Message'; // For error/success messages
import { FaRobot } from 'react-icons/fa'; // Icon for AI

const ProjectCreateScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [aiPrompt, setAiPrompt] = useState(''); // Unified AI prompt input
  const [dueDate, setDueDate] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(''); // Renamed for clarity

  const teamList = useSelector((state) => state.teamList);
  const { teams = [] } = teamList;

  // Removed taskList for simplicity of input, will re-evaluate if needed for suggestions

  const projectCreateWithAI = useSelector((state) => state.projectCreateWithAI);
  const { loading, error, success, project } = projectCreateWithAI;

  const userInfo = useSelector((state) => state.userLogin.userInfo);

  useEffect(() => {
    if (!userInfo || !userInfo.token || userInfo.token.trim() === '') {
      navigate('/login');
    } else {
      dispatch(listTeams());
      // No dispatch(listTasks()) needed for simplified input
    }
    if (success) {
      dispatch({ type: PROJECT_CREATE_WITH_AI_RESET });
      navigate(`/project/${project._id}`);
    }
  }, [dispatch, navigate, success, project, userInfo]);

  const submitHandler = (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) {
      // Handle client-side validation, perhaps using Message component
      // For now, let's assume a message will be displayed by the global Message component if there's an error state
      return;
    }
    // For now, hardcode project name as 'AI Generated Project'. Can refine if AI returns name.
    dispatch(createProjectWithAI({ name: 'AI Generated Project', goal: aiPrompt, dueDate, teamId: selectedTeam }));
  };

  return (
    <div className="create-project-ai-page">
      <Link to="/projects/ongoing" className="btn btn-secondary btn-small back-button">
        Go Back
      </Link>
      <div className="hero-input-section">
        <FaRobot className="ai-icon" />
        <h1 className="hero-title">What do you want to build?</h1>
        <div className="hero-input-container">
          <textarea
            className="form-input hero-textarea"
            placeholder="Describe your project goal, e.g., 'Develop an e-commerce platform for selling custom artwork with user authentication, product listings, and a secure payment gateway.'"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            rows={5}
          ></textarea>
          <div className="project-options">
             <div className="form-group floating-label"> {/* Reusing floating-label class */}
                <input
                    type="date"
                    id="dueDate"
                    placeholder=" "
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="form-input"
                />
                <label htmlFor="dueDate">Due Date</label>
            </div>
            <div className="form-group floating-label">
                <select
                    id="selectedTeam"
                    value={selectedTeam}
                    onChange={(e) => setSelectedTeam(e.target.value)}
                    className="form-input"
                >
                    <option value="">Select Team</option>
                    {teams.map((teamOption) => (
                        <option key={teamOption._id} value={teamOption._id}>
                            {teamOption.name}
                        </option>
                    ))}
                </select>
                <label htmlFor="selectedTeam">Assign Team (Optional)</label>
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-full-width hero-button"
            onClick={submitHandler}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Project'}
          </button>
        </div>
      </div>

      {error && <Message variant='danger'>{error}</Message>}

      {loading && (
        <div className="ai-loading-animation">
            {/* Shimmering Skeleton Loader Placeholder */}
            <div className="skeleton-loader"></div>
            <div className="skeleton-loader small"></div>
            <div className="skeleton-loader medium"></div>
            <div className="skeleton-loader"></div>
            <p className="ai-thinking-text">AI is thinking...</p>
        </div>
      )}

      {success && project && project.tasks && (
        <div className="ai-result-preview">
          <h2 className="preview-title">Generated Project Roadmap:</h2>
          {/* Simple list view for now, will enhance with timeline/tree view CSS */}
          <ul className="tasks-preview-list">
            {project.tasks.map(task => (
              <li key={task._id} className="task-preview-item">
                <span className="task-name">{task.name}</span>
                {task.duration && <span className="task-duration">({task.duration} days)</span>}
              </li>
            ))}
          </ul>
          {/* Add a button to navigate to the new project */}
          <Link to={`/project/${project._id}`} className="btn btn-primary btn-full-width mt-3">
            View New Project
          </Link>
        </div>
      )}
    </div>
  );
};

export default ProjectCreateScreen;
