import React, { useState, useEffect, useRef } from 'react';
import {
    Mail, ArrowRight, Loader2, Bot, Shield, Zap,
    CheckCircle2, Globe, Sparkles, Lock, MessageSquare,
    Cpu, Layers, ShieldCheck, Headphones, Send,
    Menu, X, ChevronRight, Github, Twitter
} from 'lucide-react';

const TEMP_EMAIL_DOMAINS = [
    'mailinator.com', 'guerrillamail.com', 'yopmail.com', 'temp-mail.org',
    'dispostable.com', 'getnada.com', '10minutemail.com', 'tempmail.com',
    'sharklasers.com', 'guerrillamailblock.com', 'guerrillamail.net',
    'guerrillamail.org', 'guerrillamail.biz', 'spam4.me', 'grr.la'
];

export default function LandingPage({ onGetStarted }) {
    const [email, setEmail] = useState('');
    const [otpInput, setOtpInput] = useState('');
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [stage, setStage] = useState('email'); // email, otp
    const [status, setStatus] = useState('idle'); // idle, loading, success
    const [errorMessage, setErrorMessage] = useState('');

    // Feedback State
    const [feedback, setFeedback] = useState({ name: '', email: '', message: '' });
    const [feedbackStatus, setFeedbackStatus] = useState('idle');

    // Scroll tracking for Nav
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(email)) return 'Please enter a valid email address.';
        const domain = email.split('@')[1].toLowerCase();
        if (TEMP_EMAIL_DOMAINS.includes(domain)) return 'Temporary or fake email addresses are not allowed.';
        return null;
    };

    const handleSendCode = async (e) => {
        if (e) e.preventDefault();
        setErrorMessage('');
        const error = validateEmail(email);
        if (error) {
            setErrorMessage(error);
            return;
        }
        setStatus('loading');
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        setGeneratedOtp(code);

        try {
            const response = await fetch("/api/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code })
            });

            if (response.ok) {
                setStatus('idle');
                setStage('otp');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to send");
            }
        } catch (err) {
            console.error("Auth flow error:", err);
            setErrorMessage("We couldn't send the code. Please try again later or contact support.");
            setStatus('idle');
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        if (otpInput !== generatedOtp) {
            setErrorMessage('Invalid code. Please check your email.');
            return;
        }
        setStatus('loading');
        try {
            await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                body: JSON.stringify({
                    access_key: import.meta.env.VITE_WEB3FORMS_ACCESS_KEY,
                    subject: "New Verified User on SusuGPT",
                    message: `Verified User Alert: ${email} has successfully joined the platform.`,
                    from_name: "SusuGPT System Notifications",
                    to_email: "zurjkkm@gmail.com"
                })
            });
            setStatus('success');
            localStorage.setItem('susugpt_user_email', email);
            setTimeout(() => onGetStarted(email), 1500);
        } catch (err) {
            setStatus('success');
            onGetStarted(email);
        }
    };

    const handleFeedback = async (e) => {
        e.preventDefault();
        setFeedbackStatus('loading');
        try {
            await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                body: JSON.stringify({
                    access_key: import.meta.env.VITE_WEB3FORMS_ACCESS_KEY,
                    subject: "New Feedback - SusuGPT",
                    from_name: feedback.name,
                    email: feedback.email,
                    message: feedback.message,
                    to_email: "zurjkkm@gmail.com"
                })
            });
            setFeedbackStatus('success');
            setFeedback({ name: '', email: '', message: '' });
            setTimeout(() => setFeedbackStatus('idle'), 3000);
        } catch (err) {
            setFeedbackStatus('error');
        }
    };

    const scrollToAuth = () => {
        document.getElementById('auth-section').scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#050505] text-zinc-900 dark:text-zinc-100 font-sans selection:bg-zinc-900/10 dark:selection:bg-white/10 scroll-smooth">

            {/* Header / Nav */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 py-3' : 'bg-transparent py-6'}`}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                            <Bot className="text-white dark:text-black" size={18} />
                        </div>
                        <span className="text-xl font-black tracking-tighter">SusuGPT</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        {['Features', 'Security', 'Privacy', 'Contact'].map((item) => (
                            <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-bold text-zinc-500 hover:text-black dark:hover:text-white transition-colors">{item}</a>
                        ))}
                    </div>

                    <button
                        onClick={scrollToAuth}
                        className="px-5 py-2.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black text-sm font-black hover:scale-105 active:scale-95 transition-all shadow-lg dark:shadow-none"
                    >
                        Get Started
                    </button>
                </div>
            </nav>

            <main>
                {/* Hero Section */}
                <section className="relative pt-40 pb-20 px-6 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
                        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-zinc-500/5 rounded-full blur-[120px] animate-pulse-slow" />
                        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-zinc-500/5 rounded-full blur-[120px] animate-pulse-slow" />
                    </div>

                    <div className="max-w-7xl mx-auto text-center space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-[10px] font-black uppercase tracking-[0.2em] animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <Sparkles size={14} className="text-zinc-400" />
                            <span>The Next Generation of AI</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
                            Unified Intelligence.<br />
                            <span className="text-zinc-400 dark:text-zinc-600">Zero Compromise.</span>
                        </h1>

                        <p className="max-w-2xl mx-auto text-lg md:text-xl text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200 fill-mode-both">
                            Access GPT-4o, Claude 3.5, and DeepSeek-V3 in one seamless workspace.
                            Built for professionals who demand speed, security, and world-class reasoning.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 fill-mode-both">
                            <button
                                onClick={scrollToAuth}
                                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-black font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-2xl"
                            >
                                Enter Workspace
                                <ArrowRight size={20} />
                            </button>
                            <a href="#features" className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-black text-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all text-center">
                                Explore Features
                            </a>
                        </div>
                    </div>
                </section>

                {/* Uses & Capabilities */}
                <section id="features" className="py-24 px-6 bg-zinc-50 dark:bg-[#080808]">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16 space-y-4">
                            <h2 className="text-4xl md:text-5xl font-black tracking-tighter italic">Engineered for Excellence</h2>
                            <p className="text-zinc-500 font-medium max-w-xl mx-auto">One platform, endless possibilities. Switch between world-leading models mid-thought.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { icon: <Cpu />, title: 'Multi-Model Switch', desc: 'Seamlessly shift between GPT-4o, Claude, and DeepSeek in the same thread.' },
                                { icon: <Layers />, title: 'Context Retention', desc: 'Advanced state management that keeps your context alive across different models.' },
                                { icon: <Zap />, title: 'Ultra Low Latency', desc: 'Optimized routing for instantaneous responses across all supported AI backends.' },
                                { icon: <ShieldCheck />, title: 'Enterprise Privacy', desc: 'Your data is encrypted. We never train on your private conversations or inputs.' },
                                { icon: <MessageSquare />, title: 'Natural Dialogue', desc: 'Refined UI that focuses on clarity and long-form reasoning capabilities.' },
                                { icon: <Headphones />, title: 'Voice Interaction', desc: 'Speak to your AI and hear responses naturally with high-quality synthesis.' },
                                { icon: <Sparkles />, title: 'Vision & Analysis', desc: 'Complex image recognition and data analysis powered by multimodal foundations.' }
                            ].map((item, i) => (
                                <div key={i} className="group p-8 rounded-[32px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
                                    <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 text-zinc-900 dark:text-white group-hover:scale-110 group-hover:bg-black dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-all duration-500">
                                        {React.cloneElement(item.icon, { size: 24 })}
                                    </div>
                                    <h3 className="text-xl font-black mb-2 tracking-tight">{item.title}</h3>
                                    <p className="text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Steps Section */}
                <section className="py-24 px-6 relative">
                    <div className="max-w-5xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div className="space-y-8">
                                <h2 className="text-4xl md:text-5xl font-black tracking-tighter">Your Path to <br /><span className="text-zinc-900 dark:text-zinc-100">Superintelligence</span></h2>
                                <div className="space-y-10">
                                    {[
                                        { step: '01', title: 'Secure Invitation', desc: 'Enter your email to receive a high-security cryptographic code.' },
                                        { step: '02', title: 'Instant Verification', desc: 'Validate your identity with our two-step email authentication process.' },
                                        { step: '03', title: 'Experience SusuGPT', desc: 'Enter a distraction-free workspace of unified AI models and start building.' }
                                    ].map((s, i) => (
                                        <div key={i} className="flex gap-6 items-start">
                                            <span className="text-3xl font-black text-zinc-200 dark:text-zinc-800 tracking-tighter leading-none pt-1">{s.step}</span>
                                            <div className="space-y-1">
                                                <h4 className="text-lg font-black tracking-tight uppercase">{s.title}</h4>
                                                <p className="text-zinc-500 dark:text-zinc-400 font-medium">{s.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-zinc-500/5 blur-[60px] rounded-full group-hover:bg-zinc-500/10 transition-all" />
                                <div className="relative aspect-square rounded-[48px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 shadow-2xl overflow-hidden text-zinc-900 dark:text-zinc-100">
                                    <div className="h-full flex flex-col justify-between">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 animate-in fade-in slide-in-from-left-4 duration-500">
                                                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100">
                                                    <Bot size={20} />
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <div className="h-2 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
                                                    <div className="h-2 w-32 bg-zinc-100 dark:bg-zinc-900 rounded-full" />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 animate-in fade-in slide-in-from-left-4 duration-500 delay-150">
                                                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100">
                                                    <Zap size={20} />
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <div className="h-2 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
                                                    <div className="h-2 w-40 bg-zinc-100 dark:bg-zinc-900 rounded-full" />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 animate-in fade-in slide-in-from-left-4 duration-500 delay-300">
                                                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100">
                                                    <Sparkles size={20} />
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <div className="h-2 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
                                                    <div className="h-2 w-28 bg-zinc-100 dark:bg-zinc-900 rounded-full" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                            <div className="flex -space-x-2">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900 bg-zinc-200 dark:bg-zinc-800" />
                                                ))}
                                            </div>
                                            <div className="px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-widest">
                                                Workspace Active
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-4 -left-4 w-40 h-40 bg-zinc-500/5 rounded-full blur-3xl" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Security & Privacy */}
                <section id="security" className="py-24 px-6 bg-black text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-zinc-900/50 rounded-full blur-[120px]" />
                    <div className="max-w-7xl mx-auto relative z-10 text-center space-y-12">
                        <div className="space-y-4">
                            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">Fortified Security</h2>
                            <p className="text-zinc-500 font-medium max-w-xl mx-auto uppercase tracking-widest text-xs font-black">We take your privacy as seriously as you do</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="p-10 rounded-[40px] bg-zinc-900/50 border border-zinc-800 text-left space-y-6">
                                <Lock className="text-zinc-100" size={40} />
                                <h3 className="text-2xl font-black tracking-tight">Zero-Knowledge Principles</h3>
                                <p className="text-zinc-400 font-medium leading-relaxed">
                                    We do not store your chat logs beyond the current session unless you explicitly choose to save them.
                                    Our multi-layer verification prevents unauthorized access to your workspace.
                                </p>
                            </div>
                            <div id="privacy" className="p-10 rounded-[40px] bg-zinc-900/50 border border-zinc-800 text-left space-y-6">
                                <Shield className="text-zinc-100" size={40} />
                                <h3 className="text-2xl font-black tracking-tight">Verified Access Only</h3>
                                <p className="text-zinc-400 font-medium leading-relaxed">
                                    Traditional passwords are vulnerable. SusuGPT uses dynamically generated cryptographic tokens
                                    sent to your verified email for every new entry, ensuring only the owner can enter.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Auth Section */}
                <section id="auth-section" className="py-32 px-6 bg-zinc-50 dark:bg-[#050505]">
                    <div className="max-w-xl mx-auto">
                        <div className="bg-white dark:bg-zinc-900 p-10 md:p-12 rounded-[56px] border border-zinc-200 dark:border-zinc-800 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] dark:shadow-none space-y-10 group relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-zinc-200 via-zinc-400 to-zinc-200 dark:from-zinc-800 dark:via-zinc-600 dark:to-zinc-800 opacity-20 group-hover:opacity-100 transition-opacity duration-1000" />

                            {stage === 'email' ? (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="text-center space-y-3">
                                        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Mail className="text-zinc-900 dark:text-white" size={28} />
                                        </div>
                                        <h3 className="text-3xl font-black tracking-tighter italic">Unlock Intelligence</h3>
                                        <p className="text-zinc-500 font-medium">Claim your secure workspace access.</p>
                                    </div>

                                    <form onSubmit={handleSendCode} className="space-y-4">
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter your email"
                                            className="w-full px-6 py-5 rounded-3xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-black dark:focus:border-white outline-none text-lg font-bold transition-all shadow-inner"
                                        />
                                        {errorMessage && <p className="text-red-500 text-xs font-black uppercase text-center animate-shake tracking-widest">{errorMessage}</p>}
                                        <button
                                            type="submit"
                                            disabled={status === 'loading'}
                                            className="w-full py-5 rounded-3xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-black text-lg hover:scale-[1.02] active:scale-[.98] transition-all flex items-center justify-center gap-2 shadow-2xl"
                                        >
                                            {status === 'loading' ? <Loader2 className="animate-spin" /> : <><span>Start Your Journey</span><ChevronRight /></>}
                                        </button>
                                    </form>
                                </div>
                            ) : (
                                <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                                    <div className="text-center space-y-3">
                                        <div className="w-16 h-16 bg-zinc-50 border border-zinc-100 dark:bg-zinc-800 dark:border-zinc-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Lock className="text-zinc-900 dark:text-zinc-100" size={28} />
                                        </div>
                                        <h3 className="text-3xl font-black tracking-tighter italic">Verify Identity</h3>
                                        <p className="text-zinc-500 font-medium text-sm leading-relaxed px-4 text-center">
                                            We've sent a 4-digit security code to <br />
                                            <span className="text-black dark:text-white font-black">{email}</span>
                                        </p>
                                    </div>

                                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                                        <div className="flex justify-center">
                                            <input
                                                type="text"
                                                maxLength="4"
                                                required
                                                autoFocus
                                                value={otpInput}
                                                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                                                placeholder="0000"
                                                className="w-full max-w-[280px] tracking-[0.5em] text-center pl-[0.5em] py-7 rounded-[32px] bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-black dark:focus:border-white outline-none text-4xl font-black shadow-inner transition-all"
                                            />
                                        </div>
                                        {errorMessage && <p className="text-red-500 text-xs font-black uppercase text-center animate-shake tracking-widest">{errorMessage}</p>}
                                        <div className="space-y-3">
                                            <button
                                                type="submit"
                                                disabled={status === 'loading' || otpInput.length < 4}
                                                className="w-full py-5 rounded-3xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-black text-lg hover:scale-[1.02] active:scale-[.98] transition-all flex items-center justify-center gap-2 shadow-2xl"
                                            >
                                                {status === 'loading' ? <Loader2 className="animate-spin" /> : <span>Access Workspace</span>}
                                            </button>
                                            <button type="button" onClick={() => setStage('email')} className="w-full text-xs font-black text-zinc-400 hover:text-black dark:hover:text-white transition-colors uppercase tracking-widest">Wrong email?</button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Contact & Feedback */}
                <section id="contact" className="py-24 px-6 relative">
                    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
                        <div className="space-y-6">
                            <h2 className="text-4xl font-black tracking-tighter">Connection & <br />Support</h2>
                            <p className="text-zinc-500 font-medium leading-relaxed">
                                Have ideas, questions, or just want to tell us about your experience?
                                Your feedback shapes the future of SusuGPT.
                            </p>
                            <div className="space-y-4 pt-4">
                                <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400">
                                    <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center"><Mail size={18} /></div>
                                    <span className="font-bold">support@soorajp.com</span>
                                </div>
                                <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400">
                                    <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center"><Headphones size={18} /></div>
                                    <span className="font-bold">24/7 Priority Support</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 rounded-[40px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl">
                            <form onSubmit={handleFeedback} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text" required placeholder="Name"
                                        value={feedback.name} onChange={(e) => setFeedback({ ...feedback, name: e.target.value })}
                                        className="w-full px-5 py-4 rounded-2xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 outline-none font-bold placeholder:text-zinc-400 shadow-inner text-sm"
                                    />
                                    <input
                                        type="email" required placeholder="Email"
                                        value={feedback.email} onChange={(e) => setFeedback({ ...feedback, email: e.target.value })}
                                        className="w-full px-5 py-4 rounded-2xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 outline-none font-bold placeholder:text-zinc-400 shadow-inner text-sm"
                                    />
                                </div>
                                <textarea
                                    required placeholder="Your message or feedback..." rows="4"
                                    value={feedback.message} onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
                                    className="w-full px-5 py-4 rounded-2xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 outline-none font-bold placeholder:text-zinc-400 shadow-inner text-sm resize-none"
                                />
                                <button
                                    type="submit" disabled={feedbackStatus === 'loading'}
                                    className="w-full py-4 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-black flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-xl"
                                >
                                    {feedbackStatus === 'loading' ? <Loader2 className="animate-spin" /> : feedbackStatus === 'success' ? <div className="flex items-center gap-2"><CheckCircle2 className="text-zinc-900 dark:text-white" /><span>Sent Successfully</span></div> : <><span>Submit Intelligence Report</span><Send size={16} /></>}
                                </button>
                            </form>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="py-20 px-6 border-t border-zinc-100 dark:border-zinc-900">
                <div className="max-w-7xl mx-auto flex flex-col items-center space-y-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 w-full text-center md:text-left">
                        <div className="space-y-6 col-span-2 md:col-span-1">
                            <div className="flex items-center gap-2 justify-center md:justify-start">
                                <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center"><Bot className="text-white dark:text-black" size={18} /></div>
                                <span className="text-xl font-black tracking-tighter">SusuGPT</span>
                            </div>
                            <p className="text-zinc-500 font-medium text-sm leading-relaxed">
                                Redefining the boundaries of multi-model collaboration.
                                Secure, unified, and uncompromising.
                            </p>
                        </div>
                        <div className="space-y-6">
                            <h4 className="font-black text-xs uppercase tracking-widest text-zinc-400">Products</h4>
                            <ul className="space-y-4 text-sm font-bold text-zinc-500">
                                <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Workspace</a></li>
                                <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Intelligence Hub</a></li>
                            </ul>
                        </div>
                        <div className="space-y-6">
                            <h4 className="font-black text-xs uppercase tracking-widest text-zinc-400">Company</h4>
                            <ul className="space-y-4 text-sm font-bold text-zinc-500">
                                <li><a href="#about" className="hover:text-black dark:hover:text-white transition-colors">About Us</a></li>
                                <li><a href="#security" className="hover:text-black dark:hover:text-white transition-colors">Security</a></li>
                                <li><a href="#privacy" className="hover:text-black dark:hover:text-white transition-colors">Privacy Policy</a></li>
                            </ul>
                        </div>
                        <div className="space-y-6">
                            <h4 className="font-black text-xs uppercase tracking-widest text-zinc-400">Connect</h4>
                            <div className="flex items-center justify-center md:justify-start gap-4">
                                <a href="#" className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"><Twitter size={18} /></a>
                                <a href="#" className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"><Github size={18} /></a>
                            </div>
                        </div>
                    </div>

                    <div className="w-full flex flex-col md:flex-row items-center justify-between pt-12 border-t border-zinc-100 dark:border-zinc-900 space-y-6 md:space-y-0 text-center md:text-left">
                        <p className="text-xs font-black text-zinc-300 dark:text-zinc-700 uppercase tracking-widest leading-none">
                            © 2026 SusuGPT • Designed for the 1%
                        </p>
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">
                            <span>Designed by</span>
                            <a href="https://soorajp.com" target="_blank" rel="noopener noreferrer" className="text-zinc-900 dark:text-white hover:text-zinc-500 transition-colors">Sooraj Puliyath</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
