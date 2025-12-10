import Sidebar from "@/components/Engineer/Sidebar";


export default function layout({children}: {children: React.ReactNode}) {
  return (
    <main className="flex w-screen flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 p-4 flex flex-col overflow-y-auto thin-scrollbar">
        {children}
        </div>
    </main>
  )
}
