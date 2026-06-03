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
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [activeView, setActiveView] = useState<ViewType>("pouls-ai");

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
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <Header onViewChange={setActiveView} />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />

        <main className="relative min-w-0 flex-1 overflow-hidden">
          <div className="fade-in h-full w-full">
            {activeView === "pouls-ai" && <PoulsAiDashboard />}
            {activeView === "moderation" && <ModerationMatrix />}
            {activeView === "widgets" && <WidgetGenerator />}
            {activeView === "targeted-push" && <TargetedCommunication />}
            {activeView === "settings" && <WhiteLabelSettings />}
            {activeView === "profile" && <ProfileView />}
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
  );
}
