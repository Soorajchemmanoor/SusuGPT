export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({ message: 'Missing email or code' });
    }

    const resendKey = process.env.VITE_RESEND_API_KEY;

    if (!resendKey) {
        console.error("VITE_RESEND_API_KEY is not set in environment variables");
        return res.status(500).json({ message: 'Server configuration error' });
    }

    try {
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${resendKey}`
            },
            body: JSON.stringify({
                from: "SusuGPT Auth <auth@soorajp.com>",
                to: email,
                subject: "Your SusuGPT Verification Code",
                html: `
          <div style="font-family: sans-serif; max-width: 400px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h1 style="color: #333; text-align: center;">SusuGPT</h1>
            <div style="background: #f4f4f4; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #3b82f6;">${code}</span>
            </div>
            <p style="font-size: 14px; color: #999; text-align: center;">Enter this code on the landing page to continue.</p>
          </div>
        `
            })
        });

        const data = await response.json();

        if (response.ok) {
            return res.status(200).json({ success: true, id: data.id });
        } else {
            console.error("Resend API Error:", data);
            return res.status(response.status).json({ message: data.message || 'Failed to send email' });
        }
    } catch (error) {
        console.error("Serverless function error:", error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
