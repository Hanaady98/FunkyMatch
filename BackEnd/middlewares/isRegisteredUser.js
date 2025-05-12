import Post from "../posts/models/post.schema.js";
export const isRegisteredUser = (isPost) => async (req, res, next) => {
  try {
    // Skip checks for admins
    if (req.user.isAdmin) return next();

    if (isPost) {
      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      // We Compare ObjectIDs properly
      if (!post.userId.equals(req.user._id)) {
        return res.status(403).json({
          message: "You are not allowed to perform this action on this post!"
        });
      }
    } else {
      // For user profile operations
      if (req.user._id.toString() !== req.params.id) {
        return res.status(403).json({
          message: "You are not allowed to perform this action on this user profile!"
        });
      }
    }

    next();
  } catch (err) {
    console.error("Authorization error:", err);
    return res.status(500).json({
      message: "Error verifying authorization",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};