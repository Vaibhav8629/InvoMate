const checkSubscription = async (req, res, next) => {
    try {
        // Ensure authMiddleware has run and req.user exists
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized - User not found" });
        }

        if (req.user.subscription === false) {
            return res.status(403).json({
                success: false,
                message: "Your subscription is inactive. Please contact admin."
            });
        }

        next();
    } catch (error) {
        console.error("Subscription check error:", error);
        return res.status(500).json({ success: false, message: "Server error during subscription check" });
    }
};

module.exports = checkSubscription;
