import { Link } from 'react-router-dom';
import { FaBell, FaEnvelope, FaUser } from 'react-icons/fa';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-blue-600">
                VibeCoding
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/feed" className="text-gray-600 hover:text-gray-900">
              Feed
            </Link>
            <Link to="/career-coach" className="text-gray-600 hover:text-gray-900">
              Career Coach
            </Link>
            <Link to="/recommendations" className="text-gray-600 hover:text-gray-900">
              Recommendations
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-gray-900">
              <FaBell className="h-6 w-6" />
            </button>
            <button className="text-gray-600 hover:text-gray-900">
              <FaEnvelope className="h-6 w-6" />
            </button>
            <Link to="/profile" className="text-gray-600 hover:text-gray-900">
              <FaUser className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 