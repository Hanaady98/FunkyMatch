import Post from "../models/post.schema.js";

/* ----- CREATE POST ----- */
const createPost = async (postData) => {
    try {
        const newPost = new Post(postData);
        await newPost.save();
        return newPost;
    } catch (err) {
        throw new Error(err.message);
    }
};

/* ----- GET USER'S POSTS ----- */
const getPostsByUser = async (userId) => {
    try {
        return await Post.find({ userId })
            .sort({ createdAt: -1 })
            .populate("userId", "username profileImage");
    } catch (err) {
        throw new Error(err.message);
    }
};

/* ----- GET ALL POSTS (ADMIN) ----- */
const getAllPosts = async () => {
    try {
        return await Post.find()
            .sort({ createdAt: -1 })
            .populate("userId", "username profileImage");
    } catch (err) {
        throw new Error(err.message);
    }
};

/* ----- UPDATE POST ----- */
const updatePost = async (postId, updateData) => {
    try {
        return await Post.findByIdAndUpdate(
            postId,
            {
                $set: {
                    ...updateData,
                    edited: true,
                    // Only update image if it was provided
                    ...(updateData.image !== undefined ? { image: updateData.image } : {})
                }
            },
            { new: true }
        ).populate("userId", "username profileImage");
    } catch (err) {
        throw new Error(err.message);
    }
};

/* ----- DELETE POST ----- */
const deletePost = async (postId) => {
    try {
        await Post.deleteOne({ _id: postId });
        return { message: "Post deleted successfully" };
    } catch (err) {
        throw new Error(err.message);
    }
};

/* ----- LIKE/UNLIKE POST ----- */
const toggleLike = async (postId, userId) => {
    try {
        const post = await Post.findById(postId);
        if (!post) throw new Error("Post not found");

        // Convert both IDs to string for comparison
        const userIdStr = userId.toString();
        const likeIndex = post.likes.findIndex(likeId =>
            likeId.toString() === userIdStr
        );

        if (likeIndex === -1) {
            // Like the post
            post.likes.push(userId);
        } else {
            // Unlike the post
            post.likes.splice(likeIndex, 1);
        }

        const updatedPost = await post.save();
        return updatedPost;
    } catch (err) {
        throw new Error(err.message);
    }
};

export { createPost, getPostsByUser, getAllPosts, updatePost, deletePost, toggleLike };