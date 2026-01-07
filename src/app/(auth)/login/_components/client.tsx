"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { LeftBackground } from "./left-background";
import { RightBackground } from "./right-background";
import { FormLogin } from "./form-login";
import { sizesImage } from "@/lib/utils";

export const Client = () => {
  return (
    <div className="flex justify-center items-center h-full px-3 relative w-full">
      <div className="absolute left-0 h-3/5 z-0">
        <LeftBackground />
      </div>
      <div className="absolute right-0 h-3/5 z-0">
        <RightBackground />
      </div>
      <Card className="w-full max-w-sm backdrop-blur-sm z-10 bg-white/70">
        <CardHeader className="flex-row items-center space-y-0 gap-2">
          <div className="h-14.5 relative aspect-square">
            <Image 
              alt=""
              src={"/images/liquid.png"}
              fill
              className="object-contain"
              sizes={sizesImage}
            />
          </div>
          <div className="w-full flex flex-col">
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>Login to your account.</CardDescription>
          </div>
        </CardHeader>
        <FormLogin />
      </Card>
    </div>
  );
};
