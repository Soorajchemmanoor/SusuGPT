import React, { useState, useEffect, useRef } from 'react';
import LandingPage from './components/LandingPage';

import { Send, User, Bot, Loader2, ChevronDown, Check, Copy, CheckCircle2, Paperclip, X, Plus, Trash2, PanelLeft, Users, Menu } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight, vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from './lib/utils';
import initialStats from './data/stats.json';

const API_KEY = import.meta.env.VITE_OPEN_ROUTER_API_KEY;

const MODELS = [
  { id: "openai/gpt-4o-mini", name: "GPT-4o mini", provider: "OpenAI", vision: true },
  { id: "deepseek/deepseek-chat", name: "DeepSeek V3", provider: "DeepSeek", vision: false },
  { id: "anthropic/claude-3-haiku", name: "Claude 3 Haiku", provider: "Anthropic", vision: true }
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
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem('susugpt_chats');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [visitorCount, setVisitorCount] = useState(initialStats.visitor_count);
  const [isLanding, setIsLanding] = useState(!localStorage.getItem('susugpt_user_email'));


  const messagesEndRef = useRef(null);
  const menuRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('susugpt_chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    if (currentChatId) {
      const activeChat = chats.find(c => c.id === currentChatId);
      if (activeChat) setMessages(activeChat.messages);
    } else {
      setMessages([]);
    }
  }, [currentChatId, chats]);

  // Personal Visit Counter Logic
  const hasIncremented = useRef(false);
  useEffect(() => {
    if (!hasIncremented.current) {
      const localVisits = parseInt(localStorage.getItem('susugpt_personal_visits') || "0") + 1;
      localStorage.setItem('susugpt_personal_visits', localVisits.toString());
      setVisitorCount(localVisits);
      hasIncremented.current = true;
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsSidebarOpen(true);
      else setIsSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsModelMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const startNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    setAttachedFiles([]);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const deleteChat = (e, id) => {
    e.stopPropagation();
    setChats(prev => prev.filter(c => c.id !== id));
    if (currentChatId === id) startNewChat();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedFiles(prev => [...prev, {
          name: file.name,
          type: file.type,
          data: reader.result
        }]);
      };
      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });
    e.target.value = null;
  };

  const removeFile = (index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!input.trim() && attachedFiles.length === 0) || isLoading) return;

    const currentFiles = [...attachedFiles];
    const userMessageContent = [];

    if (input.trim()) {
      userMessageContent.push({ type: "text", text: input });
    }

    currentFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        userMessageContent.push({
          type: "image_url",
          image_url: { url: file.data }
        });
      } else {
        userMessageContent[0] = userMessageContent[0] || { type: "text", text: "" };
        userMessageContent[0].text += `\n\n[File: ${file.name}]\n${file.data}`;
      }
    });

    const userMessage = {
      role: 'user',
      content: userMessageContent,
      displayContent: input,
      files: currentFiles
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setAttachedFiles([]);
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
          messages: newMessages.map(m => {
            if (m.role === 'user' && Array.isArray(m.content)) {
              if (!selectedModel.vision) {
                const text = m.content.find(c => c.type === 'text')?.text || "";
                return { role: m.role, content: text };
              }
              return { role: m.role, content: m.content };
            }
            return { role: m.role, content: m.content };
          }),
        })
      });

      const data = await response.json();
      const assistantMessage = {
        role: 'assistant',
        content: data.choices[0].message.content
      };

      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);

      if (!currentChatId) {
        const newChat = {
          id: Date.now().toString(),
          title: input.slice(0, 30) || "File/Image Chat",
          messages: finalMessages,
          date: new Date().toISOString()
        };
        setChats(prev => [newChat, ...prev]);
        setCurrentChatId(newChat.id);
      } else {
        setChats(prev => prev.map(chat =>
          chat.id === currentChatId ? { ...chat, messages: finalMessages } : chat
        ));
      }

    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error: Could not connect to the API.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLanding) {
    return <LandingPage onGetStarted={() => setIsLanding(false)} />;
  }

  return (
    <div className="flex h-screen bg-white dark:bg-[#171717] text-zinc-900 dark:text-zinc-100 transition-colors duration-200 overflow-hidden text-sm">

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && window.innerWidth < 1024 && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-[2px]"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:relative inset-y-0 left-0 z-50 bg-[#f9f9f9] dark:bg-[#171717] border-r border-zinc-200 dark:border-zinc-800 flex flex-col transition-all duration-300 transform",
        isSidebarOpen ? "w-[260px] translate-x-0" : "w-0 -translate-x-full lg:translate-x-0 lg:w-0 overflow-hidden"
      )}>
        <div className="p-3">
          <button
            onClick={startNewChat}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-[#2f2f2f] transition-colors group border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#171717]"
          >
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border border-zinc-900 dark:border-white flex items-center justify-center p-0.5">
                <Plus size={14} className="text-zinc-900 dark:text-white" />
              </div>
              <span className="font-medium">New Chat</span>
            </div>
            <PanelLeft size={16} className="text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-1">
          <div className="mt-4 mb-2 px-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Recent</div>
          {chats.map(chat => (
            <button
              key={chat.id}
              onClick={() => {
                setCurrentChatId(chat.id);
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center justify-between group px-3 py-2 rounded-lg transition-all text-left",
                currentChatId === chat.id ? "bg-zinc-200 dark:bg-[#2f2f2f]" : "hover:bg-zinc-100 dark:hover:bg-[#2f2f2f]/50"
              )}
            >
              <span className="truncate flex-1 pr-2">{chat.title}</span>
              <div onClick={(e) => deleteChat(e, chat.id)} className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 p-1 hover:text-red-500 transition-all">
                <Trash2 size={14} />
              </div>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
              <Users size={16} />
              <span className="text-xs font-medium">Your Visits: </span>
              <span className="text-xs font-bold font-mono px-2 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded-full text-zinc-900 dark:text-zinc-100">
                {visitorCount.toLocaleString()}
              </span>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('susugpt_user_email');
                window.location.reload();
              }}
              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-500 rounded-lg transition-colors"
              title="Logout"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative min-w-0">

        {/* Header */}
        <header className="flex items-center justify-between px-2 lg:px-4 py-3 sticky top-0 z-20 bg-white/80 dark:bg-[#171717]/80 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-1 lg:gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={cn(
                "p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors",
                isSidebarOpen && "text-zinc-400"
              )}
            >
              <Menu size={20} />
            </button>
            <span className="font-bold text-lg lg:text-xl tracking-tight text-zinc-900 dark:text-zinc-100">
              SusuGPT
            </span>
            <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-1 lg:mx-2" />
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
                className="flex items-center gap-1 px-2 lg:px-3 py-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group"
              >
                <span className="text-xs lg:text-sm font-medium text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 italic">
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
                        <span className="text-[11px] text-zinc-500">{model.provider} {model.vision ? "• Vision" : ""}</span>
                      </div>
                      {selectedModel.id === model.id && <Check size={16} className="text-zinc-900 dark:text-zinc-100" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* New Chat Button for Mobile */}
          <button
            onClick={startNewChat}
            className="lg:hidden p-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full shadow-md hover:scale-105 active:scale-95 transition-all"
            title="New Chat"
          >
            <Plus size={18} />
          </button>
        </header>

        {/* Global/Mobile Visitor Count Tooltip when sidebar is closed - Moved to Top */}
        {!isSidebarOpen && (
          <div className="absolute top-16 right-4 z-30 lg:top-16 lg:right-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2 px-2.5 py-1 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-full border border-zinc-200 dark:border-zinc-800 shadow-lg opacity-60 hover:opacity-100 transition-opacity">
              <span className="text-[10px] text-zinc-500">Your Visits:</span>
              <span className="text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-400">{visitorCount.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Main Chat Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-4">
              <div className="mb-8 p-3 rounded-full border border-zinc-200 dark:border-zinc-700">
                <Bot size={40} className="text-zinc-900 dark:text-zinc-100" />
              </div>
              <h2 className="text-xl lg:text-2xl font-semibold tracking-tight text-center">How can I help you today?</h2>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex gap-3 lg:gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300", msg.role === 'user' ? "justify-end" : "justify-start")}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0 mt-1">
                      <Bot size={18} />
                    </div>
                  )}
                  <div className={cn(
                    "max-w-[90%] lg:max-w-[85%] rounded-3xl text-[15px] leading-7",
                    msg.role === 'user'
                      ? "bg-[#f4f4f4] dark:bg-[#2f2f2f] text-zinc-900 dark:text-zinc-100 px-4 lg:px-5 py-2 lg:py-3 shadow-sm"
                      : "bg-transparent text-zinc-900 dark:text-zinc-100 py-2 prose dark:prose-invert prose-zinc prose-p:my-0 prose-pre:p-0 prose-pre:bg-transparent"
                  )}>
                    {msg.role === 'user' ? (
                      <div className="flex flex-col gap-2">
                        {msg.files && msg.files.map((file, idx) => (
                          <div key={idx} className="mb-2">
                            {file.type.startsWith('image/') ? (
                              <img src={file.data} alt="uploaded" className="max-w-full lg:max-w-xs rounded-xl border border-zinc-200 dark:border-zinc-700" />
                            ) : (
                              <div className="text-xs p-2 bg-white/50 dark:bg-black/20 rounded-lg border border-zinc-200/50 dark:border-zinc-700/50 italic">
                                📄 {file.name}
                              </div>
                            )}
                          </div>
                        ))}
                        <div className="break-words">{msg.displayContent || msg.content}</div>
                      </div>
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
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0">
                    <Bot size={18} className="animate-pulse" />
                  </div>
                  <div className="py-2 text-zinc-400 italic text-sm">Thinking...</div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </main>

        {/* Input Bar */}
        <footer className="w-full max-w-3xl mx-auto p-4 pb-12 lg:pb-8 space-y-4">
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 px-2 animate-in fade-in slide-in-from-bottom-2 duration-300 overflow-hidden">
              {attachedFiles.map((file, idx) => (
                <div key={idx} className="relative group">
                  {file.type.startsWith('image/') ? (
                    <img src={file.data} alt="preview" className="w-12 lg:w-16 h-12 lg:h-16 object-cover rounded-xl border-2 border-zinc-200 dark:border-zinc-700 shadow-sm" />
                  ) : (
                    <div className="w-12 lg:w-16 h-12 lg:h-16 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 text-[9px] p-1 text-center break-all shadow-sm">
                      {file.name}
                    </div>
                  )}
                  <button
                    onClick={() => removeFile(idx)}
                    className="absolute -top-2 -right-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full p-1 shadow-lg transition-opacity"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="relative bg-[#f4f4f4] dark:bg-[#2f2f2f] rounded-[26px] p-1.5 lg:p-2 pr-3 flex items-end shadow-sm border border-zinc-200/50 dark:border-zinc-700/50 group focus-within:ring-1 focus-within:ring-zinc-300 dark:focus-within:ring-zinc-600 transition-all">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 mb-1.5 ml-1 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors shrink-0"
            >
              <Paperclip size={20} />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder={`Message SusuGPT...`}
              className="flex-1 bg-transparent border-none outline-none resize-none py-3 px-2 text-[15px] max-h-40 min-h-[44px] placeholder-zinc-400"
              rows={1}
            />
            <div className="flex gap-2 pb-1.5 shrink-0">
              <button
                type="submit"
                disabled={(!input.trim() && attachedFiles.length === 0) || isLoading}
                className={cn(
                  "p-2 rounded-full transition-all duration-200",
                  (input.trim() || attachedFiles.length > 0)
                    ? "bg-black dark:bg-white text-white dark:text-black shadow-md scale-100"
                    : "text-zinc-300 dark:text-zinc-600 scale-95"
                )}
              >
                <Send size={18} />
              </button>
            </div>
          </form>
          <div className="text-center">
            <p className="text-[10px] lg:text-[11px] text-zinc-500 select-none">
              SusuGPT can make mistakes. Check important info.
            </p>
            <p className="text-[10px] mt-1 text-zinc-400 select-none">
              Developed by <a href="https://soorajp.com" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-600 dark:hover:text-zinc-200 underline transition-colors">Sooraj Puliyath</a>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
