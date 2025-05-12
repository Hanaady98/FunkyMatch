import jwtDecode from "jwt-decode";
import { TDecodedToken } from "../Types/TDecodedToken";

export const decode = (token: string) => {
    if (!token) {
        throw new Error("No token provided");
    }

    try {
        // We Remove "Bearer" prefix if present
        const actualToken = token.startsWith("Bearer") ? token.split(" ")[1] : token;
        return jwtDecode(actualToken) as TDecodedToken;
    } catch (error) {
        console.error("Token decode error:", error);
        throw new Error("Invalid token format");
    }
};