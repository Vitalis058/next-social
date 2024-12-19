import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getUserDataSelect } from "@/lib/types";

type UsernameType = Promise<{
  username: string;
}>;

export async function GET(req: Request, props: { params: UsernameType }) {
  try {
    const { username } = await props.params;

    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser)
      return Response.json({ message: "unauthorized" }, { status: 401 });

    const user = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },

      //used to include the followers data
      select: getUserDataSelect(loggedInUser.id),
    });

    if (!user)
      return Response.json({ message: "User not found" }, { status: 404 });

    return Response.json(user);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
