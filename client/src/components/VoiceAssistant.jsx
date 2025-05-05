import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interpretation, setInterpretation] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let recognition = null;

    if ('webkitSpeechRecognition' in window) {
      recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setTranscript(transcript);
        handleCommand(transcript);
      };

      recognition.onerror = (event) => {
        setError('Error recognizing speech. Please try again.');
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    } else {
      setError('Speech recognition is not supported in your browser.');
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  const handleCommand = async (command) => {
    try {
      const response = await axios.post('/api/ai/voice-command', 
        { command },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setInterpretation(response.data);
      executeCommand(response.data);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to interpret command. Please try again.');
    }
  };

  const executeCommand = (interpretation) => {
    const { intent, action, parameters } = interpretation;

    switch (intent) {
      case 'navigation':
        navigate(action);
        break;
      case 'profile_update':
        // Handle profile update
        console.log('Updating profile:', parameters);
        break;
      case 'job_search':
        // Handle job search
        console.log('Searching jobs:', parameters);
        break;
      case 'analytics':
        // Handle analytics request
        console.log('Fetching analytics:', parameters);
        break;
      default:
        setError('Command not recognized. Please try again.');
    }
  };

  const toggleListening = () => {
    if (isListening) {
      window.webkitSpeechRecognition.stop();
    } else {
      window.webkitSpeechRecognition.start();
    }
  };

  return (
    <>
      <button
        onClick={toggleListening}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-lg ${
          isListening ? 'bg-red-500' : 'bg-blue-500'
        } text-white hover:opacity-90 transition-opacity`}
        title="Talk to Vibe Assistant"
      >
        {isListening ? (
          <FaMicrophoneSlash className="h-6 w-6" />
        ) : (
          <FaMicrophone className="h-6 w-6" />
        )}
      </button>

      {(transcript || interpretation || error) && (
        <div className="fixed bottom-24 right-6 w-80 bg-white rounded-lg shadow-lg p-4">
          {transcript && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-1">You said:</h3>
              <p className="text-gray-800">{transcript}</p>
            </div>
          )}

          {interpretation && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Interpretation:</h3>
              <p className="text-gray-800">{interpretation.summary}</p>
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm">
              {error}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default VoiceAssistant; 