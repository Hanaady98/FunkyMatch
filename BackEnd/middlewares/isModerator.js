const isModerator = (req, res, next) => {
    console.log("User in isModerator:", req.user);

    if (!req.user?.isModerator) {
        return res.status(403).json({
            message: "Moderator privileges required",
            yourRole: {
                isModerator: req.user?.isModerator
            }
        });
    }
    next();
};

export default isModerator;