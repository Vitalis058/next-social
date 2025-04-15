"use server";

import prisma from "@/lib/prisma";
import { loginSchema, loginValues } from "@/lib/validation";
import { verify } from "@node-rs/argon2";
import { cookies } from "next/headers";
import { lucia } from "@/auth";
import { redirect } from "next/navigation";

export async function login(
  credentials: loginValues,
): Promise<{ error: string }> {
  try {
    const { password, username } = loginSchema.parse(credentials);
    console.log(password, username);

    const existingUser = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
    });

    if (!existingUser || !existingUser.passwordHash) {
      return {
        error: "Incorrect username or password",
      };
    }

    //password comparison
    const passwordHash = existingUser?.passwordHash as string;
    console.log(passwordHash);
    const validPassword = await verify(passwordHash, password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    // checking if the password is correct
    if (!validPassword) {
      return {
        error: "Incorrect username or password",
      };
    }

    const session = await lucia.createSession(existingUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    (await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    return redirect("/");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error, "sign-in");
    return {
      error: "something went wrong",
    };
  }
}
