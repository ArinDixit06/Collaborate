import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createProject, createProjectWithAI } from '../actions/projectActions';
import { FaTimes, FaMagic, FaPlus } from 'react-icons/fa';

const ProjectCreateModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [isAiMode, setIsAiMode] = useState(false);
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isAiMode) {
      dispatch(createProjectWithAI({ name, goal }));
    } else {
      dispatch(createProject({ name }));
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-btn" onClick={onClose}>
          <FaTimes />
        </button>
        <h2>{isAiMode ? 'Create Project with AI' : 'Create New Project'}</h2>
        <div className="modal-toggle">
          <button
            className={`toggle-btn ${!isAiMode ? 'active' : ''}`}
            onClick={() => setIsAiMode(false)}
          >
            <FaPlus /> Manual
          </button>
          <button
            className={`toggle-btn ${isAiMode ? 'active' : ''}`}
            onClick={() => setIsAiMode(true)}
          >
            <FaMagic /> AI-Powered
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="projectName">Project Name</label>
            <input
              type="text"
              id="projectName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          {isAiMode && (
            <div className="form-group">
              <label htmlFor="projectGoal">Project Goal</label>
              <textarea
                id="projectGoal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                required
              ></textarea>
            </div>
          )}
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Create Project
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
