"use server";

import prisma from "@/lib/prisma";
import { loginSchema, loginValues } from "@/lib/validation";
import { isRedirectError } from "next/dist/client/components/redirect";
import { verify } from "@node-rs/argon2";
import { cookies } from "next/headers";
import { lucia } from "@/auth";
import { redirect } from "next/navigation";

export async function login(
  credentials: loginValues,
): Promise<{ error: string }> {
  try {
    const { password, username } = loginSchema.parse(credentials);

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
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.log(error, "login action");

    return {
      error: "something went wrong",
    };
  }
}
