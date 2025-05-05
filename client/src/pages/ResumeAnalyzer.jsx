import { useState } from 'react';
import axios from 'axios';
import { FaFileUpload, FaStar, FaThumbsUp, FaExclamationTriangle, FaBriefcase } from 'react-icons/fa';

const ResumeAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else {
      setFile(null);
      setError('Please upload a PDF file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await axios.post('/api/ai/analyze-resume', formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setAnalysis(response.data);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to analyze resume. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">AI Resume Analyzer</h1>

        {!analysis && (
          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <FaFileUpload className="mx-auto text-4xl text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">Upload your resume (PDF only)</p>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="resume-upload"
              />
              <label
                htmlFor="resume-upload"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 cursor-pointer"
              >
                Choose File
              </label>
              {file && (
                <p className="mt-4 text-sm text-gray-600">
                  Selected: {file.name}
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!file || isLoading}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Analyzing...' : 'Analyze Resume'}
            </button>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Analyzing your resume...</p>
          </div>
        )}

        {analysis && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Analysis Results</h2>
              <button
                onClick={() => {
                  setAnalysis(null);
                  setFile(null);
                }}
                className="text-blue-500 hover:text-blue-600"
              >
                Analyze Another Resume
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <FaStar className="text-yellow-500 mr-2" />
                  <h3 className="text-lg font-semibold">Resume Score</h3>
                </div>
                <div className="text-4xl font-bold text-blue-600">
                  {analysis.score}/100
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <FaThumbsUp className="text-green-500 mr-2" />
                  <h3 className="text-lg font-semibold">Strengths</h3>
                </div>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.strengths.map((strength, index) => (
                    <li key={index} className="text-green-700">{strength}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <FaExclamationTriangle className="text-yellow-500 mr-2" />
                  <h3 className="text-lg font-semibold">Areas for Improvement</h3>
                </div>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.weaknesses.map((weakness, index) => (
                    <li key={index} className="text-yellow-700">{weakness}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <FaBriefcase className="text-purple-500 mr-2" />
                  <h3 className="text-lg font-semibold">Suggested Job Roles</h3>
                </div>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.jobRoles.map((role, index) => (
                    <li key={index} className="text-purple-700">{role}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">AI Feedback</h3>
              <p className="text-gray-700 whitespace-pre-line">{analysis.message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeAnalyzer; 