import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import CareerCoach from './pages/CareerCoach';
import SmartConnect from './pages/SmartConnect';
import Recommendations from './pages/Recommendations';
import Feed from './pages/Feed';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import JobMatcher from './pages/JobMatcher';
import JobRoleSimulator from './components/JobRoleSimulator';
import VoiceAssistant from './components/VoiceAssistant';
import CareerMentor from './pages/CareerMentor';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/career-coach" element={<CareerCoach />} />
              <Route path="/smart-connect" element={<SmartConnect />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
              <Route path="/job-matcher" element={<JobMatcher />} />
              <Route path="/job-role-simulator" element={<JobRoleSimulator />} />
              <Route path="/career-mentor" element={<CareerMentor />} />
            </Routes>
          </main>
        </div>
        <VoiceAssistant />
      </div>
    </Router>
  );
}

export default App; 