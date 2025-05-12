import cron from 'node-cron';
import GroupBan from "../users/models/GroupBan.schema.js";
import ModLog from "../users/models/ModLog.schema.js";

const checkExpiredBans = async () => {
    const now = new Date();
    const expiredBans = await GroupBan.find({
        banDuration: { $ne: 'permanent' },
        banStartDate: {
            $lte: new Date(now - 7 * 24 * 60 * 60 * 1000)
        }
    });

    for (const ban of expiredBans) {
        await ban.remove();

        await ModLog.create({
            action: 'unban',
            moderator: null,
            targetUser: ban.userId,
            groupId: ban.groupId,
            details: 'Automatically expired',
            ipAddress: 'system'
        });
    }
};

cron.schedule('0 * * * *', checkExpiredBans);

export default checkExpiredBans;