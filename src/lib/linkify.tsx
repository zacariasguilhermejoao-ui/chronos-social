import { Fragment, type ReactNode } from "react";
import { Link } from "react-router-dom";

const TOKEN_RE = /(https?:\/\/[^\s]+|#[\p{L}0-9_]{2,30}|@[a-zA-Z0-9_]{2,30})/gu;

export function linkify(text: string): ReactNode {
  if (!text) return null;
  const parts = text.split(TOKEN_RE);
  return (
    <>
      {parts.map((part, i) => {
        if (!part) return null;
        if (/^https?:\/\//i.test(part)) {
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2 hover:opacity-80 break-all"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </a>
          );
        }
        if (part.startsWith("#")) {
          const tag = part.slice(1);
          return (
            <Link
              key={i}
              to={`/search?q=${encodeURIComponent("#" + tag)}`}
              className="text-primary font-medium hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </Link>
          );
        }
        if (part.startsWith("@")) {
          const u = part.slice(1);
          return (
            <Link
              key={i}
              to={`/u/${u}`}
              className="text-primary font-medium hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </Link>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}
