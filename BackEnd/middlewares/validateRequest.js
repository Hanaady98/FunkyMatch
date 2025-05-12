export const validateRequest = (req, res, next) => {
    const { groupId } = req.body;

    if (!groupId || typeof groupId !== "string") {
        return res.status(400).json({
            success: false,
            message: "Valid groupId (string) is required"
        });
    }

    next();
};
