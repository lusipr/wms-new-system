import Image from "next/image";
import React from "react";

const Loading = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex items-center justify-center flex-col">
        <div className="relative w-16 aspect-square animate-bounce animate-infinite animate-ease-in">
          <Image
            src="/images/liquid.png"
            alt="liquid8"
            fill
            className="object-contain"
          />
        </div>
        <p className="font-semibold text-lg">Loading...</p>
      </div>
    </div>
  );
};

export default Loading;
