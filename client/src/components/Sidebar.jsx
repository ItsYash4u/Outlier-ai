import { Link } from 'react-router-dom';
import { FaHome, FaUser, FaGraduationCap, FaLightbulb, FaRss, FaUserPlus, FaFileAlt, FaBriefcase, FaLaptopCode } from 'react-icons/fa';

const Sidebar = () => {
  return (
    <div className="w-64 bg-white shadow-md h-screen fixed">
      <div className="p-4">
        <div className="space-y-4">
          <Link to="/" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600">
            <FaHome className="h-6 w-6" />
            <span>Dashboard</span>
          </Link>
          
          <Link to="/profile" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600">
            <FaUser className="h-6 w-6" />
            <span>Profile</span>
          </Link>
          
          <Link to="/career-coach" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600">
            <FaGraduationCap className="h-6 w-6" />
            <span>Career Coach</span>
          </Link>
          
          <Link to="/career-mentor" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600">
            <FaGraduationCap className="h-6 w-6" />
            <span>Career Mentor</span>
          </Link>
          
          <Link to="/smart-connect" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600">
            <FaUserPlus className="h-6 w-6" />
            <span>Smart Connect</span>
          </Link>
          
          <Link to="/recommendations" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600">
            <FaLightbulb className="h-6 w-6" />
            <span>Recommendations</span>
          </Link>
          
          <Link to="/feed" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600">
            <FaRss className="h-6 w-6" />
            <span>Feed</span>
          </Link>
          
          <Link to="/resume-analyzer" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600">
            <FaFileAlt className="h-6 w-6" />
            <span>Resume Analyzer</span>
          </Link>
          
          <Link to="/job-matcher" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600">
            <FaBriefcase className="h-6 w-6" />
            <span>Job Matcher</span>
          </Link>
          
          <Link to="/job-role-simulator" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600">
            <FaLaptopCode className="h-6 w-6" />
            <span>Job Role Simulator</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 