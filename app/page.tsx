"use client";

import React, { useEffect, useState } from "react";
import Sidebar, { ViewType } from "@/components/Sidebar";
import Header from "@/components/Header";
import PoulsAiDashboard from "@/components/PoulsAiDashboard";
import ModerationMatrix from "@/components/ModerationMatrix";
import AiAgentChatPanel from "@/components/AiAgentChatPanel";
import WidgetGenerator from "@/components/WidgetGenerator";
import TargetedCommunication from "@/components/TargetedCommunication";
import WhiteLabelSettings from "@/components/WhiteLabelSettings";
import ProfileView from "@/components/ProfileView";
import NeighborhoodManager from "@/components/NeighborhoodManager";
import Login from "@/components/Login";
import ConstructionManager from "@/components/ConstructionManager";
import WasteManager from "@/components/WasteManager";
import EventManager from "@/components/EventManager";
import TransportSettings from "@/components/TransportSettings";
import AssociationsManager from "@/components/AssociationsManager";
import CityPublicProfile from "@/components/CityPublicProfile";
import TeamInsightsDashboard from "@/components/TeamInsightsDashboard";
import TeamManager from "@/components/TeamManager";
import CitizenFeedbackDashboard from "@/components/CitizenFeedbackDashboard";
import { useAuth } from "@/context/AuthContext";
import { usePermissions, Permission } from "@/context/PermissionsContext";
import { InboxProvider } from "@/context/InboxContext";

export default function Home() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { can, isMayor } = usePermissions();
  const [activeView, setActiveView] = useState<ViewType>(
    isMayor ? "team-insights" : "pouls-ai",
  );
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [desktopNavCollapsed, setDesktopNavCollapsed] = useState(false);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileNavOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileNavOpen]);

  const handleMenuToggle = () => {
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    if (isDesktop) {
      setDesktopNavCollapsed((prev) => !prev);
    } else {
      setMobileNavOpen((prev) => !prev);
    }
  };

  const menuOpenForAria = mobileNavOpen || !desktopNavCollapsed;

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[var(--background)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)]/20 border-t-[var(--accent)]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <InboxProvider>
      <div className="flex h-screen w-full flex-col overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
        <Header
          onViewChange={setActiveView}
          onMenuToggle={handleMenuToggle}
          menuOpen={menuOpenForAria}
          mobileNavOpen={mobileNavOpen}
        />

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <Sidebar
            activeView={activeView}
            onViewChange={setActiveView}
            mobileOpen={mobileNavOpen}
            onMobileClose={() => setMobileNavOpen(false)}
            desktopCollapsed={desktopNavCollapsed}
          />

          <main
            id="main-content"
            className="relative min-w-0 flex-1 overflow-hidden"
            tabIndex={-1}
          >
            <div className="fade-in h-full w-full overflow-y-auto">
              {activeView === "team-insights" && can(Permission.TEAM_KPIS) && (
                <TeamInsightsDashboard />
              )}
              {activeView === "citizen-feedback" &&
                can(Permission.FEEDBACK_READ) && <CitizenFeedbackDashboard />}
              {activeView === "team-manage" && can(Permission.TEAM_MANAGE) && (
                <TeamManager />
              )}
              {activeView === "pouls-ai" && can(Permission.CITY_CONFIG_READ) && (
                <PoulsAiDashboard onViewChange={setActiveView} />
              )}
              {activeView === "moderation" && can(Permission.REPORTS_READ) && <ModerationMatrix />}
              {activeView === "assistant-ai" && can(Permission.REPORTS_READ) && <AiAgentChatPanel />}
              {activeView === "widgets" && can(Permission.WIDGETS_READ) && <WidgetGenerator />}
              {activeView === "transport" && can(Permission.WIDGETS_READ) && <TransportSettings />}
              {activeView === "targeted-push" && can(Permission.NOTIFICATIONS_SEND) && <TargetedCommunication />}
              {activeView === "settings" && can(Permission.CITY_CONFIG_WRITE) && <WhiteLabelSettings />}
              {activeView === "profile" && can(Permission.PROFILE_READ) && (
                <ProfileView onNavigate={setActiveView} />
              )}
              {activeView === "neighborhoods" && can(Permission.NEIGHBORHOODS_MANAGE) && <NeighborhoodManager />}
              {activeView === "construction" && can(Permission.CONSTRUCTION_MANAGE) && user?.cityId && (
                <ConstructionManager cityId={user.cityId} />
              )}
              {activeView === "waste" && can(Permission.CITY_CONFIG_READ) && user?.cityId && (
                <WasteManager cityId={user.cityId} />
              )}
              {activeView === "events" && can(Permission.EVENTS_MANAGE) && <EventManager />}
              {activeView === "associations" && can(Permission.CITY_CONFIG_WRITE) && user?.cityId && (
                <AssociationsManager cityId={user.cityId} />
              )}
              {activeView === "city-profile" && can(Permission.CITY_CONFIG_WRITE) && user?.cityId && (
                <CityPublicProfile cityId={user.cityId} />
              )}
            </div>
          </main>
        </div>
      </div>
    </InboxProvider>
  );
}
