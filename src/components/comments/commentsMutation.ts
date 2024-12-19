import { useSession } from "@/app/(main)/SessionProvider";
import { useToast } from "@/hooks/use-toast";
import {
  InfiniteData,
  QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { submitComment } from "./action";
import { CommentsPage } from "@/lib/types";

export const useSubmitCommentMutation = (postId: string) => {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const {} = useSession();

  const mutation = useMutation({
    mutationFn: submitComment,
    onSuccess: async (newComment) => {
      const queryKey: QueryKey = ["comments", postId];

      await queryClient.cancelQueries({ queryKey });

      queryClient.setQueryData<InfiniteData<CommentsPage, string>>(
        queryKey,
        (oldData) => {
          const firstpage = oldData?.pages[0];

          if (firstpage) {
            return {
              pageParams: oldData.pageParams,
              pages: [
                {
                  previousCursor: firstpage.previousCursor,
                  comments: [...firstpage.comments, newComment],
                },

                ...oldData.pages.slice(1),
              ],
            };
          }
        },
      );

      //refetch the data
      queryClient.invalidateQueries({
        queryKey,
        predicate(query) {
          return !query.state.data;
        },
      });

      toast({
        description: "comment created",
      });
    },

    onError(error) {
      console.log(error, "comments mutation");
      toast({
        description: "failed to comment",
        variant: "destructive",
      });
    },
  });

  return mutation;
};
