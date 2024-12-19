import { LinkIt, LinkItUrl } from "react-linkify-it";

interface LinkifyProps {
  children: React.ReactNode;
}

import React from "react";
import Link from "next/link";
import UserLinkWithToolTip from "./UserLinkWithToolTip";

function Linkify({ children }: LinkifyProps) {
  return (
    <LinkifyUsername>
      <LinkifyHashtag>
        <LinkifyUrl>{children}</LinkifyUrl>
      </LinkifyHashtag>
    </LinkifyUsername>
  );
}

export default Linkify;

//linkify url
function LinkifyUrl({ children }: LinkifyProps) {
  return (
    <LinkItUrl className="text-primary hover:underline">{children}</LinkItUrl>
  );
}

//linkify the username
function LinkifyUsername({ children }: LinkifyProps) {
  return (
    <LinkIt
      regex={/(@[a-zA-Z)-9_-]+)/}
      component={(match, key) => {
        return (
          <UserLinkWithToolTip key={key} username={match.slice(1)}>
            {match}
          </UserLinkWithToolTip>
        );
      }}
    >
      {children}
    </LinkIt>
  );
}

//linkify hashtags
function LinkifyHashtag({ children }: LinkifyProps) {
  return (
    <LinkIt
      regex={/(#[a-zA-Z0-9_-]+)/}
      component={(match, key) => (
        <Link
          href={`/hashtag/${match.slice(1)}`}
          key={key}
          className="text-primary hover:underline"
        >
          {match}
        </Link>
      )}
    >
      {children}
    </LinkIt>
  );
}
