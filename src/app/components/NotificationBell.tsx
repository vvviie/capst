"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/app/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  getDoc,
  onSnapshot,
  deleteDoc
} from "firebase/firestore";

//#region Variable Arrays for Retrieving Purposes
type deets = {
  id: string;
  type: string;
  subject: string;
  details: string;
  time: string;
  date: string;
  read: boolean;
  [key: string]: any;
};

type notifs = deets[];

type Vouch = {
  id: string;
  title: string;
  desc: string;
  deduction: number;
  type: string;
};

type VoucherNotification = {
  id: string;
  type: string;
  subject: string;
  details: string;
  time: string;
  date: string;
  read: boolean;
  isRead?: boolean;
  isNotifDeleted?: boolean;  // Add the isNotifDeleted property
};

interface NotificationBellProps {
  foodCartAvailable: boolean;
}

interface NotificationB {
  id: string;
  type: string;
  subject: string;
  details: string;
  time: string;
  date: string;
  read: boolean;
}

interface OrderItem {
  isRead: boolean;
  [key: string]: any;  // For flexibility if there are other dynamic fields
}

type Notification = {
  id: string;
  type: "Voucher" | "Order Item" | "Table Reservation";
  voucherID?: string; // Only for "Voucher"
};

type Voucher = {
  voucherID: string;
  isNotifDeleted?: boolean;
};

type UserNotifications = {
  [key: string]: {
    voucherID?: string;
    isNotifDeleted?: boolean;
    [key: string]: any;
  };
};
//#endregion

