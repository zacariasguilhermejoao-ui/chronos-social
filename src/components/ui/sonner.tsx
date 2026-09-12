import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const IconCheck = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...stroke} className="text-primary">
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12.2 2.4 2.4 4.6-4.9" />
  </svg>
);
const IconError = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...stroke} className="text-destructive">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v5.2M12 16.2v.1" />
  </svg>
);
const IconInfo = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...stroke} className="text-foreground/70">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5.2M12 7.8v.1" />
  </svg>
);
const IconLoading = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...stroke} className="text-primary animate-spin">
    <path d="M12 3a9 9 0 1 0 9 9" />
  </svg>
);

const Toaster = ({ ...props }: ToasterProps) => (
  <Sonner
    theme="dark"
    position="top-right"
    duration={2600}
    gap={8}
    offset={12}
    visibleToasts={3}
    icons={{
      success: <IconCheck />,
      error: <IconError />,
      info: <IconInfo />,
      warning: <IconInfo />,
      loading: <IconLoading />,
    }}
    className="toaster group"
    toastOptions={{
      unstyled: false,
      classNames: {
        toast:
          "group toast !w-auto !max-w-[min(88vw,360px)] !gap-2.5 !rounded-2xl !border !border-white/12 !bg-[hsl(0_0%_8%/0.82)] !backdrop-blur-xl !px-3.5 !py-3 !text-foreground !shadow-[0_18px_44px_-24px_rgba(0,0,0,0.95)]",
        title: "!text-[15px] !font-semibold !leading-snug",
        description: "!text-[13.5px] !text-muted-foreground !leading-snug",
        icon: "!m-0 !self-start !mt-[1px]",
        actionButton: "!bg-primary !text-primary-foreground !rounded-full !text-[13px] !font-semibold",
        cancelButton: "!bg-secondary !text-foreground !rounded-full !text-[13px]",
      },
    }}
    {...props}
  />
);

export { Toaster, toast };
