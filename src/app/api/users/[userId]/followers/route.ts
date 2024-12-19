import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { FollowerInfo } from "@/lib/types";
import { NextResponse } from "next/server";

type paramsType = Promise<{
  userId: string;
}>;

//check if logged in user is following a certain user
export async function GET(req: Request, props: { params: paramsType }) {
  try {
    const { userId } = await props.params;
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },

      select: {
        Followers: {
          where: {
            followerId: loggedInUser.id,
          },
          select: {
            followerId: true,
          },
        },
        _count: {
          select: {
            Followers: true,
          },
        },
      },
    });

    if (!user) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }

    const data: FollowerInfo = {
      followers: user._count.Followers,
      isFollowedbyUser: !!user.Followers.length,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.log(error, "followers");
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

//following a user
export async function POST(req: Request, props: { params: paramsType }) {
  try {
    const { userId } = await props.params;
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    await prisma.follow.upsert({
      where: {
        followerId_followingId: {
          followerId: loggedInUser.id,
          followingId: userId,
        },
      },
      create: {
        followerId: loggedInUser.id,
        followingId: userId,
      },
      update: {},
    });

    return new Response();
  } catch (error) {
    console.log(error, "follow");
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

//unfollow request
export async function DELETE(req: Request, props: { params: paramsType }) {
  const { userId } = await props.params;

  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    //delete logic
    await prisma.follow.deleteMany({
      where: {
        followerId: loggedInUser.id,
        followingId: userId,
      },
    });

    return new Response();
  } catch (error) {
    console.log(error, "followers delete");
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
