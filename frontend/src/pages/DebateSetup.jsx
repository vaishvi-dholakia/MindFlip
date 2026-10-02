import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { topicsAPI, debateAPI } from '../api/api';
import toast from 'react-hot-toast';
import { 
  MessageCircle, GraduationCap, Flame, HelpCircle, Trophy, 
  Cpu, BookOpen, Leaf, FlaskConical, TrendingUp, Users, Heart, Film, Dumbbell, Scale, Briefcase, Globe,
  ThumbsUp, ThumbsDown, ChevronLeft, ChevronRight, Check
} from 'lucide-react';

const MODES = [
  { id: 'friendly', name: 'Friendly Debate', icon: MessageCircle, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-500', desc: 'Relaxed discussion where AI challenges your ideas constructively.', rounds: 3 },
  { id: 'academic', name: 'Academic Debate', icon: GraduationCap, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-500', desc: 'Structured discussion focused on reasoning, evidence, and clarity.', rounds: 4 },
  { id: 'devils_advocate', name: "Devil's Advocate", icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-500', desc: 'AI deliberately challenges your position and looks for weaknesses in your reasoning.', rounds: 3 },
  { id: 'socratic', name: 'Socratic Debate', icon: HelpCircle, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-purple-500', desc: 'AI uses thoughtful questions to make you examine your own assumptions.', rounds: 4 },
  { id: 'competitive', name: 'Competitive Debate', icon: Trophy, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-500', desc: 'A more challenging multi-round debate with stronger counterarguments.', rounds: 5 },
];

const DOMAIN_ICONS = {
  'Technology & AI': Cpu,
  'Education': BookOpen,
  'Environment': Leaf,
  'Science': FlaskConical,
  'Business & Economics': TrendingUp,
  'Society & Culture': Users,
  'Health & Lifestyle': Heart,
  'Entertainment': Film,
  'Sports': Dumbbell,
  'Ethics & Philosophy': Scale,
  'Career & Workplace': Briefcase,
  'General': Globe
};

const DebateSetup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetchingTopics, setFetchingTopics] = useState(true);
  
  const [domainsData, setDomainsData] = useState([]);
  
  // Selections
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [selectedPosition, setSelectedPosition] = useState(null);

  // Toss State
  const [tossQuestion, setTossQuestion] = useState(null);
  const [tossAnswered, setTossAnswered] = useState(false);
  const [tossWon, setTossWon] = useState(false);
  const [firstTurn, setFirstTurn] = useState('user');


  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await topicsAPI.getAllTopics();
        setDomainsData(response.data.domains || []);
      } catch (error) {
        console.error('Failed to fetch topics:', error);
        toast.error('Failed to load domains. Using fallback topics.');
      } finally {
        setFetchingTopics(false);
      }
    };
    fetchTopics();
  }, []);

  useEffect(() => {
    if (step === 5 && !tossQuestion) {
      topicsAPI.getTossQuestion().then(res => setTossQuestion(res.data)).catch(console.error);
    }
  }, [step, tossQuestion]);

  const handleNext = () => setStep(s => Math.min(s + 1, 5));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const handleStart = async () => {
    if (!selectedMode || !selectedDomain || (!selectedTopic && !customTopic) || !selectedPosition) {
      toast.error('Please complete all selections');
      return;
    }

    setLoading(true);
    try {
      const topicToUse = customTopic.trim() ? customTopic.trim() : selectedTopic;
      const payload = {
        topic: topicToUse,
        domain: selectedDomain.name,
        mode: selectedMode.id,
        user_position: selectedPosition,
        first_turn: firstTurn
      };
      
      const response = await debateAPI.createDebate(payload);
      toast.success('Debate created successfully!');
      navigate(`/debate/${response.data.id}`);
    } catch (error) {
      console.error('Error creating debate:', error);
      toast.error('Failed to create debate. Please try again.');
      setLoading(false);
    }
  };

  const renderStepIndicator = () => {
    const renderStep5 = () => {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">The Toss</h2>
          <p className="text-gray-600 dark:text-gray-400">Answer correctly to choose who pitches first!</p>
        </div>

        {!tossQuestion ? (
          <div className="py-10 text-center">Loading question...</div>
        ) : !tossAnswered ? (
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">{tossQuestion.question}</h3>
            <div className="space-y-3">
              {tossQuestion.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const isCorrect = idx === tossQuestion.correct_index;
                    setTossWon(isCorrect);
                    setTossAnswered(true);
                    if (!isCorrect) {
                      setFirstTurn(Math.random() > 0.5 ? 'user' : 'ai');
                    }
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-400 transition-colors"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 text-center animate-in zoom-in duration-300">
            {tossWon ? (
              <>
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Correct!</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">You won the toss. Who should start the debate?</p>
                <div className="flex justify-center space-x-4">
                  <button onClick={() => setFirstTurn('user')} className={`px-6 py-2 rounded-lg border-2 font-bold ${firstTurn === 'user' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-300 text-gray-600'}`}>I'll Start</button>
                  <button onClick={() => setFirstTurn('ai')} className={`px-6 py-2 rounded-lg border-2 font-bold ${firstTurn === 'ai' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-300 text-gray-600'}`}>Let AI Start</button>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Flame className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Incorrect!</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  The correct answer was: <strong>{tossQuestion.options[tossQuestion.correct_index]}</strong><br/>
                  AI won the toss and decided that <strong>{firstTurn === 'ai' ? 'AI will start' : 'You will start'}</strong>.
                </p>
              </>
            )}
          </div>
        )}

        <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-800">
          <button onClick={handleBack} className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 font-medium flex items-center">
            <ChevronLeft className="w-5 h-5 mr-2" /> Back
          </button>
          <button 
            onClick={handleStart}
            disabled={!tossAnswered || loading}
            className="btn-primary px-8 py-3 rounded-lg bg-primary-600 text-white font-bold text-lg hover:bg-primary-700 shadow-lg disabled:opacity-50 flex items-center"
          >
            {loading ? 'Starting...' : 'Enter Arena'}
          </button>
        </div>
      </div>
    );
  };

  return (
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 dark:bg-gray-700 z-0 rounded-full"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary-500 z-0 rounded-full transition-all duration-300" 
            style={{ width: `${((step - 1) / 4) * 100}%` }}
          ></div>
          
          {[1, 2, 3, 4, 5].map(num => (
            <div 
              key={num} 
              className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${
                step >= num 
                  ? 'bg-primary-600 text-white shadow-md' 
                  : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              {step > num ? <Check className="w-4 h-4" /> : num}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStep1 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Choose Your Debate Style</h2>
        <p className="text-gray-600 dark:text-gray-400">Each mode shapes how the AI challenges your arguments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MODES.map((mode) => {
          const Icon = mode.icon;
          const isSelected = selectedMode?.id === mode.id;
          const renderStep5 = () => {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">The Toss</h2>
          <p className="text-gray-600 dark:text-gray-400">Answer correctly to choose who pitches first!</p>
        </div>

        {!tossQuestion ? (
          <div className="py-10 text-center">Loading question...</div>
        ) : !tossAnswered ? (
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">{tossQuestion.question}</h3>
            <div className="space-y-3">
              {tossQuestion.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const isCorrect = idx === tossQuestion.correct_index;
                    setTossWon(isCorrect);
                    setTossAnswered(true);
                    if (!isCorrect) {
                      setFirstTurn(Math.random() > 0.5 ? 'user' : 'ai');
                    }
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-400 transition-colors"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 text-center animate-in zoom-in duration-300">
            {tossWon ? (
              <>
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Correct!</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">You won the toss. Who should start the debate?</p>
                <div className="flex justify-center space-x-4">
                  <button onClick={() => setFirstTurn('user')} className={`px-6 py-2 rounded-lg border-2 font-bold ${firstTurn === 'user' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-300 text-gray-600'}`}>I'll Start</button>
                  <button onClick={() => setFirstTurn('ai')} className={`px-6 py-2 rounded-lg border-2 font-bold ${firstTurn === 'ai' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-300 text-gray-600'}`}>Let AI Start</button>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Flame className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Incorrect!</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  The correct answer was: <strong>{tossQuestion.options[tossQuestion.correct_index]}</strong><br/>
                  AI won the toss and decided that <strong>{firstTurn === 'ai' ? 'AI will start' : 'You will start'}</strong>.
                </p>
              </>
            )}
          </div>
        )}

        <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-800">
          <button onClick={handleBack} className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 font-medium flex items-center">
            <ChevronLeft className="w-5 h-5 mr-2" /> Back
          </button>
          <button 
            onClick={handleStart}
            disabled={!tossAnswered || loading}
            className="btn-primary px-8 py-3 rounded-lg bg-primary-600 text-white font-bold text-lg hover:bg-primary-700 shadow-lg disabled:opacity-50 flex items-center"
          >
            {loading ? 'Starting...' : 'Enter Arena'}
          </button>
        </div>
      </div>
    );
  };

  return (
            <div 
              key={mode.id}
              onClick={() => setSelectedMode(mode)}
              className={`cursor-pointer rounded-xl p-5 border-2 transition-all duration-200 ${
                isSelected 
                  ? `${mode.border} ${mode.bg} shadow-md scale-[1.02]` 
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-white dark:bg-gray-800 shadow-sm' : mode.bg}`}>
                  <Icon className={`w-6 h-6 ${mode.color}`} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100">{mode.name}</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{mode.desc}</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${mode.bg} ${mode.color}`}>
                {mode.rounds} Rounds
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-6">
        <button 
          onClick={handleNext}
          disabled={!selectedMode}
          className="btn-primary px-6 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          Next Step <ChevronRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => {
    if (fetchingTopics) {
      return <div className="py-20 text-center"><div className="animate-spin inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mb-4"></div><p>Loading domains...</p></div>;
    }

    const renderStep5 = () => {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">The Toss</h2>
          <p className="text-gray-600 dark:text-gray-400">Answer correctly to choose who pitches first!</p>
        </div>

        {!tossQuestion ? (
          <div className="py-10 text-center">Loading question...</div>
        ) : !tossAnswered ? (
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">{tossQuestion.question}</h3>
            <div className="space-y-3">
              {tossQuestion.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const isCorrect = idx === tossQuestion.correct_index;
                    setTossWon(isCorrect);
                    setTossAnswered(true);
                    if (!isCorrect) {
                      setFirstTurn(Math.random() > 0.5 ? 'user' : 'ai');
                    }
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-400 transition-colors"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 text-center animate-in zoom-in duration-300">
            {tossWon ? (
              <>
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Correct!</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">You won the toss. Who should start the debate?</p>
                <div className="flex justify-center space-x-4">
                  <button onClick={() => setFirstTurn('user')} className={`px-6 py-2 rounded-lg border-2 font-bold ${firstTurn === 'user' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-300 text-gray-600'}`}>I'll Start</button>
                  <button onClick={() => setFirstTurn('ai')} className={`px-6 py-2 rounded-lg border-2 font-bold ${firstTurn === 'ai' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-300 text-gray-600'}`}>Let AI Start</button>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Flame className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Incorrect!</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  The correct answer was: <strong>{tossQuestion.options[tossQuestion.correct_index]}</strong><br/>
                  AI won the toss and decided that <strong>{firstTurn === 'ai' ? 'AI will start' : 'You will start'}</strong>.
                </p>
              </>
            )}
          </div>
        )}

        <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-800">
          <button onClick={handleBack} className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 font-medium flex items-center">
            <ChevronLeft className="w-5 h-5 mr-2" /> Back
          </button>
          <button 
            onClick={handleStart}
            disabled={!tossAnswered || loading}
            className="btn-primary px-8 py-3 rounded-lg bg-primary-600 text-white font-bold text-lg hover:bg-primary-700 shadow-lg disabled:opacity-50 flex items-center"
          >
            {loading ? 'Starting...' : 'Enter Arena'}
          </button>
        </div>
      </div>
    );
  };

  return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Pick a Domain</h2>
          <p className="text-gray-600 dark:text-gray-400">What area do you want to debate in?</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {domainsData.map((domain) => {
            const Icon = DOMAIN_ICONS[domain.name] || Globe;
            const isSelected = selectedDomain?.name === domain.name;
            const renderStep5 = () => {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">The Toss</h2>
          <p className="text-gray-600 dark:text-gray-400">Answer correctly to choose who pitches first!</p>
        </div>

        {!tossQuestion ? (
          <div className="py-10 text-center">Loading question...</div>
        ) : !tossAnswered ? (
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">{tossQuestion.question}</h3>
            <div className="space-y-3">
              {tossQuestion.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const isCorrect = idx === tossQuestion.correct_index;
                    setTossWon(isCorrect);
                    setTossAnswered(true);
                    if (!isCorrect) {
                      setFirstTurn(Math.random() > 0.5 ? 'user' : 'ai');
                    }
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-400 transition-colors"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 text-center animate-in zoom-in duration-300">
            {tossWon ? (
              <>
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Correct!</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">You won the toss. Who should start the debate?</p>
                <div className="flex justify-center space-x-4">
                  <button onClick={() => setFirstTurn('user')} className={`px-6 py-2 rounded-lg border-2 font-bold ${firstTurn === 'user' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-300 text-gray-600'}`}>I'll Start</button>
                  <button onClick={() => setFirstTurn('ai')} className={`px-6 py-2 rounded-lg border-2 font-bold ${firstTurn === 'ai' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-300 text-gray-600'}`}>Let AI Start</button>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Flame className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Incorrect!</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  The correct answer was: <strong>{tossQuestion.options[tossQuestion.correct_index]}</strong><br/>
                  AI won the toss and decided that <strong>{firstTurn === 'ai' ? 'AI will start' : 'You will start'}</strong>.
                </p>
              </>
            )}
          </div>
        )}

        <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-800">
          <button onClick={handleBack} className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 font-medium flex items-center">
            <ChevronLeft className="w-5 h-5 mr-2" /> Back
          </button>
          <button 
            onClick={handleStart}
            disabled={!tossAnswered || loading}
            className="btn-primary px-8 py-3 rounded-lg bg-primary-600 text-white font-bold text-lg hover:bg-primary-700 shadow-lg disabled:opacity-50 flex items-center"
          >
            {loading ? 'Starting...' : 'Enter Arena'}
          </button>
        </div>
      </div>
    );
  };

  return (
              <div 
                key={domain.name}
                onClick={() => {
                  setSelectedDomain(domain);
                  setSelectedTopic('');
                  setCustomTopic('');
                }}
                className={`cursor-pointer rounded-xl p-4 border-2 text-center transition-all duration-200 flex flex-col items-center justify-center space-y-3 ${
                  isSelected 
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md scale-105' 
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-300 dark:hover:border-primary-700/50 hover:shadow-sm'
                }`}
              >
                <Icon className={`w-8 h-8 ${isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`} />
                <span className={`font-medium text-sm ${isSelected ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'}`}>
                  {domain.name}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between pt-6">
          <button 
            onClick={handleBack}
            className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium flex items-center"
          >
            <ChevronLeft className="w-5 h-5 mr-2" /> Back
          </button>
          <button 
            onClick={handleNext}
            disabled={!selectedDomain}
            className="btn-primary px-6 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            Next Step <ChevronRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    );
  };

  const renderStep3 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Select Your Topic</h2>
        <p className="text-gray-600 dark:text-gray-400">Choose a debate topic or create your own</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="max-h-80 overflow-y-auto p-2">
          {selectedDomain?.topics?.map((topic, idx) => (
            <div 
              key={idx}
              onClick={() => {
                setSelectedTopic(topic);
                setCustomTopic('');
              }}
              className={`cursor-pointer p-4 rounded-lg mb-2 transition-colors ${
                selectedTopic === topic && !customTopic
                  ? 'bg-primary-100 dark:bg-primary-900/30 border-l-4 border-primary-500 text-primary-900 dark:text-primary-100 font-medium'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-l-4 border-transparent'
              }`}
            >
              {topic}
            </div>
          ))}
        </div>
      </div>

      <div className="relative flex items-center py-4">
        <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
        <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-medium uppercase">Or enter your own</span>
        <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
      </div>

      <div>
        <input 
          type="text"
          value={customTopic}
          onChange={(e) => {
            setCustomTopic(e.target.value);
            if (e.target.value) setSelectedTopic('');
          }}
          placeholder="E.g., Artificial intelligence will eventually replace human creativity"
          className="input-field w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none"
        />
      </div>

      <div className="flex justify-between pt-6">
        <button 
          onClick={handleBack}
          className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium flex items-center"
        >
          <ChevronLeft className="w-5 h-5 mr-2" /> Back
        </button>
        <button 
          onClick={handleNext}
          disabled={!selectedTopic && !customTopic.trim()}
          className="btn-primary px-6 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          Next Step <ChevronRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    </div>
  );

  const renderStep4 = () => {
    const finalTopic = customTopic.trim() || selectedTopic;
    const renderStep5 = () => {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">The Toss</h2>
          <p className="text-gray-600 dark:text-gray-400">Answer correctly to choose who pitches first!</p>
        </div>

        {!tossQuestion ? (
          <div className="py-10 text-center">Loading question...</div>
        ) : !tossAnswered ? (
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">{tossQuestion.question}</h3>
            <div className="space-y-3">
              {tossQuestion.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const isCorrect = idx === tossQuestion.correct_index;
                    setTossWon(isCorrect);
                    setTossAnswered(true);
                    if (!isCorrect) {
                      setFirstTurn(Math.random() > 0.5 ? 'user' : 'ai');
                    }
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-400 transition-colors"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 text-center animate-in zoom-in duration-300">
            {tossWon ? (
              <>
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Correct!</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">You won the toss. Who should start the debate?</p>
                <div className="flex justify-center space-x-4">
                  <button onClick={() => setFirstTurn('user')} className={`px-6 py-2 rounded-lg border-2 font-bold ${firstTurn === 'user' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-300 text-gray-600'}`}>I'll Start</button>
                  <button onClick={() => setFirstTurn('ai')} className={`px-6 py-2 rounded-lg border-2 font-bold ${firstTurn === 'ai' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-300 text-gray-600'}`}>Let AI Start</button>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Flame className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Incorrect!</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  The correct answer was: <strong>{tossQuestion.options[tossQuestion.correct_index]}</strong><br/>
                  AI won the toss and decided that <strong>{firstTurn === 'ai' ? 'AI will start' : 'You will start'}</strong>.
                </p>
              </>
            )}
          </div>
        )}

        <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-800">
          <button onClick={handleBack} className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 font-medium flex items-center">
            <ChevronLeft className="w-5 h-5 mr-2" /> Back
          </button>
          <button 
            onClick={handleStart}
            disabled={!tossAnswered || loading}
            className="btn-primary px-8 py-3 rounded-lg bg-primary-600 text-white font-bold text-lg hover:bg-primary-700 shadow-lg disabled:opacity-50 flex items-center"
          >
            {loading ? 'Starting...' : 'Enter Arena'}
          </button>
        </div>
      </div>
    );
  };

  return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Choose Your Side</h2>
          <p className="text-gray-600 dark:text-gray-400">The AI will defend the opposite position</p>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl text-center shadow-inner">
          <p className="text-sm text-gray-500 dark:text-gray-400 uppercase font-semibold mb-2">Topic</p>
          <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100">"{finalTopic}"</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            onClick={() => setSelectedPosition('FOR')}
            className={`cursor-pointer rounded-2xl p-6 border-2 flex flex-col items-center justify-center space-y-4 transition-all duration-300 ${
              selectedPosition === 'FOR'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg scale-105'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-700/50'
            }`}
          >
            <div className={`p-4 rounded-full ${selectedPosition === 'FOR' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'}`}>
              <ThumbsUp className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">I'm in favor of this</h4>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">You will argue FOR the topic.</p>
          </div>

          <div 
            onClick={() => setSelectedPosition('AGAINST')}
            className={`cursor-pointer rounded-2xl p-6 border-2 flex flex-col items-center justify-center space-y-4 transition-all duration-300 ${
              selectedPosition === 'AGAINST'
                ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20 shadow-lg scale-105'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-rose-300 dark:hover:border-rose-700/50'
            }`}
          >
            <div className={`p-4 rounded-full ${selectedPosition === 'AGAINST' ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400'}`}>
              <ThumbsDown className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">I'm against this</h4>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">You will argue AGAINST the topic.</p>
          </div>
        </div>

        {selectedPosition && (
          <div className="py-4 flex items-center justify-center space-x-6 text-lg font-bold animate-in fade-in zoom-in duration-300">
            <span className={selectedPosition === 'FOR' ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400'}>
              YOU: {selectedPosition}
            </span>
            <span className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-sm text-gray-600 dark:text-gray-300">VS</span>
            <span className={selectedPosition === 'FOR' ? 'text-rose-600 dark:text-rose-400' : 'text-blue-600 dark:text-blue-400'}>
              AI: {selectedPosition === 'FOR' ? 'AGAINST' : 'FOR'}
            </span>
          </div>
        )}

        <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-800">
          <button 
            onClick={handleBack}
            className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium flex items-center"
          >
            <ChevronLeft className="w-5 h-5 mr-2" /> Back
          </button>
          <button 
            onClick={handleNext}
            disabled={!selectedPosition}
            className="btn-primary px-6 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            Next Step <ChevronRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    );
  };

  const renderStep5 = () => {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">The Toss</h2>
          <p className="text-gray-600 dark:text-gray-400">Answer correctly to choose who pitches first!</p>
        </div>

        {!tossQuestion ? (
          <div className="py-10 text-center">Loading question...</div>
        ) : !tossAnswered ? (
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">{tossQuestion.question}</h3>
            <div className="space-y-3">
              {tossQuestion.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const isCorrect = idx === tossQuestion.correct_index;
                    setTossWon(isCorrect);
                    setTossAnswered(true);
                    if (!isCorrect) {
                      setFirstTurn(Math.random() > 0.5 ? 'user' : 'ai');
                    }
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-400 transition-colors"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 text-center animate-in zoom-in duration-300">
            {tossWon ? (
              <>
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Correct!</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">You won the toss. Who should start the debate?</p>
                <div className="flex justify-center space-x-4">
                  <button onClick={() => setFirstTurn('user')} className={`px-6 py-2 rounded-lg border-2 font-bold ${firstTurn === 'user' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-300 text-gray-600'}`}>I'll Start</button>
                  <button onClick={() => setFirstTurn('ai')} className={`px-6 py-2 rounded-lg border-2 font-bold ${firstTurn === 'ai' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-300 text-gray-600'}`}>Let AI Start</button>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Flame className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Incorrect!</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  The correct answer was: <strong>{tossQuestion.options[tossQuestion.correct_index]}</strong><br/>
                  AI won the toss and decided that <strong>{firstTurn === 'ai' ? 'AI will start' : 'You will start'}</strong>.
                </p>
              </>
            )}
          </div>
        )}

        <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-800">
          <button onClick={handleBack} className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 font-medium flex items-center">
            <ChevronLeft className="w-5 h-5 mr-2" /> Back
          </button>
          <button 
            onClick={handleStart}
            disabled={!tossAnswered || loading}
            className="btn-primary px-8 py-3 rounded-lg bg-primary-600 text-white font-bold text-lg hover:bg-primary-700 shadow-lg disabled:opacity-50 flex items-center"
          >
            {loading ? 'Starting...' : 'Enter Arena'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-6 md:p-10 bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 md:p-12">
        {renderStepIndicator()}
        
        <div className="min-h-[400px]">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
          {step === 5 && renderStep5()}
        </div>
      </div>
    </div>
  );
};

export default DebateSetup;
