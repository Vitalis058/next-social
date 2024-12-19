"use client";
import { useSession } from "@/app/(main)/SessionProvider";
import { FollowerInfo, UserData } from "@/lib/types";
import { PropsWithChildren } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import Link from "next/link";
import UserAvatar from "./UserAvatar";
import FollowButton from "./FollowButton";
import FollowerCount from "./FollowerCount";

interface UserToolTipProps extends PropsWithChildren {
  user: UserData;
}

function UserTooltip({ children, user }: UserToolTipProps) {
  const { user: LoggedInUser } = useSession();

  const followerState: FollowerInfo = {
    followers: user._count.Followers,
    isFollowedbyUser: !!user.Followers.some(
      ({ followerId }) => followerId === LoggedInUser.id,
    ),
  };
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent className="border-[2px] border-muted bg-card text-muted-foreground">
          <div className="flex max-w-80 flex-col gap-3 break-words px-1 py-2.5 md:min-w-52">
            <div className="flex items-center justify-between gap-2">
              <Link href={`/users/${user.username}`}>
                <UserAvatar size={70} avatarUrl={user.avatarUrl} />
              </Link>
              {LoggedInUser.id !== user.id && (
                <FollowButton initialState={followerState} userId={user.id} />
              )}
            </div>
            <div>
              <Link href={`/users/${user.username}`}>
                <div className="text-lg font-semibold hover:underline">
                  {user.displayName}
                </div>
                <div className="">@{user.username}</div>
              </Link>
            </div>

            <FollowerCount userId={user.id} initialData={followerState} />
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default UserTooltip;
