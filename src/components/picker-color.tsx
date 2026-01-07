"use client";

import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import React, {
  Dispatch,
  MouseEvent,
  SetStateAction,
  useEffect,
  useState,
} from "react";

const hexToHsl = (hex: string) => {
  // Normalisasi input HEX
  const normalizedHex =
    hex.length === 4
      ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
      : hex;

  const r = parseInt(normalizedHex.slice(1, 3), 16) / 255;
  const g = parseInt(normalizedHex.slice(3, 5), 16) / 255;
  const b = parseInt(normalizedHex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    if (max === r) {
      h = (g - b) / d + (g < b ? 6 : 0);
    } else if (max === g) {
      h = (b - r) / d + 2;
    } else {
      h = (r - g) / d + 4;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

// Function to convert HSL to HEX
const hslToHex = (h: number, s: number, l: number): string => {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;

  const calculateColor = (n: number): string => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };

  return `#${calculateColor(0)}${calculateColor(8)}${calculateColor(4)}`;
};

const PickerColor = ({
  hexColor,
  setHexColor,
  isOpen,
}: {
  isOpen: boolean;
  hexColor: string;
  setHexColor: Dispatch<SetStateAction<string>>;
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [hue, setHue] = useState<number>(0);
  const [lightness, setLightness] = useState<number>(50);

  // Function to handle hex color input change
  const handleHexChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const hex = event.target.value;
    setHexColor(hex);

    // Convert hex to HSL
    const { h, l } = hexToHsl(hex);

    // Set HSL values and update hex color
    setHue(h);
    setLightness(l);
  };
  // Function to handle hex color input change
  const handleChange = (e: MouseEvent, hexColor: string) => {
    e.preventDefault();
    const hex = hexColor;
    setHexColor(hex);

    // Convert hex to HSL
    const { h, l } = hexToHsl(hex);

    // Set HSL values and update hex color
    setHue(h);
    setLightness(l);
  };

  // Function to handle hue change
  const handleHueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newHue = parseInt(event.target.value, 10);
    setHue(newHue);
    setHexColor(hslToHex(newHue, 100, lightness));
  };

  // Function to handle lightness change
  const handleLightnessChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newLightness = parseInt(event.target.value, 10);
    setLightness(newLightness);
    setHexColor(hslToHex(hue, 100, newLightness));
  };

  useEffect(() => {
    const { h, l } = hexToHsl(hexColor);

    // Set HSL values and update hex color
    setHue(h);
    setLightness(l);
  }, [isOpen]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }
  return (
    <div className="w-full grid gap-4">
      <style>{`
        input[type="range"]:nth-of-type(2)::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background-color: ${hexColor}; /* Pointer color based on hue */
          border: 4px solid white; /* Border for better visibility */
          border-radius: 50%; /* Makes it circular */
          box-shadow: 0 0 2px rgba(0, 0, 0, 0.5); /* Adds a slight shadow */
        }
        input[type="range"]:nth-of-type(2)::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background-color: ${hexColor};
          border: 4px solid white;
          border-radius: 50%;
          box-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
        }
        input[type="range"]:nth-of-type(1)::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background-color: black; /* Fixed white color for lightness pointer */
          border: 4px solid white; /* Black border for contrast */
          border-radius: 50%;
          box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
        }
        input[type="range"]:nth-of-type(1)::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background-color: black;
          border: 4px solid white;
          border-radius: 50%;
          box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
        }
      `}</style>
      <div
        style={{ background: hexColor }}
        className="w-full aspect-[3/1] rounded shadow border border-gray-500"
      />
      <input
        type="range"
        min="0"
        max="360"
        value={hue}
        onChange={handleHueChange}
        className="w-full h-5 rounded-full border-2 border-white shadow appearance-none cursor-pointer"
        style={{
          backgroundImage: `linear-gradient(to right, red, yellow, #00FF00, cyan, blue,  violet, red)`,
        }}
      />
      <input
        type="range"
        min="0"
        max="100"
        value={lightness}
        onChange={handleLightnessChange}
        className="w-full h-5 rounded-full border-2 border-white shadow appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, black, hsl(${hue}, 100%, 50%), white)`,
        }}
      />
      <input
        type="text"
        value={hexColor}
        onChange={handleHexChange}
        className="w-full p-2 border rounded text-center border-sky-400 focus-visible:border-sky-500 focus-visible:outline-none focus-visible:ring-0"
        placeholder="#ff0000"
      />
      <div className="p-2 gap-2 grid grid-cols-11 border border-sky-400 w-full rounded">
        <TooltipProviderPage value="Black">
          <button
            className="h-8 border shadow rounded bg-[#000000]"
            onClick={(e) => {
              handleChange(e, "#000000");
            }}
          />
        </TooltipProviderPage>
        <TooltipProviderPage value="White">
          <button
            className="h-8 border shadow rounded bg-[#ffffff]"
            onClick={(e) => {
              handleChange(e, "#ffffff");
            }}
          />
        </TooltipProviderPage>
        <TooltipProviderPage value="Red">
          <button
            className="h-8 border shadow rounded bg-[#FF0000]"
            onClick={(e) => {
              handleChange(e, "#FF0000");
            }}
          />
        </TooltipProviderPage>
        <TooltipProviderPage value="Yellow">
          <button
            className="h-8 border shadow rounded bg-[#FFFF00]"
            onClick={(e) => {
              handleChange(e, "#FFFF00");
            }}
          />
        </TooltipProviderPage>
        <TooltipProviderPage value="Green">
          <button
            className="h-8 border shadow rounded bg-[#00FF00]"
            onClick={(e) => {
              handleChange(e, "#00FF00");
            }}
          />
        </TooltipProviderPage>
        <TooltipProviderPage value="Brown">
          <button
            className="h-8 border shadow rounded bg-[#92400e]"
            onClick={(e) => {
              handleChange(e, "#92400e");
            }}
          />
        </TooltipProviderPage>
        <TooltipProviderPage value="Blue">
          <button
            className="h-8 border shadow rounded bg-[#0000FF]"
            onClick={(e) => {
              handleChange(e, "#0000FF");
            }}
          />
        </TooltipProviderPage>
        <TooltipProviderPage value="Purple">
          <button
            className="h-8 border shadow rounded bg-[#FF00FF]"
            onClick={(e) => {
              handleChange(e, "#FF00FF");
            }}
          />
        </TooltipProviderPage>
        <TooltipProviderPage value="Teal">
          <button
            className="h-8 border shadow rounded bg-[#008080]"
            onClick={(e) => {
              handleChange(e, "#008080");
            }}
          />
        </TooltipProviderPage>
        <TooltipProviderPage value="Navy">
          <button
            className="h-8 border shadow rounded bg-[#000080]"
            onClick={(e) => {
              handleChange(e, "#000080");
            }}
          />
        </TooltipProviderPage>
        <TooltipProviderPage value="Orange">
          <button
            className="h-8 border shadow rounded bg-[#f97316]"
            onClick={(e) => {
              handleChange(e, "#f97316");
            }}
          />
        </TooltipProviderPage>
      </div>
    </div>
  );
};

export default PickerColor;
