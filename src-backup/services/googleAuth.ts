import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase"; // Assuming you have a firebase configuration file

const googleAuth = {
    signIn: async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            return {
                uid: user.uid,
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
            };
        } catch (error) {
            console.error("Error during Google sign-in:", error);
            throw error;
        }
    },
};

export default googleAuth;