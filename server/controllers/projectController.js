const Project = require('../models/Project');
const Task = require('../models/Task');
const Team = require('../models/Team');
const Groq = require('groq-sdk');
const dotenv = require('dotenv');
const asyncHandler = require('../middleware/asyncHandler');

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// @desc    Get all projects for the logged-in user
// @route   GET /api/projects
// @access  Private
const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({
    $or: [{ owner: req.user._id }, { team: { $in: req.user.teams } }],
  })
    .populate('owner', 'name email')
    .populate({ // Populate team with its members' names and emails
      path: 'team',
      select: 'name members', // Select team name and members
      populate: {
        path: 'members',
        select: 'name email', // Select member name and email
      },
    })
    .populate({ // Populate tasks with status and assignee details
      path: 'tasks',
      select: 'status', // Include status for progress calculation
      populate: {
        path: 'assignee',
        select: 'name email',
      },
    });

  res.json(projects);
});

// @desc    Create a new project with AI-generated tasks
// @route   POST /api/projects/ai
// @access  Private
const createProjectWithAI = asyncHandler(async (req, res) => {
  const { name, goal, dueDate, teamId } = req.body;

  if (!name || !goal) {
    res.status(400);
    throw new Error('Project name and goal are required');
  }

  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: `Analyze the following project goal: "${goal}". Based on your analysis, generate a detailed project plan as a JSON object. The JSON object should contain a "tasks" array. Each task in the array should have a "name", a "duration" (in days), a list of "dependencies" (as an array of task names), and a "subtasks" array. Each subtask should have a "name", "duration", and "dependencies". Break down the project into a comprehensive list of tasks and sub-tasks, ensuring every step is captured. The output should be a JSON object with a "tasks" array.`,
      },
    ],
    model: 'qwen/qwen3-32b',
    response_format: { type: "json_object" },
  });

  const roadmap = JSON.parse(chatCompletion.choices[0]?.message?.content);
  const taskData = Array.isArray(roadmap) ? roadmap : roadmap.tasks || roadmap.roadmap || [];

  const project = new Project({
    name,
    goal,
    dueDate,
    team: teamId,
    owner: req.user._id,
  });

  const createdProject = await project.save();

  const allTasks = [];
  const taskNameToIdMap = new Map();

  async function createTasks(tasks, parentId = null) {
    const createdTasks = [];
    // First pass: Create tasks without dependencies to populate the name->ID map.
    for (const task of tasks) {
      const newTask = new Task({
        name: task.name,
        duration: task.duration,
        dependencies: [], // Handled in the second pass
        team: teamId,
        project: createdProject._id,
        owner: req.user._id,
        parent: parentId,
      });
      const createdTask = await newTask.save();
      createdTasks.push(createdTask);
      allTasks.push(createdTask);
      taskNameToIdMap.set(task.name, createdTask._id);
    }

    // Second pass: Now that the map is populated, handle dependencies and subtasks.
    for (let i = 0; i < tasks.length; i++) {
      const taskData = tasks[i];
      const createdTask = createdTasks[i];

      if (taskData.dependencies && taskData.dependencies.length > 0) {
        createdTask.dependencies = taskData.dependencies
          .map(depName => taskNameToIdMap.get(depName))
          .filter(depId => depId);
        await createdTask.save();
      }

      if (taskData.subtasks && taskData.subtasks.length > 0) {
        const subtaskIds = await createTasks(taskData.subtasks, createdTask._id);
        createdTask.subTasks = subtaskIds; // Assuming 'subTasks' is the field name in your Task model
        await createdTask.save();
      }
    }
    return createdTasks.map(t => t._id);
  }

  await createTasks(taskData);

  createdProject.tasks = allTasks.filter(t => !t.parent).map(t => t._id);
  await createdProject.save();

  if (teamId) {
    const team = await Team.findById(teamId);
    if (team) {
      team.tasks.push(...allTasks.map(task => task._id));
      await team.save();
    }
  }

  res.status(201).json(createdProject);
});

// @desc    Get a single project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = asyncHandler(async (req, res) => {
    // Check if req.params.id is a valid MongoDB ObjectId
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(404);
        throw new Error('Invalid Project ID');
    }
    const project = await Project.findById(req.params.id)
        .populate({
            path: 'tasks',
            select: 'name status duration priority assignee subTasks', // Explicitly select required fields
            populate: {
                path: 'assignee',
                select: 'name email',
            },
        })
        .populate('owner', 'name email')
        .populate({ // Populate team with its members' names and emails
            path: 'team',
            select: 'name members', // Select team name and members
            populate: {
                path: 'members',
                select: 'name email', // Select member name and email
            },
        });

    if (project) {
        // A function to recursively populate subTasks
        const populateSubTasks = async (tasks) => {
            for (let i = 0; i < tasks.length; i++) {
                if (tasks[i].subTasks && tasks[i].subTasks.length > 0) {
                    tasks[i] = await tasks[i].populate({
                        path: 'subTasks',
                        select: 'name status duration priority assignee subTasks',
                        populate: {
                            path: 'assignee',
                            select: 'name email',
                        }
                    });
                    await populateSubTasks(tasks[i].subTasks);
                }
            }
        };

        await populateSubTasks(project.tasks);
        res.json(project);
    } else {
        res.status(404);
        throw new Error('Project not found');
    }
});

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (project) {
    if (project.owner.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized as project owner');
    }

    // Delete all tasks associated with this project
    await Task.deleteMany({ project: project._id });

    await project.deleteOne();
    res.json({ message: 'Project removed' });
  } else {
    res.status(404);
    throw new Error('Project not found');
  }
});

module.exports = {
  getProjects,
  createProjectWithAI,
  getProjectById,
  deleteProject,
};
