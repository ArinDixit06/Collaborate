import React, { useEffect, useState } from 'react';
import './OngoingProjectsScreen.css';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { FaTrash, FaUsers, FaPlus, FaCalendarAlt, FaUser } from 'react-icons/fa';

import Message from '../components/Message';
import Loader from '../components/Loader';
import { listProjects, deleteProject } from '../actions/projectActions';
import { getUserDetails } from '../actions/userActions'; // Import getUserDetails
import { PROJECT_DELETE_SUCCESS } from '../constants/projectConstants';
import ProjectCreateModal from '../components/ProjectCreateModal';



const getInitials = (name) => {
  if (!name) return '';
  const words = name.split(' ');
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

const OngoingProjectsScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const projectList = useSelector(state => state.projectList);
  const { loading, error, projects } = projectList;

  const projectDelete = useSelector(state => state.projectDelete);
  const { loading: loadingDelete, error: errorDelete, success: successDelete } = projectDelete;

  const projectCreate = useSelector(state => state.projectCreate);
  const { success: successCreate } = projectCreate;

  useEffect(() => {
    if (!userInfo || !userInfo.token || userInfo.token.trim() === '') {
      navigate('/login');
    } else {
      dispatch(getUserDetails('profile')); // Fetch fresh user details
      if (successDelete) {
        dispatch({ type: PROJECT_DELETE_SUCCESS }); // Reset delete status
        dispatch(listProjects());
      } else {
        dispatch(listProjects());
      }
    }
  }, [dispatch, navigate, userInfo, successDelete, successCreate]);

  const deleteHandler = (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      dispatch(deleteProject(id));
    }
  };
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="ongoing-projects-page">
      <div className="project-hero-header">
        <div className="project-hero-title-and-action">
            <h1 className="project-detail-title">Ongoing Projects</h1>
            <button className="btn-gradient" onClick={openModal}>
                <FaPlus /> Create Project
            </button>
        </div>
        <p className="project-detail-goal">
            A centralized view of all your active projects. Track progress, manage teams, and stay on top of deadlines.
        </p>
      </div>

      {loadingDelete && <Loader />}
      {errorDelete && <Message variant='danger'>{errorDelete}</Message>}
      
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <div className="modern-project-list">
          {projects.length === 0 ? (
            <div className="empty-state-container">
                <Message variant='info'>No ongoing projects found. Start by creating one!</Message>
                <button className="btn btn-primary" onClick={openModal}>
                    <FaPlus /> Create Your First Project
                </button>
            </div>
          ) : (
            projects.map((project) => {
              const isOwner = userInfo && project.owner && project.owner._id === userInfo._id;
              const progress = calculateProgress(project.tasks);

              return (
                <div
                  key={project._id}
                  className="project-card"
                  onClick={() => navigate(`/project/${project._id}`)}
                >
                  <div className="project-card-header">
                    <div className="project-avatar" style={{ backgroundColor: project.color || '#7c3aed' }}>
                      {getInitials(project.name)}
                    </div>
                    <div>
                      <h3 className="project-card-title">{project.name}</h3>
                      <div className="project-card-meta">
                        {project.dueDate && (
                          <div className="project-card-meta-item">
                            <FaCalendarAlt />
                            <span>{new Date(project.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        {project.owner && (
                          <div className="project-card-meta-item">
                            <FaUser />
                            <span>{project.owner.name}</span>
                          </div>
                        )}
                        {project.team && (
                          <div className="project-card-meta-item">
                            <FaUsers />
                            <span>{project.team.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="project-card-progress">
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                  
                  <div className="project-card-footer">
                    <div className="project-team-avatars">
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
                  </div>

                  {isOwner && (
                    <FaTrash
                      className="project-card-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteHandler(project._id);
                      }}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
      <ProjectCreateModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
};

export default OngoingProjectsScreen;