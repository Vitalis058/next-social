import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { BookmarkType } from "@/lib/types";

type BookmarkParams = Promise<{
  postId: string;
}>;

export async function GET(req: Request, props: { params: BookmarkParams }) {
  const { postId } = await props.params;
  try {
    // first validate the user
    const { user } = await validateRequest();
    if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

    // now we fetch the bookmark
    const bookmark = await prisma.bookmark.findUnique({
      where: {
        postId_userId: {
          postId: postId,
          userId: user.id,
        },
      },
    });

    const data: BookmarkType = {
      isBookmarkedByUser: !!bookmark,
    };

    return Response.json(data);
  } catch (error) {
    console.log(error, "getting bookmarks");
    return Response.json({ error: "internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request, props: { params: BookmarkParams }) {
  const { postId } = await props.params;
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser)
      return Response.json(
        { error: "unauthorized" },
        {
          status: 401,
        },
      );

    //create a record into the database
    const bookmark = await prisma.bookmark.upsert({
      where: {
        postId_userId: {
          postId: postId,
          userId: loggedInUser.id,
        },
      },
      create: {
        postId: postId,
        userId: loggedInUser.id,
      },
      update: {},
    });

    return Response.json(bookmark);
  } catch (error) {
    console.log(error, "post bookmark");
    return Response.json({ error: "internal server error" });
  }
}

export async function DELETE(req: Request, props: { params: BookmarkParams }) {
  const { postId } = await props.params;

  const { user } = await validateRequest();

  try {
    if (!user) {
      return Response.json({ error: "unauthorized" });
    }

    await prisma.bookmark.deleteMany({
      where: {
        postId: postId,
        userId: user.id,
      },
    });

    return new Response();
  } catch (error) {
    console.log(error, "delete like");
    return Response.json({ error: "internal server error" });
  }
}
