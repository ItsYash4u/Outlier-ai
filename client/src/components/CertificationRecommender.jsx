import { useState } from 'react';
import axios from 'axios';
import { FaGraduationCap, FaClock, FaExternalLinkAlt, FaSpinner } from 'react-icons/fa';

const CertificationRecommender = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState(null);

  const handleAnalyzeProfile = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/ai/certification-recommender', {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setRecommendations(response.data.recommendations);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to analyze profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPlatformLogo = (platform) => {
    switch (platform.toLowerCase()) {
      case 'coursera':
        return 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera.s3.amazonaws.com/media/coursera-logo-square.png';
      case 'edx':
        return 'https://www.edx.org/sites/default/files/edx-logo-square.png';
      case 'udemy':
        return 'https://www.udemy.com/staticx/udemy/images/v7/logo-udemy.svg';
      case 'linkedin learning':
        return 'https://static.licdn.com/sc/h/akt4ae504epesldzj74dzred8';
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <FaGraduationCap className="mr-2 text-blue-500" />
          Skill Builder Suggestions
        </h2>
        <button
          onClick={handleAnalyzeProfile}
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isLoading ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              Analyzing...
            </>
          ) : (
            '🔍 Analyze My Profile'
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Analyzing your profile and finding the best certifications...</p>
        </div>
      )}

      {recommendations && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.map((cert, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{cert.title}</h3>
                    <div className="flex items-center mt-1">
                      {getPlatformLogo(cert.platform) && (
                        <img
                          src={getPlatformLogo(cert.platform)}
                          alt={cert.platform}
                          className="h-6 w-6 mr-2"
                        />
                      )}
                      <span className="text-sm text-gray-600">{cert.platform}</span>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <FaClock className="mr-1" />
                    {cert.duration}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Skill Gap Addressed</h4>
                    <p className="text-sm text-gray-600">{cert.skillGap}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Why This Matters</h4>
                    <p className="text-sm text-gray-600">{cert.valueProposition}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Description</h4>
                    <p className="text-sm text-gray-600">{cert.description}</p>
                  </div>

                  <a
                    href={cert.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-500 hover:text-blue-600 text-sm"
                  >
                    View Course
                    <FaExternalLinkAlt className="ml-1" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => setRecommendations(null)}
              className="text-blue-500 hover:text-blue-600"
            >
              Get New Recommendations
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificationRecommender; 