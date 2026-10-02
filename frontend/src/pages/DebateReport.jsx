import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { reportAPI, debateAPI } from '../api/api';
import { CheckCircle2, Swords, Target, Eye, Brain, Shield, Link as LinkIcon, Lightbulb, AlertTriangle, Medal } from 'lucide-react';

export default function DebateReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [debate, setDebate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const debateRes = await debateAPI.getDebate(id);
      setDebate(debateRes.data);
      
      try {
        const reportRes = await reportAPI.getReport(id);
        setReport(reportRes.data);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          // Report not found, it needs to be generated
          setReport(null);
        } else {
          throw err;
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load debate data');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      setGenerating(true);
      await debateAPI.finishDebate(id);
      await fetchData();
    } catch (err) {
      console.error(err);
      setError('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">{error}</p>
        <button className="btn-primary" onClick={() => navigate('/history')}>Back to History</button>
      </div>
    );
  }

  if (!report && debate) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 px-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <CheckCircle2 className="w-16 h-16 text-primary-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Debate Completed</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You've finished the debate on "{debate.topic}". Generate your personalized feedback report to see how you did!
          </p>
          <button 
            onClick={generateReport} 
            disabled={generating}
            className="btn-primary w-full text-lg py-3"
          >
            {generating ? 'Analyzing Debate...' : 'Generate Report'}
          </button>
        </div>
      </div>
    );
  }

  if (!report) return null;

  const getScoreColor = (score) => {
    if (score <= 40) return 'text-red-500';
    if (score <= 60) return 'text-amber-500';
    if (score <= 80) return 'text-green-500';
    return 'text-emerald-500';
  };

  const getBarColor = (score) => {
    if (score <= 40) return 'bg-red-500';
    if (score <= 60) return 'bg-amber-500';
    if (score <= 80) return 'bg-green-500';
    return 'bg-emerald-500';
  };

  const metrics = [
    { label: 'Argument Strength', score: report.argument_strength, icon: <Swords size={20} /> },
    { label: 'Relevance', score: report.relevance, icon: <Target size={20} /> },
    { label: 'Clarity', score: report.clarity, icon: <Eye size={20} /> },
    { label: 'Logical Reasoning', score: report.logical_reasoning, icon: <Brain size={20} /> },
    { label: 'Counterargument Handling', score: report.counterargument_handling, icon: <Shield size={20} /> },
    { label: 'Consistency', score: report.consistency, icon: <LinkIcon size={20} /> }
  ];

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center space-x-2 mb-4">
          <CheckCircle2 className="text-emerald-500 w-8 h-8" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Debate Complete</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 mb-6">MindFlip - Flip your perspective.</p>
        
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">{debate?.topic}</h2>
        
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          <span className="px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-sm font-medium">
            {debate?.domain}
          </span>
          <span className="px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium">
            {debate?.mode} Mode
          </span>
        </div>
        
        <div className="flex justify-center items-center gap-6">
          <div className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800">
            <span className="text-sm text-gray-500 dark:text-gray-400 block">YOU</span>
            <span className={`font-bold ${debate?.user_position === 'FOR' ? 'text-blue-600' : 'text-rose-600'}`}>
              {debate?.user_position}
            </span>
          </div>
          <div className="font-bold text-gray-400">VS</div>
          <div className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800">
            <span className="text-sm text-gray-500 dark:text-gray-400 block">AI</span>
            <span className={`font-bold ${debate?.ai_position === 'FOR' ? 'text-blue-600' : 'text-rose-600'}`}>
              {debate?.ai_position}
            </span>
          </div>
        </div>
      </div>

      {/* Overall Score */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8 text-center">
        <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200">Overall Score</h3>
        <div className="relative inline-flex items-center justify-center">
          <svg className="w-48 h-48 transform -rotate-90">
            <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-200 dark:text-gray-700" />
            <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent"
              strokeDasharray={80 * 2 * Math.PI}
              strokeDashoffset={80 * 2 * Math.PI - (report.overall_score / 100) * 80 * 2 * Math.PI}
              className={`${getScoreColor(report.overall_score).replace('text-', '')}`}
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className={`text-5xl font-bold ${getScoreColor(report.overall_score)}`}>{report.overall_score}</span>
            <span className="text-gray-500 text-sm">/ 100</span>
          </div>
        </div>
      </div>

      {/* Performance Breakdown */}
      <div className="mb-10">
        <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white px-2">Performance Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((m, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                  <span className="text-primary-500">{m.icon}</span>
                  {m.label}
                </div>
                <span className={`font-bold ${getScoreColor(m.score)}`}>{m.score}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-auto">
                <div className={`h-2 rounded-full ${getBarColor(m.score)}`} style={{ width: `${m.score}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strongest Argument & Responses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4 text-emerald-700 dark:text-emerald-400">
            <Medal size={24} />
            <h3 className="text-xl font-bold">Strongest Argument</h3>
          </div>
          <p className="text-gray-800 dark:text-gray-200 italic mb-4">"{report.strongest_argument}"</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4 text-emerald-700 dark:text-emerald-400">
            <Shield size={24} />
            <h3 className="text-xl font-bold">Best Response</h3>
          </div>
          <p className="text-gray-800 dark:text-gray-200 italic mb-4">"{report.strongest_response}"</p>
        </div>
      </div>

      {/* Areas to Improve */}
      {report.weaknesses && report.weaknesses.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-6 px-2 text-amber-600 dark:text-amber-500">
            <AlertTriangle size={24} />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Areas to Improve</h3>
          </div>
          <div className="space-y-4">
            {report.weaknesses.map((w, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-900/50 rounded-xl p-6 shadow-sm">
                <h4 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">{w.what_happened}</h4>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{w.why_it_weakened}</p>
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg mb-4">
                  <h5 className="font-medium text-amber-800 dark:text-amber-400 mb-1">How to improve:</h5>
                  <p className="text-amber-900 dark:text-amber-200">{w.how_to_improve}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border-l-4 border-amber-500">
                  <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Better approach:</h5>
                  <p className="text-gray-600 dark:text-gray-400 italic">"{w.better_approach}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Arguments */}
      <div className="mb-10">
        <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white px-2">Key Arguments</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h4 className="font-bold mb-4 text-blue-600 dark:text-blue-400">Your Main Points</h4>
            <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
              {report.key_user_arguments?.map((arg, i) => <li key={i}>{arg}</li>)}
            </ul>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h4 className="font-bold mb-4 text-rose-600 dark:text-rose-400">AI's Main Points</h4>
            <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
              {report.key_ai_arguments?.map((arg, i) => <li key={i}>{arg}</li>)}
            </ul>
          </div>
        </div>
      </div>

      {/* Suggestions */}
      {report.suggestions && report.suggestions.length > 0 && (
        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-6 mb-10 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-primary-700 dark:text-primary-400">
            <Lightbulb size={24} />
            <h3 className="text-xl font-bold">Suggestions for Next Time</h3>
          </div>
          <ul className="list-disc pl-5 space-y-2 text-gray-800 dark:text-gray-200">
            {report.suggestions.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}

      {/* Neutral Summary */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 mb-10 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4 text-gray-700 dark:text-gray-300">
          <Brain size={24} />
          <h3 className="text-xl font-bold">Neutral Summary</h3>
        </div>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{report.neutral_summary}</p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
        <Link to="/debate/setup" className="btn-primary text-center">Start Another Debate</Link>
        <Link to="/history" className="btn-secondary text-center">View History</Link>
        <Link to="/dashboard" className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-center font-medium">Back to Dashboard</Link>
      </div>
    </div>
  );
}
