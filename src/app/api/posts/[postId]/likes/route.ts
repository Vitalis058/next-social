import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { LikeInfo } from "@/lib/types";
import { NextRequest } from "next/server";

type LikeProps = Promise<{
  postId: string;
}>;

// checking if the logged in user has liked a post
export async function GET(req: NextRequest, props: { params: LikeProps }) {
  const { postId } = await props.params;

  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) return Response.json({ error: "unauthorized" });

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        likes: {
          where: {
            userId: loggedInUser.id,
          },
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    const data: LikeInfo = {
      likes: post._count.likes,
      isLikedByUser: !!post.likes.length,
    };

    return Response.json(data);
  } catch (error) {
    console.log(error, "getting likes");
    return Response.json(
      {
        error: "internal server error",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest, props: { params: LikeProps }) {
  const { postId } = await props.params;
  const { user } = await validateRequest();
  try {
    if (!user) {
      return Response.json({ error: "unauthorized" });
    }

    await prisma.like.upsert({
      where: {
        postId_userId: {
          postId: postId,
          userId: user.id,
        },
      },
      create: {
        userId: user.id,
        postId: postId,
      },
      update: {},
    });

    return new Response();
  } catch (error) {
    console.log(error, "upsert like");
    return Response.json({ error: "internal server error" });
  }
}

export async function DELETE(req: NextRequest, props: { params: LikeProps }) {
  const { postId } = await props.params;

  const { user } = await validateRequest();

  try {
    if (!user) {
      return Response.json({ error: "unauthorized" });
    }

    await prisma.like.deleteMany({
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
