import { useToast } from "@/hooks/use-toast";
import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { submitPost } from "./action";
import { PostsPage } from "@/lib/types";
import { useSession } from "@/app/(main)/SessionProvider";

export function useSubmitPostMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useSession();

  const mutation = useMutation({
    mutationFn: submitPost,
    onSuccess: async (newPost) => {
      const forYouQueryKey = ["post-feed", "for-you"];
      const userPostsQueryKey = ["post-feed", "user-posts", user.id];

      await queryClient.cancelQueries({ queryKey: forYouQueryKey });
      await queryClient.cancelQueries({ queryKey: userPostsQueryKey });

      //cancel all the queries

      queryClient.setQueriesData<InfiniteData<PostsPage>>(
        { queryKey: forYouQueryKey },

        (oldData) => {
          //returns if the old data is available
          if (!oldData) return undefined;

          const firstPage = oldData?.pages[0];

          if (firstPage) {
            return {
              pageParams: oldData.pageParams,
              pages: [
                {
                  posts: [newPost, ...firstPage.posts],
                  nextCursor: firstPage.nextCursor,
                },
                ...oldData.pages.slice(1),
              ],
            };
          }
        },
      );

      queryClient.setQueriesData<InfiniteData<PostsPage>>(
        { queryKey: userPostsQueryKey },
        (oldData) => {
          if (!oldData) return undefined;

          const firstPage = oldData.pages[0];
          if (firstPage) {
            return {
              pageParams: oldData.pageParams,
              pages: [
                {
                  posts: [newPost, ...firstPage.posts],
                  nextCursor: firstPage.nextCursor,
                },
                ...oldData.pages.slice(1),
              ],
            };
          }
          return oldData;
        },
      );

      //invalidate the queries when the data is null
      //if we canceled the query before the data was fetched
      queryClient.invalidateQueries({
        queryKey: forYouQueryKey,
      });
      queryClient.invalidateQueries({ queryKey: userPostsQueryKey });

      toast({
        description: "Post Created",
      });
    },
    onError: (error) => {
      console.log(error);
      toast({
        variant: "destructive",
        description: "failed to post please try again",
      });
    },
  });

  return mutation;
}
