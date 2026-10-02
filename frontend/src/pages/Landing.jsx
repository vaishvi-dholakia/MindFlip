import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
  Sun, 
  Moon, 
  Target, 
  Shield, 
  Swords, 
  TrendingUp, 
  MessageCircle, 
  GraduationCap, 
  Flame, 
  HelpCircle, 
  Trophy,
  BrainCircuit,
  BarChart,
  LineChart,
  RefreshCw,
  BookOpen
} from 'lucide-react';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button 
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun className="w-5 h-5 text-gray-300" /> : <Moon className="w-5 h-5 text-gray-600" />}
    </button>
  );
};

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed w-full z-50 top-0 left-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <BrainCircuit className="w-8 h-8 text-primary-500" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                MindFlip
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-primary-500 font-medium transition-colors">
                Login
              </Link>
              <Link to="/register" className="btn-primary px-4 py-2 text-sm">
                Start Debating
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-rose-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent animate-slide-up">
            MindFlip
          </h1>
          <p className="text-xl md:text-2xl text-primary-500 dark:text-primary-400 font-medium mb-6 animate-slide-up animation-delay-100">
            Flip your perspective.
          </p>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl animate-slide-up animation-delay-200">
            Don't just defend what you think. Challenge it. MindFlip puts your ideas to the test by giving you an AI opponent that challenges your arguments, questions your reasoning, and helps you see another side.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 animate-slide-up animation-delay-300">
            <Link to="/register" className="btn-primary px-8 py-4 text-lg font-semibold shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transform hover:-translate-y-1 transition-all">
              Start Debating
            </Link>
            <Link to="/login" className="btn-secondary px-8 py-4 text-lg font-semibold bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transform hover:-translate-y-1 transition-all">
              Login
            </Link>
          </div>
          
          {/* VS Indicator */}
          <div className="mt-16 flex items-center justify-center space-x-6 animate-fade-in animation-delay-500">
            <div className="px-6 py-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-semibold text-lg">YOU</div>
            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center font-bold text-gray-500 dark:text-gray-400 shadow-inner">VS</div>
            <div className="px-6 py-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold text-lg">AI</div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">How It Works</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Master the art of debate in four simple steps.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Target, title: "Choose Your Battlefield", desc: "Pick a topic, select your debate mode, and choose your side." },
              { icon: Shield, title: "Defend Your Position", desc: "Construct and present your initial arguments clearly." },
              { icon: Swords, title: "Face the Challenge", desc: "The AI analyzes your stance and counters with strong opposition." },
              { icon: TrendingUp, title: "Grow Stronger", desc: "Receive detailed feedback and performance metrics after every round." }
            ].map((step, index) => (
              <div key={index} className="card p-6 relative group hover:-translate-y-2 transition-transform duration-300">
                <div className="absolute top-4 right-4 text-4xl font-extrabold text-gray-100 dark:text-gray-800/50 group-hover:text-primary-100 dark:group-hover:text-primary-900/30 transition-colors z-0">
                  {index + 1}
                </div>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center mb-4 text-primary-600 dark:text-primary-400">
                    <step.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Debate Modes Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Debate Modes</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Different ways to challenge your thinking depending on your goals.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: MessageCircle, name: "Friendly Debate", desc: "Relaxed discussion where AI challenges your ideas constructively without being too aggressive." },
              { icon: GraduationCap, name: "Academic Debate", desc: "Structured discussion heavily focused on logical reasoning, solid evidence, and clarity." },
              { icon: Flame, name: "Devil's Advocate", desc: "AI deliberately challenges your position forcefully and actively looks for weaknesses in your argument." },
              { icon: HelpCircle, name: "Socratic Debate", desc: "AI uses thoughtful, probing questions to deeply examine your underlying assumptions." },
              { icon: Trophy, name: "Competitive Debate", desc: "A formal multi-round debate with strong counterarguments simulating a competition." }
            ].map((mode, index) => (
              <div key={index} className="card p-6 hover:shadow-lg transition-shadow duration-300 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 text-primary-500">
                    <mode.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{mode.name}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400">{mode.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example Debate Section */}
      <section className="py-24 bg-white dark:bg-gray-900 border-t border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Experience the Arena</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">See how a typical exchange unfolds.</p>
          </div>
          
          <div className="card border border-gray-200 dark:border-gray-700 p-6 md:p-8 rounded-2xl shadow-xl">
            <div className="text-center mb-8 pb-4 border-b border-gray-100 dark:border-gray-800">
              <span className="text-sm font-semibold text-primary-500 tracking-wider uppercase">Topic</span>
              <h3 className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">Should AI replace some human jobs?</h3>
            </div>
            
            <div className="space-y-6">
              {/* User Message */}
              <div className="flex flex-col items-start w-full">
                <div className="flex items-center space-x-2 mb-2 ml-2">
                  <span className="text-sm font-bold text-blue-500">YOU (FOR)</span>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4 rounded-2xl rounded-tl-sm max-w-[85%] text-gray-800 dark:text-gray-200">
                  <p>AI should replace repetitive and dangerous human jobs. It increases efficiency, reduces fatal workplace accidents, and frees humans to focus on creative and complex problem-solving tasks that machines cannot do.</p>
                </div>
              </div>
              
              {/* AI Message */}
              <div className="flex flex-col items-end w-full">
                <div className="flex items-center space-x-2 mb-2 mr-2">
                  <span className="text-sm font-bold text-rose-500">AI (AGAINST)</span>
                </div>
                <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 p-4 rounded-2xl rounded-tr-sm max-w-[85%] text-gray-800 dark:text-gray-200">
                  <p>While efficiency might increase, the rapid replacement of jobs leads to severe economic displacement. History shows that while new jobs are created, the transition period often leaves unskilled workers in poverty. How do you propose we handle the immediate socioeconomic fallout of mass automation before these hypothetical 'creative' jobs materialize?</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Why MindFlip?</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: BrainCircuit, title: "AI-Powered Opposition", desc: "Dynamic opponents that adapt to your arguments in real-time." },
              { icon: RefreshCw, title: "Multiple Debate Modes", desc: "From casual chats to strict academic formats." },
              { icon: BarChart, title: "Detailed Performance Reports", desc: "Get logical, factual, and rhetorical analysis." },
              { icon: LineChart, title: "Track Your Growth", desc: "Monitor your improvement over time with visual analytics." },
              { icon: Swords, title: "Structured Rounds", desc: "Organized turns keep the debate focused and fair." },
              { icon: BookOpen, title: "Learn From Every Debate", desc: "Actionable tips to improve your argumentation skills." }
            ].map((feat, index) => (
              <div key={index} className="flex space-x-4 p-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                    <feat.icon className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1 text-gray-900 dark:text-white">{feat.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <div className="flex items-center space-x-2 mb-4">
            <BrainCircuit className="w-6 h-6 text-primary-500" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">MindFlip</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Flip your perspective.</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            &copy; {new Date().getFullYear()} MindFlip. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
