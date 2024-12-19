"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getUserDataSelect } from "@/lib/types";
import {
  UpdatedUserProfileValues,
  updateUserProfileSchema,
} from "@/lib/validation";

export async function updateUserProfile(values: UpdatedUserProfileValues) {
  const validatedValues = updateUserProfileSchema.parse(values);

  const { user } = await validateRequest();

  if (!user) throw new Error("unauthorized");

  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: validatedValues,
    select: getUserDataSelect(user.id),
  });

  return updatedUser;
}
