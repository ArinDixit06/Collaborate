import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Header from './components/Header';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import TeamScreen from './screens/TeamScreen';
import TaskScreen from './screens/TaskScreen';
import TaskEditScreen from './screens/TaskEditScreen';
import HomeScreen from './screens/HomeScreen';
import ProjectCreateScreen from './screens/ProjectCreateScreen';
import ProjectScreen from './screens/ProjectScreen';
import OngoingProjectsScreen from './screens/OngoingProjectsScreen';

// import other screens as needed

const App = () => {
  return (
    <Router>
      <Header />
      <main className="py-3">
        <Container>
          <Routes>
            <Route path="/" element={<HomeScreen />} exact />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route path="/teams" element={<TeamScreen />} />
            <Route path="/tasks" element={<TaskScreen />} />
            <Route path="/task/create" element={<TaskEditScreen />} />
            <Route path="/task/:id/edit" element={<TaskEditScreen />} />
            <Route path="/project/create" element={<ProjectCreateScreen />} />
            <Route path="/project/:id" element={<ProjectScreen />} />
            <Route path="/projects/ongoing" element={<OngoingProjectsScreen />} />
            {/* Add other routes here */}
          </Routes>
        </Container>
      </main>
    </Router>
  );
};

export default App;
