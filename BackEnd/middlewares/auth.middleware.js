import { verifyToken } from "../services/auth.service.js";
import { checkActiveBan } from "../users/utils/banUtils.js";

export const auth = async (req, res, next) => {
    try {
        // 1. Token Verification
        const tokenFromClient = req.header("x-auth-token");
        const userData = verifyToken(tokenFromClient);
        if (!userData || !tokenFromClient) {
            throw new Error("Authentication failed: Missing or invalid token.");
        };

        // 2. Ban Check (Now using utility)
        const activeBan = await checkActiveBan(userData._id);
        if (activeBan) {
            throw new Error(
                `Account banned until ${activeBan.banExpiry || "permanently"}. ` +
                `Reason: ${activeBan.banReason}`
            );
        }

        // 3. Proceed
        req.user = userData;
        next();
    } catch (error) {
        return res.status(401).json({
            message: error.message,
            isBanError: error.message.includes("banned")
        });
    }
};