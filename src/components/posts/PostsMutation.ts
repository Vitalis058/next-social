import { useToast } from "@/hooks/use-toast";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { deletePost } from "./actions";
import { PostsPage } from "@/lib/types";

export function useDeletePost() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathName = usePathname();

  const mutation = useMutation({
    mutationFn: deletePost,

    //mutate the posts
    onSuccess: async (deletedPost) => {
      //indentifying the cache to mutate depending on the query key(query filter)
      const queryFilter: QueryFilters = { queryKey: ["post-feed"] };

      // we first cancel all the queries with this query key
      await queryClient.cancelQueries(queryFilter);

      //mutating the cache
      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return;

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor,
              posts: page.posts.filter((post) => post.id !== deletedPost.id),
            })),
          };
        },
      );

      toast({
        description: "Post deleted",
      });

      // redirect to the home page
      if (pathName === `/posts/${deletedPost.id}`) {
        router.push("/");
      }
    },
    onError: (error) => {
      console.log(error);
      toast({
        description: "failed to delete post",
        variant: "destructive",
      });
    },
  });

  return mutation;
}
