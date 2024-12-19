import { CommentsPage, PostData } from "@/lib/types";
import CommentInput from "./CommentInput";
import { useInfiniteQuery } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";

interface Props {
  post: PostData;
}

function Comments({ post }: Props) {
  const {} = useInfiniteQuery({
    queryKey: ["comments", post.id],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          `/api/posts/${post.id}/comments`,
          pageParam ? { searchParams: { cursor: pageParam } } : {},
        )
        .json<CommentsPage>(),

    initialPageParam: null as string | null,

    getNextPageParam: (firstPage) => firstPage.previousCursor,
  });

  return (
    <div>
      <CommentInput post={post} />
    </div>
  );
}

export default Comments;
