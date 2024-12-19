import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bell, Bookmark, Home, Mail } from "lucide-react";
import Link from "next/link";

interface MenuBarProps {
  className: string;
}

function MenuBar({ className }: MenuBarProps) {
  return (
    <div className={cn(className)}>
      <Button
        variant={"ghost"}
        className="flex w-full items-center justify-start gap-3"
        title="home"
      >
        <Link href={"/"}>
          <Home className="" />
        </Link>
        <span className="hidden lg:inline">Home</span>
      </Button>
      <Button
        variant={"ghost"}
        className="flex w-full items-center justify-start gap-3"
        title="Notifications"
      >
        <Link href={"/notifications"}>
          <Bell className="" />
        </Link>
        <span className="hidden lg:inline">Notifications</span>
      </Button>
      <Button
        variant={"ghost"}
        className="flex w-full items-center justify-start gap-3"
        title="messages"
      >
        <Link href={"/messages"}>
          <Mail className="" />
        </Link>
        <span className="hidden lg:inline">Messages</span>
      </Button>{" "}
      <Button
        variant={"ghost"}
        className="flex w-full items-center justify-start gap-3"
        title="bookmarks"
      >
        <Link href={"/bookmarks"}>
          <Bookmark className="" />
        </Link>
        <span className="hidden lg:inline">Bookmarks</span>
      </Button>
    </div>
  );
}

export default MenuBar;
