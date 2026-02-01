/**
 * Clerk Authentication Middleware
 * Verifies Clerk session tokens and attaches user info to request
 */

let clerkClient = null;

// Try to initialize Clerk client if keys are available
try {
    if (process.env.CLERK_SECRET_KEY) {
        const { clerkClient: createClerkClient } = require('@clerk/clerk-sdk-node');
        clerkClient = createClerkClient({
            secretKey: process.env.CLERK_SECRET_KEY
        });
        console.log('✅ Clerk SDK initialized successfully');
    } else {
        console.warn('⚠️  Clerk Secret Key not found. Clerk authentication will not be available.');
    }
} catch (error) {
    console.error('❌ Failed to initialize Clerk SDK:', error.message);
    console.log('Clerk authentication routes will return errors until properly configured.');
}

// Middleware to require Clerk authentication
const requireClerkAuth = async (req, res, next) => {
    if (!clerkClient) {
        return res.status(503).json({
            success: false,
            message: 'Clerk authentication is not configured. Please check your environment variables.'
        });
    }

    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized - Missing authentication token'
            });
        }

        const token = authHeader.substring(7);

        // Verify the session token
        try {
            const session = await clerkClient.sessions.verifySession(token, token);

            if (!session) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized - Invalid session'
                });
            }

            req.auth = {
                userId: session.userId,
                sessionId: session.id
            };

            next();
        } catch (verifyError) {
            console.error('Session verification error:', verifyError.message);
            return res.status(401).json({
                success: false,
                message: 'Unauthorized - Invalid session token'
            });
        }
    } catch (error) {
        console.error('Clerk auth error:', error);
        return res.status(401).json({
            success: false,
            message: 'Unauthorized - Invalid or missing authentication'
        });
    }
};

/**
 * Custom middleware to extract Clerk user info
 * Use this after requireClerkAuth to get user details
 */
const extractClerkUser = async (req, res, next) => {
    try {
        if (req.auth && req.auth.userId) {
            // Clerk user ID is available in req.auth.userId
            req.clerkUserId = req.auth.userId;

            // You can also get the session ID
            req.clerkSessionId = req.auth.sessionId;

            next();
        } else {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }
    } catch (error) {
        console.error('Error extracting Clerk user:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication error',
            error: error.message
        });
    }
};

module.exports = {
    requireClerkAuth,
    extractClerkUser,
    clerkClient
};
