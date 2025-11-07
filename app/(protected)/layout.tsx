import Navbar from "@/components/Navbar";
import { getServerUser } from "@/lib/server/auth";

export default async function Layout({ children, }: { children: React.ReactNode }) {
    const session = await getServerUser();
    return <div className="w-screen h-screen flex flex-col">
    <Navbar userName={session?.user?.name || "Guest"} />
   {children}
   </div>;
}