const NotificationBell: React.FC<NotificationBellProps> = ({ foodCartAvailable }) => {
  //#region Constant Variables
  const [open, setOpen] = useState(false);
  const [notifItems, setNotifItems] = useState<notifs>([]);
  const [hasUnreadNotifs, setHasUnreadNotifs] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [voucherNotifs, setVoucherNotifs] = useState<VoucherNotification[]>([]);
  //#endregion

  const fetchTableReservations = useCallback(
    (existingNotifications: deets[]) => {
      if (!userEmail) return;
  
      const tempReservationsRef = collection(db, "tableReservations");
      const q = query(tempReservationsRef, where("reservedBy", "==", userEmail));
  
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const newNotifications: notifs = []; // Use the 'notifs' type here
  
        querySnapshot.forEach((doc) => {
          const data = doc.data();
  
          if (!data.isNotifDeleted) {
            let additionalDetails = "";
  
            if (data.status === "TO PAY" || data.status === "REQUESTED" || data.status === "PENDING") {
              const today = new Date();
              const reservationDate = new Date(data.dateToBeReserved); // Convert to Date object
            
              const diffTime = reservationDate.getTime() - today.getTime(); // Difference in ms
              let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 2; // Adjust by 2 days
            
              if (diffDays === 0) {
                // Extract the timeReserved (e.g., "22:25") and convert it to hours and minutes
                const [reservedHours, reservedMinutes] = data.timeReserved.split(":").map(Number);
            
                // Create a Date object for the reserved time on the same day
                const reservationTime = new Date();
                reservationTime.setHours(reservedHours, reservedMinutes, 0, 0);
            
                // Calculate the difference in milliseconds between now and the reserved time
                const diffMilliseconds = reservationTime.getTime() - today.getTime();
                const diffHours = Math.floor(diffMilliseconds / (1000 * 60 * 60)); // Full hours remaining
                const diffMinutes = Math.floor((diffMilliseconds % (1000 * 60 * 60)) / (1000 * 60)); // Remaining minutes
            
                if (diffMilliseconds > 0) {
                  additionalDetails = `Please settle within ${diffHours} hour(s) and ${diffMinutes} minute(s).`;
                } else {
                  additionalDetails = `Please settle within today!`;
                }
              } else if (diffDays > 0) {
                additionalDetails = `Please settle within ${diffDays} day(s).`;
              } else {
                additionalDetails = `Payment overdue by ${Math.abs(diffDays)} day(s).`;
              }
            }         
  
            const notification: deets = {
              id: doc.id,
              type: "Table Reservation",
              subject: `New Booking for: ${data.type || "Unknown"}`,
              details: `Your reservation for ${data.numberOfPersons} pax on ${data.dateToBeReserved} at ${data.timeToBeReserved} is ${
                data.status === "PENDING" ? "REQUESTED" : data.status || "in progress"
              }. ${additionalDetails}`,
              time: data.timeReserved || "N/A",
              date: data.dateReserved || "N/A",
              read: data.read || false, // Ensure this is fetched
            };
            newNotifications.push(notification);
          }
        });
  
        // Update the notifItems state with the latest reservations, avoiding duplicates
        setNotifItems((prevNotifItems) => {
          const existingIds = new Set(prevNotifItems.map((item) => item.id));
  
          const allNotifications = [
            ...newNotifications.filter((notification) => !existingIds.has(notification.id)),
            ...prevNotifItems,
          ];
  
          allNotifications.sort((a, b) => {
            const dateA = new Date(`${a.date} ${a.time}`);
            const dateB = new Date(`${b.date} ${b.time}`);
            return dateB.getTime() - dateA.getTime(); // Descending order
          });
  
          return allNotifications;
        });
  
        // Check for unread notifications
        setHasUnreadNotifs((prev) => newNotifications.some((notif) => !notif.read) || prev);
      });
  
      // Return the unsubscribe function to clean up the listener
      return unsubscribe;
    },
    [userEmail, setNotifItems] // Add relevant dependencies
  );
  
  useEffect(() => {
    if (!userEmail) return;

    const tempReservationsRef = collection(db, "tableReservations");

    // Listen for changes in the `tableReservations` collection
    const unsubscribe = onSnapshot(tempReservationsRef, (querySnapshot) => {
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        const reservationId = docSnapshot.id;

        // Check if the reservation belongs to the current user
        if (data.reservedBy === userEmail) {
          // Process only if the status matches the criteria
          if (
            data.status === "TO PAY" ||
            data.status === "REQUESTED" ||
            data.status === "PENDING"
          ) {
            const today = new Date();
            const reservationDate = new Date(data.dateToBeReserved);
            const diffTime = reservationDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 2;

            // Delete the reservation if overdue
            if (diffDays < 0) {
              deleteDoc(doc(db, "tableReservations", reservationId))
                .then(() => {
                  console.log(
                    `Reservation ${reservationId} deleted due to non-payment.`
                  );
                })
                .catch((error) => {
                  console.error(
                    `Error deleting reservation ${reservationId}:`,
                    error
                  );
                });
            }
          }
        }
      });
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [userEmail]);

  //#region Fetching of All Vouchers
  useEffect(() => {
    const fetchVouchers = () => {
      if (!userEmail) return;

      const userDocRef = doc(db, "users", userEmail);

      const unsubscribe = onSnapshot(
        userDocRef,
        (userDoc) => {
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const userVouchers = userData.vouchers || {};

            //console.log("Fetched Vouchers:", userVouchers); // Log fetched vouchers

            const formattedVouchers: VoucherNotification[] = Object.entries(
              userVouchers
            )
              .filter(([, value]: any) => {
                //console.log(`Voucher ${value.voucherID} isNotifDeleted:`, value.isNotifDeleted); // Log isNotifDeleted status
                return !value.isNotifDeleted;
              })
              .map(([key, value]: any) => ({
                id: value.voucherID,
                type: "Voucher",
                subject: `New Voucher: ${value.voucherID}`,
                details: value.voucherDescription,
                time: value.timeCreated,
                date: value.dateCreated,
                read: value.read,
                deleted: value.isNotifDeleted,
              }));

            setVoucherNotifs(formattedVouchers); // Update state with filtered vouchers
          }
        },
        (error) => {
          //console.error('Error fetching vouchers:', error);
        }
      );

      return () => unsubscribe(); // Cleanup listener on unmount
    };

    if (userEmail) {
      fetchVouchers();
    }
  }, [userEmail]);
  //#endregion

  //#region Logging In - Storing of Email
  useEffect(() => {
    // Listen to authentication state
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      const loggedIn = !!authUser;
      setIsLoggedIn(loggedIn);
      setUserEmail(authUser?.email || null); // Sets user email
    });

    return () => unsubscribe();
  }, []);
  //#endregion

  //#region Fetching of Orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!userEmail) return;
  
      const tempOrdersRef = collection(db, "completedOrders");
      const q = query(tempOrdersRef, where("user", "==", userEmail));
  
      const fetchedNotificationsMap = new Map<string, deets>(); // Map to track unique notifications (not an array)
  
      const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        // Fetch order notifications
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const items = data.items || [];
  
          items.forEach((item: any, index: number) => {
            const notificationId = `${doc.id}-${index}`;
            if (
              !item.isNotifDeleted &&
              !fetchedNotificationsMap.has(notificationId) &&
              typeof data.subtotal === "number" && // Ensure subtotal is a number
              data.subtotal > 0 &&
              data.status
            ) {
              const notification: deets = {
                id: notificationId,
                type: "Order Item",
                subject: `Order Status: ${data.status || "Unknown"}`,
                details: `Your order '${doc.id}' with subtotal PHP ${data.subtotal.toFixed(2)} is ${data.status || "in progress"}.`,
                time: data.timeCreated || "N/A",
                date: data.dateCreated || "N/A",
                read: item.isRead || false,
              };
              fetchedNotificationsMap.set(notificationId, notification);
            }
          });
        });
  
        // Add voucher notifications
        voucherNotifs.forEach((voucher) => {
          if (!fetchedNotificationsMap.has(voucher.id)) {
            const voucherNotification: deets = {
              id: voucher.id,
              type: "Voucher",
              subject: "New Voucher Claimed",
              details: `Congratulations! ${voucher.details}`,
              time: voucher.time,
              date: voucher.date,
              read: voucher.read,
            };
            fetchedNotificationsMap.set(voucher.id, voucherNotification); // Add to the Map
          }
        });
  
        // Fetch user notifications from the users database
        const notifRef = doc(db, "users", userEmail);
        const userSnapshot = await getDoc(notifRef); // One-time fetch
        const userData = userSnapshot.data();
  
        if (userData && userData.notifications) {
          const notificationsMap = userData.notifications;
  
          Object.keys(notificationsMap).forEach((notifId) => {
            if (!fetchedNotificationsMap.has(notifId)) {
              const notifData = notificationsMap[notifId];
              if (!notifData.isNotifDeleted) {
                const userNotification: deets = {
                  id: notifId,
                  type: "Notification",
                  subject: notifData.subject || "No Subject",
                  details: notifData.body || "No Details",
                  time: notifData.timeCreated || "N/A",
                  date: notifData.dateCreated || "N/A",
                  read: notifData.read || false,
                };
                fetchedNotificationsMap.set(notifId, userNotification); // Add to the Map
              }
            }
          });
        }
  
        
        // Fetch table reservations and append to notifications
        await fetchTableReservations(Array.from(fetchedNotificationsMap.values()));
  
        // Sort all notifications by date and time in descending order
        const sortedNotifications = Array.from(fetchedNotificationsMap.values()).sort((a, b) => {
          const dateA = new Date(`${a.date} ${a.time}`);
          const dateB = new Date(`${b.date} ${b.time}`);
          return dateB.getTime() - dateA.getTime();
        });
  
        // Update notifications state
        setNotifItems(sortedNotifications);
        setHasUnreadNotifs(sortedNotifications.some((notif) => !notif.read));
      });
  
      // Clean up when the component unmounts or dependencies change
      return () => {
        unsubscribe();
      };
    };
  
    fetchOrders();
  }, [userEmail, voucherNotifs, fetchTableReservations]);
