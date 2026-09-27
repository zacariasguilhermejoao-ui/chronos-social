import { Fragment } from "react";
import { Link } from "react-router-dom";

const URL_RE = /(https?:\/\/[^\s]+|www\.[^\s]+|@[a-zA-Z0-9_]{2,30}|#[\w\u00C0-\u024F]+)/g;

export function Linkify({ text }: { text: string }) {
  if (!text) return null;
  const parts = text.split(URL_RE);
  return (
    <>
      {parts.map((part, i) => {
        if (!part) return null;
        if (part.startsWith("@") && part.length > 1) {
          const u = part.slice(1);
          return (
            <Link key={i} to={`/u/${u}`} className="text-primary font-semibold hover:underline">
              {part}
            </Link>
          );
        }
        if (part.startsWith("#")) {
          return (
            <Link key={i} to={`/search?q=${encodeURIComponent(part)}`} className="text-primary hover:underline">
              {part}
            </Link>
          );
        }
        if (/^(https?:\/\/|www\.)/i.test(part)) {
          const href = part.startsWith("http") ? part : `https://${part}`;
          return (
            <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
              {part}
            </a>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}
