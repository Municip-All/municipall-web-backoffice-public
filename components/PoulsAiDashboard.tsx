"use client";

import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, AlertCircle, MessageSquare } from "lucide-react";

const trendData = [
  { name: "Lun", satisfaction: 65 },
  { name: "Mar", satisfaction: 68 },
  { name: "Mer", satisfaction: 62 },
  { name: "Jeu", satisfaction: 74 },
  { name: "Ven", satisfaction: 79 },
  { name: "Sam", satisfaction: 77 },
  { name: "Dim", satisfaction: 84 },
];

export default function PoulsAiDashboard() {
  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-[28px] font-bold text-gray-900 tracking-tight mb-2">
          Pouls de la Ville
        </h2>
        <p className="text-sm text-gray-500">Vue d'ensemble du sentiment citoyen et statistiques clés.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card-panel p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
            <TrendingUp className="text-indigo-600 w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Indice de Satisfaction</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-gray-900">78%</span>
              <span className="text-xs font-bold text-green-600">+5%</span>
            </div>
          </div>
        </div>

        <div className="card-panel p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <Users className="text-blue-500 w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Citoyens Engagés</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-gray-900">14.2k</span>
              <span className="text-xs font-bold text-green-600">+120</span>
            </div>
          </div>
        </div>

        <div className="card-panel p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-yellow-50 flex items-center justify-center shrink-0">
            <AlertCircle className="text-yellow-600 w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Signalements Actifs</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-gray-900">45</span>
              <span className="text-xs font-bold text-red-600">-12%</span>
            </div>
          </div>
        </div>

        <div className="card-panel p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
            <MessageSquare className="text-green-500 w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Suggestions du Mois</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-gray-900">312</span>
              <span className="text-xs font-bold text-green-600">+45</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-panel p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Évolution de la Satisfaction Citoyenne</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSatisfaction" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0b0080" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0b0080" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} ticks={[0, 25, 50, 75, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                  itemStyle={{ color: '#111827', fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="satisfaction" stroke="#0b0080" strokeWidth={3} fillOpacity={1} fill="url(#colorSatisfaction)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="card-panel p-6">
            <h3 className="text-base font-bold text-gray-900 mb-6">Sujets Chauds (IA)</h3>
            <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-4 px-2">
              <span className="text-2xl font-bold text-red-600">Nids-de-poule</span>
              <span className="text-xl font-bold text-municipall-blue">Stationnement</span>
              <span className="text-xl font-bold text-gray-900">Sécurité</span>
              <span className="text-sm text-gray-500">Parcs</span>
              <span className="text-base font-bold text-green-600">Propreté</span>
              <span className="text-sm text-gray-500">Pistes cyclables</span>
              <span className="text-lg font-bold text-orange-500">Éclairage</span>
              <span className="text-xs text-gray-400">Bruit</span>
              <span className="text-xl font-bold text-blue-500">Transports</span>
            </div>
          </div>

          <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-6 relative">
            <h3 className="text-base font-bold text-municipall-blue mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-municipall-blue"></span>
              Synthèse de la Semaine
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed relative z-10">
              L'IA note une <strong>amélioration globale de 5%</strong> de la satisfaction ce mois-ci. Les efforts sur la propreté sont salués. Cependant, une hausse des plaintes concernant l'état de la voirie (nids-de-poule) est détectée dans le secteur Nord.
            </p>
            <div className="absolute right-4 top-4 w-12 h-12 border-2 border-indigo-100/50 rounded-lg bg-white/50"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
