import { useToast } from "@/hooks/use-toast";
import kyInstance from "@/lib/ky";
import { BookmarkType } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Bookmark } from "lucide-react";

interface BookmarkProps {
  postId: string;
  initialState: BookmarkType;
}

function BookMarkButton({ initialState, postId }: BookmarkProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const queryKey: QueryKey = ["bookmark-info", postId];

  const { data } = useQuery({
    queryKey: queryKey,
    queryFn: () =>
      kyInstance.get(`api/posts/${postId}/bookmarks`).json<BookmarkType>(),
    initialData: initialState,
    staleTime: Infinity,
  });

  const mutate = useMutation({
    mutationFn: () =>
      data.isBookmarkedByUser
        ? kyInstance.delete(`/api/posts/${postId}/bookmarks`)
        : kyInstance.post(`/api/posts/${postId}/bookmarks`),

    onMutate: async () => {
      toast({
        description: `post ${data.isBookmarkedByUser ? "unbookmarked" : "bookmarked"}`,
      });
      await queryClient.cancelQueries({ queryKey });
      const previousState = queryClient.getQueryData<BookmarkType>(queryKey);

      queryClient.setQueryData<BookmarkType>(queryKey, () => ({
        isBookmarkedByUser: !previousState?.isBookmarkedByUser,
      }));

      //always return this if an error occurs
      return {
        previousState,
      };
    },

    onError: (error, variables, context) => {
      if (context) {
        queryClient.setQueryData(queryKey, context.previousState);
      }
      console.log(error);
      toast({
        description: "Something went wrong please try again",
        variant: "destructive",
      });
    },
  });

  return (
    <button onClick={() => mutate.mutate()} className="flex items-center gap-2">
      <Bookmark
        className={cn(
          "size-5",
          data.isBookmarkedByUser && "fill-primary text-primary",
        )}
      />
    </button>
  );
}

export default BookMarkButton;
