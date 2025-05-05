import { useState } from 'react';
import VoiceProfileAssistant from '../components/VoiceProfileAssistant';
import CertificationRecommender from '../components/CertificationRecommender';

const Profile = () => {
  const [profile, setProfile] = useState(null);

  const handleProfileUpdate = (newProfile) => {
    setProfile(newProfile);
    // Here you would typically also update the profile in your backend
    console.log('Profile updated:', newProfile);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Your Profile</h1>
        
        <div className="mb-8">
          <VoiceProfileAssistant onProfileUpdate={handleProfileUpdate} />
        </div>

        {profile && (
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Current Profile</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-700">Name</h3>
                <p className="text-gray-600">{profile.name}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-700">Bio</h3>
                <p className="text-gray-600">{profile.bio}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-700">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-700">Experience</h3>
                <div className="space-y-2">
                  {profile.experience.map((exp, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <p className="font-medium text-gray-800">{exp.role}</p>
                      <p className="text-gray-600">{exp.company}</p>
                      <p className="text-sm text-gray-500">{exp.duration}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-700">Education</h3>
                <div className="space-y-2">
                  {profile.education.map((edu, index) => (
                    <div key={index} className="border-l-4 border-green-500 pl-4">
                      <p className="font-medium text-gray-800">{edu.degree}</p>
                      <p className="text-gray-600">{edu.university}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <CertificationRecommender />
    </div>
  );
};

export default Profile; 