import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { sendChatMessage, clearChat } from '../features/ai/aiSlice';

const AIAdvisorPage = () => {
  const dispatch = useDispatch();
  const { chatHistory, isChatLoading, error } = useSelector((state) => state.ai);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isChatLoading]);

  const handleSend = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isChatLoading) return;
    dispatch(sendChatMessage(trimmed));
    setInput('');
  };

  const suggestedPrompts = [
    'How am I doing with my spending this month?',
    'What can I cut back on to save more?',
    'Am I on track with my savings goals?',
  ];

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Financial Advisor</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Ask anything about your finances. Grounded in your last 30 days of activity.
          </p>
        </div>
        {chatHistory.length > 0 && (
          <button
            onClick={() => dispatch(clearChat())}
            className="btn-secondary !py-2 !px-3 text-xs"
          >
            Clear chat
          </button>
        )}
      </div>

      <div className="glass-card flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {chatHistory.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <span className="mb-3 text-4xl">🤖</span>
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                Ask me about your spending, budgets, or savings goals.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestedPrompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => dispatch(sendChatMessage(p))}
                    className="rounded-full border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {chatHistory.map((turn, idx) => (
            <div key={idx} className={`flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  turn.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                }`}
              >
                {turn.content}
              </div>
            </div>
          ))}

          {isChatLoading && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-gray-100 dark:bg-gray-800 px-4 py-2.5 text-sm">
                <span className="inline-flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />
                </span>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        <form onSubmit={handleSend} className="flex gap-2 border-t border-gray-200 dark:border-gray-800 p-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your AI advisor anything…"
            className="input-field flex-1"
            disabled={isChatLoading}
          />
          <button type="submit" className="btn-primary" disabled={isChatLoading || !input.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIAdvisorPage;
