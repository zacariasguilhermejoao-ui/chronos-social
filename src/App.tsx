import { Suspense } from "react";
import { lazyWithRetry } from "./lib/lazyWithRetry";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { RouteErrorBoundary as ErrorBoundary } from "./components/RouteErrorBoundary";
import { OfflineBanner } from "./components/OfflineBanner";
import { PageTransition } from "./components/PageTransition";
import PushBridge from "./components/PushBridge";
import { useTheme, useThemeSync } from "./lib/theme";

import Home from "./pages/Home";
import Feed from "./pages/Feed";
const Reels = lazyWithRetry(() => import("./pages/Reels"));
import NotFound from "./pages/NotFound";

const Auth = lazyWithRetry(() => import("./pages/Auth"));
const Signup = lazyWithRetry(() => import("./pages/Signup"));
const Wallet = lazyWithRetry(() => import("./pages/Wallet"));
const Upload = lazyWithRetry(() => import("./pages/Upload"));
const PhotoUpload = lazyWithRetry(() => import("./pages/PhotoUpload"));
const Photos = lazyWithRetry(() => import("./pages/Photos"));
const Messages = lazyWithRetry(() => import("./pages/Messages"));
const ProfilePage = lazyWithRetry(() => import("./pages/ProfilePage"));
const EditProfile = lazyWithRetry(() => import("./pages/EditProfile"));
const Search = lazyWithRetry(() => import("./pages/Search"));
const Discover = lazyWithRetry(() => import("./pages/Discover"));
const Friends = lazyWithRetry(() => import("./pages/Friends"));
const Settings = lazyWithRetry(() => import("./pages/Settings"));
const AccountSettings = lazyWithRetry(() => import("./pages/settings/Account"));
const PrivacySettings = lazyWithRetry(() => import("./pages/settings/Privacy"));
const BlockedSettings = lazyWithRetry(() => import("./pages/settings/Blocked"));
const NotificationsSettings = lazyWithRetry(() => import("./pages/settings/Notifications"));
const AppearanceSettings = lazyWithRetry(() => import("./pages/settings/Appearance"));
const SecuritySettings = lazyWithRetry(() => import("./pages/settings/Security"));
const AccessibilitySettings = lazyWithRetry(() => import("./pages/settings/Accessibility"));
const MonetizationSettings = lazyWithRetry(() => import("./pages/settings/Monetization"));
const HelpSettings = lazyWithRetry(() => import("./pages/settings/Help"));
const LegalIndex = lazyWithRetry(() => import("./pages/legal/LegalIndex"));
const Terms = lazyWithRetry(() => import("./pages/legal/Terms"));
const PrivacyDoc = lazyWithRetry(() => import("./pages/legal/Privacy"));
const ContentDoc = lazyWithRetry(() => import("./pages/legal/Content"));
const MonetizationDoc = lazyWithRetry(() => import("./pages/legal/Monetization"));
const CommunityDoc = lazyWithRetry(() => import("./pages/legal/Community"));
const ChildSafety = lazyWithRetry(() => import("./pages/legal/ChildSafety"));
const Admin = lazyWithRetry(() => import("./pages/Admin"));
const ForgotPassword = lazyWithRetry(() => import("./pages/ForgotPassword"));
const ResetPassword = lazyWithRetry(() => import("./pages/ResetPassword"));
const Install = lazyWithRetry(() => import("./pages/Install"));
const Saved = lazyWithRetry(() => import("./pages/Saved"));
const AudioPage = lazyWithRetry(() => import("./pages/AudioPage"));
const VideoView = lazyWithRetry(() => import("./pages/VideoView"));
const Posts = lazyWithRetry(() => import("./pages/Posts"));
const Groups = lazyWithRetry(() => import("./pages/Groups"));
const GroupCreate = lazyWithRetry(() => import("./pages/GroupCreate"));
const GroupChat = lazyWithRetry(() => import("./pages/GroupChat"));
const GroupInfo = lazyWithRetry(() => import("./pages/GroupInfo"));
const GroupCatalog = lazyWithRetry(() => import("./pages/GroupCatalog"));
const GroupJoin = lazyWithRetry(() => import("./pages/GroupJoin"));
const Notifications = lazyWithRetry(() => import("./pages/Notifications"));
const AdminPayouts = lazyWithRetry(() => import("./pages/AdminPayouts"));
const AdminModeration = lazyWithRetry(() => import("./pages/AdminModeration"));
const Invite = lazyWithRetry(() => import("./pages/Invite"));
const Referrals = lazyWithRetry(() => import("./pages/Referrals"));
const Marketplace = lazyWithRetry(() => import("./pages/Marketplace"));
const MarketplaceNew = lazyWithRetry(() => import("./pages/MarketplaceNew"));
const MarketplaceItem = lazyWithRetry(() => import("./pages/MarketplaceItem"));
const PagesList = lazyWithRetry(() => import("./pages/Pages"));
const PageView = lazyWithRetry(() => import("./pages/PageView"));
const PageAdmin = lazyWithRetry(() => import("./pages/PageAdmin"));
const Stories = lazyWithRetry(() => import("./pages/Stories"));
const Ads = lazyWithRetry(() => import("./pages/Ads"));
const AdminAds = lazyWithRetry(() => import("./pages/AdminAds"));
const Billing = lazyWithRetry(() => import("./pages/Billing"));
const ProfileList = lazyWithRetry(() => import("./pages/ProfileList"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: "always",
      retry: 1,
      networkMode: "offlineFirst",
    },
    mutations: {
      networkMode: "offlineFirst",
      retry: 0,
    },
  },
});

