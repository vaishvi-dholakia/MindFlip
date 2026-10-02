import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../api/api';
import toast from 'react-hot-toast';
import { Check, Plus, ArrowRight, ArrowLeft } from 'lucide-react';

const ageGroups = ['Under 13', '13-17', '18-24', '25-34', '35-44', '45+'];
const predefinedHobbies = [
  'Technology', 'Art', 'Music', 'Reading', 'Writing', 
  'Sports', 'Gaming', 'Travel', 'Movies', 'Cooking', 
  'Photography', 'Science'
];

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  
  const [step, setStep] = useState(1);
  const [ageGroup, setAgeGroup] = useState('');
  const [hobbies, setHobbies] = useState([]);
  const [customHobby, setCustomHobby] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleHobbyToggle = (hobby) => {
    if (hobbies.includes(hobby)) {
      setHobbies(hobbies.filter(h => h !== hobby));
    } else {
      setHobbies([...hobbies, hobby]);
    }
  };

  const handleAddCustomHobby = () => {
    if (customHobby.trim() && !hobbies.includes(customHobby.trim())) {
      setHobbies([...hobbies, customHobby.trim()]);
    }
    setCustomHobby('');
    setShowCustomInput(false);
  };

  const handleSubmit = async () => {
    if (hobbies.length === 0) {
      toast.error('Please select at least one interest');
      return;
    }

    setIsLoading(true);
    try {
      await profileAPI.updateProfile({ 
        age_group: ageGroup, 
        hobbies: hobbies 
      });
      // Update local context state if possible
      if (updateUser) {
        updateUser({ profile_completed: true, age_group: ageGroup, hobbies });
      }
      toast.success('Profile setup complete!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to MindFlip! Let's set up your profile.
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Step {step} of 2
          </p>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 mt-4 max-w-md mx-auto">
            <div 
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: step === 1 ? '50%' : '100%' }}
            ></div>
          </div>
        </div>

        <div className="card p-8 shadow-xl animate-fade-in relative overflow-hidden">
          {step === 1 && (
            <div className="space-y-6 animate-slide-up">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">What's your age group?</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">This helps us tailor the debate complexity.</p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {ageGroups.map((age) => (
                  <button
                    key={age}
                    onClick={() => setAgeGroup(age)}
                    className={`py-4 px-2 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center ${
                      ageGroup === age 
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 shadow-md shadow-primary-500/10'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-primary-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <span className="font-semibold text-lg">{age}</span>
                  </button>
                ))}
              </div>
              
              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  disabled={!ageGroup}
                  className="btn-primary flex items-center px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-slide-up">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">What are your interests?</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Select all that apply - this helps us suggest relevant debate topics.</p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {predefinedHobbies.map((hobby) => {
                  const isSelected = hobbies.includes(hobby);
                  return (
                    <button
                      key={hobby}
                      onClick={() => handleHobbyToggle(hobby)}
                      className={`px-4 py-2 rounded-full border transition-all duration-200 flex items-center space-x-1 ${
                        isSelected 
                          ? 'bg-primary-500 border-primary-500 text-white shadow-md shadow-primary-500/20' 
                          : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary-400'
                      }`}
                    >
                      {isSelected && <Check className="w-4 h-4 mr-1" />}
                      <span>{hobby}</span>
                    </button>
                  );
                })}
                
                {/* Custom hobbies shown as selected chips */}
                {hobbies.filter(h => !predefinedHobbies.includes(h)).map(hobby => (
                  <button
                    key={hobby}
                    onClick={() => handleHobbyToggle(hobby)}
                    className="px-4 py-2 rounded-full border bg-primary-500 border-primary-500 text-white shadow-md shadow-primary-500/20 flex items-center space-x-1 transition-all"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    <span>{hobby}</span>
                  </button>
                ))}

                {showCustomInput ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={customHobby}
                      onChange={(e) => setCustomHobby(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCustomHobby()}
                      placeholder="Add custom..."
                      className="input-field py-1 px-3 h-10 w-32 md:w-48 text-sm"
                      autoFocus
                    />
                    <button 
                      onClick={handleAddCustomHobby}
                      className="btn-primary p-2 h-10 rounded-lg"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowCustomInput(true)}
                    className="px-4 py-2 rounded-full border border-dashed border-gray-400 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-primary-500 hover:text-primary-500 transition-colors flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    <span>Add Custom</span>
                  </button>
                )}
              </div>
              
              <div className="mt-8 flex justify-between items-center pt-6 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => setStep(1)}
                  className="btn-secondary flex items-center px-6 py-2"
                >
                  <ArrowLeft className="mr-2 w-4 h-4" /> Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || hobbies.length === 0}
                  className="btn-primary flex items-center px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Saving...' : 'Complete Setup'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
