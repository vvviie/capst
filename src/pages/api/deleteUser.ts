import type { NextApiRequest, NextApiResponse } from "next";
import admin from "firebase-admin";
import serviceAccount from "../../app/adminsettings/adminsettings.json";

// Initialize Firebase Admin only once
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const { username } = req.body;

        console.log("Username received:", username);

        if (!username) {
            return res.status(400).json({ error: "Username is required" });
        }

        try {
            // Fetch user document based on the username
            const userQuery = await admin.firestore().collection("users").where("username", "==", username).get();

            console.log("Documents found:", userQuery.size);

            if (userQuery.empty) {
                console.log(`No user found with username: ${username}`);
                return res.status(404).json({ error: "User not found" });
            }

            // Assuming the username is unique and will return one user
            const userDoc = userQuery.docs[0];

            // Get the UID from Firebase Authentication using the username (email)
            const userRecord = await admin.auth().getUserByEmail(username);

            // Log the UID of the user
            const userId = userRecord.uid; // Correct UID from Firebase Auth
            console.log(`User UID: ${userId}`);

            // Delete user from Firebase Auth
            await admin.auth().deleteUser(userId);
            // Delete user from Firestore
            await admin.firestore().collection("users").doc(userDoc.id).delete();

            console.log(`User with UID: ${userId} deleted successfully.`); // Log successful deletion
            return res.status(200).json({ message: "User deleted successfully" });
        } catch (error: unknown) {
            console.error("Error deleting user:", error);

            // Check if error is an instance of Error and has a code property
            if (error instanceof Error) {
                // Handle Firebase error codes
                if ((error as any).code === 'auth/user-not-found') {
                    return res.status(404).json({ error: "User not found" });
                }

                // Generic error handling for other cases
                return res.status(500).json({ error: error.message || "Failed to delete user" });
            }

            // Fallback for unknown error types
            return res.status(500).json({ error: "An unknown error occurred" });
        }
    } else {
        res.setHeader("Allow", ["POST"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
