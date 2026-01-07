import React from "react";
import { RefreshCw } from "lucide-react";

import { Input } from "./ui/input";
import { Button } from "./ui/button";

import { cn } from "@/lib/utils";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";

interface InputSearchProps {
  value?: string | number | readonly string[];
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  autoFocus?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  loading?: boolean;
}

export const InputSearch = ({
  value,
  onChange,
  placeholder,
  autoFocus,
  onClick,
  disabled,
  loading,
}: InputSearchProps) => {
  return (
    <div className="flex items-center gap-3 w-full">
      <Input
        className="w-2/5 border-sky-400/80 focus-visible:ring-sky-400"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        disabled={disabled}
      />
      <TooltipProviderPage value={"Reload Data"}>
        <Button
          onClick={onClick}
          className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
          variant={"outline"}
          disabled={disabled}
        >
          <RefreshCw className={cn("w-4 h-4", loading ? "animate-spin" : "")} />
        </Button>
      </TooltipProviderPage>
    </div>
  );
};
