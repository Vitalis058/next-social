import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude, PostsPage } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const cursor = req.nextUrl.searchParams.get("cursor") || undefined;

  try {
    const { user } = await validateRequest();
    const pageSize = 10;

    if (!user) return Response.json({ error: "unauthorized" });
    // getting bookmarks specific to the logged in user

    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: user.id,
      },
      include: {
        post: {
          include: getPostDataInclude(user.id),
        },
      },
      take: pageSize + 1,
      orderBy: { createdAt: "desc" },
      cursor: cursor ? { id: cursor } : undefined,
    });

    //set the next cursor
    const nextCursor =
      bookmarks.length > pageSize ? bookmarks[pageSize].id : null;

    const data: PostsPage = {
      posts: bookmarks.slice(0, pageSize).map((bookmark) => bookmark.post),
      nextCursor,
    };

    console.log(data);

    return Response.json(data);
  } catch (error) {
    console.log(error, "getting bookmarks");

    return Response.json({ error: "internal server error" });
  }
}
