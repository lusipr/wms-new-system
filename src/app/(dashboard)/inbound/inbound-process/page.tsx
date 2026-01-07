import React from "react";
import { Metadata } from "next";
import { protect } from "@/lib/protect";
import { redirect } from "next/navigation";
import { Footer } from "@/components/footer";
import { Client } from "./_components/clients";

export const metadata: Metadata = {
  title: "Inbound Process",
};

const InboundProcess = async () => {
  const user = await protect();

  if (!user) redirect("/login");
  return (
    <div className="w-full h-full">
      <Client />
      <Footer />
    </div>
  );
};

export default InboundProcess;
