import { put } from '@vercel/blob';

// We must disable the default body parser to handle raw file streams
export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // Grab the filename from the query string (passed by the frontend)
        const filename = req.query.filename || 'brand-logo.png';

        // Upload the raw request body directly to Vercel Blob
        const blob = await put(filename, req, {
            access: 'public',
        });

        // Return the blob object, which contains the new public URL
        return res.status(200).json(blob);
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to upload to Vercel Blob.' });
    }
}
