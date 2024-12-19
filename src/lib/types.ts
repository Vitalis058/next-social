import { Prisma } from "@prisma/client";

export function getUserDataSelect(loggedInUserId: string) {
  return {
    username: true,
    displayName: true,
    avatarUrl: true,
    id: true,
    bio: true,
    createdAt: true,

    Followers: {
      where: {
        followerId: loggedInUserId,
      },
      select: {
        followerId: true,
      },
    },

    //counting the followers and the posts
    _count: {
      select: {
        Posts: true,
        Followers: true,
      },
    },
  } satisfies Prisma.UserSelect;
}

//makes sure the embedded user data type is included
export function getPostDataInclude(loggedInUserId: string) {
  return {
    user: {
      select: getUserDataSelect(loggedInUserId),
    },

    attachments: true, //includes the attachments while fetching the data

    likes: {
      where: {
        userId: loggedInUserId,
      },

      select: {
        userId: true,
      },
    },

    Bookmark: {
      where: {
        userId: loggedInUserId,
      },

      select: {
        userId: true,
      },
    },

    _count: {
      select: {
        likes: true,
        comments: true,
      },
    },
  } satisfies Prisma.PostInclude;
}

//post data
export type PostData = Prisma.PostGetPayload<{
  include: ReturnType<typeof getPostDataInclude>;
}>;

//adds the cursor data type
export interface PostsPage {
  posts: PostData[];
  nextCursor?: string | null;
}

//the type of comments data
export function getCommentDataInclude(loggedInUserId: string) {
  return {
    user: {
      select: getUserDataSelect(loggedInUserId),
    },
  } satisfies Prisma.CommentInclude;
}

//converting the function return type to the types
export type CommentData = Prisma.CommentGetPayload<{
  include: ReturnType<typeof getCommentDataInclude>;
}>;

export interface CommentsPage {
  comments: CommentData[];
  previousCursor?: string | null;
}

//the type of followers data
export interface FollowerInfo {
  followers: number;
  isFollowedbyUser: boolean;
}

//user data type
export type UserData = Prisma.UserGetPayload<{
  select: ReturnType<typeof getUserDataSelect>;
}>;

//like return type
export type LikeInfo = {
  likes: number;
  isLikedByUser: boolean;
};

// bookmark type
export interface BookmarkType {
  isBookmarkedByUser: boolean;
}
