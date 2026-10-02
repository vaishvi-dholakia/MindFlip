import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { debateAPI } from '../api/api';
import { useNavigate, Link } from 'react-router-dom';
import { Swords, MessageSquare, TrendingUp, Award, CheckCircle, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [debates, setDebates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    avgScore: 0,
    bestScore: 0,
    completed: 0,
  });

  useEffect(() => {
    fetchDebates();
  }, []);

  const fetchDebates = async () => {
    try {
      const response = await debateAPI.getDebates();
      const debatesData = response.data || [];
      setDebates(debatesData);

      // Compute stats
      const completedDebates = debatesData.filter((d) => d.status === 'completed');
      const total = debatesData.length;
      const completed = completedDebates.length;
      const avgScore = completed > 0 
        ? (completedDebates.reduce((acc, curr) => acc + (curr.overall_score || 0), 0) / completed).toFixed(1) 
        : 0;
      const bestScore = completed > 0 
        ? Math.max(...completedDebates.map(d => d.overall_score || 0)) 
        : 0;

      setStats({ total, avgScore, bestScore, completed });
    } catch (error) {
      console.error('Error fetching debates:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const recentDebates = debates.slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading your MindFlip dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-10 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            Welcome back, {user?.name || 'Debater'}! <span className="text-4xl">👋</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Ready to flip your perspective?
          </p>
        </header>

        {/* Primary CTA */}
        <section>
          <div 
            onClick={() => navigate('/debate/setup')}
            className="cursor-pointer bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 text-white shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 flex items-center justify-between"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <Swords className="w-8 h-8" />
                Start New Debate
              </h2>
              <p className="text-primary-100 text-lg">Choose a topic and challenge yourself</p>
            </div>
            <div className="hidden md:flex bg-white/20 p-4 rounded-full">
              <ChevronRight className="w-8 h-8 text-white" />
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-start space-x-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Debates</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</h3>
            </div>
          </div>

          <div className="card bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-start space-x-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.completed}</h3>
            </div>
          </div>

          <div className="card bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-start space-x-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Score</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.avgScore}</h3>
            </div>
          </div>

          <div className="card bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-start space-x-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Best Score</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.bestScore}</h3>
            </div>
          </div>
        </section>

        {/* Content Area: Recent Debates & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recent Debates */}
          <section className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Recent Debates</h2>
              <Link to="/history" className="text-primary-600 dark:text-primary-400 hover:underline text-sm font-medium">
                View all
              </Link>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              {recentDebates.length === 0 ? (
                <div className="p-8 text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-2">
                    <MessageSquare className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No debates yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
                    Start your first debate to begin challenging your perspectives and earning scores.
                  </p>
                  <button 
                    onClick={() => navigate('/debate/setup')}
                    className="btn-primary mt-4 px-6 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700"
                  >
                    Start a Debate
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                  {recentDebates.map((debate) => (
                    <li key={debate.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <Link 
                        to={debate.status === 'completed' ? `/debate/${debate.id}/report` : `/debate/${debate.id}`}
                        className="block p-4 sm:p-6"
                      >
                        <div className="flex items-center justify-between">
                          <div className="space-y-1 flex-1 min-w-0 pr-4">
                            <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {debate.topic}
                            </h4>
                            <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                {debate.mode}
                              </span>
                              <span>•</span>
                              <span>{new Date(debate.started_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end space-y-2">
                            {debate.status === 'completed' ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                                Completed
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                                Active (Round {debate.current_round}/{debate.total_rounds})
                              </span>
                            )}
                            {debate.status === 'completed' && debate.overall_score && (
                              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                Score: {debate.overall_score}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Quick Actions */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Quick Actions</h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 flex flex-col space-y-3">
              <Link 
                to="/history" 
                className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200 group"
              >
                <div className="p-2 bg-gray-100 dark:bg-gray-900 rounded-md mr-3 group-hover:bg-white dark:group-hover:bg-gray-800 transition-colors">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <span className="font-medium">View History</span>
                <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
              </Link>
              
              <Link 
                to="/settings" 
                className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200 group"
              >
                <div className="p-2 bg-gray-100 dark:bg-gray-900 rounded-md mr-3 group-hover:bg-white dark:group-hover:bg-gray-800 transition-colors">
                  <Swords className="w-5 h-5" />
                </div>
                <span className="font-medium">Account Settings</span>
                <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
              </Link>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
