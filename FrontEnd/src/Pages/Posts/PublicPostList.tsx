import { useEffect, useState } from 'react';
import axios from 'axios';
import PostItem from './PostItem';
import { TPost } from '../../Types/TPost';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';
import { TRootState } from '../../Store/BigPie';

interface PublicPostListProps {
    userId: string;
}

const PublicPostList = ({ userId }: PublicPostListProps) => {
    const [posts, setPosts] = useState<TPost[]>([]);
    const [loading, setLoading] = useState(true);
    const currentUser = useSelector((state: TRootState) => state.UserSlice.user);

    const fetchPosts = async () => {
        try {
            const response = await axios.get(
                `http://localhost:8181/posts/public/user/${userId}`
            );
            const validatedPosts = response.data.map((post: any) => ({
                ...post,
                id: post.id || post._id,
                userId: post.userId?._id || post.userId,
                likes: post.likes || []
            }));
            setPosts(validatedPosts);
        } catch (error) {
            console.error("Failed to fetch posts:", error);
            Swal.fire('Error!', 'Failed to load posts', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePostUpdated = (updatedPost: TPost) => {
        setPosts(posts.map(post =>
            post.id === updatedPost.id ? updatedPost : post
        ));
    };

    const handlePostDeleted = (postId: string) => {
        setPosts(posts.filter(post => post.id !== postId));
    };

    useEffect(() => {
        fetchPosts();
    }, [userId]);

    if (loading) return <div className="py-4 text-center">Loading posts...</div>;

    return (
        <div className="mt-8">
            <hr className="my-6 border-gray-200" />
            <h2 className="mb-4 text-xl font-semibold">Posts</h2>
            <div className="mt-4 space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {posts.length === 0 ? (
                    <p className="text-gray-500">No posts yet.</p>
                ) : (
                    posts.map(post => (
                        <PostItem
                            key={post.id}
                            post={post}
                            isOwner={currentUser?._id === post.userId}
                            onPostUpdated={handlePostUpdated}
                            onPostDeleted={handlePostDeleted}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default PublicPostList;