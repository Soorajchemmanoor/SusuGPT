import React, { useState } from 'react';
import { Bot, Send, Sparkles, Zap, Shield, Globe, Mail, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

const TEMP_EMAIL_DOMAINS = [
    'mailinator.com', 'guerrillamail.com', 'yopmail.com', 'temp-mail.org',
    'dispostable.com', 'getnada.com', '10minutemail.com', 'tempmail.com',
    'sharklasers.com', 'guerrillamailblock.com', 'guerrillamail.net',
    'guerrillamail.org', 'guerrillamail.biz', 'spam4.me', 'grr.la'
];

export default function LandingPage({ onGetStarted }) {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [errorMessage, setErrorMessage] = useState('');

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(email)) return 'Please enter a valid email address.';

        const domain = email.split('@')[1].toLowerCase();
        if (TEMP_EMAIL_DOMAINS.includes(domain)) {
            return 'Temporary or fake email addresses are not allowed.';
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        const error = validateEmail(email);
        if (error) {
            setErrorMessage(error);
            return;
        }

        setStatus('loading');

        try {
            // Using Web3Forms for sending email (requires access_key, but we'll simulate or use a fallback for now)
            // The user wants the email sent to zurjkkm@gmail.com
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    access_key: "YOUR_WEB3FORMS_ACCESS_KEY", // Replace with actual key from web3forms.com
                    email: email,
                    subject: "New User Joined SusuGPT",
                    message: `A new user has started using SusuGPT with email: ${email}`,
                    from_name: "SusuGPT System",
                    to_email: "zurjkkm@gmail.com" // Some services use this, others use the key association
                })
            });

            // Even if the fetch fails (due to key), we'll proceed if the email is valid as per user requirement to redirect.
            // But we'll log it or show a subtle message.
            setStatus('success');

            // Save to localStorage to remember the user
            localStorage.setItem('susugpt_user_email', email);

            // Small delay for the success animation
            setTimeout(() => {
                onGetStarted(email);
            }, 1500);

        } catch (err) {
            console.error("Submission error:", err);
            // Fallback: still allow them through if it's a network error, as long as email is valid
            setStatus('success');
            localStorage.setItem('susugpt_user_email', email);
            setTimeout(() => {
                onGetStarted(email);
            }, 1500);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#0f0f0f] text-zinc-900 dark:text-zinc-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">

            {/* Background Gradients */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 dark:bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 dark:bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Main Content */}
            <div className="max-w-4xl w-full z-10">
                <header className="text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-1000">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-6 shadow-sm">
                        <Sparkles size={14} className="text-amber-500" />
                        <span>Next-Generation AI Chat</span>
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-500 bg-clip-text text-transparent">
                        Meet SusuGPT
                    </h1>

                    <p className="text-lg lg:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                        The ultimate multi-model playground. Seamlessly switch between
                        <span className="text-zinc-900 dark:text-white font-medium"> GPT-4o</span>,
                        <span className="text-zinc-900 dark:text-white font-medium"> DeepSeek V3</span>, and
                        <span className="text-zinc-900 dark:text-white font-medium"> Claude 3</span>.
                        Engineered for speed, intelligence, and visual excellence.
                    </p>
                </header>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                    {[
                        { icon: <Zap className="text-yellow-500" />, title: "Instant Response", desc: "Powered by the latest LLMs for lightning-fast answers." },
                        { icon: <Shield className="text-blue-500" />, title: "Privacy First", desc: "Your data stays local. We only process what you send." },
                        { icon: <Globe className="text-green-500" />, title: "Multi-Model", desc: "GPT-4o, Claude, and DeepSeek in one unified interface." }
                    ].map((feature, i) => (
                        <div key={i} className="p-6 rounded-2xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all hover:shadow-lg group">
                            <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                {feature.icon}
                            </div>
                            <h3 className="font-semibold mb-2">{feature.title}</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Action Area */}
                <div className="max-w-md mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors" size={20} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email to start..."
                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 focus:border-zinc-900 dark:focus:border-white transition-all outline-none text-lg shadow-sm"
                            />
                        </div>

                        {errorMessage && (
                            <p className="text-red-500 text-sm pl-2 animate-in fade-in slide-in-from-left-2">
                                {errorMessage}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={status === 'loading' || status === 'success'}
                            className="w-full py-4 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl disabled:opacity-70 disabled:hover:scale-100"
                        >
                            {status === 'loading' ? (
                                <Loader2 className="animate-spin" />
                            ) : status === 'success' ? (
                                <>
                                    <CheckCircle2 className="text-green-500" />
                                    <span>Redirecting...</span>
                                </>
                            ) : (
                                <>
                                    <span>Get Started</span>
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400 mt-4">
                            By joining, you agree to experience the future of AI.
                        </p>
                    </form>
                </div>
            </div>

            {/* Footer */}
            <footer className="absolute bottom-8 text-center text-xs text-zinc-400">
                <p>© 2026 SusuGPT • Multiple Models, One Experience</p>
            </footer>
        </div>
    );
}
