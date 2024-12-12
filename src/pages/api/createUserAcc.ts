import { NextApiRequest, NextApiResponse } from "next";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db, auth } from "@/app/firebase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { email, password, firstName, lastName, phoneNumber, address } = req.body;

    if (!email || !password || !firstName || !lastName || !phoneNumber || !address) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Send email verification
      await sendEmailVerification(user);

      // Fetch the first-time voucher from Firestore
      const firstTimeVoucherRef = doc(db, "vouchers", "firstTimeVoucher");
      const voucherSnap = await getDoc(firstTimeVoucherRef);

      if (voucherSnap.exists()) {
        const firstTimeVoucher = voucherSnap.data();

        // Get current date and time
        const now = new Date();
        const date = `${String(now.getMonth() + 1).padStart(2, "0")}/${String(
          now.getDate()
        ).padStart(2, "0")}/${now.getFullYear()}`;
        const time = `${String(now.getHours()).padStart(2, "0")}:${String(
          now.getMinutes()
        ).padStart(2, "0")}`;

        // Save user data to Firestore
        await setDoc(doc(db, "users", email), {
          username: email,
          firstName,
          lastName,
          phoneNumber,
          address,
          role: "user",
          totalPaid: 0,
          vouchers: {
            firstTimeVoucher: {
              available: firstTimeVoucher.available,
              voucherDeduction: firstTimeVoucher.voucherDeduction,
              voucherDescription: firstTimeVoucher.voucherDescription,
              voucherID: firstTimeVoucher.voucherID,
              voucherType: firstTimeVoucher.deductionType,
              used: false,
              isRead: false,
              isNotifDeleted: false,
              dateCreated: date,
              timeCreated: time,
            },
          },
        });

        // Respond with success
        return res.status(200).json({ message: "Verification email sent. Please verify your email." });
      } else {
        return res.status(404).json({ error: "Voucher not found." });
      }
    } catch (error) {
      console.error("Error creating user:", error);
      return res.status(500).json({ error: "Error creating user." });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
