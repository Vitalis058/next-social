import { CommentData } from "@/lib/types";

interface CommentProps {
  comment: CommentData;
}

function Comment({ comment }: CommentProps) {
  return <div>{comment.content}</div>;
}

export default Comment;
