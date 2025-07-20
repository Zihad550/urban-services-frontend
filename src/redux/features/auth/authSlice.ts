import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../../store";

export interface IUser {
    id: string;
    role: string;
    iat: number;
    exp: number;
}

export interface IAuthState {
    user: null | IUser;
    token: null | string;
}
const initialState: IAuthState = {
    user: null,
    token: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUser: (state, action) => {
            const { user, token } = action.payload;
            state.user = user;
            state.token = token;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
        },
    },
});

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;
export const selectToken = (state: RootState) => state.auth.token;
export const selectUser = (state: RootState) => state.auth.user;
