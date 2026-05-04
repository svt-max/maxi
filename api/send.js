const { Resend } = require('resend');
const { neon } = require('@neondatabase/serverless');

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'Server misconfiguration: Missing API Key.' });
        }

        const resend = new Resend(apiKey);
        const { to, subject, html, leadData } = req.body;

        if (!to || !subject || !html) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // --- LEAD GENERATION DB LOGIC (NEON) ---
        try {
            // Check for the standard Neon/Vercel env variables
            const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
            
            if (connectionString) {
                const sql = neon(connectionString);
                
                // Create the table if it doesn't exist
                await sql`
                    CREATE TABLE IF NOT EXISTS leads (
                        id SERIAL PRIMARY KEY,
                        company_name VARCHAR(255),
                        target_email VARCHAR(255),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                `;
                
                // Insert the lead
                if (leadData && leadData.companyName) {
                    await sql`
                        INSERT INTO leads (company_name, target_email)
                        VALUES (${leadData.companyName}, ${to})
                    `;
                    console.log(`[LEAD CAPTURED] Company: ${leadData.companyName}`);
                }
            } else {
                console.warn('[DB WARNING] No DATABASE_URL found. Skipping lead capture.');
            }
        } catch (dbError) {
            console.error('[DB ERROR] Failed to save lead:', dbError);
        }
        // ---------------------------------

        const data = await resend.emails.send({
            // Update this line to use your verified domain
            from: 'MaxCredible <noreply@maxi.maxcredible.com>', 
            to: [to], 
            subject: subject,
            html: html,
        });

        if (data.error) {
            return res.status(400).json({ error: data.error.message });
        }

        return res.status(200).json({ success: true, data });
        
    } catch (error) {
        console.error("[API/SEND] Internal Server Error:", error);
        return res.status(500).json({ error: error.message || 'Failed to process email dispatch.' });
    }
};
