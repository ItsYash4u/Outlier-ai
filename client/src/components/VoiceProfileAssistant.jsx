import { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import axios from 'axios';
import { FaMicrophone, FaMicrophoneSlash, FaEdit, FaCheck, FaSpinner } from 'react-icons/fa';

const VoiceProfileAssistant = ({ onProfileUpdate }) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [editedText, setEditedText] = useState('');
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState(null);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      setTranscribedText(transcript);
      setEditedText(transcript);
    }
  }, [transcript]);

  const startListening = () => {
    setIsListening(true);
    setError(null);
    resetTranscript();
    SpeechRecognition.startListening({ continuous: true });
  };

  const stopListening = () => {
    setIsListening(false);
    SpeechRecognition.stopListening();
  };

  const handleEdit = () => {
    setEditedText(transcribedText);
  };

  const handleSubmit = async () => {
    if (!editedText.trim()) {
      setError('Please provide some profile information');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await axios.post('/api/ai/voice-profile-builder', {
        transcribedText: editedText
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setProfileData(response.data);
      if (onProfileUpdate) {
        onProfileUpdate(response.data);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to process profile. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Your browser doesn't support speech recognition. Please use Chrome or Edge.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Voice Profile Assistant</h2>
        <button
          onClick={isListening ? stopListening : startListening}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            isListening
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isListening ? (
            <>
              <FaMicrophoneSlash />
              <span>Stop Recording</span>
            </>
          ) : (
            <>
              <FaMicrophone />
              <span>Start Recording</span>
            </>
          )}
        </button>
      </div>

      {isListening && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-blue-800">Listening... Speak clearly into your microphone.</p>
        </div>
      )}

      {transcribedText && (
        <div className="space-y-4">
          <div className="bg-white border rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Your Input</h3>
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows="6"
              placeholder="Your profile information will appear here..."
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={handleEdit}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
              >
                <FaEdit />
                <span>Edit</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={isProcessing}
                className="flex items-center space-x-1 bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <FaCheck />
                    <span>Submit</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {profileData && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Profile Generated</h3>
          <div className="space-y-2">
            <p><span className="font-medium">Name:</span> {profileData.name}</p>
            <p><span className="font-medium">Bio:</span> {profileData.bio}</p>
            <p><span className="font-medium">Skills:</span> {profileData.skills.join(', ')}</p>
            <div>
              <span className="font-medium">Experience:</span>
              <ul className="list-disc list-inside ml-4">
                {profileData.experience.map((exp, index) => (
                  <li key={index}>
                    {exp.role} at {exp.company} ({exp.duration})
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <span className="font-medium">Education:</span>
              <ul className="list-disc list-inside ml-4">
                {profileData.education.map((edu, index) => (
                  <li key={index}>
                    {edu.degree} from {edu.university}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceProfileAssistant; 