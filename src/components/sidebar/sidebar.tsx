"use client";

import Image from "next/image";
import { ArrowLeftToLine, MoveLeft, MoveLeftIcon, X } from "lucide-react";
import { MenuSidebar } from "./menu";
import { usePathname } from "next/navigation";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const Sidebar = ({ open, setOpen }: SidebarProps) => {
  if (!open) return null;
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-72 bg-white border-r border-gray-100 flex flex-col">
      {/* HEADER LOGO */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Image
            src="/images/liquid.png"
            alt="Liquid8"
            width={32}
            height={32}
          />
          <span className="text-lg font-bold text-gray-800">LIQUID8</span>
        </div>

        <button
          onClick={() => setOpen(false)}
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100  border border-gray-300"
        >
          <ArrowLeftToLine className="w-4 h-4" />
        </button>
      </div>

      {/* MENU */}
      <div className="bg-white flex-1 overflow-y-auto">
        <MenuSidebar pathname={pathname} />
      </div>
    </aside>
  );
};
