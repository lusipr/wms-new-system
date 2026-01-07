"use client";

import React, { useRef } from "react";
import Barcode from "react-barcode";
import { useReactToPrint } from "react-to-print";

interface OnlyBarcodePrint {
  barcode: string;
  cancel?: () => void;
}

const OnlyBarcodePrinted: React.FC<OnlyBarcodePrint> = ({
  barcode,
  cancel,
}) => {
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  return (
    <div>
      <div className="border rounded-md border-gray-500 p-2 w-fit">
        <div
          className="w-[7cm] h-[4cm] flex justify-start items-center font-sans p-1"
          ref={componentRef}
        >
          <div className="w-full">
            <div className="flex items-center justify-between w-full">
              {barcode && (
                <Barcode
                  fontOptions="bold"
                  textMargin={3}
                  fontSize={16}
                  font="sans-serif"
                  value={barcode}
                  width={1.2}
                  height={50}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-6">
        {cancel && (
          <button
            onClick={(e) => {
              e.preventDefault();
              cancel();
            }}
            className="py-2 px-8 bg-gray-300/80 text-black rounded-full hover:bg-gray-300"
          >
            Cancel
          </button>
        )}
        <button
          onClick={() => handlePrint()}
          className="py-2 px-8 bg-sky-400/80 text-black rounded-full hover:bg-sky-400"
        >
          Print
        </button>
      </div>
    </div>
  );
};

export default OnlyBarcodePrinted;
