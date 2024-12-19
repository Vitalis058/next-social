import { PostData } from "@/lib/types";
import React, { useState } from "react";
import { useSubmitCommentMutation } from "./commentsMutation";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Loader2, SendHorizonal } from "lucide-react";

interface CommentInputProps {
  post: PostData;
}

function CommentInput({ post }: CommentInputProps) {
  const [input, setInput] = useState("");

  const mutation = useSubmitCommentMutation(post.id);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!input) return;

    mutation.mutate(
      {
        content: input,
        post,
      },
      {
        onSuccess: () => {
          setInput("");
        },
      },
    );
  };

  return (
    <form className="flex w-full items-center gap-2" onSubmit={onSubmit}>
      <Input
        placeholder="write a comment"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        autoFocus
      />
      <Button
        type="submit"
        variant={"ghost"}
        size={"icon"}
        disabled={!input.trim || mutation.isPending}
      >
        {!mutation.isPending ? (
          <SendHorizonal />
        ) : (
          <Loader2 className="animate-spin" />
        )}
      </Button>
    </form>
  );
}

export default CommentInput;
