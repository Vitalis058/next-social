import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude, UserData } from "@/lib/types";
import { notFound } from "next/navigation";
import { cache, Suspense } from "react";
import Post from "@/components/posts/Post";
import UserTooltip from "@/components/UserTooltip";
import Link from "next/link";
import UserAvatar from "@/components/UserAvatar";
import { Loader2 } from "lucide-react";
import Linkify from "@/components/Linkify";
import FollowButton from "@/components/FollowButton";

type PostDetailsProps = Promise<{ postId: string }>;

const getPost = cache(async (postId: string, loggedInUser: string) => {
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },

    // include the user data of the post
    include: getPostDataInclude(loggedInUser),
  });

  if (!post) notFound();

  return post;
});

export async function generateMetadata(props: { params: PostDetailsProps }) {
  const { postId } = await props.params;

  const { user } = await validateRequest();

  if (!user) return {};

  const post = await getPost(postId, user.id);

  return {
    title: `${post.user.displayName}:${post.content.slice(0, 50)}`,
  };
}

export default async function page(props: { params: PostDetailsProps }) {
  const { postId } = await props.params;
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) {
    return (
      <p className="text-destructive">
        You are not authorized to view this page
      </p>
    );
  }

  const post = await getPost(postId, loggedInUser.id);

  return (
    <main className="flex w-full min-w-0 gap-5">
      {" "}
      <div className="w-full min-w-0 space-y-5">
        <Post post={post} />
      </div>
      <div className="sticky top-[5.2rem] hidden h-fit w-80 flex-none lg:block">
        <Suspense fallback={<Loader2 className="mx-auto animate-spin" />}>
          <UserInfoSidebar user={post.user} />
        </Suspense>
      </div>
    </main>
  );
}
interface UserInfoSidebarProps {
  user: UserData;
}

async function UserInfoSidebar({ user }: UserInfoSidebarProps) {
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) {
    return (
      <p className="text-destructive">
        You are not authorized to view this page
      </p>
    );
  }

  return (
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="text-xl">
        <UserTooltip user={user}>
          <Link
            href={`/users/${user.username}`}
            className="flex items-center gap-3"
          >
            <UserAvatar avatarUrl={user.avatarUrl} className="flex-none" />
            <div>
              <p className="line-clamp-1 break-all font-semibold hover:underline">
                {user.displayName}
              </p>
              <p className="line-clamp-1 break-all text-sm text-muted-foreground">
                {user.displayName}
              </p>
            </div>
          </Link>
        </UserTooltip>
        <Linkify>
          <div className="font-base line-clamp-6 whitespace-pre-line break-words text-sm text-muted-foreground">
            {user.bio}
          </div>
        </Linkify>

        {user.id !== loggedInUser?.id && (
          <FollowButton
            userId={user.id}
            initialState={{
              followers: user._count.Followers,
              isFollowedbyUser: user.Followers.some(
                ({ followerId }) => followerId === loggedInUser.id,
              ),
            }}
          />
        )}
      </div>
    </div>
  );
}
