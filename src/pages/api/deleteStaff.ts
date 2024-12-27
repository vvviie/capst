import type { NextApiRequest, NextApiResponse } from "next";
import admin from "firebase-admin";
import serviceAccount from "../../app/adminsettings/adminsettings.json";

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        databaseURL: "https://testingcapstonejg-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "testingcapstonejg",
    });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const { username } = req.body;

        console.log("Username received:", username);

        // Validate input
        if (!username) {
            return res.status(400).json({ error: "Username is required" });
        }

        try {
            // Fetch user document based on the username
            const userQuery = await admin.firestore().collection("staff").where("username", "==", username).get();

            console.log("Documents found:", userQuery.size);

            // Check if user exists
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
            await admin.firestore().collection("staff").doc(userDoc.id).delete();

            console.log(`User with UID: ${userId} deleted successfully.`); // Log successful deletion
            return res.status(200).json({ message: "User deleted successfully" });
        } catch (error: unknown) {
            console.error("Error deleting user:", error);

            // Handle Firebase-specific errors
            if (error instanceof Error) {
                // Check for Firebase Authentication error
                if ((error as any).code === "auth/user-not-found") {
                    return res.status(404).json({ error: "User not found" });
                }

                // Return the error message if available
                return res.status(500).json({ error: error.message || "Failed to delete user" });
            }

            // Handle non-standard error formats (e.g., unknown error types)
            if (typeof error === "string") {
                return res.status(500).json({ error });
            }

            // Fallback for unknown error types
            return res.status(500).json({ error: "An unknown error occurred" });
        }
    } else {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
