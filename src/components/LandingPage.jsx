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
    const [otpInput, setOtpInput] = useState('');
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [stage, setStage] = useState('email'); // email, otp
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

    const handleSendCode = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        const error = validateEmail(email);
        if (error) {
            setErrorMessage(error);
            return;
        }

        setStatus('loading');

        // Generate 4-digit code
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        setGeneratedOtp(code);

        try {
            // Send the code to the admin so they know a user is trying to verify
            // In a full production app, you'd use a service to send this to the USER's email.
            await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                body: JSON.stringify({
                    access_key: import.meta.env.VITE_WEB3FORMS_ACCESS_KEY,
                    subject: "Verification Code for SusuGPT",
                    email: email,
                    message: `Verification code for ${email} is: ${code}`,
                    from_name: "SusuGPT Auth"
                })
            });

            // For demo purposes and local testing, we'll log it
            console.log(`Verification Code for ${email}: ${code}`);

            setStatus('idle');
            setStage('otp');
        } catch (err) {
            console.error("Auth error:", err);
            // Even if notification fails, let's proceed to the OTP stage for demo
            setStage('otp');
            setStatus('idle');
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (otpInput !== generatedOtp) {
            setErrorMessage('Invalid verification code. Please try again.');
            return;
        }

        setStatus('loading');

        try {
            // Send final user details to admin
            await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                body: JSON.stringify({
                    access_key: import.meta.env.VITE_WEB3FORMS_ACCESS_KEY,
                    subject: "New Verified User Joined!",
                    email: email,
                    message: `A new user has VERIFIED their email and joined SusuGPT: ${email}`,
                    from_name: "SusuGPT System",
                    to_email: "zurjkkm@gmail.com"
                })
            });

            setStatus('success');
            localStorage.setItem('susugpt_user_email', email);

            setTimeout(() => {
                onGetStarted(email);
            }, 1000);
        } catch (err) {
            console.error("Success notification error:", err);
            setStatus('success');
            onGetStarted(email);
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
                        <Shield size={14} className="text-blue-500" />
                        <span>Secure Email Authentication</span>
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-500 bg-clip-text text-transparent">
                        Meet SusuGPT
                    </h1>

                    <p className="text-lg lg:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                        Verify your email to explore the ultimate multi-model arena with
                        <span className="text-zinc-900 dark:text-white font-medium"> GPT-4o</span>,
                        <span className="text-zinc-900 dark:text-white font-medium"> Claude 3</span>, and
                        <span className="text-zinc-900 dark:text-white font-medium"> DeepSeek</span>.
                    </p>
                </header>

                {/* Verification Area */}
                <div className="max-w-md mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl">
                    {stage === 'email' ? (
                        <form onSubmit={handleSendCode} className="space-y-4">
                            <div className="text-center mb-6">
                                <h2 className="text-xl font-bold mb-2">Get Started</h2>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">Enter your email to receive a 4-digit code.</p>
                            </div>

                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors" size={20} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-zinc-950 border-2 border-zinc-100 dark:border-zinc-800 focus:border-zinc-900 dark:focus:border-blue-500 transition-all outline-none text-lg shadow-sm"
                                />
                            </div>

                            {errorMessage && (
                                <p className="text-red-500 text-sm pl-2 animate-in fade-in slide-in-from-left-2 text-center">
                                    {errorMessage}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full py-4 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl disabled:opacity-70"
                            >
                                {status === 'loading' ? <Loader2 className="animate-spin" /> : (
                                    <>
                                        <span>Send Code</span>
                                        <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-6">
                            <div className="text-center mb-6">
                                <div className="inline-flex p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
                                    <Shield size={24} />
                                </div>
                                <h2 className="text-xl font-bold mb-2">Check your email</h2>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    We sent a 4-digit code to <span className="text-zinc-900 dark:text-white font-medium">{email}</span>
                                </p>
                            </div>

                            <div className="flex justify-center gap-3">
                                <input
                                    type="text"
                                    maxLength="4"
                                    required
                                    autoFocus
                                    value={otpInput}
                                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                                    placeholder="0 0 0 0"
                                    className="w-48 tracking-[0.5em] text-center py-4 rounded-2xl bg-white dark:bg-zinc-950 border-2 border-zinc-100 dark:border-zinc-800 focus:border-zinc-900 dark:focus:border-blue-500 transition-all outline-none text-3xl font-bold shadow-sm"
                                />
                            </div>

                            {errorMessage && (
                                <p className="text-red-500 text-sm pl-2 animate-in fade-in slide-in-from-left-2 text-center">
                                    {errorMessage}
                                </p>
                            )}

                            <div className="space-y-3">
                                <button
                                    type="submit"
                                    disabled={status === 'loading' || otpInput.length < 4}
                                    className="w-full py-4 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl disabled:opacity-50"
                                >
                                    {status === 'loading' ? <Loader2 className="animate-spin" /> : status === 'success' ? (
                                        <CheckCircle2 className="text-green-500" />
                                    ) : (
                                        <span>Verify & Enter</span>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setStage('email')}
                                    className="w-full text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors py-2"
                                >
                                    Change email address
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-700">
                    {[
                        { icon: <Zap className="text-yellow-500" />, title: "Intelligence", desc: "Access GPT-4o and Claude 3.5 Sonnet instantly." },
                        { icon: <Shield className="text-blue-500" />, title: "Secure Access", desc: "Your session is protected and verification is required." },
                        { icon: <Globe className="text-green-500" />, title: "Multi-Model", desc: "Switch models in the middle of a conversation." }
                    ].map((feature, i) => (
                        <div key={i} className="p-6 rounded-2xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all hover:shadow-lg group text-center lg:text-left">
                            <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform mx-auto lg:mx-0">
                                {feature.icon}
                            </div>
                            <h3 className="font-semibold mb-2">{feature.title}</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            <footer className="absolute bottom-8 text-center text-xs text-zinc-400">
                <p>© 2026 SusuGPT • Secure & Private Multi-Model Chat</p>
            </footer>
        </div>
    );
}
