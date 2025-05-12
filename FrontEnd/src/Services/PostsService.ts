import axios from 'axios';
import { TPost } from '../Types/TPost.ts';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8181';

export const getPostsByUser = async (userId: string): Promise<TPost[]> => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/posts/user/${userId}`, {
            headers: {
                'x-auth-token': token || '',
                'Accept': 'application/json'
            }
        });

        return response.data.map((post: any) => ({
            _id: post._id,
            content: post.content || '',
            image: post.image || undefined,
            userId: post.userId,
            likes: post.likes || [],
            likeCount: post.likeCount || post.likes?.length || 0,
            edited: post.edited || false,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt || post.createdAt,
            isLiked: post.likes?.includes(userId) || false,
            user: post.user || undefined
        }));
    } catch (error) {
        console.error('Error fetching posts:', error);
        throw error;
    }
};

export const createPost = async (postData: {
    content: string;
    image?: File;
}): Promise<TPost> => {
    try {
        const token = localStorage.getItem('token');
        const formData = new FormData();

        formData.append('content', postData.content);

        if (postData.image) {
            formData.append('image', postData.image);
        }

        const response = await axios.post(`${API_BASE_URL}/posts`, formData, {
            headers: {
                'x-auth-token': token || '',
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error creating post:', error);
        throw error;
    }
};

export const deletePost = async (postId: string): Promise<void> => {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_BASE_URL}/posts/${postId}`, {
        headers: { 'x-auth-token': token || '' }
    });
};

export const toggleLike = async (postId: string): Promise<TPost> => {
    const token = localStorage.getItem('token');
    const response = await axios.patch(
        `${API_BASE_URL}/posts/${postId}`,
        {},
        {
            headers: {
                'x-auth-token': token || ''
            }
        }
    );
    return response.data;
};