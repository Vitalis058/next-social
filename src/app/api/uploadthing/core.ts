import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";

const f = createUploadthing();

export const fileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  avatar: f({ image: { maxFileSize: "1MB" } })
    .middleware(async () => {
      const { user: loggedInUser } = await validateRequest();

      if (!loggedInUser) throw new UploadThingError("unauthorized user");

      //this will be passed to our next function, the metadata
      return { loggedInUser };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      //old avatar
      const oldAvatarUrl = metadata.loggedInUser.avatarUrl;
      if (oldAvatarUrl) {
        const key = oldAvatarUrl.split("/f/")[1];
        await new UTApi().deleteFiles(key);
      }

      //rename the url to match our own
      const newAvatarUrl = file.url;

      // upload to the database
      await prisma.user.update({
        where: {
          id: metadata.loggedInUser.id,
        },
        data: {
          avatarUrl: newAvatarUrl,
        },
      });

      // we will use this to update the image immediately
      return { avatarUrl: newAvatarUrl };
    }),

  // route to upload the videos and photos
  attachment: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 5,
    },
    video: {
      maxFileSize: "64MB",
      maxFileCount: 5,
    },
  })
    .middleware(async () => {
      const { user: loggedInUser } = await validateRequest();

      if (!loggedInUser) throw new UploadThingError("unauthorized user");

      //this will be passed to our next function, the metadata
      return {};
    })
    .onUploadComplete(async ({ file }) => {
      // metadata  = data returned from uploading the file via the route
      // File = the actual uploaded file data

      const media = await prisma.media.create({
        data: {
          url: file.url,
          type: file.type.startsWith("image") ? "IMAGE" : "VIDEO",
        },
      });

      return { mediaId: media.id };
    }),
} satisfies FileRouter;

export type AppFileRouter = typeof fileRouter;
