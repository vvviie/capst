"use client";
import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/app/firebase";
import { collection, getDocs, query, where, doc, updateDoc, getDoc } from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";

type deets = {
    id: string;
    type: string;
    subject: string;
    details: string;
    time: string;
    date: string;
    read: boolean;
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
    deleted: boolean;
};

const NotificationBell = () => {
    const [open, setOpen] = useState(false);
    const [notifItems, setNotifItems] = useState<notifs>([]);
    const [hasUnreadNotifs, setHasUnreadNotifs] = useState(false);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [vouchers, setVouchers] = useState<Vouch[]>([]);
    const [voucherNotifs, setVoucherNotifs] = useState<VoucherNotification[]>([]);

    // Fetch vouchers when userEmail changes
    useEffect(() => {
        const fetchVouchers = () => {
            if (!userEmail) return;
    
            const userDocRef = doc(db, 'users', userEmail);
    
            const unsubscribe = onSnapshot(userDocRef, (userDoc) => {
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const userVouchers = userData.vouchers || {};
    
                    console.log("Fetched Vouchers:", userVouchers); // Log fetched vouchers
    
                    const formattedVouchers: VoucherNotification[] = Object.entries(userVouchers)
                        .filter(([, value]: any) => {
                            console.log(`Voucher ${value.voucherID} isNotifDeleted:`, value.isNotifDeleted); // Log isNotifDeleted status
                            return !value.isNotifDeleted;
                        })
                        .map(([key, value]: any) => ({
                            id: value.voucherID,
                            type: "Voucher",
                            subject: `New Voucher: ${value.voucherID}`,
                            details: value.voucherDescription,
                            time: value.timeCreated,
                            date: value.dateCreated,
                            read: value.isRead,
                            deleted: value.isNotifDeleted,
                        }));
    
                    setVoucherNotifs(formattedVouchers); // Update state with filtered vouchers
                }
            }, (error) => {
                console.error('Error fetching vouchers:', error);
            });
    
            return () => unsubscribe(); // Cleanup listener on unmount
        };
    
        if (userEmail) {
            fetchVouchers();
        }
    }, [userEmail]);

    useEffect(() => {
        // Listen to authentication state
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (authUser) => {
            const loggedIn = !!authUser && authUser.emailVerified;
            setIsLoggedIn(loggedIn);
            setUserEmail(authUser?.email || null); // Sets user email
        });

        return () => unsubscribe();
    }, []);

    // Fetch orders and voucher notifications
    useEffect(() => {
        const fetchOrders = async () => {
            if (!userEmail) return;

            const tempOrdersRef = collection(db, "completedOrders");
            const q = query(tempOrdersRef, where("user", "==", userEmail));

            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const fetchedNotifications: notifs = [];

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const items = data.items || [];

                    items.forEach((item: any, index: number) => {
                        if (!item.isNotifDeleted) {
                            const notification = {
                                id: `${doc.id}-${index}`,
                                type: "Order Item",
                                subject: `Order Status: ${data.status || "Unknown"}`,
                                details: `Your order '${doc.id}' with subtotal P${data.subtotal || 0} is ${data.status || "in progress"}. Please proceed to the cashier and settle your orders.`,
                                time: data.timeCreated || "N/A",
                                date: data.dateCreated || "N/A",
                                read: item.isRead || false,
                            };
                            fetchedNotifications.push(notification);
                        }
                    });
                });

                // Add all voucher notifications
                voucherNotifs.forEach((voucher) => {
                    const voucherNotification = {
                        id: voucher.id,
                        type: "Voucher",
                        subject: "New Voucher Claimed",
                        details: `Congratulations! ${voucher.details}`,
                        time: voucher.time,
                        date: voucher.date,
                        read: voucher.read, // Use the actual read status
                    };
                    fetchedNotifications.push(voucherNotification);
                });

                // Sort notifications by date and time in descending order
                fetchedNotifications.sort((a, b) => {
                    const dateA = new Date(`${a.date} ${a.time}`);
                    const dateB = new Date(`${b.date} ${b.time}`);
                    return dateB.getTime() - dateA.getTime(); // Descending order
                });

                setNotifItems(fetchedNotifications);
                setHasUnreadNotifs(fetchedNotifications.some((notif) => !notif.read));
            });

            return () => unsubscribe();
        };

        fetchOrders();
    }, [userEmail, voucherNotifs]);

    const toggleReadStatus = async (notificationId: string, currentReadStatus: boolean) => {
        try {
            if (!userEmail) {
                console.error('User email is null or undefined.');
                return; // Exit the function if userEmail is invalid
            }
    
            const voucherIndex = voucherNotifs.findIndex((voucher) => voucher.id === notificationId);
            if (voucherIndex > -1) {
                // Voucher notification toggle
                const updatedVouchers = [...voucherNotifs];
                const updatedReadStatus = !currentReadStatus;
    
                // Update locally
                updatedVouchers[voucherIndex] = { ...updatedVouchers[voucherIndex], read: updatedReadStatus };
                setVoucherNotifs(updatedVouchers);
    
                // Update Firestore
                const userDocRef = doc(db, 'users', userEmail); // Use the userEmail to get the correct user document
                const userDoc = await getDoc(userDocRef);
    
                if (userDoc.exists()) {
                    const userVouchers = userDoc.data().vouchers || {};
    
                    // Find the voucher by searching within the map
                    const voucherKey = Object.keys(userVouchers).find((key) => userVouchers[key].voucherID === notificationId);
    
                    if (voucherKey) {
                        // Update the isRead status for the found voucher
                        userVouchers[voucherKey].isRead = updatedReadStatus;
                        await updateDoc(userDocRef, { vouchers: userVouchers });
                    } else {
                        console.error(`Voucher with ID ${notificationId} does not exist in Firestore.`);
                    }
                }
            } else {
                // Handle order notification toggle
                const [docId, itemIndex] = notificationId.split('-');
                const completedOrderRef = doc(db, "completedOrders", docId);
                const notifDoc = await getDoc(completedOrderRef);
                if (notifDoc.exists()) {
                    const notifData = notifDoc.data();
                    const updatedItems = [...notifData.items];
                    updatedItems[itemIndex] = { ...updatedItems[itemIndex], isRead: !currentReadStatus };
                    await updateDoc(completedOrderRef, { items: updatedItems });
    
                    // Update state locally
                    setNotifItems((prevNotifs) =>
                        prevNotifs.map((notif) =>
                            notif.id === notificationId ? { ...notif, read: !currentReadStatus } : notif
                        )
                    );
                }
            }
        } catch (error) {
            console.error("Error toggling notification read status:", error);
        }
    };
    
    const deleteNotification = async (notificationId: string) => {
        try {
            if (!userEmail) {
                console.error('User email is null or undefined.');
                return; // Exit the function if userEmail is invalid
            }
    
            const voucherIndex = voucherNotifs.findIndex((voucher) => voucher.id === notificationId);
            if (voucherIndex > -1) {
                // Mark the voucher as deleted locally
                const updatedVouchers = [...voucherNotifs];
                updatedVouchers[voucherIndex] = { ...updatedVouchers[voucherIndex], isNotifDeleted: true };
                setVoucherNotifs(updatedVouchers); // Update local state
    
                // Update Firestore
                const userDocRef = doc(db, 'users', userEmail); // Get the correct user document
                const userDoc = await getDoc(userDocRef);
    
                if (userDoc.exists()) {
                    const userVouchers = userDoc.data().vouchers || {};
    
                    // Find the voucher by searching within the map
                    const voucherKey = Object.keys(userVouchers).find((key) => userVouchers[key].voucherID === notificationId);
    
                    if (voucherKey) {
                        // Update the isNotifDeleted status for the found voucher
                        userVouchers[voucherKey].isNotifDeleted = true;
                        await updateDoc(userDocRef, { vouchers: userVouchers });
                    } else {
                        console.error(`Voucher with ID ${notificationId} does not exist in Firestore.`);
                    }
                }
            } else {
                // Handle order notification deletion in Firestore
                const [docId, itemIndex] = notificationId.split('-');
                const completedOrderRef = doc(db, "completedOrders", docId);
                const notifDoc = await getDoc(completedOrderRef);
                if (notifDoc.exists()) {
                    const notifData = notifDoc.data();
                    const updatedItems = [...notifData.items];
                    updatedItems[itemIndex] = { ...updatedItems[itemIndex], isNotifDeleted: true };
                    await updateDoc(completedOrderRef, { items: updatedItems });
    
                    // Remove the notification from local state
                    setNotifItems((prevNotifs) => prevNotifs.filter((notif) => notif.id !== notificationId));
                }
            }
        } catch (error) {
            console.error("Error deleting notification:", error);
        }
    };    

    // Function to mark all notifications as read
    const markAllAsRead = async () => {
        try {
            if (!userEmail) {
                console.error('User email is missing.');
                return; // Exit if userEmail is not available
            }
    
            await Promise.all(
                notifItems.map(async (notif) => {
                    if (notif.type === "Voucher") {
                        // Update read status for vouchers in Firestore
                        const userDocRef = doc(db, 'users', userEmail);
                        const userDoc = await getDoc(userDocRef);
    
                        if (userDoc.exists()) {
                            const userData = userDoc.data();
                            const userVouchers = userData.vouchers;
    
                            // Update read status in vouchers
                            const updatedVouchers = Object.entries(userVouchers).map(([key, value]) => {
                                if (value.voucherID === notif.id) {
                                    return { ...value, isRead: true }; // Mark as read
                                }
                                return value;
                            });
    
                            await updateDoc(userDocRef, { vouchers: updatedVouchers });
                        }
    
                        // Update local state
                        const newVoucherNotifs = [...voucherNotifs].map((voucher) =>
                            voucher.id === notif.id ? { ...voucher, read: true } : voucher
                        );
                        setVoucherNotifs(newVoucherNotifs);
                    } else {
                        const [docId, itemIndex] = notif.id.split('-');
                        const completedOrderRef = doc(db, "completedOrders", docId);
                        const notifDoc = await getDoc(completedOrderRef);
                        if (notifDoc.exists()) {
                            const notifData = notifDoc.data();
                            const updatedItems = [...notifData.items];
                            updatedItems[itemIndex] = { ...updatedItems[itemIndex], isRead: true };
                            await updateDoc(completedOrderRef, { items: updatedItems });
                        }
                    }
                })
            );
    
            setNotifItems((prevNotifs) =>
                prevNotifs.map((notif) => ({ ...notif, read: true }))
            );
            setHasUnreadNotifs(false);
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
        }
    };

    // Function to delete all notifications
    const deleteAllNotifs = async () => {
        try {
            if (!userEmail) {
                console.error('User email is missing.');
                return; // Exit if userEmail is not available
            }
    
            await Promise.all(
                notifItems.map(async (notif) => {
                    if (notif.type === "Voucher") {
                        // Remove vouchers from the local state and Firestore
                        const userDocRef = doc(db, 'users', userEmail);
                        const userDoc = await getDoc(userDocRef);
    
                        if (userDoc.exists()) {
                            const userData = userDoc.data();
                            const userVouchers = userData.vouchers;
    
                            // Update each voucher's isNotifDeleted property
                            const updatedVouchers = Object.entries(userVouchers).map(([key, value]) => {
                                if (value.voucherID === notif.id) {
                                    return { ...value, isNotifDeleted: true }; // Mark as deleted
                                }
                                return value;
                            });
    
                            await updateDoc(userDocRef, { vouchers: updatedVouchers });
                        }
    
                        setVoucherNotifs((prev) => prev.filter(voucher => voucher.id !== notif.id)); // Update local state
                    } else {
                        const [docId, itemIndex] = notif.id.split('-');
                        const completedOrderRef = doc(db, "completedOrders", docId);
                        const notifDoc = await getDoc(completedOrderRef);
                        if (notifDoc.exists()) {
                            const notifData = notifDoc.data();
                            const updatedItems = [...notifData.items];
                            updatedItems[itemIndex] = { ...updatedItems[itemIndex], isNotifDeleted: true };
                            await updateDoc(completedOrderRef, { items: updatedItems });
                        }
                    }
                })
            );
            setNotifItems([]); // Clear the notification items from the local state
        } catch (error) {
            console.error("Error deleting all notifications:", error);
        }
    };

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
                                                className={`h-14 rounded-full aspect-square flex items-center justify-center mr-3 mt-1 ${notif.read ? "bg-gray-300" : "bg-orange-900"}`}
                                            >
                                                <i
                                                    className={`fa fa-mug-hot ml-1 text-xl ${notif.read ? "text-gray-100" : "text-yellow-100"}`}
                                                    aria-hidden="true"
                                                ></i>
                                            </div>
                                            <div className="w-[300px] md:w-[320px] lg:w-[340px] pr-2">
                                                <h1 className={`${notif.read ? "text-gray-500 font-semibold" : "text-orange-950 font-bold"}`}>
                                                    {notif.subject}
                                                </h1>
                                                <p className={`${notif.read ? "text-gray-400 font-normal" : "text-gray-700 font-semibold"} text-sm`}>
                                                    {notif.details}
                                                </p>
                                                <div className="mt-1 flex justify-between items-center">
                                                    <span className={`${notif.read ? "text-gray-300" : "text-gray-500"} text-xs`}>
                                                        {notif.date} | {notif.time}
                                                    </span>
                                                    <span
                                                        className="text-xs underline underline-offset-2 text-gray-500 cursor-pointer hover:text-gray-400 duration-150"
                                                        onClick={() => toggleReadStatus(notif.id, notif.read)}
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