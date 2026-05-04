const { neon } = require('@neondatabase/serverless');

module.exports = async function handler(req, res) {
    // 1. Strict Server-Side Authentication
    const authHeader = req.headers.authorization;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
        return res.status(500).json({ error: 'Server misconfiguration: ADMIN_PASSWORD not set.' });
    }

    if (!authHeader || authHeader !== `Bearer ${adminPassword}`) {
        return res.status(401).json({ error: 'Unauthorized.' });
    }

    try {
        // 2. Fetch the leads
        const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
        if (!connectionString) {
            return res.status(500).json({ error: 'Database connection string missing.' });
        }

        const sql = neon(connectionString);

        // Fetch all leads, newest first
        const leads = await sql`
            SELECT id, company_name, target_email, created_at 
            FROM leads 
            ORDER BY created_at DESC
        `;

        return res.status(200).json({ leads });
        
    } catch (error) {
        console.error("[API/LEADS] Database Error:", error);
        // If the table doesn't exist yet, return an empty array safely
        if (error.message.includes('relation "leads" does not exist')) {
            return res.status(200).json({ leads: [] });
        }
        return res.status(500).json({ error: 'Failed to query the database.' });
    }
};
