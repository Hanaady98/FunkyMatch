import jwt from 'jsonwebtoken';
import { SECRET_KEY } from './env.service.js';

/* Creates a JWT token */
const generateToken = (user) => {
    const { _id, isAdmin, isModerator } = user;
    if (!_id) {
        throw new Error("Cannot generate token - missing user ID");
    }
    const payloadData = { _id, isAdmin, isModerator };
    return jwt.sign(payloadData, SECRET_KEY,
        { expiresIn: "1d" }
    );
};

/*  Verifies the provided JWT token to ensure it’s valid and not expired, returning the decoded user data. */
const verifyToken = (tokenFromClient) => {
    try {
        const userData = jwt.verify(tokenFromClient, SECRET_KEY);
        return userData;
    } catch (error) {
        return null;
    };
};

export { generateToken, verifyToken };