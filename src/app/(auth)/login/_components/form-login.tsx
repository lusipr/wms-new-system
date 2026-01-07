"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";

import { Eye, EyeOff } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

import { useLogin } from "../_api/use-login";

import { LoadingLogin } from "./loading-login";

export const FormLogin = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [input, setInput] = useState({
    emailOrUsername: "",
    password: "",
  });

  const { mutate, isPending } = useLogin();

  const handleChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
    setInput((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const body = {
      email_or_username: input.emailOrUsername,
      password: input.password,
    };

    mutate({ body });
  };
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <LoadingLogin />;
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="flex flex-col gap-4 px-6 pb-6">
        <div className="flex w-full flex-col gap-1">
          <Label>Email or Username</Label>
          <Input
            name="emailOrUsername"
            value={input.emailOrUsername}
            onChange={handleChangeValue}
            placeholder="Email/Username"
          />
        </div>
        <div className="flex w-full flex-col gap-1">
          <Label>Password</Label>
          <div className="relative flex items-center">
            <Input
              type={isVisible ? "text" : "password"}
              name="password"
              value={input.password}
              placeholder="•••••••"
              className="tracking-widest"
              onChange={handleChangeValue}
            />
            <button
              type="button"
              className="absolute right-3"
              onClick={() => setIsVisible(!isVisible)}
            >
              {isVisible ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
      <CardFooter>
        <Button
          type="submit"
          className="w-full bg-sky-500/70 hover:bg-sky-500 text-black"
          disabled={isPending}
        >
          Sign in
        </Button>
      </CardFooter>
    </form>
  );
};
