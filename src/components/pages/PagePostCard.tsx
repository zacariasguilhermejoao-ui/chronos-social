import { UserAvatar } from "@/components/UserAvatar";
import { linkify } from "@/lib/linkify";

export function PagePostCard({
  post,
}: {
  post: {
    id: string;
    content?: string | null;
    image_url?: string | null;
    created_at: string;
    page?: { name: string; handle: string; avatar_url?: string | null };
  };
}) {
  return (
    <article className="glass rounded-2xl border border-border overflow-hidden">
      <header className="flex items-center gap-2 p-3">
        <UserAvatar
          userId={post.id}
          fallbackUrl={post.page?.avatar_url}
          fallbackName={post.page?.name}
          size={36}
        />
        <div>
          <p className="font-semibold text-sm">{post.page?.name}</p>
          <p className="text-[11px] text-muted-foreground">@{post.page?.handle}</p>
        </div>
      </header>
      {post.content && <p className="px-3 pb-2 text-sm">{linkify(post.content)}</p>}
      {post.image_url && <img src={post.image_url} alt="" className="w-full aspect-square object-cover" />}
    </article>
  );
}
