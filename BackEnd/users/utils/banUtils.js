// utils/banUtils.js
import UserBan from "../models/UserBanSchema.js";

/**
 * Calculates ban expiry date (null = permanent)
 */
export const calculateBanExpiry = (ban) => {
    if (ban.banDuration === "permanent") return null;

    const hours = ban.banDuration === "1h" ? 1 :
        ban.banDuration === "24h" ? 24 :
            ban.banDuration === "1w" ? 168 : 0;

    return new Date(ban.banStartDate.getTime() + hours * 60 * 60 * 1000);
};

/**
 * Checks if a user has an active ban
 */
export const checkActiveBan = async (userId) => {
    const ban = await UserBan.findOne({
        userId,
        banStartDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }).lean();

    if (!ban) return null;

    const expiry = calculateBanExpiry(ban);
    return (!expiry || expiry > new Date()) ? ban : null;
};