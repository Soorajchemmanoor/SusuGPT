import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Loader2, ChevronDown, Check, Copy, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight, vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from './lib/utils';

const API_KEY = import.meta.env.VITE_OPEN_ROUTER_API_KEY;


const MODELS = [
  { id: "openai/gpt-4o-mini", name: "GPT-4o mini", provider: "OpenAI" },
  { id: "deepseek/deepseek-chat", name: "DeepSeek V3", provider: "DeepSeek" },
  { id: "anthropic/claude-3-haiku", name: "Claude 3 Haiku", provider: "Anthropic" }
];

const CodeBlock = ({ children, language }) => {
  const [copied, setCopied] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark') ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(isDarkMode);

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const onCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 shadow-sm bg-zinc-50 dark:bg-zinc-900">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
        <span className="text-xs font-mono text-zinc-500">{language}</span>
        <button
          onClick={onCopy}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          {copied ? (
            <>
              <CheckCircle2 size={14} className="text-green-500" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        children={children}
        style={isDark ? vscDarkPlus : oneLight}
        language={language}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: 0,
          padding: '1rem',
          fontSize: '13px',
          background: 'transparent'
        }}
      />
    </div>
  );
};

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const menuRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsModelMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "SusuGPT",
        },
        body: JSON.stringify({
          model: selectedModel.id,
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
        })
      });

      const data = await response.json();
      const assistantMessage = {
        role: 'assistant',
        content: data.choices[0].message.content
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error: Could not connect to the API. Check your .env file.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-[#212121] text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      {/* Header with Model Selector */}
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-20 bg-white/80 dark:bg-[#212121]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            SusuGPT
          </span>
          <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-[#2f2f2f] transition-colors group"
            >
              <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 italic transition-colors">
                {selectedModel.name}
              </span>
              <ChevronDown size={14} className="text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
            </button>

            {isModelMenuOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-[#2f2f2f] border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 p-2">
                {MODELS.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model);
                      setIsModelMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group"
                  >
                    <div className="flex flex-col items-start translate-y-[-1px]">
                      <span className="text-[14px] font-medium">{model.name}</span>
                      <span className="text-[11px] text-zinc-500">{model.provider}</span>
                    </div>
                    {selectedModel.id === model.id && <Check size={16} className="text-zinc-900 dark:text-zinc-100" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-4">
            <div className="mb-8 p-3 rounded-full border border-zinc-200 dark:border-zinc-700">
              <Bot size={40} className="text-zinc-900 dark:text-zinc-100" />
            </div>
            <h2 className="text-2xl font-semibold mb-8 tracking-tight text-center">How can I help you today?</h2>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex gap-5", msg.role === 'user' ? "justify-end" : "justify-start")}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0 mt-1">
                    <Bot size={18} />
                  </div>
                )}
                <div className={cn(
                  "max-w-[85%] rounded-3xl text-[15px] leading-7 prose dark:prose-invert prose-zinc prose-p:my-0 prose-pre:p-0 prose-pre:bg-transparent",
                  msg.role === 'user'
                    ? "bg-[#f4f4f4] dark:bg-[#2f2f2f] text-zinc-900 dark:text-zinc-100 px-5 py-3"
                    : "bg-transparent text-zinc-900 dark:text-zinc-100 py-2"
                )}>
                  {msg.role === 'user' ? (
                    msg.content
                  ) : (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ node, inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || '');
                          return !inline && match ? (
                            <CodeBlock language={match[1]}>
                              {String(children).replace(/\n$/, '')}
                            </CodeBlock>
                          ) : (
                            <code className={cn("px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 font-mono text-sm", className)} {...props}>
                              {children}
                            </code>
                          );
                        }
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-5">
                <div className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0">
                  <Bot size={18} className="animate-pulse" />
                </div>
                <div className="py-3">
                  <Loader2 size={18} className="animate-spin text-zinc-400" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input Bar */}
      <footer className="w-full max-w-3xl mx-auto p-4 pb-8">
        <form onSubmit={handleSubmit} className="relative bg-[#f4f4f4] dark:bg-[#2f2f2f] rounded-[26px] p-2 pr-3 flex items-end shadow-sm">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={`Message ${selectedModel.name.split(' ')[0]}`}
            className="flex-1 bg-transparent border-none outline-none resize-none py-3 px-2 text-[15px] max-h-40 min-h-[44px]"
            rows={1}
          />
          <div className="flex gap-2 pb-1.5">
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={cn(
                "p-2 rounded-full transition-all duration-200",
                input.trim()
                  ? "bg-black dark:bg-white text-white dark:text-black"
                  : "text-zinc-300 dark:text-zinc-600"
              )}
            >
              <Send size={18} />
            </button>
          </div>
        </form>
        <div className="text-center mt-3">
          <p className="text-[11px] text-zinc-500">
            {selectedModel.provider} can make mistakes. Check important info.
          </p>
        </div>
      </footer>
    </div>
  );
}
