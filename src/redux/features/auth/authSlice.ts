import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
    createUserWithEmailAndPassword,
    getIdToken,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile,
    type User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../../../services/firebase';
import type { AuthState, AuthUser, LoginCredentials, RegisterData, User } from "../../../types/user";
import type { RootState } from "../../store";

// Initialize Google provider
const googleProvider = new GoogleAuthProvider();

// Types for async thunk return values
interface AuthResult {
    firebaseUser: AuthUser;
    idToken: string;
}

interface AuthStateChangePayload {
    firebaseUser: AuthUser | null;
    user: User | null;
}

// Helper function to convert Firebase user to AuthUser
const convertFirebaseUser = (firebaseUser: FirebaseUser): AuthUser => ({
    uid: firebaseUser.uid,
    email: firebaseUser.email!,
    displayName: firebaseUser.displayName ?? undefined,
    photoURL: firebaseUser.photoURL ?? undefined,
    emailVerified: firebaseUser.emailVerified,
});

// Async thunks for authentication operations
export const loginWithEmail = createAsyncThunk<
    AuthResult,
    LoginCredentials,
    { rejectValue: string }
>(
    'auth/loginWithEmail',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            const idToken = await getIdToken(result.user);
            localStorage.setItem('idToken', idToken);

            return {
                firebaseUser: convertFirebaseUser(result.user),
                idToken
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Login failed';
            return rejectWithValue(message);
        }
    }
);

export const registerWithEmail = createAsyncThunk<
    AuthResult,
    RegisterData,
    { rejectValue: string }
>(
    'auth/registerWithEmail',
    async ({ email, password, displayName, role, phoneNumber }, { rejectWithValue }) => {
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);

            // Update profile with display name
            if (displayName) {
                await updateProfile(result.user, { displayName });
            }

            const idToken = await getIdToken(result.user);
            localStorage.setItem('idToken', idToken);

            // Save user to backend
            const userData = { email, displayName, role, phoneNumber };
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users`, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                throw new Error('Failed to save user to backend');
            }

            return {
                firebaseUser: convertFirebaseUser(result.user),
                idToken
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Registration failed';
            return rejectWithValue(message);
        }
    }
);

export const loginWithGoogle = createAsyncThunk<
    AuthResult,
    void,
    { rejectValue: string }
>(
    'auth/loginWithGoogle',
    async (_, { rejectWithValue }) => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const idToken = await getIdToken(result.user);
            localStorage.setItem('idToken', idToken);

            // Save user to backend
            const userData = {
                email: result.user.email,
                displayName: result.user.displayName
            };
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users`, {
                method: 'PUT',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                throw new Error('Failed to save user to backend');
            }

            return {
                firebaseUser: convertFirebaseUser(result.user),
                idToken
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Google login failed';
            return rejectWithValue(message);
        }
    }
);

export const logoutUser = createAsyncThunk<
    null,
    void,
    { rejectValue: string }
>(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await signOut(auth);
            localStorage.removeItem('idToken');
            return null;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Logout failed';
            return rejectWithValue(message);
        }
    }
);

export const fetchUserProfile = createAsyncThunk<
    User,
    string,
    { rejectValue: string }
>(
    'auth/fetchUserProfile',
    async (email, { rejectWithValue }) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/${email}`, {
                headers: {
                    'content-type': 'application/json',
                    authorization: localStorage.getItem('idToken') || ''
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user profile');
            }

            const userData = await response.json();
            return userData as User;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch user profile';
            return rejectWithValue(message);
        }
    }
);

// Initial state
const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
};

// Auth slice
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setAuthStateChanged: (state, action: PayloadAction<AuthStateChangePayload>) => {
            const { firebaseUser, user } = action.payload;
            if (firebaseUser && user) {
                state.user = user;
                state.isAuthenticated = true;
            } else {
                state.user = null;
                state.isAuthenticated = false;
            }
            state.isLoading = false;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
    },
    extraReducers: (builder) => {
        // Login with email
        builder
            .addCase(loginWithEmail.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginWithEmail.fulfilled, (state) => {
                state.isLoading = false;
                state.error = null;
                // Firebase user will be set via auth state listener
            })
            .addCase(loginWithEmail.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Login failed';
                state.isAuthenticated = false;
            });

        // Register with email
        builder
            .addCase(registerWithEmail.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(registerWithEmail.fulfilled, (state) => {
                state.isLoading = false;
                state.error = null;
                // Firebase user will be set via auth state listener
            })
            .addCase(registerWithEmail.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Registration failed';
                state.isAuthenticated = false;
            });

        // Login with Google
        builder
            .addCase(loginWithGoogle.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginWithGoogle.fulfilled, (state) => {
                state.isLoading = false;
                state.error = null;
                // Firebase user will be set via auth state listener
            })
            .addCase(loginWithGoogle.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Google login failed';
                state.isAuthenticated = false;
            });

        // Logout
        builder
            .addCase(logoutUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.isLoading = false;
                state.error = null;
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Logout failed';
            });

        // Fetch user profile
        builder
            .addCase(fetchUserProfile.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                // Set the complete user data from backend
                state.user = action.payload;
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Failed to fetch user profile';
            });
    },
});

// Actions
export const { clearError, setAuthStateChanged, setLoading } = authSlice.actions;

// Selectors
export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectIsLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectUserRole = (state: RootState) => state.auth.user?.role;
export const selectIsAdmin = (state: RootState) => state.auth.user?.role === 'admin';
export const selectIsWorker = (state: RootState) => state.auth.user?.role === 'worker';
export const selectIsCustomer = (state: RootState) => state.auth.user?.role === 'customer';

// Default export
export default authSlice.reducer;