import { NextApiRequest, NextApiResponse } from 'next';
import admin from 'firebase-admin';
import path from 'path';
import serviceAccount from '../../app/adminsettings/adminsettings.json';

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        databaseURL: "https://testingcapstonejg-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "testingcapstonejg",
    });
}

const createNewStaff = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === "POST") {
        const { username, password } = req.body;

        if (!username || !password) {
            console.error("Username and password must be provided.");
            return res.status(400).json({ error: "Username and password are required." });
        }

        try {
            const userRecord = await admin.auth().createUser({
                email: username,
                password: password,
            });

            console.log("User created successfully:", userRecord.uid);
            res.status(201).json({ uid: userRecord.uid });
        } catch (error) {
            console.error("Error creating new user:", error);

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

export default createNewStaff;
