"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  PopoverPortal,
  PopoverPortalContent,
  PopoverPortalTrigger,
} from "@/components/ui/popover-portal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { alertError, cn } from "@/lib/utils";

import { AxiosError } from "axios";
import React, { FormEvent, useEffect, useState } from "react";
import { ChevronDown, Eye, EyeOff, Loader, Loader2, Send } from "lucide-react";

import {
  useCreateAccount,
  useGetDetailAccount,
  useUpdateAccount,
} from "../../_api";

const DialogCreateEdit = ({
  open,
  onCloseModal,
  role,
  userId,
}: {
  open: boolean;
  onCloseModal: () => void;
  role: any[];
  userId: any;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const defaultValue = {
    name: "",
    username: "",
    roleId: "",
    email: "",
    password: "",
  };

  // data form create edit
  const [input, setInput] = useState(defaultValue);

  // mutate DELETE, UPDATE, CREATE
  const { mutate: mutateUpdate, isPending: isPendingUpdate } =
    useUpdateAccount();
  const { mutate: mutateCreate, isPending: isPendingCreate } =
    useCreateAccount();

  const isPendingSubmit = isPendingUpdate || isPendingCreate;

  // get detail data
  const {
    data: dataUser,
    isLoading: isLoadingUser,
    isSuccess: isSuccessUser,
    isError: isErrorUser,
    error: errorUser,
  } = useGetDetailAccount({ id: userId });

  // set data detail
  useEffect(() => {
    if (isSuccessUser && dataUser) {
      const dataRes = dataUser.data.data.resource;
      setInput((prev) => ({
        ...prev,
        name: dataRes.name ?? "",
        username: dataRes.username ?? "",
        roleId: dataRes.role_id ?? "",
        email: dataRes.email ?? "",
      }));
    }
  }, [dataUser]);

  // handle create
  const handleSubmit = (isUpdate: boolean, e: FormEvent) => {
    e.preventDefault();
    const body = {
      email: input.email,
      name: input.name,
      password: input.password,
      role_id: input.roleId,
      username: input.username,
    };
    if (isUpdate) {
      mutateUpdate(
        { body, params: { id: userId ?? "" } },
        {
          onSuccess: () => {
            onCloseModal();
          },
        }
      );
    } else {
      mutateCreate(
        { body },
        {
          onSuccess: () => {
            onCloseModal();
          },
        }
      );
    }
  };

  useEffect(() => {
    // isError get Detail
    alertError({
      isError: isErrorUser,
      error: errorUser as AxiosError,
      action: "get data",
      data: "User",
      method: "GET",
    });
  }, [isErrorUser, errorUser]);

  useEffect(() => {
    if (!open) {
      setIsVisible(false);
      setIsOpen(false);
      setInput(defaultValue);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onCloseModal}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {userId ? "Edit Account" : "Create Account"}
          </DialogTitle>
          <DialogDescription />
        </DialogHeader>
        {isLoadingUser ? (
          <div className="h-[420px] flex items-center justify-center">
            <Loader className="size-5 animate-spin" />
          </div>
        ) : (
          <form
            onSubmit={(e) => handleSubmit(!!userId, e)}
            className="w-full flex flex-col gap-4"
          >
            <div className="border p-4 rounded border-sky-500 gap-4 flex flex-col">
              <div className="flex flex-col gap-1 w-full">
                <Label>Name</Label>
                <Input
                  className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                  placeholder="Name..."
                  value={input.name}
                  disabled={isPendingSubmit}
                  onChange={(e) =>
                    setInput((prev: any) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <Label>Role</Label>
                <PopoverPortal open={isOpen} onOpenChange={setIsOpen}>
                  <PopoverPortalTrigger asChild>
                    <Button className="justify-between border-b bg-transparent hover:bg-transparent text-black shadow-none border-sky-400/80 rounded-none">
                      <p>
                        {input.roleId
                          ? role.find((item) => item.id === input.roleId)
                              ?.role_name
                          : "Select Role"}
                      </p>
                      <ChevronDown className="size-4" />
                    </Button>
                  </PopoverPortalTrigger>
                  <PopoverPortalContent
                    className="p-0"
                    style={{ width: "var(--radix-popover-trigger-width)" }}
                  >
                    <Command>
                      <CommandInput placeholder="Search Role..." />
                      <CommandList>
                        <CommandEmpty>No Data Found.</CommandEmpty>
                        <CommandGroup>
                          {role.map((item) => (
                            <CommandItem
                              onSelect={() => {
                                setIsOpen(false);
                                setInput((prev: any) => ({
                                  ...prev,
                                  roleId: item.id,
                                }));
                              }}
                              key={item.id}
                            >
                              {item.role_name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverPortalContent>
                </PopoverPortal>
              </div>
              <div className="flex flex-col gap-1 w-full">
                <Label>Username</Label>
                <Input
                  className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                  placeholder="username"
                  value={input.username}
                  disabled={isPendingSubmit}
                  onChange={(e) =>
                    setInput((prev: any) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <Label>Email</Label>
                <Input
                  className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                  placeholder="Email..."
                  type="email"
                  value={input.email}
                  disabled={isPendingSubmit}
                  onChange={(e) =>
                    setInput((prev: any) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <Label>Password</Label>
                <div className="relative w-full flex items-center">
                  <Input
                    className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                    placeholder="****"
                    type={isVisible ? "text" : "password"}
                    value={input.password}
                    disabled={isPendingSubmit}
                    onChange={(e) =>
                      setInput((prev: any) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                  />
                  <Button
                    type={"button"}
                    variant={"ghost"}
                    size={"icon"}
                    className="size-fit absolute right-3"
                    onClick={() => setIsVisible(!isVisible)}
                  >
                    {isVisible ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex w-full gap-2">
              <Button
                className="w-full bg-transparent hover:bg-transparent text-black border-black/50 border hover:border-black"
                onClick={(e) => {
                  e.preventDefault();
                  onCloseModal();
                }}
                type="button"
              >
                Cancel
              </Button>
              <Button
                className={cn(
                  "text-black w-full",
                  userId
                    ? "bg-yellow-400 hover:bg-yellow-400/80"
                    : "bg-sky-400 hover:bg-sky-400/80"
                )}
                type="submit"
                disabled={
                  !input.name ||
                  !input.username ||
                  !input.roleId ||
                  !input.email ||
                  (!userId && !input.password) ||
                  isPendingSubmit
                }
              >
                {isPendingSubmit ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Send />
                )}
                {userId ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DialogCreateEdit;
