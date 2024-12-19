import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { CommentsPage, getCommentDataInclude } from "@/lib/types";
import { NextRequest } from "next/server";

type PostId = Promise<{
  postId: string;
}>;

export async function GET(req: NextRequest, props: { params: PostId }) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor");
    const pageSize = 5;

    const { postId } = await props.params;

    const { user } = await validateRequest();
    if (!user) return Response.json({ error: "unauthorized" });

    const comments = await prisma.comment.findMany({
      where: {
        postId,
      },
      include: getCommentDataInclude(user.id),
      take: -pageSize - 1,
      orderBy: { createdAt: "asc" },
      cursor: cursor ? { id: cursor } : undefined,
    });

    const previousCursor = comments.length > pageSize ? comments[0].id : null;

    const data: CommentsPage = {
      comments: comments.length > pageSize ? comments.slice(1) : comments,
      previousCursor,
    };

    Response.json(data, { status: 200 });
  } catch (error) {
    console.log(error, "getting comments");
    return Response.json({ error: "internal server error" });
  }
}
