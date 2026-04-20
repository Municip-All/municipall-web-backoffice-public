"use client";

import React, { useState } from "react";
import Sidebar, { ViewType } from "@/components/Sidebar";
import Header from "@/components/Header";
import PoulsAiDashboard from "@/components/PoulsAiDashboard";
import ModerationMatrix from "@/components/ModerationMatrix";
import WidgetGenerator from "@/components/WidgetGenerator";
import TargetedCommunication from "@/components/TargetedCommunication";
import WhiteLabelSettings from "@/components/WhiteLabelSettings";
import Login from "@/components/Login";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>("pouls-ai");

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex flex-col h-screen w-full bg-[#f9fafb] overflow-hidden text-[#111827] font-sans">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
        
        <main className="flex-1 h-full overflow-hidden relative">
          <div className="relative z-10 w-full h-full fade-in">
            {activeView === "pouls-ai" && <PoulsAiDashboard />}
            {activeView === "moderation" && <ModerationMatrix />}
            {activeView === "widgets" && <WidgetGenerator />}
            {activeView === "targeted-push" && <TargetedCommunication />}
            {activeView === "settings" && <WhiteLabelSettings />}
          </div>
        </main>
      </div>
    </div>
  );
}
