import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude, PostsPage } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

type PageProps = Promise<{
  userId: string;
}>;

//getting  posts for a specific user
export async function GET(req: NextRequest, props: { params: PageProps }) {
  const { userId } = await props.params;
  // use the next request so as to get the params from the url
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const pageSize = 10;
    const { user } = await validateRequest();

    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const posts = await prisma.post.findMany({
      where: {
        userId,
      },
      include: getPostDataInclude(user.id),
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const nextCursor = posts.length > pageSize ? posts[pageSize].id : null;

    const data: PostsPage = {
      posts: posts.slice(0, pageSize),
      nextCursor,
    };

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.log(error, "get posts");

    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 },
    );
  }
}
