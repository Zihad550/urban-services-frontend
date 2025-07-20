import { getIdToken, onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';
import { fetchUserProfile, setAuthStateChanged } from '../redux/features/auth/authSlice';
import { useAppDispatch } from '../redux/hooks';
import { auth } from '../services/firebase';
import type { AuthUser } from '../types/user';

export const useAuthListener = () => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    // Get and store the ID token
                    const idToken = await getIdToken(firebaseUser);
                    localStorage.setItem('idToken', idToken);

                    // Create auth user object
                    const authUser: AuthUser = {
                        uid: firebaseUser.uid,
                        email: firebaseUser.email!,
                        displayName: firebaseUser.displayName ?? undefined,
                        photoURL: firebaseUser.photoURL ?? undefined,
                        emailVerified: firebaseUser.emailVerified,
                    };

                    // Fetch user profile from backend
                    const userProfileResult = await dispatch(fetchUserProfile(firebaseUser.email!));

                    if (fetchUserProfile.fulfilled.match(userProfileResult)) {
                        // Set auth state with both Firebase user and backend user data
                        dispatch(setAuthStateChanged({
                            firebaseUser: authUser,
                            user: userProfileResult.payload
                        }));
                    } else {
                        // If backend user doesn't exist, still set Firebase user
                        dispatch(setAuthStateChanged({
                            firebaseUser: authUser,
                            user: null
                        }));
                    }
                } catch (error) {
                    console.error('Error handling auth state change:', error);
                    dispatch(setAuthStateChanged({
                        firebaseUser: null,
                        user: null
                    }));
                }
            } else {
                // User is signed out
                localStorage.removeItem('idToken');
                dispatch(setAuthStateChanged({
                    firebaseUser: null,
                    user: null
                }));
            }
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [dispatch]);
};