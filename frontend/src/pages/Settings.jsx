import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { profileAPI } from '../api/api';
import { Settings as SettingsIcon, Lock, Sun, Moon, Monitor, User, Calendar, LogOut, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, logout, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    age_group: user?.age_group || '',
    interests: user?.interests || [],
  });
  
  const [passwordData, setPasswordData] = useState({
    new_password: '',
    confirm_password: ''
  });

  const [saving, setSaving] = useState(false);
  const [customInterest, setCustomInterest] = useState('');

  const ageGroups = ['Under 13', '13-17', '18-24', '25-34', '35-44', '45+'];
  const commonInterests = ['Technology', 'Science', 'Politics', 'Philosophy', 'Ethics', 'History', 'Economics', 'Art', 'Pop Culture', 'Environment'];

  const hasChanges = formData.name !== user?.name || 
                     formData.age_group !== user?.age_group || 
                     JSON.stringify(formData.interests) !== JSON.stringify(user?.interests);

  const handleInterestToggle = (interest) => {
    setFormData(prev => {
      if (prev.interests.includes(interest)) {
        return { ...prev, interests: prev.interests.filter(i => i !== interest) };
      } else {
        return { ...prev, interests: [...prev.interests, interest] };
      }
    });
  };

  const handleAddCustomInterest = (e) => {
    e.preventDefault();
    if (customInterest.trim() && !formData.interests.includes(customInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, customInterest.trim()]
      }));
      setCustomInterest('');
    }
  };

  const handleSaveProfile = async () => {
    if (!hasChanges) return;
    
    try {
      setSaving(true);
      const res = await profileAPI.updateProfile({
        name: formData.name,
        age_group: formData.age_group,
        interests: formData.interests
      });
      updateUser(res.data);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error('Failed to update profile');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordData.new_password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      // In a real app we'd have a specific password update endpoint
      await profileAPI.updateProfile({ password: passwordData.new_password });
      toast.success('Password updated successfully!');
      setPasswordData({ new_password: '', confirm_password: '' });
    } catch (err) {
      toast.error('Failed to update password');
      console.error(err);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center gap-3 mb-8">
        <SettingsIcon className="w-8 h-8 text-primary-500" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile & Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your MindFlip profile</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Profile Details */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
              <User className="w-5 h-5 text-primary-500" /> 
              Personal Info
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input 
                  type="text" 
                  className="input-field"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="email" 
                    className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-500 cursor-not-allowed"
                    value={user?.email || ''}
                    disabled
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed.</p>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700 mt-4">
                <Calendar className="w-4 h-4" />
                Member since {formatDate(user?.created_at)}
              </div>
            </div>
          </div>

          {/* Age Group */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Age Group</h2>
            <div className="flex flex-wrap gap-2">
              {ageGroups.map(age => (
                <button
                  key={age}
                  onClick={() => setFormData({...formData, age_group: age})}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.age_group === age 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {age}
                </button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Your Interests</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {[...new Set([...commonInterests, ...(formData.interests || [])])].map(interest => (
                <button
                  key={interest}
                  onClick={() => handleInterestToggle(interest)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                    formData.interests?.includes(interest)
                      ? 'bg-primary-100 text-primary-700 border-primary-300 border dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-800' 
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700'
                  }`}
                >
                  {formData.interests?.includes(interest) && <Check className="w-3 h-3" />}
                  {interest}
                </button>
              ))}
            </div>
            
            <form onSubmit={handleAddCustomInterest} className="flex gap-2">
              <input
                type="text"
                placeholder="Add custom interest..."
                className="input-field py-1.5 text-sm"
                value={customInterest}
                onChange={(e) => setCustomInterest(e.target.value)}
              />
              <button type="submit" className="btn-secondary py-1.5 px-4 text-sm whitespace-nowrap">Add</button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          {/* Appearance */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Appearance</h2>
            <div className="space-y-2">
              <button 
                onClick={() => setTheme('light')}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${theme === 'light' ? 'bg-primary-50 border-primary-200 dark:bg-primary-900/20 dark:border-primary-800 text-primary-700 dark:text-primary-400' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                <div className="flex items-center gap-3">
                  <Sun className="w-5 h-5" />
                  <span className="font-medium">Light</span>
                </div>
                {theme === 'light' && <Check className="w-5 h-5" />}
              </button>
              
              <button 
                onClick={() => setTheme('dark')}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${theme === 'dark' ? 'bg-primary-50 border-primary-200 dark:bg-primary-900/20 dark:border-primary-800 text-primary-700 dark:text-primary-400' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5" />
                  <span className="font-medium">Dark</span>
                </div>
                {theme === 'dark' && <Check className="w-5 h-5" />}
              </button>

              <button 
                onClick={() => setTheme('system')}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${theme === 'system' ? 'bg-primary-50 border-primary-200 dark:bg-primary-900/20 dark:border-primary-800 text-primary-700 dark:text-primary-400' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                <div className="flex items-center gap-3">
                  <Monitor className="w-5 h-5" />
                  <span className="font-medium">System</span>
                </div>
                {theme === 'system' && <Check className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Change Password</h2>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                <input 
                  type="password" 
                  className="input-field"
                  value={passwordData.new_password}
                  onChange={e => setPasswordData({...passwordData, new_password: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
                <input 
                  type="password" 
                  className="input-field"
                  value={passwordData.confirm_password}
                  onChange={e => setPasswordData({...passwordData, confirm_password: e.target.value})}
                />
              </div>
              <button 
                type="submit" 
                className="btn-secondary w-full"
                disabled={!passwordData.new_password || !passwordData.confirm_password}
              >
                Update Password
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-8 flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {hasChanges ? "You have unsaved changes." : "All changes saved."}
        </p>
        <button 
          onClick={handleSaveProfile}
          disabled={!hasChanges || saving}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            hasChanges && !saving 
              ? 'bg-primary-500 hover:bg-primary-600 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
          }`}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Danger Zone */}
      <div className="mt-12 text-center">
        <button 
          onClick={logout}
          className="inline-flex items-center gap-2 text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 font-medium"
        >
          <LogOut className="w-5 h-5" />
          Log out of MindFlip
        </button>
      </div>
    </div>
  );
}
