"use client";

import React, { useState } from "react";
import Sidebar, { ViewType } from "@/components/Sidebar";
import Header from "@/components/Header";
import PoulsAiDashboard from "@/components/PoulsAiDashboard";
import ModerationMatrix from "@/components/ModerationMatrix";
import WidgetGenerator from "@/components/WidgetGenerator";
import TargetedCommunication from "@/components/TargetedCommunication";
import WhiteLabelSettings from "@/components/WhiteLabelSettings";
import ProfileView from "../components/ProfileView";
import NeighborhoodManager from "@/components/NeighborhoodManager";
import Login from "@/components/Login";
import ConstructionManager from "@/components/ConstructionManager";
import WasteManager from "@/components/WasteManager";
import EventManager from "@/components/EventManager";
import TransportSettings from "@/components/TransportSettings";
import TeamInsightsDashboard from "@/components/TeamInsightsDashboard";
import TeamManager from "@/components/TeamManager";
import { useAuth } from "@/context/AuthContext";
import { usePermissions, Permission } from "@/context/PermissionsContext";
import { InboxProvider } from "@/context/InboxContext";

export default function Home() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { can, isMayor } = usePermissions();
  const [activeView, setActiveView] = useState<ViewType>(
    isMayor ? "team-insights" : "pouls-ai",
  );

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
        <Header onViewChange={setActiveView} />

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <Sidebar activeView={activeView} onViewChange={setActiveView} />

          <main className="relative min-w-0 flex-1 overflow-hidden">
            <div className="fade-in h-full w-full overflow-y-auto">
              {activeView === "team-insights" && can(Permission.TEAM_KPIS) && (
                <TeamInsightsDashboard />
              )}
              {activeView === "team-manage" && can(Permission.TEAM_MANAGE) && (
                <TeamManager />
              )}
              {activeView === "pouls-ai" && (
                <PoulsAiDashboard onViewChange={setActiveView} />
              )}
              {activeView === "moderation" && <ModerationMatrix />}
              {activeView === "widgets" && <WidgetGenerator />}
              {activeView === "transport" && <TransportSettings />}
              {activeView === "targeted-push" && <TargetedCommunication />}
              {activeView === "settings" && <WhiteLabelSettings />}
              {activeView === "profile" && (
                <ProfileView onNavigate={setActiveView} />
              )}
              {activeView === "neighborhoods" && <NeighborhoodManager />}
              {activeView === "construction" && user?.cityId && (
                <ConstructionManager cityId={user.cityId} />
              )}
              {activeView === "waste" && user?.cityId && (
                <WasteManager cityId={user.cityId} />
              )}
              {activeView === "events" && <EventManager />}
            </div>
          </main>
        </div>
      </div>
    </InboxProvider>
  );
}
