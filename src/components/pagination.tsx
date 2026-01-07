"use client";

import React, { useState } from "react";
import { Badge } from "./ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { Button } from "./ui/button";

const Pagination = ({
  setPagination,
  pagination,
}: {
  pagination: {
    current: number;
    last: number;
    from: number;
    total: number;
    perPage: number;
  };
  setPagination: any;
}) => {
  // cookies
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-3 items-center">
        <Badge className="rounded-full hover:bg-sky-100 bg-sky-100 text-black border border-sky-500 text-sm">
          Total: {pagination.total.toLocaleString()}
        </Badge>
        <Badge className="rounded-full hover:bg-green-100 bg-green-100 text-black border border-green-500 text-sm">
          Row per page: {pagination.perPage.toLocaleString()}
        </Badge>
      </div>
      <div className="flex gap-5 items-center text-sm">
        <Popover modal={true} open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <button className="w-fit flex items-center gap-1">
              <div className="pr-1 gap-1 py-0.5 pl-2 rounded bg-sky-100 hover:bg-sky-200 flex items-center">
                <span>Page {pagination.current.toLocaleString()}</span>
                <ChevronUp className="size-4" />
              </div>
              <span>of {pagination.last.toLocaleString()}</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-24 p-1">
            <Command>
              <CommandInput />
              <CommandList>
                <CommandEmpty>Data not found.</CommandEmpty>
                <CommandGroup>
                  {Array.from({ length: pagination.last }, (_, i) => (
                    <CommandItem
                      key={i}
                      className="justify-center"
                      onSelect={() => {
                        setPagination(i + 1);
                        setIsOpen(false);
                      }}
                    >
                      {(i + 1).toLocaleString()}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <div className="flex items-center gap-2">
          <Button
            className="p-0 h-9 w-9 bg-sky-400/80 hover:bg-sky-400 text-black"
            onClick={() => {
              setPagination((prev: number) => prev - 1);
            }}
            disabled={pagination.current === 1}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            className="p-0 h-9 w-9 bg-sky-400/80 hover:bg-sky-400 text-black"
            onClick={() => {
              setPagination((prev: number) => prev + 1);
            }}
            disabled={pagination.current === pagination.last}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
