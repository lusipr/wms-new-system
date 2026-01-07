"use client";

import React, { Dispatch, ReactNode, SetStateAction, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { useQueryClient } from "@tanstack/react-query";

interface SidebarButtonProps {
  label: string;
  href: string | undefined;
  icon: ReactNode;
  sidebarMenu: any[];
  subMenu?: any[];
  query?: string;
  pathname: string;
  setOpenMenu: Dispatch<SetStateAction<string>>;
  openMenu: string;
  setOpenSubMenu: Dispatch<SetStateAction<string>>;
  openSubMenu: string;
  setOpen?: Dispatch<SetStateAction<boolean>>;
}

export const ButtonSidebar = ({
  label,
  href,
  icon,
  query,
  sidebarMenu,
  subMenu,
  pathname,
  openMenu,
  setOpenMenu,
  setOpenSubMenu,
  openSubMenu,
  setOpen,
}: SidebarButtonProps) => {
  // button width variant
  const buttonChevronVariant = {
    isClose: { rotate: "0deg" },
    isOpen: { rotate: "90deg" },
  };

  const queryClient = useQueryClient();

  const findActiveMenuTitle = () => {
    for (const menu of sidebarMenu) {
      for (const item of menu.menu) {
        // Check direct href match
        if (menu.href && pathname.includes(menu.href)) {
          return menu.title;
        }
        // Check sub_menu href match
        for (const subItem of item.sub_menu) {
          if (subItem.href && pathname.includes(subItem.href)) {
            return item.title;
          }
        }
      }
    }
    return null;
  };
  const findActiveSubMenuTitle = () => {
    for (const menu of sidebarMenu) {
      for (const item of menu.menu) {
        for (const subItem of item.sub_menu) {
          if (subItem.href && pathname.includes(subItem.href)) {
            return subItem.title;
          }
        }
      }
    }
    return null;
  };

  useEffect(() => {
    // Function to find the active menu title
    setOpenMenu(findActiveMenuTitle());
    // Function to find the active menu title
    setOpenSubMenu(findActiveSubMenuTitle());
  }, [pathname]);
  return (
    <div className="w-full">
      {href ? (
        <Button
          asChild
          type="button"
          className={cn(
            "flex items-center leading-none h-10 bg-transparent shadow-none hover:bg-sky-200/70 dark:hover:bg-sky-300 px-3 transition-all text-sm font-medium rounded-md justify-between w-full",
            pathname.includes(href) &&
              "bg-sky-200/50 hover:bg-sky-200/80 border border-sky-300"
          )}
          onClick={() => {
            setOpen?.(false);
            if (query) {
              queryClient.invalidateQueries({ queryKey: [query] });
            }
          }}
        >
          <Link href={href}>
            <div className="flex gap-2 items-center w-full capitalize text-sky-900">
              <span className="w-4 h-4">{icon}</span>
              <span>{label}</span>
            </div>
          </Link>
        </Button>
      ) : (
        <>
          <button
            type="button"
            className={cn(
              "flex items-center leading-none h-10 bg-transparent hover:bg-sky-200/70 dark:hover:bg-sky-300 px-3 transition-all text-sm font-medium rounded-md justify-between w-full",
              (openMenu === label || findActiveMenuTitle() === label) &&
                "bg-sky-200/50 hover:bg-sky-200/80 border border-sky-300"
            )}
            onClick={() =>
              label === openMenu ? setOpenMenu("") : setOpenMenu(label)
            }
          >
            <div className="flex gap-2 items-center w-full capitalize text-sky-900">
              <span className="w-5 h-5">{icon}</span>
              <span>{label}</span>
            </div>
            <motion.span
              initial="isClose"
              animate={openMenu === label ? "isOpen" : "isClose"}
              variants={buttonChevronVariant}
              transition={{ delay: 0, duration: 0.5 }}
            >
              <ChevronRight className="h-4 w-4 text-sky-900" />
            </motion.span>
          </button>
          {subMenu && subMenu?.length > 0 && (
            <AnimatePresence>
              {openMenu === label && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden flex flex-col items-start mt-1"
                >
                  {subMenu.map((item) => (
                    <Link href={item.href} className="w-full" key={item.href}>
                      <button
                        className={cn(
                          "flex items-center leading-none capitalize h-10 text-sky-900 bg-transparent hover:bg-sky-200/50 hover:border hover:border-sky-300 dark:hover:bg-sky-300 pl-6 pr-3 transition-all text-sm font-light rounded-md justify-start before:pr-1 w-full before:content-['-']",
                          (pathname === item.href ||
                            openSubMenu === item.title) &&
                            "*:underline text-sky-950"
                        )}
                        type="button"
                        onClick={() => setOpen?.(false)}
                      >
                        <p>{item.title}</p>
                      </button>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </>
      )}
    </div>
  );
};
