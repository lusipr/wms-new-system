import React from "react";
import { Client } from "./_components/client";
import { protect } from "@/lib/protect";
import { redirect } from "next/navigation";

const LoginPage = async () => {
  const user = await protect();

  if (user) {
    redirect("/");
  }

  return (
    <div className="w-full h-full">
      <Client />
    </div>
  );
};

export default LoginPage;
