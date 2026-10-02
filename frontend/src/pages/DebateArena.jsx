import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { debateAPI } from '../api/api';
import toast from 'react-hot-toast';
import { 
  Send, User, Bot, AlertCircle, Loader2, PlayCircle, FileText
} from 'lucide-react';

const DebateArena = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [debate, setDebate] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [finishing, setFinishing] = useState(false);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchDebate();
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  const fetchDebate = async () => {
    try {
      const response = await debateAPI.getDebate(id);
      const fetchedDebate = response.data;
      setDebate(fetchedDebate);
      setMessages(fetchedDebate.messages || []);
      
      // If AI goes first and no messages exist, trigger AI opening
      if (fetchedDebate.first_turn === 'ai' && (!fetchedDebate.messages || fetchedDebate.messages.length === 0)) {
        startAIOpening();
      }
    } catch (error) {
      console.error('Error fetching debate:', error);
      toast.error('Failed to load debate');
    } finally {
      setLoading(false);
    }
  };

  const startAIOpening = async () => {
    setSending(true);
    try {
      const response = await debateAPI.startAITurn(id);
      const { ai_message, debate_status, current_round } = response.data;
      setMessages([ai_message]);
      setDebate(prev => ({
        ...prev,
        current_round,
        status: debate_status
      }));
    } catch (error) {
      console.error('Error starting AI turn:', error);
      const errorMsg = error.response?.data?.detail || error.response?.data?.message || 'Failed to get AI opening';
      toast.error(errorMsg);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    
    const userMsgText = input.trim();
    setInput('');
    
    // Optimistic UI update
    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      sender: 'user',
      round_number: debate.current_round,
      message: userMsgText,
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, tempUserMsg]);
    setSending(true);

    try {
      const response = await debateAPI.sendMessage(id, { message: userMsgText });
      const { user_message, ai_message, debate_status, current_round } = response.data;
      
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== tempUserMsg.id);
        return [...filtered, user_message, ai_message];
      });
      
      setDebate(prev => ({
        ...prev,
        current_round,
        status: debate_status
      }));

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMsg = error.response?.data?.detail || error.response?.data?.message || 'Failed to send message';
      toast.error(errorMsg);
      setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id));
      setInput(userMsgText); // restore input
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFinishDebate = async () => {
    setFinishing(true);
    try {
      await debateAPI.finishDebate(id);
      toast.success('Debate finished successfully!');
      navigate(`/debate/${id}/report`);
    } catch (error) {
      console.error('Error finishing debate:', error);
      toast.error('Failed to generate report');
      setFinishing(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
        <p className="text-gray-600 dark:text-gray-400">Loading arena...</p>
      </div>
    );
  }

  if (!debate) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center space-y-4 text-center p-6">
        <AlertCircle className="w-16 h-16 text-red-500" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Debate Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400">We couldn't find the debate you're looking for.</p>
        <button onClick={() => navigate('/dashboard')} className="btn-primary px-6 py-2 rounded-lg bg-primary-600 text-white mt-4">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const isCompleted = debate.status === 'completed';
  const progressPercent = (debate.current_round / debate.total_rounds) * 100;
  
  const userColor = debate.user_position === 'FOR' ? 'blue' : 'rose';
  const aiColor = debate.ai_position === 'FOR' ? 'blue' : 'rose';

  // Input placeholder logic
  let placeholder = 'Type your message here...';
  if (debate.current_round === 1) placeholder = 'Present your opening argument...';
  else if (debate.current_round === debate.total_rounds) placeholder = 'Deliver your closing statement...';
  else placeholder = "Counter the AI's argument...";

  return (
    <div className="h-screen max-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 overflow-hidden font-sans">
      {/* HEADER BAR */}
      <header className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 shadow-sm z-10">
        <div className="max-w-7xl mx-auto w-full flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-purple-600">
                MindFlip
              </span>
              <span className="hidden sm:inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                {debate.mode}
              </span>
            </div>
            
            {/* VS Indicator Center */}
            <div className="flex items-center space-x-4 bg-gray-50 dark:bg-gray-800 px-4 py-1.5 rounded-full border border-gray-200 dark:border-gray-700">
              <span className={`text-sm font-bold text-${userColor}-600 dark:text-${userColor}-400`}>YOU ({debate.user_position})</span>
              <span className="text-xs font-bold text-gray-400">VS</span>
              <span className={`text-sm font-bold text-${aiColor}-600 dark:text-${aiColor}-400`}>AI ({debate.ai_position})</span>
            </div>

            <div className="text-sm font-bold text-gray-700 dark:text-gray-300">
              Round {debate.current_round} / {debate.total_rounds}
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100 truncate">
              "{debate.topic}"
            </h1>
          </div>

          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 mt-2">
            <div 
              className="bg-primary-500 h-1.5 rounded-full transition-all duration-500 ease-in-out" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </header>

      {/* MAIN ARENA */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* LEFT SIDEBAR (USER) - Hidden on Mobile */}
        <div className={`hidden md:flex flex-col w-64 border-r border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 p-6 items-center`}>
          <div className={`w-20 h-20 rounded-full flex items-center justify-center bg-${userColor}-100 dark:bg-${userColor}-900/30 text-${userColor}-600 dark:text-${userColor}-400 shadow-sm border-4 border-white dark:border-gray-800 mb-4`}>
            <User className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{user?.name || 'You'}</h2>
          <span className={`mt-2 px-3 py-1 rounded-full text-xs font-bold bg-${userColor}-100 dark:bg-${userColor}-900/30 text-${userColor}-700 dark:text-${userColor}-300 border border-${userColor}-200 dark:border-${userColor}-800`}>
            {debate.user_position}
          </span>
          
          {!sending && !isCompleted && (
            <div className="mt-8 animate-pulse text-center">
              <span className="inline-block px-4 py-2 rounded-lg bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-300 font-bold text-sm shadow-sm">
                YOUR TURN
              </span>
            </div>
          )}
        </div>

        {/* CENTER (CHAT) */}
        <div className="flex-1 flex flex-col bg-transparent relative w-full h-full">
          {/* Subtle gradient background based on turns */}
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent to-gray-50/50 dark:to-gray-900/50 pointer-events-none"></div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 z-10 scroll-smooth">
            
            {messages.length === 0 && !sending && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-70">
                <PlayCircle className="w-16 h-16 text-gray-400" />
                <h3 className="text-xl font-medium text-gray-600 dark:text-gray-300">The arena is ready.</h3>
                <p className="text-gray-500 dark:text-gray-400">Make your opening argument to begin the debate.</p>
              </div>
            )}

            {messages.map((msg, idx) => {
              const isUser = msg.sender === 'user';
              const cardColor = isUser ? userColor : aiColor;
              const alignClass = isUser ? 'self-end ml-auto' : 'self-start mr-auto';
              
              return (
                <div key={msg.id || idx} className={`flex flex-col w-full max-w-[85%] md:max-w-[75%] ${alignClass} animate-in slide-in-from-bottom-2 fade-in duration-300`}>
                  <div className={`flex items-baseline space-x-2 mb-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      {isUser ? 'You' : 'MindFlip AI'}
                    </span>
                    <span className="text-[10px] text-gray-400">Round {msg.round_number}</span>
                  </div>
                  
                  <div className={`p-4 rounded-2xl shadow-sm border ${
                    isUser 
                      ? `bg-${cardColor}-500 text-white rounded-tr-none border-${cardColor}-600` 
                      : `bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none border-gray-200 dark:border-gray-700`
                  }`}>
                    <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.message}</p>
                  </div>
                </div>
              );
            })}

            {sending && (
              <div className="flex flex-col w-full max-w-[85%] self-start mr-auto animate-in fade-in">
                 <div className="flex items-baseline space-x-2 mb-1 justify-start">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      MindFlip AI
                    </span>
                  </div>
                <div className="p-4 rounded-2xl rounded-tl-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 w-24 h-12 flex items-center justify-center shadow-sm">
                  <div className="flex space-x-1.5">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* INPUT AREA */}
          <div className="p-4 md:p-6 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="max-w-4xl mx-auto">
              {isCompleted ? (
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="text-center sm:text-left">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">Debate Complete!</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">You have finished all rounds. Let's see how you did.</p>
                  </div>
                  <button 
                    onClick={handleFinishDebate}
                    disabled={finishing}
                    className="btn-primary px-8 py-3 rounded-lg bg-primary-600 text-white font-bold flex items-center shadow-lg hover:shadow-xl hover:bg-primary-700 transition-all disabled:opacity-70"
                  >
                    {finishing ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <FileText className="w-5 h-5 mr-2" />}
                    {finishing ? 'Generating Report...' : 'View Your Report'}
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={sending}
                    placeholder={sending ? "AI is thinking..." : placeholder}
                    className="w-full resize-none rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-4 pl-4 pr-16 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-shadow disabled:opacity-60 shadow-inner"
                    rows="3"
                  />
                  <div className="absolute right-3 bottom-3 flex items-center">
                    <span className="text-xs text-gray-400 mr-3 hidden sm:inline-block">
                      {input.length} chars
                    </span>
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || sending}
                      className="p-3 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR (AI) - Hidden on Mobile */}
        <div className={`hidden md:flex flex-col w-64 border-l border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 p-6 items-center`}>
          <div className={`w-20 h-20 rounded-full flex items-center justify-center bg-${aiColor}-100 dark:bg-${aiColor}-900/30 text-${aiColor}-600 dark:text-${aiColor}-400 shadow-sm border-4 border-white dark:border-gray-800 mb-4`}>
            <Bot className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">MindFlip AI</h2>
          <span className={`mt-2 px-3 py-1 rounded-full text-xs font-bold bg-${aiColor}-100 dark:bg-${aiColor}-900/30 text-${aiColor}-700 dark:text-${aiColor}-300 border border-${aiColor}-200 dark:border-${aiColor}-800`}>
            {debate.ai_position}
          </span>
          
          {sending && (
            <div className="mt-8 text-center text-sm font-medium text-gray-500 animate-pulse">
              Formulating response...
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DebateArena;
