import kyInstance from "@/lib/ky";
import { FollowerInfo } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

export default function useFollower(userId: string, initialData: FollowerInfo) {
  const query = useQuery({
    queryKey: ["followerInfo", userId],
    queryFn: () =>
      kyInstance.get(`/api/users/${userId}/followers`).json<FollowerInfo>(),
    initialData: initialData,
  });

  return query;
}
