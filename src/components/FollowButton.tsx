"use client";
import useFollower from "@/hooks/use-follower";
import { useToast } from "@/hooks/use-toast";
import { FollowerInfo } from "@/lib/types";
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "./ui/button";
import kyInstance from "@/lib/ky";

interface FollowButtonProps {
  userId: string;
  initialState: FollowerInfo;
}

export default function FollowButton({
  initialState,
  userId,
}: FollowButtonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const queryKey: QueryKey = ["followerInfo", userId];

  const { data } = useFollower(userId, initialState);
  const { mutate } = useMutation({
    mutationFn: () =>
      data.isFollowedbyUser
        ? kyInstance.delete(`/api/users/${userId}/followers`)
        : kyInstance.post(`/api/users/${userId}/followers`),

    //optimistic update
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previousState = queryClient.getQueryData<FollowerInfo>(queryKey);

      if (previousState) {
        queryClient.setQueryData<FollowerInfo>(queryKey, {
          followers:
            (previousState.followers || 0) +
            (previousState.isFollowedbyUser ? -1 : 1),
          isFollowedbyUser: !previousState.isFollowedbyUser,
        });
      }

      return { previousState };
    },

    onError: (err, variables, context) => {
      if (context) {
        queryClient.setQueryData(queryKey, context.previousState);
      }
      console.log(err);
      toast({
        description: "Something went wrong please try again",
        variant: "destructive",
      });
    },
  });

  return (
    <Button
      variant={data.isFollowedbyUser ? "secondary" : "default"}
      onClick={() => mutate()}
    >
      {data.isFollowedbyUser ? "Unfollow" : "follow"}
    </Button>
  );
}
