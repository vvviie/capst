import type { NextApiRequest, NextApiResponse } from "next";
import admin from "firebase-admin";
import serviceAccount from '../../app/adminsettings/adminsettings.json';

// working fine
// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        databaseURL: "https://testingcapstonejg-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "testingcapstonejg",
    });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Handle only POST requests
    if (req.method === "POST") {
        const { username } = req.body;

        console.log("Username received:", username);

        // Validate input
        if (!username) {
            return res.status(400).json({ error: "Username is required" });
        }

        try {
            // Query Firestore for the user by username
            const userQuery = await admin.firestore().collection("users").where("username", "==", username).get();

            console.log("Documents found:", userQuery.size);

            // Check if user exists
            if (userQuery.empty) {
                console.log(`No user found with username: ${username}`);
                return res.status(404).json({ error: "User not found" });
            }

            const userDoc = userQuery.docs[0];

            // Get user record from Firebase Authentication
            const userRecord = await admin.auth().getUserByEmail(username); // Corrected method name
            const userId = userRecord.uid; // Access the UID from the user record

            console.log(`User UID: ${userId}`);

            // Delete the user from Firebase Authentication
            await admin.auth().deleteUser(userId); // Corrected method call
            console.log(`Auth user ${userId} deleted successfully.`);

            // Delete the user document from Firestore
            await admin.firestore().collection("users").doc(userDoc.id).delete();
            console.log(`Firestore user document ${userDoc.id} deleted successfully.`);

            // Respond with success message
            return res.status(200).json({ message: "User deleted successfully" });
        } catch (error: unknown) {
            console.error("Error deleting user:", error);

            // Handle different types of errors
            if (error instanceof Error) {
                console.error("Error details:", error.message);

                // Check for specific error codes
                if ((error as any).code === 'auth/user-not-found') {
                    return res.status(404).json({ error: "User not found" });
                }

                // Return the error message as JSON
                return res.status(500).json({ error: error.message || "Failed to delete user" });
            }

            // If the error is a string or unknown type, return a generic error message
            return res.status(500).json({ error: "An unknown error occurred" });
        }
    } else {
        // Handle unsupported HTTP methods
        res.setHeader("Allow", ["POST"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
