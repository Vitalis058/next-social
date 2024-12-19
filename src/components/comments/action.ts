"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getCommentDataInclude, PostData } from "@/lib/types";
import { createPostSchema } from "@/lib/validation";

export async function submitComment({
  post,
  content,
}: {
  post: PostData;
  content: string;
}) {
  const { user } = await validateRequest();

  if (!user) throw Error("Unauthorized");

  const { content: contentValidated } = createPostSchema.parse(content);

  const newPost = await prisma.comment.create({
    data: {
      content: contentValidated,
      userId: user.id,
      postId: post.id,
    },
    include: getCommentDataInclude(user.id),
  });

  return newPost; // rteurning the post so as to enable the cache mutation
}
