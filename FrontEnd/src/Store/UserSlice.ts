import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TUser } from "../Types/TUser.ts";

const initialState = {
    isLoggedIn: false,
    user: null as TUser | null,
};

// Load user from localStorage on init (if exists)
const loadUserFromLocalStorage = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        return {
            isLoggedIn: true,
            user: JSON.parse(storedUser),
        };
    }
    return initialState;
};

const userSlice = createSlice({
    name: "user",
    initialState: loadUserFromLocalStorage(),  // Load the user state on app start
    reducers: {
        login: (state: TUserState, action: PayloadAction<TUser>) => {
            state.isLoggedIn = true;
            state.user = action.payload;
            // Save user to localStorage
            localStorage.setItem('user', JSON.stringify(action.payload));
        },
        logout: (state: TUserState) => {
            state.isLoggedIn = false;
            state.user = null;
            // Remove user from localStorage
            localStorage.removeItem('user');
        },
    },
});

export const userActions = userSlice.actions;
export default userSlice.reducer;
export type TUserState = typeof initialState;
export type TUserPayload = { userName: string };