import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createProject, createProjectWithAI } from '../actions/projectActions';
import { listTeams } from '../actions/teamActions';
import { FaTimes, FaMagic, FaPlus } from 'react-icons/fa';
import './ProjectCreateModal.css';
import Message from './Message';
import Loader from './Loader';

const ProjectCreateModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [isAiMode, setIsAiMode] = useState(false);
  const dispatch = useDispatch();

  const teamList = useSelector((state) => state.teamList);
  const { teams = [], loading: loadingTeams, error: errorTeams } = teamList;

  const projectCreate = useSelector((state) => state.projectCreate);
  const { loading: loadingCreate, error: errorCreate, success: successCreate } = projectCreate;

  useEffect(() => {
    if (isOpen) {
      dispatch(listTeams());
      setName('');
      setGoal('');
      setDueDate('');
      setSelectedTeam('');
      setIsAiMode(false);
    }
  }, [dispatch, isOpen]);

  useEffect(() => {
    if (successCreate && isOpen) {
      onClose();
    }
  }, [successCreate, isOpen, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isAiMode) {
      dispatch(createProjectWithAI({ name, goal, dueDate, teamId: selectedTeam }));
    } else {
      dispatch(createProject({ name }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="project-create-modal-overlay">
      <div className="project-create-modal-content">
        <button className="project-create-modal-close-btn" onClick={onClose}>
          <FaTimes />
        </button>
        
        <h2 className="project-create-modal-title">
          {isAiMode ? 'Create Project with AI' : 'Create New Project'}
        </h2>

        {loadingCreate && <Loader />}
        {errorCreate && <Message variant="danger">{errorCreate}</Message>}
        {loadingTeams && <Loader />}
        {errorTeams && <Message variant="danger">{errorTeams}</Message>}

        <div className="modal-toggle-buttons">
          <button
            type="button"
            className={`toggle-btn ${!isAiMode ? 'active' : ''}`}
            onClick={() => setIsAiMode(false)}
          >
            <FaPlus /> Manual
          </button>
          <button
            type="button"
            className={`toggle-btn ${isAiMode ? 'active' : ''}`}
            onClick={() => setIsAiMode(true)}
          >
            <FaMagic /> AI-Powered
          </button>
        </div>

        <form onSubmit={handleSubmit} className="project-create-modal-form">
          <div className="form-group">
            <label htmlFor="projectName" className="form-label">Project Name*</label>
            <input
              type="text"
              id="projectName"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          {isAiMode && (
            <>
              <div className="form-group">
                <label htmlFor="projectGoal" className="form-label">Project Goal*</label>
                <textarea
                  id="projectGoal"
                  className="form-input"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  rows="4"
                  required
                ></textarea>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="dueDate" className="form-label">Due Date</label>
                  <input
                    type="date"
                    id="dueDate"
                    className="form-input"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="selectedTeam" className="form-label">Assign Team</label>
                  <select
                    id="selectedTeam"
                    value={selectedTeam}
                    onChange={(e) => setSelectedTeam(e.target.value)}
                    className="form-input"
                  >
                    <option value="">No Assigned Team</option>
                    {teams.map((team) => (
                      <option key={team._id} value={team._id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}
          <div className="project-create-modal-form-actions">
            <button type="submit" className="btn btn-primary">
              {isAiMode ? 'Generate Project' : 'Create Project'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectCreateModal;
