import React, { useEffect, useState } from 'react';
import './ProjectScreen.css';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProjectDetails } from '../actions/projectActions';
import { updateTask, createTask } from '../actions/taskActions';
import Loader from '../components/Loader';
import Message from '../components/Message';
import TaskSideDrawer from '../components/TaskSideDrawer';
import { FaEdit, FaCalendarAlt, FaUser, FaUsers, FaPlus } from 'react-icons/fa';

const calculateProgress = (tasks) => {
  if (!tasks || tasks.length === 0) return 0;
  const completedTasks = tasks.filter(task => task.status === 'Completed').length;
  return Math.round((completedTasks / tasks.length) * 100);
};

const ProjectScreen = () => {
  const { id: projectId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  const projectDetails = useSelector((state) => state.projectDetails);
  const { loading, error, project } = projectDetails;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
      dispatch(getProjectDetails(projectId));
    }
  }, [dispatch, projectId, userInfo, navigate]);

  const handleTaskCheck = (task) => {
    const newStatus = task.status === 'Completed' ? 'To Do' : 'Completed';
    dispatch(updateTask({ ...task, status: newStatus }));
  };

  const handleEditTask = (taskId) => {
    setSelectedTaskId(taskId);
    setIsCreatingTask(false);
    setIsDrawerOpen(true);
  };

  const handleAddTask = () => {
    setSelectedTaskId(null);
    setIsCreatingTask(true);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedTaskId(null);
    setIsCreatingTask(false);
    dispatch(getProjectDetails(projectId));
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Completed': return 'status-completed';
      case 'In Progress': return 'status-inprogress';
      case 'Blocked': return 'status-blocked';
      case 'To Do':
      default:
        return 'status-todo';
    }
  };

  const progress = project ? calculateProgress(project.tasks) : 0;

  return (
    <div className="project-details-page">
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        project && (
          <>
            <div className="project-hero-header">
              <h1 className="project-detail-title">{project.name}</h1>
              <div className="project-metadata-badges">
                {project.dueDate && (
                  <div className="metadata-badge">
                    <FaCalendarAlt />
                    <span>{new Date(project.dueDate).toLocaleDateString()}</span>
                  </div>
                )}
                {project.owner && (
                  <div className="metadata-badge">
                    <FaUser />
                    <span>{project.owner.name}</span>
                  </div>
                )}
                {project.team && (
                  <div className="metadata-badge">
                    <FaUsers />
                    <span>{project.team.name}</span>
                  </div>
                )}
              </div>
              <div className="project-progress-bar">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
              </div>
              <button className="add-task-btn" onClick={handleAddTask}>
                <FaPlus /> Add Task
              </button>
            </div>

            <div className="modern-task-list">
              {project.tasks && project.tasks.length > 0 ? (
                project.tasks.map((task) => (
                  <div key={task._id} className="task-list-item">
                    <div
                      className={`task-checkbox ${task.status === 'Completed' ? 'checked' : ''}`}
                      onClick={() => handleTaskCheck(task)}
                    >
                      {task.status === 'Completed' && '✔'}
                    </div>
                    <span
                      className={`task-name ${task.status === 'Completed' ? 'completed' : ''}`}
                      onClick={() => handleEditTask(task._id)}
                    >
                      {task.name}
                    </span>
                    <span className={`task-status-pill ${getStatusClass(task.status)}`}>
                      {task.status}
                    </span>
                    <FaEdit
                      className="task-edit-action"
                      onClick={() => handleEditTask(task._id)}
                    />
                  </div>
                ))
              ) : (
                <Message variant="info">
                  No tasks for this project.
                  <button className="btn btn-primary btn-sm" onClick={handleAddTask}>
                    Add the first task
                  </button>
                </Message>
              )}
            </div>
          </>
        )
      )}

      {isDrawerOpen && (
        <TaskSideDrawer
          taskId={selectedTaskId}
          projectId={projectId}
          isCreatingTask={isCreatingTask}
          onClose={closeDrawer}
        />
      )}
    </div>
  );
};

export default ProjectScreen;