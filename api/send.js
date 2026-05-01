const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { to, subject, html } = req.body;

        if (!to || !subject || !html) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const data = await resend.emails.send({
            // Note: Until you verify a domain in Resend, you MUST use this testing email address
            from: 'MaxCredible <onboarding@resend.dev>', 
            to: [to], // Note: Until you verify a domain, this MUST be your own email address!
            subject: subject,
            html: html,
        });

        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error("Email Dispatch Error:", error);
        return res.status(500).json({ error: error.message || 'Failed to send email' });
    }
};