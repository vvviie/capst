import { NextApiRequest, NextApiResponse } from 'next';
import admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';

// Import and cast adminsettings.json as ServiceAccount
import adminsettings from '../../app/adminsettings/adminsettings.json';
const serviceAccount = adminsettings as ServiceAccount;

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://testingcapstonejg-default-rtdb.asia-southeast1.firebasedatabase.app",
    });
}

const createNewUser = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === "POST") {
        const { username, password } = req.body;

        // Validate inputs
        if (!username || !password) {
            console.error("Username and password must be provided.");
            return res.status(400).json({ error: "Username and password are required." });
        }

        try {
            // Step 1: Create user via Firebase Admin SDK
            const userRecord = await admin.auth().createUser({
                email: username, // Ensure email is passed as username
                password: password,
            });

            console.log("User created successfully:", userRecord.uid);

            // Step 2: Send email verification, only if email is available
            if (userRecord.email) {
                await admin.auth().generateEmailVerificationLink(userRecord.email);

                console.log("Verification email sent to:", userRecord.email);
            } else {
                console.error("Email is undefined, cannot send verification link.");
                return res.status(500).json({ error: "Failed to send verification email. Email is undefined." });
            }

            // Respond with user UID and email
            res.status(201).json({ uid: userRecord.uid, email: userRecord.email });

        } catch (error) {
            console.error("Error creating new user:", error);

            // Handle specific Firebase error for email already in use
            if ((error as { code: string }).code === 'auth/email-already-exists') {
                return res.status(409).json({ error: "The email address is already in use by another account." });
            }

            res.status(500).json({ error: (error as Error).message });
        }
    } else {
        res.setHeader("Allow", ["POST"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};

export default createNewUser;
