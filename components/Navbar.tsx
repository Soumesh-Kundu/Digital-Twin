import ProfileDropDown from "./ProfileDropDown";
import NotificationPanel from "./NotificationPanel";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";


export default function Navbar({ userName }: { userName: string }) {
  return (
    <nav className="flex items-center justify-between py-4 px-5 shadow-md border-b">
      <h1 className="text-xl font-bold">Digital Twin</h1>
      <div className="flex items-center gap-4">
        <NotificationPanel />
        <ProfileDropDown>
          <div className="flex items-center gap-2 border-2 shadow-sm rounded-full px-3 py-1 cursor-pointer">
            <span className="font-medium ">{userName}</span>
            <Avatar>
              <AvatarImage src="https://cdn-icons-png.flaticon.com/512/6522/6522516.png"></AvatarImage>
              <AvatarFallback>
                <img
                  src="https://cdn-icons-png.flaticon.com/512/6522/6522516.png"
                  alt="fallback"
                />
              </AvatarFallback>
            </Avatar>
          </div>
        </ProfileDropDown>
      </div>
    </nav>
  );
}

