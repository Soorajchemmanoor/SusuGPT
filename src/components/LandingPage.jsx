import React, { useState } from 'react';
import { Mail, ArrowRight, Loader2, Bot, Shield, Zap, CheckCircle2, Globe, Sparkles } from 'lucide-react';

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
        console.log("Attempting to send code to:", email);

        const error = validateEmail(email);
        if (error) {
            setErrorMessage(error);
            return;
        }

        setStatus('loading');

        // 1. Generate 4-digit code
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        setGeneratedOtp(code);

        try {
            // 2. Call Vercel Serverless Function to send OTP via Resend
            const response = await fetch("/api/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code })
            });

            if (response.ok) {
                console.log("Serverless Mail Success!");
                setStatus('idle');
                setStage('otp');
            } else {
                const errorData = await response.json();
                console.error("Serverless Error:", errorData);
                throw new Error(errorData.message || "Failed to send");
            }
        } catch (err) {
            console.error("Auth flow error:", err);
            // Fallback for development (if not yet deployed to Vercel)
            console.log(`%c [DEBUG] Code for ${email}: ${code}`, "color: white; background: #3b82f6; font-size: 1.2rem; padding: 10px; border-radius: 5px; font-weight: bold;");

            setErrorMessage("Email delivery failed. If not deployed on Vercel, check browser console (F12) for the code.");
            setStatus('idle');
            setStage('otp');
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
            // 1. [FLOW] Notify ADMIN (zurjkkm@gmail.com) upon successful verification
            // Using Web3Forms for the admin notification as requested.
            await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                body: JSON.stringify({
                    access_key: import.meta.env.VITE_WEB3FORMS_ACCESS_KEY,
                    subject: "New Verified User on SusuGPT",
                    message: `Verified User Alert: ${email} has successfully verified their account and joined the platform.`,
                    from_name: "SusuGPT System Notifications",
                    to_email: "zurjkkm@gmail.com"
                })
            });

            console.log(`%c [ADMIN NOTIFIED] Success sent for ${email}`, "color: #10b981; font-weight: bold;");

            setStatus('success');
            localStorage.setItem('susugpt_user_email', email);

            setTimeout(() => {
                onGetStarted(email);
            }, 1500);
        } catch (err) {
            console.error("Verification callback error:", err);
            // Even if admin notification fails, we allow the user to proceed
            setStatus('success');
            onGetStarted(email);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-[#050505] text-zinc-900 dark:text-zinc-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-blue-500/30">

            {/* Premium Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-15%] left-[-10%] w-[60%] h-[60%] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-15%] right-[-10%] w-[60%] h-[60%] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-[120px] animate-pulse-slow" />

                {/* Floating decor */}
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/20 rounded-full animate-bounce [animation-delay:700ms]" />
                <div className="absolute bottom-1/4 right-1/3 w-3 h-3 bg-purple-400/20 rounded-full animate-bounce [animation-delay:1000ms]" />
            </div>

            <div className="max-w-6xl w-full z-10 flex flex-col items-center py-12">
                {/* Logo & Headline */}
                <div className="text-center mb-16 space-y-6 animate-in fade-in slide-in-from-top-12 duration-1000 ease-out">
                    <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/80 dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 text-[13px] font-bold text-zinc-600 dark:text-zinc-400 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] dark:shadow-none hover:scale-105 transition-transform cursor-default">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        <span className="tracking-tight">Multi-Model Intelligence v1.2</span>
                    </div>

                    <h1 className="text-7xl md:text-9xl font-black tracking-tighter bg-gradient-to-b from-zinc-950 via-zinc-800 to-zinc-700 dark:from-white dark:via-zinc-200 dark:to-zinc-500 bg-clip-text text-transparent leading-none drop-shadow-sm">
                        SusuGPT
                    </h1>

                    <p className="text-xl md:text-2xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto font-medium tracking-tight leading-snug px-4">
                        The world's most capable AI models,
                        <span className="text-zinc-950 dark:text-white"> unified </span>
                        in a single premium interface.
                    </p>
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 w-full max-w-5xl items-center">

                    {/* Left Side: Feature Cards */}
                    <div className="lg:col-span-7 grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-left-12 duration-1000 delay-500 fill-mode-both">
                        {[
                            {
                                icon: <Zap className="text-blue-500" />,
                                title: "Intelligence",
                                desc: "Access GPT-4o, Claude 3.5 Sonnet, and DeepSeek-V3 instantly.",
                                color: "bg-blue-500/5"
                            },
                            {
                                icon: <Shield className="text-purple-500" />,
                                title: "Secure Access",
                                desc: "End-to-end encryption with mandatory 2-step email verification.",
                                color: "bg-purple-500/5"
                            },
                            {
                                icon: <Globe className="text-emerald-500" />,
                                title: "Multi-Model",
                                desc: "Switch between world-class models mid-conversation seamlessly.",
                                color: "bg-emerald-500/5"
                            }
                        ].map((feature, i) => (
                            <div key={i} className="group p-6 rounded-[32px] bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md border border-white dark:border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:hover:bg-zinc-900/60 transition-all duration-500 flex items-start gap-5">
                                <div className={`p-4 rounded-2xl ${feature.color} group-hover:scale-110 transition-transform duration-500`}>
                                    {feature.icon}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black tracking-tight">{feature.title}</h3>
                                    <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right Side: Auth Card */}
                    <div className="lg:col-span-5 animate-in fade-in slide-in-from-right-12 duration-1000 delay-700 fill-mode-both">
                        <div className="bg-white/90 dark:bg-zinc-900/70 backdrop-blur-2xl p-8 md:p-10 rounded-[48px] border border-white dark:border-zinc-800 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] dark:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] relative overflow-hidden group">

                            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                            {stage === 'email' ? (
                                <form onSubmit={handleSendCode} className="space-y-8">
                                    <div className="space-y-3 text-center">
                                        <div className="w-16 h-16 bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-500">
                                            <Mail className="text-blue-500" size={32} />
                                        </div>
                                        <h3 className="text-2xl font-black tracking-tight">Access Pro</h3>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Enter your email to receive an invitation.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="relative group/input">
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="name@example.com"
                                                className="w-full px-6 py-5 rounded-[24px] bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 focus:border-blue-500 dark:focus:border-blue-500 outline-none text-lg font-bold transition-all placeholder:text-zinc-300 dark:placeholder:text-zinc-700 shadow-inner"
                                            />
                                        </div>

                                        {errorMessage && (
                                            <p className="text-red-500 text-[11px] font-bold uppercase tracking-widest text-center animate-shake">
                                                {errorMessage}
                                            </p>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={status === 'loading'}
                                            className="w-full py-5 rounded-[24px] bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] dark:shadow-none disabled:opacity-50 relative overflow-hidden group/btn"
                                        >
                                            {status === 'loading' ? (
                                                <Loader2 className="animate-spin" />
                                            ) : (
                                                <>
                                                    <span>Get Invitation</span>
                                                    <ArrowRight size={22} className="group-hover/btn:translate-x-1 transition-transform" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={handleVerifyOtp} className="space-y-8">
                                    <div className="text-center space-y-4">
                                        <div className="inline-flex p-5 rounded-[32px] bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-2">
                                            <Shield size={40} />
                                        </div>
                                        <h3 className="text-2xl font-black tracking-tight">Verify Identity</h3>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                                            Check your inbox for the security code sent to <br />
                                            <span className="text-zinc-950 dark:text-white font-bold">{email}</span>
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex justify-center">
                                            <input
                                                type="text"
                                                maxLength="4"
                                                required
                                                autoFocus
                                                value={otpInput}
                                                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                                                placeholder="0000"
                                                className="w-56 tracking-[0.8em] text-center py-6 rounded-3xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 focus:border-blue-500 outline-none text-4xl font-black shadow-inner"
                                            />
                                        </div>

                                        {errorMessage && (
                                            <p className="text-red-500 text-[11px] font-bold uppercase tracking-widest text-center animate-shake">
                                                {errorMessage}
                                            </p>
                                        )}

                                        <div className="space-y-4">
                                            <button
                                                type="submit"
                                                disabled={status === 'loading' || otpInput.length < 4}
                                                className="w-full py-5 rounded-[24px] bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-2xl disabled:opacity-30"
                                            >
                                                {status === 'loading' ? (
                                                    <Loader2 className="animate-spin" />
                                                ) : status === 'success' ? (
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle2 className="text-green-500" />
                                                        <span>Verified</span>
                                                    </div>
                                                ) : (
                                                    <span>Open SusuGPT</span>
                                                )}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setStage('email')}
                                                className="w-full text-xs font-bold text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors uppercase tracking-[0.2em]"
                                            >
                                                Change email address
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Trust Indicators */}
                <div className="mt-20 flex flex-wrap justify-center gap-10 opacity-30 grayscale hover:grayscale-0 hover:opacity-60 transition-all duration-700 animate-in fade-in slide-in-from-bottom-8 delay-[1200ms] fill-mode-both">
                    {[
                        { icon: <Shield size={18} />, label: "Enterprise Security" },
                        { icon: <Globe size={18} />, label: "Global AI Integration" }
                    ].map((badge, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm font-black tracking-[0.15em] uppercase whitespace-nowrap">
                            {badge.icon}
                            <span>{badge.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <footer className="absolute bottom-6 w-full text-center space-y-2 z-20">
                <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.4em]">
                    © 2026 SusuGPT • The Future of Intelligence is Unified
                </p>
                <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em]">
                    Developed by <a href="https://soorajp.com" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">Sooraj Puliyath</a>
                </p>
            </footer>
        </div>
    );
}
