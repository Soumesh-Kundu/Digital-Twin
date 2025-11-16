import Navbar from "@/components/Navbar";
import SessionWrapper from "@/components/SessionWrapper";
import { getServerUser } from "@/lib/server/auth";
import { SessionProvider } from "next-auth/react";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerUser();
  return (
    <div className="w-screen h-screen flex flex-col">
      <SessionWrapper>
        <Navbar userName={session?.user?.name || "Guest"} />
        {children}
      </SessionWrapper>
    </div>
  );
}
