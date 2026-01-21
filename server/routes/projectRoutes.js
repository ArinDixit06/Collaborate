const express = require('express');
const router = express.Router();
const {
  createProjectWithAI,
  getProjectById,
  getProjects, // Import getProjects
  deleteProject, // Import deleteProject
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getProjects); // New route for getting all projects
router.route('/ai').post(protect, createProjectWithAI);
router.route('/:id').get(protect, getProjectById).delete(protect, deleteProject);

module.exports = router;
