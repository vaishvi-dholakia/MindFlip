import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { debateAPI } from '../api/api';
import { Clock, Search, Filter, MessageSquare, ChevronRight, CheckCircle, Target } from 'lucide-react';

export default function DebateHistory() {
  const [debates, setDebates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDomain, setFilterDomain] = useState('All');
  const [filterMode, setFilterMode] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('date_desc');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDebates();
  }, []);

  const fetchDebates = async () => {
    try {
      setLoading(true);
      const res = await debateAPI.getDebates();
      setDebates(res.data);
    } catch (err) {
      console.error('Failed to fetch history', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDebates = debates.filter(d => {
    const matchesSearch = d.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain = filterDomain === 'All' || d.domain === filterDomain;
    const matchesMode = filterMode === 'All' || d.mode === filterMode;
    const matchesStatus = filterStatus === 'All' || d.status === filterStatus.toLowerCase();
    return matchesSearch && matchesDomain && matchesMode && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'date_desc') return new Date(b.started_at) - new Date(a.started_at);
    if (sortBy === 'date_asc') return new Date(a.started_at) - new Date(b.started_at);
    if (sortBy === 'score_desc') return (b.overall_score || 0) - (a.overall_score || 0);
    return 0;
  });

  const domains = ['All', ...new Set(debates.map(d => d.domain))];
  const modes = ['All', ...new Set(debates.map(d => d.mode))];

  const totalCompleted = debates.filter(d => d.status === 'completed').length;
  const avgScore = totalCompleted > 0 
    ? Math.round(debates.filter(d => d.status === 'completed').reduce((acc, curr) => acc + (curr.overall_score || 0), 0) / totalCompleted)
    : 0;
  const bestScore = totalCompleted > 0
    ? Math.max(...debates.filter(d => d.status === 'completed').map(d => d.overall_score || 0))
    : 0;

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (debates.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 border border-gray-200 dark:border-gray-700">
          <MessageSquare className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">No debates yet</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">Time to flip your perspective! Challenge yourself with your first AI debate.</p>
          <button onClick={() => navigate('/debate/setup')} className="btn-primary px-8 py-3 text-lg">
            Start Your First Debate
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex items-center gap-3 mb-8">
        <Clock className="w-8 h-8 text-primary-500" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Debate History</h1>
          <p className="text-gray-600 dark:text-gray-400">Review your past debates and track your growth</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Total Debates</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{debates.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Completed</p>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{totalCompleted}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Avg Score</p>
          <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{avgScore}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Best Score</p>
          <p className="text-3xl font-bold text-amber-500 dark:text-amber-400">{bestScore}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search topics..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
          />
        </div>
        
        <select value={filterDomain} onChange={(e) => setFilterDomain(e.target.value)} className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2">
          {domains.map(d => <option key={d} value={d}>{d === 'All' ? 'All Domains' : d}</option>)}
        </select>

        <select value={filterMode} onChange={(e) => setFilterMode(e.target.value)} className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2">
          {modes.map(m => <option key={m} value={m}>{m === 'All' ? 'All Modes' : m}</option>)}
        </select>
        
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2">
          <option value="All">All Status</option>
          <option value="Completed">Completed</option>
          <option value="Active">Active</option>
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2">
          <option value="date_desc">Newest First</option>
          <option value="date_asc">Oldest First</option>
          <option value="score_desc">Highest Score</option>
        </select>
      </div>

      {/* Debate List */}
      <div className="space-y-4">
        {filteredDebates.length === 0 ? (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">No debates match your filters.</div>
        ) : (
          filteredDebates.map(debate => (
            <div 
              key={debate.id} 
              onClick={() => navigate(debate.status === 'completed' ? `/debate/${debate.id}/report` : `/debate/${debate.id}`)}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col md:flex-row gap-4 items-start md:items-center justify-between group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${debate.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                    {debate.status === 'completed' ? 'Completed' : 'Active'}
                  </span>
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    {debate.domain}
                  </span>
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                    {debate.mode}
                  </span>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${debate.user_position === 'FOR' ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-rose-50 text-rose-700 border border-rose-200 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-400'}`}>
                    YOU: {debate.user_position}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate mb-1" title={debate.topic}>{debate.topic}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <span>{formatDate(debate.started_at)}</span>
                  <span>•</span>
                  <span>Round {debate.current_round} / {debate.total_rounds}</span>
                </p>
              </div>
              
              <div className="flex items-center gap-6 mt-4 md:mt-0 w-full md:w-auto">
                {debate.status === 'completed' && debate.overall_score !== null && (
                  <div className="flex flex-col items-center">
                    <span className={`text-2xl font-bold ${
                      debate.overall_score >= 80 ? 'text-emerald-500' : 
                      debate.overall_score >= 60 ? 'text-green-500' : 
                      debate.overall_score >= 40 ? 'text-amber-500' : 'text-red-500'
                    }`}>{debate.overall_score}</span>
                    <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Score</span>
                  </div>
                )}
                <div className="ml-auto md:ml-0 bg-gray-100 dark:bg-gray-700 p-2 rounded-full group-hover:bg-primary-100 dark:group-hover:bg-primary-900 transition-colors">
                  <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
