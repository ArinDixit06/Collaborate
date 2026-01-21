import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom'; // Import Link
import { FaTrash, FaUsers } from 'react-icons/fa'; // Import icons

import Message from '../components/Message';
import Loader from '../components/Loader';
import { listProjects, deleteProject } from '../actions/projectActions';
import { PROJECT_DELETE_SUCCESS } from '../constants/projectConstants';

// Helper to calculate progress (simple example)
const calculateProgress = (tasks) => {
  if (!tasks || tasks.length === 0) return 0;
  const completedTasks = tasks.filter(task => task.status === 'Completed').length; // Assuming 'Completed' is the status
  return Math.round((completedTasks / tasks.length) * 100);
};

// Helper to determine due date urgency color
const getDueDateColor = (dueDate) => {
  if (!dueDate) return 'var(--text-low-emphasis)';
  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'var(--status-error)'; // Overdue
  if (diffDays <= 7) return 'var(--status-warning)'; // Due in 7 days or less
  return 'var(--status-info)'; // Default or long term
};


// --- New ProjectCard Component ---
const ProjectCard = ({ project, userInfo, onDelete }) => {
  const isOwner = userInfo && project.owner && project.owner._id === userInfo._id;
  const progress = calculateProgress(project.tasks);
  const dueDateColor = getDueDateColor(project.dueDate);

  return (
    <div className="project-card">
      <div className="project-card-header">
        <h3 className="project-name">{project.name}</h3>
        {project.dueDate && (
          <div className="due-date-badge" style={{ backgroundColor: dueDateColor }}>
            {new Date(project.dueDate).toLocaleDateString()}
          </div>
        )}
      </div>
      <div className="project-card-body">
        <p className="project-goal-snippet">{project.goal}</p>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
          <span className="progress-text">{progress}% Complete</span>
        </div>
      </div>
      <div className="project-card-footer">
        <div className="stacked-avatars">
          {project.team && project.team.members && project.team.members.slice(0, 3).map((member) => (
            <div key={member._id} className="member-avatar" title={member.name}>
              {member.name.charAt(0).toUpperCase()}
            </div>
          ))}
          {project.team && project.team.members && project.team.members.length > 3 && (
            <div className="member-avatar-more">
              +{project.team.members.length - 3}
            </div>
          )}
        </div>
        <Link to={`/project/${project._id}`} className="btn btn-primary btn-small">
          View Project
        </Link>
        {isOwner && (
          <button className="btn btn-icon btn-small btn-danger" onClick={() => onDelete(project._id)}>
            <FaTrash />
          </button>
        )}
      </div>
    </div>
  );
};
// ---------------------------------------------------------------------

const OngoingProjectsScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const projectList = useSelector(state => state.projectList);
  const { loading, error, projects } = projectList;

  const projectDelete = useSelector(state => state.projectDelete);
  const { loading: loadingDelete, error: errorDelete, success: successDelete } = projectDelete;

  useEffect(() => {
    if (!userInfo || !userInfo.token || userInfo.token.trim() === '') {
      navigate('/login');
    } else {
      if (successDelete) {
        dispatch({ type: PROJECT_DELETE_SUCCESS });
        dispatch(listProjects());
      } else {
        dispatch(listProjects());
      }
    }
  }, [dispatch, navigate, userInfo, successDelete]);

  const deleteHandler = (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      dispatch(deleteProject(id));
    }
  };

  return (
    <div className="ongoing-projects-page">
      <h1 className="dashboard-title">Ongoing Projects</h1> {/* Reusing dashboard-title class */}

      {loadingDelete && <Loader />}
      {errorDelete && <Message variant='danger'>{errorDelete}</Message>}
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <div className="project-grid">
          {projects.length === 0 ? (
            <Message variant='info'>No ongoing projects found.</Message>
          ) : (
            projects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                userInfo={userInfo}
                onDelete={deleteHandler}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default OngoingProjectsScreen;