//#endregion

//#endregion

//#region Mark Notification as Read and Unread
const toggleReadStatus = async (notificationId: string, currentReadStatus: boolean) => {
  try {
    if (!userEmail) {
      console.error("User email is null or undefined.");
      return;
    }

    const userDocRef = doc(db, "users", userEmail);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      console.error("User document not found in Firestore.");
      return;
    }

    const userData = userDoc.data();
    const userNotifications = userData.notifications || {};
    const userVouchers = userData.vouchers || {};
    const notificationKey = Object.keys(userNotifications).find((key) => key === notificationId);

    // Handle user notification
    if (notificationKey) {
      console.log("Updating user notification...");
      const updatedNotification = {
        ...userNotifications[notificationKey],
        read: !currentReadStatus, // Toggle the read status
      };

      await updateDoc(userDocRef, {
        [`notifications.${notificationKey}`]: updatedNotification,
      });

      setNotifItems((prevNotifs) =>
        prevNotifs.map((notif) =>
          notif.id === notificationId
            ? { ...notif, read: !currentReadStatus }
            : notif
        )
      );
      return; // Exit after processing user notification
    }

    // Handle voucher notifications
    const voucherKey = Object.keys(userVouchers).find(
      (key) => key === notificationId || userVouchers[key].voucherID === notificationId
    );

    if (voucherKey) {
      console.log("Found voucherKey:", voucherKey);
      console.log("Voucher details:", userVouchers[voucherKey]);

      const updatedVoucher = {
        ...userVouchers[voucherKey],
        read: !currentReadStatus, // Toggle the read status
      };

      await updateDoc(userDocRef, {
        [`vouchers.${voucherKey}`]: updatedVoucher,
      });

      setNotifItems((prevNotifs) =>
        prevNotifs.map((notif) =>
          notif.id === notificationId
            ? { ...notif, read: !currentReadStatus }
            : notif
        )
      );
      return; // Exit after processing voucher notification
    }

    // Handle table reservation notification
    const tableReservationRef = doc(db, "tableReservations", notificationId);
    const tableDoc = await getDoc(tableReservationRef);

    if (tableDoc.exists()) {
      const tableData = tableDoc.data();
      const updatedReadStatus = !currentReadStatus;

      await updateDoc(tableReservationRef, {
        read: updatedReadStatus, // Toggle the read status in Firestore
      });

      // Update local state for the table reservation notification
      setNotifItems((prevNotifs) =>
        prevNotifs.map((notif) =>
          notif.id === notificationId
            ? { ...notif, read: updatedReadStatus }
            : notif
        )
      );
      return; // Exit after processing table reservation notification
    }

    // Handle order notifications
    const [docId, itemIndex] = notificationId.split("-");
    const orderDocRef = doc(db, "completedOrders", docId);
    const orderDoc = await getDoc(orderDocRef);

    if (orderDoc.exists()) {
      const orderData = orderDoc.data();
      const updatedItems = orderData.items.map((item: any, index: number) => {
        if (index === parseInt(itemIndex)) {
          return { ...item, isRead: !currentReadStatus }; // Toggle the read status for the specific item
        }
        return item;
      });

      await updateDoc(orderDocRef, {
        items: updatedItems, // Update the items array with the updated read status
      });

      // Update local state for order notifications
      setNotifItems((prevNotifs) =>
        prevNotifs.map((notif) =>
          notif.id === notificationId
            ? { ...notif, read: !currentReadStatus }
            : notif
        )
      );
    }
  } catch (error) {
    console.error("Error updating notification status:", error);
  }
};


