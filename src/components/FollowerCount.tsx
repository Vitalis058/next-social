"use client";
import useFollower from "@/hooks/use-follower";
import { FollowerInfo } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

interface FollowerCountProps {
  userId: string;
  initialData: FollowerInfo;
}

function FollowerCount({ initialData, userId }: FollowerCountProps) {
  const { data } = useFollower(userId, initialData);

  return (
    <span>
      Followers:{" "}
      <span className="font-semibold">{formatNumber(data.followers)}</span>
    </span>
  );
}

export default FollowerCount;
