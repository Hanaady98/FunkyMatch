import { useEffect, useState } from 'react';
import axios from 'axios';
import PostItem from './PostItem';
import { TPost } from '../../Types/TPost.ts';
import Swal from 'sweetalert2';
import PostForm from './PostsForm/PostsForm.tsx';
import { useSelector } from 'react-redux';
import { TRootState } from '../../Store/BigPie';

interface PostListProps {
    userId: string;
    isOwner: boolean;
}

const PostList = ({ userId, isOwner }: PostListProps) => {
    const [posts, setPosts] = useState<TPost[]>([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');
    const currentUser = useSelector((state: TRootState) => state.UserSlice.user);

    const fetchPosts = async () => {
        try {
            const response = await axios.get(`http://localhost:8181/posts/public/user/${userId}`);
            const validatedPosts = response.data.map((post: any) => ({
                ...post,
                id: post.id || post._id,
                userId: post.userId?._id || post.userId
            }));
            setPosts(validatedPosts);
        } catch (error) {
            console.error("Failed to fetch posts:", error);
            Swal.fire('Error!', 'Failed to load posts', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [userId, token]);

    const handlePostCreated = (newPost: TPost) => {
        setPosts(prev => [newPost, ...prev]);
    };

    const handlePostUpdated = (updatedPost: TPost) => {
        setPosts(prev => prev.map(post =>
            post.id === updatedPost.id ? {
                ...updatedPost,
                userId: post.userId
            } : post
        ));
    };

    const handlePostDeleted = (postId: string) => {
        setPosts(prev => prev.filter(post => post.id !== postId));
    };

    if (loading) return <div className="py-4 text-center">Loading posts...</div>;

    return (
        <div className="mt-8">
            <hr className="my-6 border-gray-200" />
            <h2 className="mb-4 text-xl font-semibold">Posts</h2>

            {isOwner && <PostForm onPostCreated={handlePostCreated} />}

            <div className="mt-4 space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {posts.length === 0 ? (
                    <p className="text-gray-500">No posts yet.</p>
                ) : (
                    posts.map(post => (
                        <PostItem
                            key={post.id}
                            post={post}
                            isOwner={isOwner && currentUser?._id?.toString() === post.userId?.toString()}
                            onPostUpdated={handlePostUpdated}
                            onPostDeleted={handlePostDeleted}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default PostList;