"use client";

import React from "react";
import { Button } from "./ui/button";
import { ArrowLeftCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export const ButtonBack = () => {
  const router = useRouter();
  return (
    <Button
      onClick={() => router.back()}
      className="bg-transparent hover:bg-sky-100 border border-sky-500 text-sky-500"
    >
      <ArrowLeftCircle className="w-4 h-4 mr-2" />
      Go Back
    </Button>
  );
};
