import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full border-4 border-t-4 border-orange-500 border-t-transparent h-16 w-16"></div>
    </div>
  );
};

export default Spinner;