//#endregion

//#region Delete a Notification
const deleteNotification = async (notificationId: string) => {
  try {
    if (!userEmail) {
      console.error('User email is null or undefined.');
      return;
    }

    const userDocRef = doc(db, "users", userEmail);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      console.error('User document not found in Firestore.');
      return;
    }

    const userNotifications = userDoc.data().notifications || {};
    const notificationKey = Object.keys(userNotifications).find(
      (key) => key === notificationId
    );

    if (notificationKey) {
      // It's a user notification, mark it as deleted
      console.log('Marking user notification as deleted...');

      const updatedNotification = {
        ...userNotifications[notificationKey],
        isNotifDeleted: true, // Set the notification as deleted
      };

      // Update Firestore with updated notification status
      await updateDoc(userDocRef, {
        [`notifications.${notificationKey}`]: updatedNotification, // Update the specific notification
      });

      // Update local state for notifications
      setNotifItems((prevNotifs) =>
        prevNotifs.filter((notif) => notif.id !== notificationId)
      );
      return; // Exit after processing user notification
    }

    // Handle voucher notification
    const userVouchers = userDoc.data().vouchers || {};
    const voucherKey = Object.keys(userVouchers).find(
      (key) => userVouchers[key].voucherID === notificationId
    );

    if (voucherKey) {
      console.log('Marking voucher notification as deleted...');

      const updatedVoucher = {
        ...userVouchers[voucherKey],
        isNotifDeleted: true, // Set the voucher as deleted
      };

      await updateDoc(userDocRef, {
        [`vouchers.${voucherKey}`]: updatedVoucher, // Update Firestore
      });

      // Update local state for voucher notifications
      setNotifItems((prevNotifs) =>
        prevNotifs.filter((notif) => notif.id !== notificationId)
      );
      return; // Exit after processing voucher notification
    }

    // Handle order notification (Order Item)
    const [docId, itemIndex] = notificationId.split('-');
    const orderDocRef = doc(db, "completedOrders", docId);
    const orderDoc = await getDoc(orderDocRef);

    if (orderDoc.exists()) {
      console.log('Marking order notification as deleted...');
      
      const orderData = orderDoc.data();
      const updatedItems = orderData.items.map((item: OrderItem, index: number) => {
        if (index === parseInt(itemIndex)) {
          return { ...item, isNotifDeleted: true }; // Mark the item as deleted
        }
        return item;
      });

      await updateDoc(orderDocRef, {
        items: updatedItems, // Update the items array with the deleted status
      });

      // Update local state for order notifications
      setNotifItems((prevNotifs) =>
        prevNotifs.filter((notif) => notif.id !== notificationId)
      );
      return; // Exit after processing order notification
    }

    // Handle table reservation notification
    const reservationRef = doc(db, "tableReservations", notificationId);
    const reservationDoc = await getDoc(reservationRef);

    if (reservationDoc.exists()) {
      console.log('Marking table reservation notification as deleted...');
      
      // Update Firestore document to mark as deleted
      await updateDoc(reservationRef, { isNotifDeleted: true });

      // Update local state for table reservation notifications
      setNotifItems((prevNotifs) =>
        prevNotifs.filter((notif) => notif.id !== notificationId)
      );
    }
  } catch (error) {
    console.error("Error deleting notification:", error);
  }
};

