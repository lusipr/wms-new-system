"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown, Circle } from "lucide-react";
import React from "react";

const PopoverWithTrigger = ({
  open,
  setIsOpen,
  data,
  dataId,
  trigger,
  onSelect,
  itemSelect,
}: {
  open: boolean;
  setIsOpen: any;
  data: any[];
  dataId: any;
  trigger: any;
  onSelect: any;
  itemSelect: any;
}) => {
  return (
    <Popover open={open} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button className="justify-between bg-transparent shadow-none hover:bg-transparent text-black group hover:underline hover:underline-offset-2 border border-sky-400/80 hover:border-sky-400">
          {trigger}
          <div className="size-8 rounded-full flex items-center justify-center group-hover:bg-sky-50">
            <ChevronDown className="size-4" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0"
        style={{ width: "var(--radix-popover-trigger-width)" }}
      >
        <Command>
          <CommandInput />
          <CommandList className="p-1">
            <CommandGroup>
              <CommandEmpty>No Data Found.</CommandEmpty>
              {data.map((item: any) => (
                <CommandItem
                  key={item.id}
                  className="border border-gray-500 my-2 first:mt-0 last:mb-0 flex gap-2 items-center"
                  onSelect={() => onSelect(item)}
                >
                  <div className="size-4 rounded-full border border-gray-500 flex-none flex items-center justify-center">
                    {dataId === item.id && (
                      <Circle className="fill-black size-2.5" />
                    )}
                  </div>
                  {itemSelect(item)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default PopoverWithTrigger;
