const express = require('express');
const router = express.Router();
const { requireClerkAuth, extractClerkUser, clerkClient } = require('../middleware/clerkAuth');
const User = require('../models/User');

/**
 * Clerk Authentication Routes
 * Handles user sync and profile management with Clerk
 */

// @route   POST /api/clerk-auth/sync-user
// @desc    Sync Clerk user with local database
// @access  Protected (Clerk)
router.post('/sync-user', requireClerkAuth, extractClerkUser, async (req, res) => {
    try {
        const clerkUserId = req.clerkUserId;

        // Get user details from Clerk
        const clerkUser = await clerkClient.users.getUser(clerkUserId);

        // Extract user information
        const email = clerkUser.emailAddresses.find(e => e.id === clerkUser.primaryEmailAddressId)?.emailAddress;
        const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() ||
            clerkUser.username ||
            email?.split('@')[0] ||
            'User';

        // Check if user exists in our database
        let user = await User.findOne({ clerkId: clerkUserId });

        if (!user) {
            // Create new user in our database
            user = new User({
                clerkId: clerkUserId,
                name: name,
                email: email,
                bio: '',
                coins: 10, // Starting coins
                profilePicture: clerkUser.imageUrl || '',
                skillsOffered: [],
                skillsWanted: []
            });

            await user.save();

            return res.status(201).json({
                success: true,
                message: 'User created and synced successfully',
                data: {
                    userId: user._id,
                    clerkId: user.clerkId,
                    name: user.name,
                    email: user.email,
                    coins: user.coins,
                    profilePicture: user.profilePicture
                }
            });
        } else {
            // Update existing user
            user.name = name;
            user.email = email;
            user.profilePicture = clerkUser.imageUrl || user.profilePicture;
            user.lastActiveAt = new Date();

            await user.save();

            return res.json({
                success: true,
                message: 'User synced successfully',
                data: {
                    userId: user._id,
                    clerkId: user.clerkId,
                    name: user.name,
                    email: user.email,
                    coins: user.coins,
                    profilePicture: user.profilePicture
                }
            });
        }
    } catch (error) {
        console.error('User sync error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to sync user',
            error: error.message
        });
    }
});

// @route   GET /api/clerk-auth/me
// @desc    Get current user profile
// @access  Protected (Clerk)
router.get('/me', requireClerkAuth, extractClerkUser, async (req, res) => {
    try {
        const user = await User.findOne({ clerkId: req.clerkUserId })
            .populate('skillsOffered')
            .populate('skillsWanted');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found. Please sync your account first.'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/clerk-auth/session
// @desc    Verify Clerk session
// @access  Protected (Clerk)
router.get('/session', requireClerkAuth, extractClerkUser, async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Session is valid',
            data: {
                clerkUserId: req.clerkUserId,
                sessionId: req.clerkSessionId
            }
        });
    } catch (error) {
        console.error('Session verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Session verification failed',
            error: error.message
        });
    }
});

module.exports = router;
