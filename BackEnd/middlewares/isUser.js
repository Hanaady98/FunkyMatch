/* checks if the user's id doesn't match the id in the URL or if the user is not an admin then throw an error */

export const isUser = (req, res, next) => {
    if (req.user._id !== req.params.id && !req.user.isAdmin) {
        return res.status(403).json(
            { message: "You are not allowed to perform this action, you are not the authorized user !!!" }
        );
    };
    return next();
};