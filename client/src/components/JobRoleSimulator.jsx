import { useState } from 'react';
import axios from 'axios';
import { FaLaptopCode, FaTools, FaGraduationCap, FaTasks, FaLightbulb, FaChevronDown } from 'react-icons/fa';

const jobRoles = {
  'Development': [
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'DevOps Engineer',
    'Cloud Architect'
  ],
  'Data & AI': [
    'Data Analyst',
    'Data Scientist',
    'Machine Learning Engineer',
    'AI Engineer',
    'Business Intelligence Analyst'
  ],
  'Design & Product': [
    'UX Designer',
    'UI Designer',
    'Product Manager',
    'Product Designer',
    'UX Researcher'
  ],
  'Business & Management': [
    'Project Manager',
    'Business Analyst',
    'Product Owner',
    'Scrum Master',
    'Technical Lead'
  ]
};

const JobRoleSimulator = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [simulation, setSimulation] = useState(null);

  const handleRoleSelect = async (role) => {
    setSelectedRole(role);
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/ai/job-role-simulator', 
        { jobTitle: role },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setSimulation(response.data);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to generate simulation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <FaLaptopCode className="mr-2 text-blue-500" />
          Job Role Simulator
        </h2>
        <div className="flex space-x-4">
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 pr-8 appearance-none"
            >
              <option value="">Select Category</option>
              {Object.keys(jobRoles).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={selectedRole}
              onChange={(e) => handleRoleSelect(e.target.value)}
              disabled={!selectedCategory}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 pr-8 appearance-none disabled:opacity-50"
            >
              <option value="">Select Role</option>
              {selectedCategory && jobRoles[selectedCategory].map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Generating role simulation...</p>
        </div>
      )}

      {simulation && (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Role Overview</h3>
            <p className="text-gray-600">{simulation.overview}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FaTasks className="mr-2 text-blue-500" />
                Daily Tasks
              </h3>
              <ul className="space-y-2">
                {simulation.dailyTasks.map((task, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span className="text-gray-600">{task}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FaTools className="mr-2 text-blue-500" />
                Essential Tools
              </h3>
              <div className="space-y-3">
                {simulation.tools.map((tool, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded">
                    <h4 className="font-medium text-gray-800">{tool.name}</h4>
                    <p className="text-sm text-gray-600">{tool.description}</p>
                    <span className="text-xs text-gray-500">{tool.category}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaLightbulb className="mr-2 text-blue-500" />
              Realistic Scenarios
            </h3>
            <div className="space-y-4">
              {simulation.scenarios.map((scenario, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded">
                  <h4 className="font-medium text-gray-800 mb-2">{scenario.title}</h4>
                  <p className="text-gray-600 mb-3">{scenario.description}</p>
                  <ol className="list-decimal list-inside space-y-1">
                    {scenario.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="text-gray-600">{step}</li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaGraduationCap className="mr-2 text-blue-500" />
              Skills to Master
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {simulation.skills.map((skill, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded">
                  <h4 className="font-medium text-gray-800">{skill.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{skill.importance}</p>
                  <div className="space-y-1">
                    {skill.learningResources.map((resource, resIndex) => (
                      <a
                        key={resIndex}
                        href={resource}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:text-blue-600 block"
                      >
                        Resource {resIndex + 1}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobRoleSimulator; 