if (typeof window !== "undefined") {
  const w = window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => void };
  const idle = (cb: () => void) =>
    w.requestIdleCallback ? w.requestIdleCallback(cb, { timeout: 2500 }) : window.setTimeout(cb, 1500);
  idle(() => {
    import("./pages/Messages");
    import("./pages/Notifications");
    import("./pages/ProfilePage");
    import("./pages/Search");
  });
}

const protect = (el: JSX.Element) => <ProtectedRoute>{el}</ProtectedRoute>;

const RouteFallback = () => (
  <div className="h-[60vh] grid place-items-center">
    <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
  </div>
);

const App = () => {
  useThemeSync();
  const { resolved } = useTheme();
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner theme={resolved} position="top-center" />
      <OfflineBanner />
      <BrowserRouter>
        <PushBridge />
        <PageTransition>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/install" element={<Install />} />
            <Route path="/g/join/:token" element={<GroupJoin />} />
            <Route path="/invite/:code" element={<Invite />} />
            <Route path="/child-safety" element={<ErrorBoundary><ChildSafety /></ErrorBoundary>} />
            <Route path="/reels" element={protect(<ErrorBoundary><Reels /></ErrorBoundary>)} />
            <Route element={protect(<AppLayout />)}>
              <Route path="/" element={<ErrorBoundary><Home /></ErrorBoundary>} />
              <Route path="/discover" element={<ErrorBoundary><Discover /></ErrorBoundary>} />
              <Route path="/posts" element={<ErrorBoundary><Posts /></ErrorBoundary>} />
              <Route path="/u/:username" element={<ErrorBoundary><ProfilePage /></ErrorBoundary>} />
              <Route path="/u/:username/:kind" element={<ErrorBoundary><ProfileList /></ErrorBoundary>} />
              <Route path="/v/:id" element={<ErrorBoundary><VideoView /></ErrorBoundary>} />
              <Route path="/audio/:id" element={<ErrorBoundary><AudioPage /></ErrorBoundary>} />
              <Route path="/saved" element={protect(<ErrorBoundary><Saved /></ErrorBoundary>)} />
              <Route path="/photos" element={protect(<ErrorBoundary><Photos /></ErrorBoundary>)} />
              <Route path="/photo-upload" element={protect(<ErrorBoundary><PhotoUpload /></ErrorBoundary>)} />
              <Route path="/search" element={protect(<ErrorBoundary><Search /></ErrorBoundary>)} />
              <Route path="/friends" element={protect(<ErrorBoundary><Friends /></ErrorBoundary>)} />
              <Route path="/wallet" element={protect(<ErrorBoundary><Wallet /></ErrorBoundary>)} />
              <Route path="/upload" element={protect(<ErrorBoundary><Upload /></ErrorBoundary>)} />
              <Route path="/messages" element={protect(<ErrorBoundary><Messages /></ErrorBoundary>)} />
              <Route path="/messages/:threadId" element={protect(<ErrorBoundary><Messages /></ErrorBoundary>)} />
              <Route path="/groups" element={protect(<ErrorBoundary><Groups /></ErrorBoundary>)} />
              <Route path="/groups/new" element={protect(<ErrorBoundary><GroupCreate /></ErrorBoundary>)} />
              <Route path="/groups/:id" element={protect(<ErrorBoundary><GroupChat /></ErrorBoundary>)} />
              <Route path="/groups/:id/catalog" element={protect(<ErrorBoundary><GroupCatalog /></ErrorBoundary>)} />
              <Route path="/groups/:id/info" element={protect(<ErrorBoundary><GroupInfo /></ErrorBoundary>)} />
              <Route path="/notifications" element={protect(<ErrorBoundary><Notifications /></ErrorBoundary>)} />
              <Route path="/referrals" element={protect(<ErrorBoundary><Referrals /></ErrorBoundary>)} />
              <Route path="/marketplace" element={<ErrorBoundary><Marketplace /></ErrorBoundary>} />
              <Route path="/marketplace/new" element={protect(<ErrorBoundary><MarketplaceNew /></ErrorBoundary>)} />
              <Route path="/marketplace/:id" element={<ErrorBoundary><MarketplaceItem /></ErrorBoundary>} />
              <Route path="/pages" element={protect(<ErrorBoundary><PagesList /></ErrorBoundary>)} />
              <Route path="/p/:handle" element={<ErrorBoundary><PageView /></ErrorBoundary>} />
              <Route path="/p/:handle/admin" element={protect(<ErrorBoundary><PageAdmin /></ErrorBoundary>)} />
              <Route path="/stories" element={<ErrorBoundary><Stories /></ErrorBoundary>} />
              <Route path="/ads" element={protect(<ErrorBoundary><Ads /></ErrorBoundary>)} />
              <Route path="/billing" element={protect(<ErrorBoundary><Billing /></ErrorBoundary>)} />
              <Route path="/me" element={protect(<ErrorBoundary><ProfilePage /></ErrorBoundary>)} />
              <Route path="/me/:kind" element={protect(<ErrorBoundary><ProfileList /></ErrorBoundary>)} />
              <Route path="/me/edit" element={protect(<ErrorBoundary><EditProfile /></ErrorBoundary>)} />
              <Route path="/settings" element={<ErrorBoundary><Settings /></ErrorBoundary>} />
              <Route path="/settings/account" element={protect(<ErrorBoundary><AccountSettings /></ErrorBoundary>)} />
              <Route path="/settings/privacy" element={protect(<ErrorBoundary><PrivacySettings /></ErrorBoundary>)} />
              <Route path="/settings/blocked" element={protect(<ErrorBoundary><BlockedSettings /></ErrorBoundary>)} />
              <Route path="/settings/notifications" element={<ErrorBoundary><NotificationsSettings /></ErrorBoundary>} />
              <Route path="/settings/appearance" element={<ErrorBoundary><AppearanceSettings /></ErrorBoundary>} />
              <Route path="/settings/security" element={protect(<ErrorBoundary><SecuritySettings /></ErrorBoundary>)} />
              <Route path="/settings/accessibility" element={<ErrorBoundary><AccessibilitySettings /></ErrorBoundary>} />
              <Route path="/settings/monetization" element={protect(<ErrorBoundary><MonetizationSettings /></ErrorBoundary>)} />
              <Route path="/settings/help" element={<ErrorBoundary><HelpSettings /></ErrorBoundary>} />
              <Route path="/legal" element={<ErrorBoundary><LegalIndex /></ErrorBoundary>} />
              <Route path="/legal/terms" element={<ErrorBoundary><Terms /></ErrorBoundary>} />
              <Route path="/legal/privacy" element={<ErrorBoundary><PrivacyDoc /></ErrorBoundary>} />
              <Route path="/legal/content" element={<ErrorBoundary><ContentDoc /></ErrorBoundary>} />
              <Route path="/legal/monetization" element={<ErrorBoundary><MonetizationDoc /></ErrorBoundary>} />
              <Route path="/legal/community" element={<ErrorBoundary><CommunityDoc /></ErrorBoundary>} />
              <Route path="/legal/child-safety" element={<ErrorBoundary><ChildSafety /></ErrorBoundary>} />
              <Route path="/admin" element={protect(<ErrorBoundary><Admin /></ErrorBoundary>)} />
              <Route path="/admin/payouts" element={protect(<ErrorBoundary><AdminPayouts /></ErrorBoundary>)} />
              <Route path="/admin/moderation" element={protect(<ErrorBoundary><AdminModeration /></ErrorBoundary>)} />
              <Route path="/admin/ads" element={protect(<ErrorBoundary><AdminAds /></ErrorBoundary>)} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        </PageTransition>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
