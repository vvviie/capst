import Link from "next/link";
import React from "react";
import AdminStaffFilter from "../components/AdminStaffFilter";

type staff = {
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  dateCreated: string;
  activated: boolean;
};

type listStaff = staff[];

const staffAccounts: listStaff = [
  {
    username: "jorgeangelo@gmail.com",
    firstName: "Jorge Angelo",
    lastName: "Pangilinan",
    role: "Bar",
    dateCreated: "10/28/2024",
    activated: true,
  },
  {
    username: "johanncarl@gmail.com",
    firstName: "Johann Carl",
    lastName: "Fellizar",
    role: "Kitchen",
    dateCreated: "10/28/2024",
    activated: true,
  },
  {
    username: "jericko@gmail.com",
    firstName: "Jericko",
    lastName: "Gomez",
    role: "Kitchen",
    dateCreated: "10/28/2024",
    activated: true,
  },
];

const status = [
  {
    id: 1,
    value: "Activated",
  },
  {
    id: 2,
    value: "Deactivated",
  },
];

const roles = [
  {
    id: 1,
    value: "Bar",
  },
  {
    id: 2,
    value: "Kitchen",
  },
];

const AccountsListPage = () => {
  return (
    <div
      className="min-h-[69.37vh] mt-14 px-10 pt-6 pb-20 md:px-24 xl:px-56 w-full bg-white flex 
      justify-center items-start
    lg:bg-[url('/backgrounds/bg3-2.png')] lg:bg-cover lg:bg-no-repeat lg:bg-center"
    >
      {/* MAIN CONTAINER */}
      <div className="w-full max-w-[600px] flex flex-col gap-2">
        {/* HEADER */}
        <h1 className="text-xl sm:text-2xl font-bold text-orange-950">
          Staff Accounts
        </h1>
        {/* CREATE BUTTON AND FILTER CONTAINER*/}
        <div className="flex justify-between items-center">
          {/* CREATE BUTTON */}
          <Link
            href={"fkstllaccounts/add"}
            className="bg-orange-950 text-white font-bold h-10 px-6 rounded-md shadow-md
          hover:scale-[1.02] hover:bg-orange-900 duration-200 pt-2"
          >
            Create
          </Link>
          {/* FILTER */}
          <AdminStaffFilter />
        </div>
        {/* ACCOUNTS LIST CONTAINER */}
        <div className="w-full flex flex-col justify-center gap-2">
          {/* STAFF ACCOUNTS */}
          {staffAccounts.map((staff) => (
            <div
              className="w-full bg-white border-2 border-gray-100 shadow-md rounded-md p-2
            flex flex-col justify-center gap-2"
            >
              {/* STAFF NAME */}
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                {staff.firstName + " " + staff.lastName}
              </h1>
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
                  >
                    {status.map((stat) => (
                      <option value={stat.value} key={stat.id}>
                        {stat.value}
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
                  >
                    {roles.map((stat) => (
                      <option value={stat.value} key={stat.id}>
                        {stat.value}
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
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccountsListPage;