//#endregion

//#region Mark All As Read
const markAllAsRead = async () => {
  try {
    if (!userEmail) {
      console.warn("User email not available.");
      return;
    }

    const userDocRef = doc(db, "users", userEmail);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      console.error("User document not found in Firestore.");
      return;
    }

    const userData = userDoc.data();
    const userNotifications = userData.notifications || {};
    const userVouchers = userData.vouchers || {};

    // ✅ Handle user notifications (update each key individually)
    await Promise.all(
      Object.keys(userNotifications).map(async (key) => {
        const notif = userNotifications[key];
        if (!notif.read) {
          await updateDoc(userDocRef, {
            [`notifications.${key}`]: {
              ...notif,
              read: true,
            },
          });
        }
      })
    );

    // ✅ Handle user vouchers (update each key individually like toggleReadStatus)
    await Promise.all(
      Object.keys(userVouchers).map(async (key) => {
        const voucher = userVouchers[key];
        if (!voucher.read) {
          await updateDoc(userDocRef, {
            [`vouchers.${key}`]: {
              ...voucher,
              read: true,
            },
          });
        }
      })
    );

    // ✅ Handle order items and table reservations
    await Promise.all(
      notifItems.map(async (notif) => {
        switch (notif.type) {
          case "Order Item": {
            const [docId, itemIndex] = notif.id.split("-");
            const completedOrderRef = doc(db, "completedOrders", docId);
            const orderDoc = await getDoc(completedOrderRef);

            if (orderDoc.exists()) {
              const orderData = orderDoc.data();
              const updatedItems = orderData.items.map((item: OrderItem, index: number) =>
                index === parseInt(itemIndex) ? { ...item, isRead: true } : item
              );

              await updateDoc(completedOrderRef, { items: updatedItems });
            }
            break;
          }
          case "Table Reservation": {
            const reservationRef = doc(db, "tableReservations", notif.id);
            await updateDoc(reservationRef, { read: true });
            break;
          }
        }
      })
    );

    // ✅ Update local state for all types
    setNotifItems((prev) =>
      prev.map((notif) => ({ ...notif, read: true }))
    );
    setHasUnreadNotifs(false);
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
  }
};


//#endregion

//#region Delete All Notifications

