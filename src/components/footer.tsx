import React from "react";

export const Footer = () => {
  return (
    <div className="mx-3 pb-5">
      <div className="w-full px-5 py-3 bg-white rounded-md border border-gray-50 shadow-md text-center relative">
        <p className="text-sm">
          © {new Date().getFullYear()} PT. LIKUID MEGAH SEMESTA , ALL RIGHTS
          RESERVED.
        </p>
      </div>
    </div>
  );
};
