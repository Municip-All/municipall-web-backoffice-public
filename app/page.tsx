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
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeView, setActiveView] = useState<ViewType>("pouls-ai");

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="flex flex-col h-screen w-full bg-[var(--background)] overflow-hidden text-[var(--foreground)] font-sans transition-colors duration-500">
      <Header onViewChange={setActiveView} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
        
        <main className="flex-1 h-full overflow-hidden relative">
          <div className="relative z-10 w-full h-full fade-in">
            {activeView === "pouls-ai" && <PoulsAiDashboard />}
            {activeView === "moderation" && <ModerationMatrix />}
            {activeView === "widgets" && <WidgetGenerator />}
            {activeView === "targeted-push" && <TargetedCommunication />}
            {activeView === "settings" && <WhiteLabelSettings />}
            {activeView === "profile" && <ProfileView />}
            {activeView === "neighborhoods" && <NeighborhoodManager />}
          </div>
        </main>
      </div>
    </div>
  );
}
