const { put } = require('@vercel/blob');

// Disable the default body parser to handle raw file streams
module.exports.config = {
    api: {
        bodyParser: false,
    },
};

module.exports = async function handler(req, res) {
    // 1. Log that the route was hit
    console.log(`[API/UPLOAD] Received ${req.method} request`);

    // 2. Reject non-POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
    }

    try {
        // 3. Ensure the token exists
        const token = process.env.BLOB_READ_WRITE_TOKEN;
        if (!token) {
            console.error('[API/UPLOAD] FATAL: BLOB_READ_WRITE_TOKEN is missing from environment variables.');
            return res.status(500).json({ error: 'Server misconfiguration: Missing Blob Token.' });
        }

        // 4. Grab the filename from the query string
        const filename = req.query.filename || `logo-${Date.now()}.png`;
        console.log(`[API/UPLOAD] Attempting to upload: ${filename}`);

        // 5. Upload to Vercel Blob
        const blob = await put(filename, req, {
            access: 'public',
            token: token // Explicitly pass the token
        });

        console.log(`[API/UPLOAD] Success: Hosted at ${blob.url}`);
        return res.status(200).json(blob);
        
    } catch (error) {
        console.error("[API/UPLOAD] Vercel Blob Upload Error:", error);
        return res.status(500).json({ error: 'Failed to upload to Vercel Blob. Check Server Logs.' });
    }
};
