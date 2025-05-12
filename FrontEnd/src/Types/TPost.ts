export type TPost = {
    id: string;
    content: string;
    image?: {
        url: string;
        alt: string;
    };
    userId: string;
    likes?: string[];
    edited: boolean;
    createdAt: string;
    updatedAt: string;
    _id?: string;
};

export type TPostFormData = {
    existingImage: any;
    content: string;
    image?: File | null;
};