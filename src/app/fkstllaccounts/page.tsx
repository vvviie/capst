"use client";
import Link from "next/link";
import React, { useState, useEffect, useCallback } from "react";
import AdminStaffFilter from "../components/AdminStaffFilter";
import UsersFilter from "../components/UsersFilter";
import { auth, db } from "../firebase";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  deleteDoc,
  getDoc,
  DocumentData,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import {
  onAuthStateChanged,
  getAuth,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
} from "firebase/auth"; // Import Firebase Auth methods
import Cookies from "js-cookie";
import AccGiveVoucherForm from "../components/AccGiveVoucherForm";

//#region Staff Sample Acc
type Staff = {
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  uid: string;
};

type listStaff = Staff[];

const status = [
  { id: 1, name: "Activated", value: "activated" },
  { id: 2, name: "Deactivated", value: "deactivated" },
];

const roles = [
  { id: 1, name: "Bar", value: "bar" },
  { id: 2, name: "Kitchen", value: "kitchen" },
];
//#endregion

//#region Users Sample Acc
type user = {
  username: string;
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  totalPaid: number;
  role: string;
};

type listUser = user[];
//#endregion

const AccountsListPage = () => {
  const [accountType, setAccountType] = useState("users");
  const [userAccounts, setUserAccounts] = useState<listUser>([]);
  const [staffAccounts, setStaffAccounts] = useState<listStaff>([]);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>(
    {}
  );
  const [searchInput, setSearchInput] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [filteredStatus, setFilteredStatus] = useState("All");
  const [filteredStaffStatus, setFilteredStaffStatus] = useState("all");
  const [filteredStaffRole, setFilteredStaffRole] = useState("all"); // Initial value of "all"
  const router = useRouter(); // Initialize useRouter
  const auth = getAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const toggleForm = () => {
    setIsFormOpen((prev) => !prev);
  };

  const handleFilterChange = (status: string) => {
    setFilteredStatus(status);
};

  const handleFilterStaffChange = (status: string, role: string) => {
    setFilteredStaffStatus(status);
    setFilteredStaffRole(role);
  };

  const toggleOrder = (id: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setAccountType(event.target.value === "users" ? "users" : "staff");
  };

  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchInput(event.target.value);
  };

  const handleStatusChange = async (username: string, newStatus: string) => {
    const staffRef = doc(db, "staff", username); // Reference the specific staff document
    try {
      await updateDoc(staffRef, { staffStatus: newStatus }); // Update the staff status in Firestore
      //console.log(`Updated ${username} status to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status: ", error);
    }
  };

  const handleRoleChange = async (username: string, newRole: string) => {
    const staffRef = doc(db, "staff", username); // Reference the specific staff document
    try {
      await updateDoc(staffRef, { staffRole: newRole }); // Update the staff role in Firestore
      //console.log(`Updated ${username} role to ${newRole}`);
    } catch (error) {
      console.error("Error updating role: ", error);
    }
  };

  const fetchUsers = useCallback(async () => {
    try {
      // Ensure there is an authenticated user
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("User is not authenticated");
      }
  
      const usersCollection = collection(db, "users");
      const q = query(usersCollection, where("role", "==", "user"));
      const userSnapshot = await getDocs(q);
      const users = userSnapshot.docs.map((doc) => ({
        username: doc.data().username,
        firstName: doc.data().firstName,
        lastName: doc.data().lastName,
        address: doc.data().address,
        phone: doc.data().phoneNumber,
        totalPaid: doc.data().totalPaid,
        role: doc.data().role,
      }));
      setUserAccounts(users);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error fetching users:", error);
        if (error.message.includes("insufficient permissions")) {
          alert(
            "You do not have permission to access this data. Please check your authentication status."
          );
        }
      } else {
        // If error is not an instance of Error, handle it here if needed
        console.error("An unexpected error occurred:", error);
      }
    }
  }, [auth.currentUser]);

  // Function to fetch staff data with real-time updates
  const fetchStaff = useCallback(() => {
    try {
      // Ensure there is an authenticated user
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("User is not authenticated");
      }
  
      const staffCollection = collection(db, "staff");
  
      // Subscribe to changes in the staff collection
      const unsubscribe = onSnapshot(staffCollection, (snapshot) => {
        const staff = snapshot.docs.map((doc) => ({
          username: doc.data().username,
          firstName: doc.data().firstName,
          lastName: doc.data().lastName,
          role: doc.data().staffRole,
          status: doc.data().staffStatus,
          uid: doc.data().uid,
        }));
  
        // Filter out the staff with role "admin"
        const filteredStaff = staff.filter(
          (staffMember) => staffMember.role !== "admin"
        );
  
        setStaffAccounts(filteredStaff); // Update state with the filtered staff data
      });
  
      // Return the unsubscribe function for cleanup
      return unsubscribe;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error fetching staff:", error);
        if (error.message.includes("insufficient permissions")) {
          alert(
            "You do not have permission to access this data. Please check your authentication status."
          );
        }
      } else {
        // Handle the case where error is not an instance of Error
        console.error("An unexpected error occurred:", error);
      }
    }
  }, [auth.currentUser]);

  useEffect(() => {
    if (accountType === "staff") {
      setFilteredStaffStatus("all");
      setFilteredStaffRole("all");
    }
  }, [accountType]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Only fetch staff data if authenticated
        const unsubscribeStaff = fetchStaff();

        // Cleanup: unsubscribe from Firestore listener when the component unmounts
        return () => {
          if (unsubscribeStaff) unsubscribeStaff();
        };
      } else {
        router.push("/"); // Redirect to login if not authenticated
      }
    });

    // Cleanup for auth listener
    return () => unsubscribeAuth();
  }, [router, auth, fetchStaff]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user || !Cookies.get("admin")) {
        // Redirect to home page if user is not logged in or does not have the "admin" cookie
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [auth, router]);

  useEffect(() => {
    if (accountType === "users") {
      fetchUsers();
    } else if (accountType === "staff") {
      fetchStaff();
    }
  }, [accountType, fetchUsers, fetchStaff]);

  const statusInfo = status.find((s) => s.value === filteredStatus); // Move this outside

  const statusOptions = [
    { id: 1, value: "All", min: 0, max: Infinity },
    { id: 2, value: "Regular", min: 0, max: 999 },
    { id: 3, value: "Bronze", min: 1000, max: 4999 },
    { id: 4, value: "Silver", min: 5000, max: 9999 },
    { id: 5, value: "Gold", min: 10000, max: 19999 },
    { id: 6, value: "Diamond", min: 20000, max: Infinity },
  ];

  const filteredUserAccounts = userAccounts.filter((user) => {
    const matchesSearch =
      user.firstName.toLowerCase().startsWith(searchInput.toLowerCase()) ||
      user.lastName.toLowerCase().startsWith(searchInput.toLowerCase()) ||
      user.username.toLowerCase().startsWith(searchInput.toLowerCase());

    const statusInfo = statusOptions.find((s) => s.value === filteredStatus);
    const matchesStatus = statusInfo
      ? user.totalPaid >= statusInfo.min && user.totalPaid <= statusInfo.max
      : false;

    return matchesSearch && (filteredStatus === "All" || matchesStatus);
  });

  const filteredStaffAccounts = staffAccounts.filter((staff) => {
    const matchesSearch =
      staff.firstName.toLowerCase().startsWith(searchInput.toLowerCase()) ||
      staff.lastName.toLowerCase().startsWith(searchInput.toLowerCase()) ||
      staff.username.toLowerCase().startsWith(searchInput.toLowerCase());

    const matchesStatus =
      filteredStaffStatus === "all" || staff.status === filteredStaffStatus;
    const matchesRole =
      filteredStaffRole === "all" || staff.role === filteredStaffRole;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const reauthenticateUser = async (email: string, password: string) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const credential = EmailAuthProvider.credential(email, password);
      return reauthenticateWithCredential(user, credential);
    }
    throw new Error("No user is currently logged in.");
  };

  const handleDeleteUser = async (username: string) => {
    try {
      // Ensure username is provided
      if (!username) {
        alert("Please provide a username to delete.");
        return;
      }

      // Call the delete API with the username
      const response = await fetch("/api/deleteUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }), // Correctly send the username
      });

      const data = await response.json(); // Get the response data
      //console.log("Response data:", data); // Log the response data

      if (response.ok) {
        // If the deletion was successful, update the state accordingly
        setUserAccounts((prev) =>
          prev.filter((user) => user.username !== username)
        );
      } else {
        // Since we've already read the response body, we can use 'data' here
        console.error("Error data:", data); // Log error message
        alert(`Failed to delete user: ${data.error || "Please try again."}`);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user. Please try again.");
    }
  };

  const handleDeleteStaff = async (username: string) => {
    try {
      // Ensure username is provided
      if (!username) {
        alert("Please provide a username to delete.");
        return;
      }

      // Call the delete API with the username
      const response = await fetch("/api/deleteStaff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }), // Correctly send the username
      });

      const data = await response.json(); // Get the response data
      //console.log("Response data:", data); // Log the response data

      if (response.ok) {
        // If the deletion was successful, update the state accordingly
        setUserAccounts((prev) =>
          prev.filter((user) => user.username !== username)
        );
      } else {
        // Since we've already read the response body, we can use 'data' here
        console.error("Error data:", data); // Log error message
        alert(`Failed to delete user: ${data.error || "Please try again."}`);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user. Please try again.");
    }
  };

  //#region PAGES CODE
  const [currentPage, setCurrentPage] = useState(1);
  const [pageWindowStart, setPageWindowStart] = useState(1);
  const itemsPerPage = accountType === "users" ? 5 : 3;
  const pagesToShow = 5;

  // Get current page orders

  // Calculate total pages
  const totalUserPages = Math.ceil(filteredUserAccounts.length / itemsPerPage);
  const totalStaffPages = Math.ceil(
    filteredStaffAccounts.length / itemsPerPage
  );

  const currentUserAccounts = filteredUserAccounts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const currentStaffAccounts = filteredStaffAccounts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const visiblePages = Array.from(
    {
      length: Math.min(
        pagesToShow,
        (accountType === "users" ? totalUserPages : totalStaffPages) -
          pageWindowStart +
          1
      ),
    },
    (_, index) => pageWindowStart + index
  );

  // Handle page change
  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);

    // Adjust the visible page numbers if necessary
    if (pageNumber >= pageWindowStart + pagesToShow) {
      setPageWindowStart(pageWindowStart + 1);
    } else if (pageNumber < pageWindowStart) {
      setPageWindowStart(pageWindowStart - 1);
    }
  };

  const handleUserNext = () => {
    if (currentPage < totalUserPages) {
      goToPage(currentPage + 1);

      // Adjust page window start for "Next"
      if (currentPage + 1 >= pageWindowStart + pagesToShow) {
        setPageWindowStart(pageWindowStart + 1);
      }
    }
  };

  const handleStaffNext = () => {
    if (currentPage < totalStaffPages) {
      goToPage(currentPage + 1);

      // Adjust page window start for "Next"
      if (currentPage + 1 >= pageWindowStart + pagesToShow) {
        setPageWindowStart(pageWindowStart + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);

      // Adjust page window start for "Previous"
      if (currentPage - 1 < pageWindowStart) {
        setPageWindowStart(pageWindowStart - 1);
      }
    }
  };
  //#endregion

  return (
    <div
      className="min-h-[69.37vh] mt-14 px-10 pt-6 pb-20 md:px-24 xl:px-56 w-full bg-white flex 
                justify-center items-start
                lg:bg-[url('/backgrounds/bg3-2.png')] lg:bg-cover lg:bg-no-repeat lg:bg-center"
    >
      {/* MAIN CONTAINER */}
      <div className="w-full max-w-[600px] flex flex-col gap-2">
        {/* HEADER */}
        <div className="w-full flex gap-2 sm:gap-4 items-center">
          <span className="flex-1 bg-orange-300 h-1 rounded-full"></span>
          <span className="text-xl sm:text-2xl text-center font-bold text-orange-900">
            Accounts
          </span>
          <span className="flex-1 bg-orange-300 h-1 rounded-full"></span>
        </div>
        {/* CREATE BUTTON, SEARCH BAR, ACCOUNT TYPE, AND FILTER CONTAINER*/}
        <div className="flex flex-col-reverse items-center gap-2 w-full mb-2 md:flex-row-reverse">
          <div className="flex items-center gap-2 justify-between w-full">
            {/* SEARCH BAR */}
            <input
              type="text"
              id="inputSearch"
              placeholder="Search accounts..."
              className="border-2 border-solid border-gray-200 text-sm sm:text-base
                                md:text-lg h-10 pl-2 rounded-md bg-gray-50 w-full font-semibold"
              value={searchInput}
              onChange={handleSearchInputChange}
            />
            {/* FILTER */}
            {accountType === "users" ? (
              <UsersFilter onFilterChange={handleFilterChange} />
            ) : (
              <AdminStaffFilter onFilterChange={handleFilterStaffChange} />
            )}
          </div>
          <div className="flex gap-2 items-center justify-between w-full md:w-1/2">
            {/* SELECT ACCOUNT TYPE */}
            <select
              name="selectAccounts"
              id="selectAccounts"
              className="w-2/3 rounded-md border-2 border-gray-100 shadow-md h-10 bg-whitep font-bold text-center
                            text-gray-500"
              onChange={handleCategoryChange}
            >
              <option value="users">Users</option>
              <option value="staff">Staff</option>
            </select>
            {/* CREATE BUTTON */}
            <Link
              href={`fkstllaccounts/add${
                accountType === "users" ? "users" : ""
              }`}
              className="bg-orange-950 text-white font-bold h-10 w-1/3 rounded-md shadow-md
                                hover:scale-[1.02] hover:bg-orange-900 duration-200 pt-2 text-center md:w-auto md:px-4"
            >
              Create
            </Link>
          </div>
        </div>
        {/* ACCOUNTS LIST CONTAINER */}
        {accountType === "users" ? (
          <div className="w-full flex flex-col justify-center gap-2 max-h-[720px] overflow-y-auto pb-2">
            {/* USER ACCOUNTS */}
            {currentUserAccounts.map((user) => (
              <div
                className="w-full bg-white border-2 border-gray-100 shadow-md rounded-md p-2
                                    flex flex-col justify-center gap-2"
                key={user.username}
                onClick={() => toggleOrder(user.username)}
              >
                {/* USER HEADER CONTAINER */}
                <div className="flex gap-2 justify-between items-center">
                  <div className="flex flex-col gap-0">
                    {/* USER FULL NAME */}
                    <h1 className="sm:text-lg font-bold text-gray-900 mb-[-4px]">
                      {user.firstName + " " + user.lastName}
                    </h1>
                    {/* USER EMAIL */}
                    <p className="text-sm font-light text-gray-500">
                      {user.username}
                    </p>
                    <p
                      className={`text-xs font-bold uppercase text-${
                        user.totalPaid < 1000
                          ? "gray-700"
                          : user.totalPaid < 5000
                          ? "orange-900"
                          : user.totalPaid < 10000
                          ? "gray-400"
                          : user.totalPaid < 20000
                          ? "yellow-500"
                          : "green-600"
                      }`}
                    >{`${
                      user.totalPaid < 1000
                        ? "REGULAR"
                        : user.totalPaid < 5000
                        ? "BRONZE"
                        : user.totalPaid < 10000
                        ? "SILVER"
                        : user.totalPaid < 20000
                        ? "GOLD"
                        : "DIAMOND"
                    } MEMBER`}</p>
                  </div>

                  {/* ARROW */}
                  <span
                    className="w-6 aspect-square rounded-full bg-gray-100 flex justify-center items-center
                                            mr-4 cursor-pointer"
                  >
                    <i
                      className={`fa ${
                        expandedOrders[user.username]
                          ? "fa-caret-down"
                          : "fa-caret-right"
                      } text-gray-300 text-xs`}
                      aria-hidden="true"
                    ></i>
                  </span>
                </div>
                {/* EXPANDED DETAILS AND ACTIONS CONTAINER */}
                {expandedOrders[user.username] && (
                  <div className="bg-gray-100 p-2 rounded-md flex flex-col gap-1 items-start">
                    {/* ADDRESS */}
                    <div className="flex flex-col">
                      <h1 className="text-xs font-light text-gray-600">
                        Address
                      </h1>
                      <p className="text-sm text-gray-600 font-semibold">
                        {user.address}
                      </p>
                    </div>
                    {/* PHONE NUMBER */}
                    <div className="flex flex-col">
                      <h1 className="text-xs font-light text-gray-600">
                        Phone Number
                      </h1>
                      <p className="text-sm text-gray-600 font-semibold">
                        {user.phone}
                      </p>
                    </div>
                    {/* ACTIONS */}
                    <div className="w-full flex gap-2 items-center justify-end">
                      {/* EDIT BUTTON */}
                      {/* <Link
                        href={`/fkstllaccounts/editusers/${users.username}`}
                        className="h-10 text-center pt-1.5 font-bold text-gray-500 bg-white w-1/2 border-gray-100
                        border-2 shadow-md rounded-md hover:bg-gray-50 hover:scale-[1.02] duration-200"
                    >
                        Edit
                    </Link> */}
                      {/* GIVE VOUCHER BUTTON
                      <button
                        className="h-10 w-2/3 bg-white border-2 border-gray-100 font-bold rounded-md shadow-md
                                    hover:bg-gray-50 hover:scale-[1.02] duration-200 mt-2 text-gray-500"
                          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                          setIsFormOpen(true);
                          event.stopPropagation();
                          toggleForm();
                        }}
                      >
                        Send Discount
                      </button> */}
                      {/* DELETE BUTTON */}
                      <button
                        className="h-10 w-1/3 bg-red-500 font-bold text-white rounded-md shadow-md
                                                hover:bg-red-400 hover:scale-[1.02] duration-200 mt-2"
                        onClick={() => handleDeleteUser(user.username)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full flex flex-col justify-center gap-2">
            {/* STAFF ACCOUNTS */}
            {currentStaffAccounts.map((staff) => (
              <div
                className="w-full bg-white border-2 border-gray-100 shadow-md rounded-md p-2
                                    flex flex-col justify-center gap-2"
                key={staff.username}
              >
                <div className="flex flex-col gap-0">
                  {/* STAFF NAME */}
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-[-4px]">
                    {staff.firstName + " " + staff.lastName}
                  </h1>
                  <p className="font-light text-gray-500 text-sm">
                    {staff.username}
                  </p>
                </div>
                {/* STATUS AND ROLE CONTAINER */}
                <div className="w-full flex items-center gap-1">
                  {/* ACTIVE OR NOT */}
                  <div className="w-1/2 flex flex-col gap-1 items-center justify-center">
                    <label
                      className="text-orange-950 text-sm w-full text-left space-x-1"
                      htmlFor="activateOptions"
                    >
                      <span>Status</span>
                    </label>
                    <select
                      name="activateOptions"
                      id="selectActivation"
                      className="h-10 bg-white border-2 rounded-md shadow-md border-gray-100 font-semibold
                                            text-gray-500 text-center w-full"
                      value={staff.status}
                      onChange={(e) =>
                        handleStatusChange(staff.username, e.target.value)
                      }
                    >
                      {status.map((stat) => (
                        <option value={stat.value} key={stat.id}>
                          {stat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* ROLE */}
                  <div className="w-1/2 flex flex-col gap-1 items-center justify-center">
                    <label
                      className="text-orange-950 text-sm w-full text-left space-x-1"
                      htmlFor="roleOptions"
                    >
                      <span>Role</span>
                    </label>
                    <select
                      name="roleOptions"
                      id="selectRole"
                      className="h-10 bg-white border-2 rounded-md shadow-md border-gray-100 font-semibold
                                            text-gray-500 text-center w-full"
                      value={staff.role}
                      onChange={(e) =>
                        handleRoleChange(staff.username, e.target.value)
                      }
                    >
                      {roles.map((stat) => (
                        <option value={stat.value} key={stat.id}>
                          {stat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {/* ACTIONS CONTAINER */}
                <div className="w-full flex justify-end gap-1">
                  <Link
                    href={`/fkstllaccounts/edit/${staff.username}`}
                    className="h-10 bg-white border-2 rounded-md shadow-md border-gray-100 font-semibold
                                        text-gray-500 text-center w-1/4 hover:bg-gray-50 hover:scale-[1.02] duration-200 pt-1.5"
                  >
                    Edit
                  </Link>
                  <button
                    className="h-10 bg-red-500 rounded-md shadow-md font-semibold
                                        text-orange-50 text-center w-1/4 hover:bg-red-400 hover:scale-[1.02] duration-200"
                    onClick={() => handleDeleteStaff(staff.username)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* PAGINATION CONTROLS */}
        <div
          className={`flex justify-center items-center space-x-2
              ${
                (accountType === "users" && !filteredUserAccounts) ||
                (accountType === "staff" && !filteredStaffAccounts)
                  ? "hidden"
                  : ""
              }`}
        >
          <button
            className="font-semibold cursor-pointer w-24 border-2 shadow-md h-9 border-gray-100 bg-white rounded-md text-gray-500 hover:bg-gray-50"
            disabled={currentPage === 1}
            onClick={handlePrevious}
          >
            Prev
          </button>
          {visiblePages.map((page) => (
            <button
              key={page}
              className={`cursor-pointer h-9 aspect-square font-semibold rounded-md ${
                currentPage === page
                  ? "bg-orange-300 text-white border-orange-300 border-2"
                  : "bg-white text-gray-500 hover:bg-orange-50 border-2 border-gray-100 hover:border-orange-50 hover:text-orange-500"
              } shadow-md`}
              onClick={() => goToPage(page)}
            >
              {page}
            </button>
          ))}
          <button
            className="cursor-pointer font-semibold w-24 border-2 shadow-md h-9 border-gray-100 bg-white rounded-md text-gray-500 hover:bg-gray-50"
            disabled={
              currentPage ===
              (accountType === "users" ? totalUserPages : totalStaffPages)
            }
            onClick={accountType === "users" ? handleUserNext : handleStaffNext}
          >
            Next
          </button>
        </div>
      </div>

      <AccGiveVoucherForm isOpen={isFormOpen} toggleForm={toggleForm} />
    </div>
  );
};

export default AccountsListPage;