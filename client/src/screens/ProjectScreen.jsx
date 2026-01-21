import React, { useEffect, useState } from 'react'; // Import useState
import { Link, useParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import { useDispatch, useSelector } from 'react-redux';
import { getProjectDetails } from '../actions/projectActions';
import { updateTask } from '../actions/taskActions'; // Import updateTask action for checkbox
import Loader from '../components/Loader';
import Message from '../components/Message';
import TaskSideDrawer from '../components/TaskSideDrawer'; // Import TaskSideDrawer
import { FaEdit, FaCheckSquare, FaSquare } from 'react-icons/fa'; // Icons for tasks

const ProjectScreen = () => {
  const { id: projectId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false); // New state for create mode

  const projectDetails = useSelector((state) => state.projectDetails);
  const { loading, error, project } = projectDetails;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const taskUpdate = useSelector((state) => state.taskUpdate);
  const { success: successUpdate } = taskUpdate;

  useEffect(() => {
    if (!userInfo || !userInfo.token || userInfo.token.trim() === '') {
      navigate('/login');
    } else {
      dispatch(getProjectDetails(projectId));
    }
  }, [dispatch, projectId, userInfo, navigate, successUpdate]);

  const handleTaskCheck = (task) => {
    const newStatus = task.status === 'Completed' ? 'To Do' : 'Completed';
    dispatch(updateTask({ ...task, status: newStatus }));
  };

  const handleEditTask = (taskId) => { // Renamed from openDrawer
    setSelectedTaskId(taskId);
    setIsCreatingTask(false); // Ensure it's edit mode
    setIsDrawerOpen(true);
  };

  const handleAddTask = () => { // New function for adding task
    setSelectedTaskId(null); // No task selected for creation
    setIsCreatingTask(true); // Set to create mode
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedTaskId(null);
    setIsCreatingTask(false); // Reset create mode
    dispatch(getProjectDetails(projectId));
  };

  // Helper to get status color (moved here or into common utility if used elsewhere)
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'var(--status-success)';
      case 'In Progress': return 'var(--status-info)';
      case 'Blocked': return 'var(--status-error)';
      case 'To Do': return 'var(--text-medium-emphasis)'; // or another neutral color
      default: return 'var(--text-medium-emphasis)';
    }
  };

  // Helper to get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'var(--status-error)';
      case 'Medium': return 'var(--status-warning)';
      case 'Low': return 'var(--status-success)'; // Or another subtle color
      case 'Urgent': return 'var(--status-error)';
      default: return 'var(--text-medium-emphasis)';
    }
  };

  return (
    <div className="project-details-page">
      <Link to="/projects/ongoing" className="btn btn-secondary btn-small back-button">
        Go Back
      </Link>

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        project && (
          <>
            <div className="project-header-details">
              <h1 className="project-detail-title">{project.name}</h1>
              <p className="project-detail-goal">{project.goal}</p>
              <div className="project-meta">
                <span className="meta-item">
                  <strong>Due Date:</strong> {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'N/A'}
                </span>
                <span className="meta-item">
                  <strong>Owner:</strong> {project.owner ? project.owner.name : 'N/A'}
                </span>
                <span className="meta-item">
                  <strong>Team:</strong> {project.team ? project.team.name : 'N/A'}
                </span>
              </div>
            </div>

            <div className="tasks-header">
              <h2 className="section-title">Tasks</h2>
              <button className="btn btn-primary btn-small" onClick={handleAddTask}>
                Add Task
              </button>
            </div>
            {project.tasks && project.tasks.length === 0 ? (
              <Message variant="info">
                No tasks generated for this project.
                <button className="btn btn-primary btn-small ml-2" onClick={handleAddTask}>
                  Add First Task
                </button>
              </Message>
            ) : (
              <ul className="modern-task-list">
                {project.tasks && project.tasks.map((task) => (
                  <li key={task._id} className="task-list-item">
                    <button className="btn-icon task-checkbox" onClick={() => handleTaskCheck(task)}>
                      {task.status === 'Completed' ? <FaCheckSquare /> : <FaSquare />}
                    </button>
                    <span className={`task-name ${task.status === 'Completed' ? 'completed' : ''}`} onClick={() => handleEditTask(task._id)}>
                      {task.name}
                    </span>
                    <div className="task-tags">
                      {task.priority && (
                        <span className="task-tag" style={{ backgroundColor: getPriorityColor(task.priority) }}>
                          {task.priority}
                        </span>
                      )}
                      {task.assignee && task.assignee.name && (
                        <span className="task-tag assignee-tag">
                          {task.assignee.name}
                        </span>
                      )}
                      <span className="task-tag" style={{backgroundColor: getStatusColor(task.status)}}>
                        {task.status}
                      </span>
                    </div>
                    <button className="btn-icon task-edit-button" onClick={() => handleEditTask(task._id)}>
                      <FaEdit />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )
      )}

      {isDrawerOpen && (
        <TaskSideDrawer
          taskId={selectedTaskId}
          projectId={projectId} // Pass projectId for new task creation
          isCreatingTask={isCreatingTask}
          onClose={closeDrawer}
        />
      )}
    </div>
  );
};

export default ProjectScreen;
