import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

type FilterOption = {
  id: number;
  name: string;
  value: string;
};

const statusOptions: FilterOption[] = [
  { id: 1, name: "ALL", value: "all" },
  { id: 2, name: "REQUESTED", value: "REQUESTED" },
  { id: 3, name: "PENDING", value: "PENDING" },
  { id: 4, name: "TO PAY", value: "TO PAY" },
  { id: 5, name: "PAID", value: "PAID" },
  { id: 6, name: "REJECTED", value: "REJECTED" },
  { id: 7, name: "CANCELLED", value: "CANCELLED" },
  { id: 8, name: "DONE", value: "DONE" },
];

interface AdminReservationFilterProps {
  onStatusChange: (status: string) => void;
}

const AdminReservationFilter: React.FC<AdminReservationFilterProps> = ({ onStatusChange }) => {
  const [open, setOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const formRef = useRef<HTMLFormElement | null>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (formRef.current && !formRef.current.contains(event.target as Node)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Only update local selectedStatus on radio button change
  const handleStatusSelect = (value: string) => {
    setSelectedStatus(value);
  };

  // Trigger filter update only when clicking "Apply Filter"
  const applyFilter = () => {
    onStatusChange(selectedStatus);
    setOpen(false); // Optionally close the filter menu
  };

  return (
    <div className="h-6 w-6 cursor-pointer z-10 relative mr-2">
      <Image
        src="/filter.webp"
        alt="filter"
        fill
        className="object-contain"
        onClick={() => setOpen(true)}
      />
      {open && (
        <div
          className="fixed top-14 left-0 w-full h-[calc(100vh-56px)] flex items-center justify-center"
          style={{ background: "rgba(0, 0, 0, 0.5)" }}
        >
          <form
            ref={formRef}
            id="drinksFilter"
            className="bg-white rounded-md shadow-xl p-8 flex flex-col gap-2 min-w-72 mx-10 max-h-[720px] overflow-auto border-2 border-gray-100 mt-[-200px]"
          >
            <h1 className="text-xl text-left font-semibold text-orange-950 my-1">
              Status
            </h1>
            <hr />
            <div className="grid grid-cols-2 sm:grid-cols-3">
              {statusOptions.map((stat) => (
                <div
                  className="flex items-center justify-start space-x-2 mx-1 my-3"
                  key={stat.id}
                >
                  <input
                    type="radio"
                    name="status"
                    id={`radio${stat.value}`}
                    className="w-4 h-4"
                    checked={selectedStatus === stat.value}
                    onChange={() => handleStatusSelect(stat.value)}
                  />
                  <span className="text-sm text-center">{stat.name}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={applyFilter}
              className="w-full text-white font-bold text-xl bg-orange-950 px-4 py-2 rounded-md shadow-md mt-4 hover:bg-orange-900 hover:scale-[1.02] duration-300"
            >
              Apply Filter
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminReservationFilter;
