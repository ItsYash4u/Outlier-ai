import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FaPaperPlane, FaSpinner } from 'react-icons/fa';

const CareerMentor = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      text: input,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/ai/career-mentor', 
        { question: input },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      const mentorMessage = {
        text: response.data.response,
        sender: 'mentor',
        timestamp: new Date().toISOString(),
        suggestions: response.data.suggestions,
        followUpQuestions: response.data.followUpQuestions
      };

      setMessages(prev => [...prev, mentorMessage]);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to get mentor response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowUp = (question) => {
    setInput(question);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold text-gray-800">Career Mentor</h1>
          <p className="text-gray-600">Ask me anything about your career development!</p>
        </div>

        <div className="h-[600px] overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.text}</p>
                
                {message.sender === 'mentor' && message.suggestions && (
                  <div className="mt-4 space-y-3">
                    <h4 className="font-semibold">Suggestions:</h4>
                    {message.suggestions.map((suggestion, idx) => (
                      <div key={idx} className="bg-white rounded p-3 shadow-sm">
                        <h5 className="font-medium text-blue-600">{suggestion.name}</h5>
                        <p className="text-sm text-gray-600">{suggestion.description}</p>
                        {suggestion.link && (
                          <a
                            href={suggestion.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-500 hover:text-blue-600"
                          >
                            Learn more
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {message.sender === 'mentor' && message.followUpQuestions && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Follow-up Questions:</h4>
                    <div className="flex flex-wrap gap-2">
                      {message.followUpQuestions.map((question, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleFollowUp(question)}
                          className="text-sm bg-blue-100 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-200"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-4 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your career mentor..."
              className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaPaperPlane className="mr-2" />
              )}
              Ask Mentor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CareerMentor; 