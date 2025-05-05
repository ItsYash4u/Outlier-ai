import { useState } from 'react';
import axios from 'axios';
import { FaBriefcase, FaBuilding, FaChartLine, FaCheck, FaExternalLinkAlt } from 'react-icons/fa';

const JobMatcher = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [matches, setMatches] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [recentSearches, setRecentSearches] = useState(['React', 'Node.js', 'Full Stack']);

  const handleFindJobs = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/ai/job-matcher', {
        resumeText,
        recentSearches
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setMatches(response.data.matches);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to find job matches. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">AI Job Matcher</h1>

        {!matches && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Your Profile Information</h2>
              <p className="text-gray-600 mb-4">
                We'll use your profile data, skills, and recent activity to find the best job matches for you.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resume Text (Optional)
                  </label>
                  <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    placeholder="Paste relevant parts of your resume here..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recent Job Searches
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700"
                      >
                        {search}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <button
              onClick={handleFindJobs}
              disabled={isLoading}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Finding Best Jobs...' : 'Find Best Jobs for Me'}
            </button>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Analyzing your profile and finding the best matches...</p>
          </div>
        )}

        {matches && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Your Best Job Matches</h2>
              <button
                onClick={() => setMatches(null)}
                className="text-blue-500 hover:text-blue-600"
              >
                Find New Matches
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {matches.map((match, index) => (
                <div key={index} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{match.jobTitle}</h3>
                        <p className="text-gray-600 flex items-center">
                          <FaBuilding className="mr-2" />
                          {match.company}
                        </p>
                      </div>
                      <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {match.matchScore}% Match
                      </div>
                    </div>

                    <p className="mt-4 text-gray-700">{match.description}</p>

                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Key Requirements</h4>
                      <div className="flex flex-wrap gap-2">
                        {match.requirements.map((req, i) => (
                          <span
                            key={i}
                            className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700 flex items-center"
                          >
                            <FaCheck className="mr-1 text-green-500" />
                            {req}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Why This Match?</h4>
                      <p className="text-gray-600 text-sm">{match.reason}</p>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        <FaChartLine className="inline mr-1" />
                        {match.location}
                      </div>
                      <a
                        href="#"
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center"
                      >
                        Apply Now
                        <FaExternalLinkAlt className="ml-2" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobMatcher; 