const deleteAllNotifs = async () => {
  try {
    if (!userEmail) {
      console.warn("User email not available.");
      return;
    }

    // Get user document reference
    const userDocRef = doc(db, "users", userEmail);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      console.error("User document not found in Firestore.");
      return;
    }

    const userData = userDoc.data() as {
      notifications: UserNotifications;
      vouchers: { [key: string]: Voucher };
    };

    const userNotifications = userData.notifications || {};
    const userVouchers = userData.vouchers || {};

    // Use Promise.all to handle multiple async tasks
    await Promise.all(
      notifItems.map(async (notif: deets) => {
        switch (notif.type) {
          case "Voucher": {
            // Update vouchers in Firestore
            const updatedVouchers = Object.entries(userVouchers).reduce(
              (acc, [key, value]) => {
                acc[key] =
                  value.voucherID === notif.id
                    ? { ...value, isNotifDeleted: true }
                    : value;
                return acc;
              },
              {} as { [key: string]: Voucher }
            );

            await updateDoc(userDocRef, { vouchers: updatedVouchers });

            // Update corresponding notification in Firestore
            const notificationKey = Object.keys(userNotifications).find(
              (key) => userNotifications[key].voucherID === notif.id
            );

            if (notificationKey) {
              await updateDoc(userDocRef, {
                [`notifications.${notificationKey}`]: {
                  ...userNotifications[notificationKey],
                  isNotifDeleted: true,
                },
              });
            }

            setVoucherNotifs((prev) =>
              prev.filter((voucher) => voucher.id !== notif.id)
            );
            break;
          }

          case "Order Item": {
            const [docId, itemIndex] = notif.id.split("-");
            const completedOrderRef = doc(db, "completedOrders", docId);
            const orderDoc = await getDoc(completedOrderRef);

            if (orderDoc.exists()) {
              const orderData = orderDoc.data();
              const updatedItems = orderData.items.map((item: OrderItem, index: number) =>
                index === parseInt(itemIndex)
                  ? { ...item, isNotifDeleted: true }
                  : item
              );

              // Update Firestore with the updated items
              await updateDoc(completedOrderRef, { items: updatedItems });
            }

            // Remove the specific order notification locally
            setNotifItems((prev) =>
              prev.filter((notifItem) => notifItem.id !== notif.id)
            );
            break;
          }

          case "Table Reservation": {
            const reservationRef = doc(db, "tableReservations", notif.id);
            // Mark the reservation notification as deleted
            await updateDoc(reservationRef, { isNotifDeleted: true });
            setNotifItems((prev) =>
              prev.filter((notifItem) => notifItem.id !== notif.id)
            );
            break;
          }

          default:
            break;
        }

        // Remove the notification from Firestore `notifications` map
        const notificationKey = Object.keys(userNotifications).find(
          (key) => key === notif.id
        );

        if (notificationKey) {
          await updateDoc(userDocRef, {
            [`notifications.${notificationKey}`]: {
              ...userNotifications[notificationKey],
              isNotifDeleted: true,
            },
          });
        }
      })
    );

    // Clear all notifications in local state
    setHasUnreadNotifs(false);
    setNotifItems([]);
  } catch (error) {
    console.error("Error deleting all notifications:", error);
  }
};
//#endregion

  return (
    <div className="cursor-pointer">
      {/* RED CIRCLE ON NOTIF BELL WHEN THERE IS/ARE UNREAD MESSAGE/S */}
      {hasUnreadNotifs && (
        <span
          className="w-3 aspect-square bg-red-500 absolute rounded-full top-4 translate-x-[10px]"
          style={{ boxShadow: "0 2px 6px rgba(200, 100, 100, 0.8)" }}
          onClick={() => setOpen(open ? false : true)}
        ></span>
      )}
      {/* ICON OF THE NOTIF BELL WHEN OPEN AND CLOSED */}
      {!open ? (
        // NOT OPENED
        <i
          className="fa-solid fa-bell text-xl mt-1 md:text-base md:mt-0 text-white hover:text-yellow-100"
          onClick={() => setOpen(true)}
        ></i>
      ) : (
        // OPENED
        <i
          className="fa-solid fa-bell text-xl mt-1 md:text-base md:mt-0 text-yellow-200"
          onClick={() => setOpen(false)}
        ></i>
      )}
      {/* NOTIF DROPDOWN */}
      {open && (
        <div
          className="fixed top-14 left-0 w-[100vw] h-[calc(100vh-56px)] z-30 flex justify-center items-start cursor-default"
          style={{ background: "rgba(0, 0, 0, 0.5)" }}
          onClick={(e) => e.stopPropagation()} // Prevent event bubbling here
        >
          {/* NOTIFS CONTAINER */}
          <div
            className="mx-2 pt-4 pb-3 pl-6 pr-4 bg-white rounded-md shadow-md relative mt-2
                        max-h-[calc(96vh-56px)] overflow-y-clip flex items-center flex-col max-w-[410px] md:max-w-[480px]
                        md:max-h-[calc(65vh)] cursor-default overflow-x-clip"
          >
            <div className="flex justify-between items-center w-full">
              <span className="text-xl font-bold text-orange-950">
                Notifications
              </span>
              <div
                className="h-6 aspect-square bg-gray-50 text-gray-400 border-2 cursor-pointer
                                border-gray-50 text-center font-thin rounded-full flex items-center justify-center
                                hover:bg-white hover:shadow-md hover:border-gray-100 hover:font-normal duration-200"
                onClick={() => setOpen(false)}
              >
                <p>X</p>
              </div>
            </div>

            {/* NOTIFICATIONS LIST */}
            {notifItems.length > 0 ? (
              <div className="max-h-[1560px] overflow-y-auto">
                {notifItems.map((notif) => (
                  <div key={notif.id}>
                    <hr className="my-4" />
                    <div className="relative flex items-start">
                      <div
                        className={`h-14 rounded-full aspect-square flex items-center justify-center mr-3 mt-1 ${
                          notif.read ? "bg-gray-300" : "bg-orange-900"
                        }`}
                      >
                        <i
                          className={`fa fa-mug-hot ml-1 text-xl ${
                            notif.read ? "text-gray-100" : "text-yellow-100"
                          }`}
                          aria-hidden="true"
                        ></i>
                      </div>
                      <div className="w-[300px] md:w-[320px] lg:w-[340px] pr-2">
                        <h1
                          className={`${
                            notif.read
                              ? "text-gray-500 font-semibold"
                              : "text-orange-950 font-bold"
                          }`}
                        >
                          {notif.subject}
                        </h1>
                        <p
                          className={`${
                            notif.read
                              ? "text-gray-400 font-normal"
                              : "text-gray-700 font-semibold"
                          } text-sm`}
                        >
                          {notif.details}
                        </p>
                        <div className="mt-1 flex justify-between items-center">
                          <span
                            className={`${
                              notif.read ? "text-gray-300" : "text-gray-500"
                            } text-xs`}
                          >
                            {notif.date} | {notif.time}
                          </span>
                          <span
                            className="text-xs underline underline-offset-2 text-gray-500 cursor-pointer hover:text-gray-400 duration-150"
                            onClick={() =>
                              toggleReadStatus(notif.id, notif.read)
                            }
                          >
                            Mark as {notif.read ? "unread" : "read"}
                          </span>
                          <span
                            className="text-xs underline underline-offset-2 text-red-300 cursor-pointer hover:text-red-400 duration-150"
                            onClick={() => deleteNotification(notif.id)}
                          >
                            Delete
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-[410px]">
                <hr />
                <h1 className="text-gray-400 pt-4 text-center">
                  You do not have any notifications.
                </h1>
              </div>
            )}
            {notifItems.length > 0 && (
              <div className="flex gap-4 w-full mt-4">
                <button
                  className="bg-white rounded-md shadow-md h-9 flex-1 font-bold text-gray-600 border-gray-50 border-2 hover:bg-gray-50 hover:text-gray-400"
                  onClick={markAllAsRead}
                >
                  Mark all as read
                </button>
                <button
                  className="bg-red-500 rounded-md shadow-md h-9 flex-1 font-bold text-white border-red-500 border-2 hover:border-red-400 hover:bg-red-400"
                  onClick={deleteAllNotifs}
                >
                  Delete all
                </button>
              </div>
            )}
            <span
              className="self-center mt-6 block bg-gray-300 w-24 h-1 rounded-full cursor-pointer hover:bg-gray-200"
              onClick={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
