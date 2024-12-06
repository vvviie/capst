import type { NextApiRequest, NextApiResponse } from "next";
import admin from "firebase-admin";
import serviceAccount from '../../app/adminsettings/adminsettings.json';

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

        if (!username) {
            return res.status(400).json({ error: "Username is required" });
        }

        try {
            const userQuery = await admin.firestore().collection("users").where("username", "==", username).get();

            console.log("Documents found:", userQuery.size);

            if (userQuery.empty) {
                console.log(`No user found with username: ${username}`);
                return res.status(404).json({ error: "User not found" });
            }

            const userDoc = userQuery.docs[0];
            const userRecord = await admin.auth().getUserByEmail(username);
            const userId = userRecord.uid;

            console.log(`User UID: ${userId}`);

            await admin.auth().deleteUser(userId);
            console.log(`Auth user ${userId} deleted successfully.`);

            await admin.firestore().collection("users").doc(userDoc.id).delete();
            console.log(`Firestore user document ${userDoc.id} deleted successfully.`);

            return res.status(200).json({ message: "User deleted successfully" });
        } catch (error: unknown) {
            console.error("Error deleting user:", error);

            if (typeof error === "string") {
                return res.status(500).json({ error });
            }

            if (error instanceof Error) {
                console.error("Error details:", JSON.stringify(error, Object.getOwnPropertyNames(error)));

                if ((error as any).code === 'auth/user-not-found') {
                    return res.status(404).json({ error: "User not found" });
                }

                return res.status(500).json({ error: error.message || "Failed to delete user" });
            }

            return res.status(500).json({ error: "An unknown error occurred" });
        }
    } else {
        res.setHeader("Allow", ["POST"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
