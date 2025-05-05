import { useState } from 'react';
import axios from 'axios';
import { FaUserPlus, FaGraduationCap, FaLightbulb, FaCode } from 'react-icons/fa';

const SmartConnect = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getSuggestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/ai/suggest-connections', {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSuggestions(response.data.suggestions);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to get suggestions. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async (userId) => {
    try {
      await axios.post(`/api/connections/${userId}`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      // Remove the connected user from suggestions
      setSuggestions(prev => prev.filter(s => s.userId !== userId));
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to send connection request. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Smart Connect</h1>
          <button
            onClick={getSuggestions}
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Getting Suggestions...' : 'Get AI Suggestions'}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {suggestions.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Click the button above to get AI-powered connection suggestions!</p>
            <div className="flex justify-center space-x-4 text-gray-400">
              <FaUserPlus className="text-4xl" />
              <FaGraduationCap className="text-4xl" />
              <FaLightbulb className="text-4xl" />
              <FaCode className="text-4xl" />
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        <div className="space-y-4">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{suggestion.name}</h3>
                  <p className="text-gray-600 mt-1">{suggestion.reason}</p>
                  <p className="text-blue-600 mt-2 italic">{suggestion.message}</p>
                  
                  <div className="mt-3 space-y-2">
                    {suggestion.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {suggestion.skills.map((skill, i) => (
                          <span key={i} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {suggestion.interests.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {suggestion.interests.map((interest, i) => (
                          <span key={i} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                            {interest}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => handleConnect(suggestion.userId)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Connect
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SmartConnect; 