"use client";

import React, { useState, useEffect } from "react";
import { Trash2, Plus, X, Clock, Calendar, Check, Save, Loader2 } from "lucide-react";
import { api, CityConfig } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

interface WasteService {
  type: string;
  icon: string;
  color: string;
  days: number[]; // 0=Sunday, 1=Monday...
  time: string;
}

const DAYS = [
  { id: 1, label: "Lun" },
  { id: 2, label: "Mar" },
  { id: 3, label: "Mer" },
  { id: 4, label: "Jeu" },
  { id: 5, label: "Ven" },
  { id: 6, label: "Sam" },
  { id: 0, label: "Dim" },
];

const ICONS = ["trash", "refresh", "leaf", "archive", "flask"];

export default function WasteManager({ cityId }: { cityId: string }) {
  const toast = useToast();
  const [config, setConfig] = useState<CityConfig | null>(null);
  const [services, setServices] = useState<WasteService[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getCityConfig(cityId).then((data) => {
      setConfig(data);
      if (data?.wasteConfig?.services) {
        setServices(data.wasteConfig.services);
      } else {
        // Default services if none exist
        setServices([
          { type: "Ordures Ménagères", icon: "trash", color: "#333333", days: [1, 4], time: "19:00" },
          { type: "Recyclage", icon: "refresh", color: "#FFCC00", days: [3], time: "08:00" },
        ]);
      }
      setIsLoading(false);
    });
  }, [cityId]);

  const handleAddService = () => {
    setServices([
      ...services,
      { type: "Nouveau Service", icon: "trash", color: "#666666", days: [], time: "08:00" },
    ]);
  };

  const handleRemoveService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const updateService = (index: number, updates: Partial<WasteService>) => {
    const newServices = [...services];
    newServices[index] = { ...newServices[index], ...updates };
    setServices(newServices);
  };

  const toggleDay = (serviceIndex: number, dayId: number) => {
    const service = services[serviceIndex];
    const newDays = service.days.includes(dayId)
      ? service.days.filter((d) => d !== dayId)
      : [...service.days, dayId].sort();
    updateService(serviceIndex, { days: newDays });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const ok = await api.saveCityConfig(cityId, {
        wasteConfig: { services }
      } as any);
      
      if (ok) {
        toast("success", "Calendrier de collecte mis à jour avec succès !");
      } else {
        toast("error", "Erreur lors de l'enregistrement.");
      }
    } catch (error) {
      toast("error", "Une erreur est survenue.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" /></div>;

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Déchets</h2>
          <p className="text-gray-500 text-sm mt-1">Configurez les types de collecte et les horaires pour vos citoyens.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Enregistrer les modifications
        </button>
      </div>

      <div className="space-y-6">
        {services.map((service, sIndex) => (
          <div key={sIndex} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm relative group">
            <button
              onClick={() => handleRemoveService(sIndex)}
              className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Info de base */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                    Nom du service
                  </label>
                  <input
                    type="text"
                    value={service.type}
                    onChange={(e) => updateService(sIndex, { type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                      Couleur
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={service.color}
                        onChange={(e) => updateService(sIndex, { color: e.target.value })}
                        className="h-10 w-10 p-0 border-none rounded cursor-pointer"
                      />
                      <span className="text-sm font-mono text-gray-500 uppercase">{service.color}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                      Heure de passage
                    </label>
                    <div className="relative">
                      <Clock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                      <input
                        type="time"
                        value={service.time}
                        onChange={(e) => updateService(sIndex, { time: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Jours de passage */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">
                  Jours de collecte
                </label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((day) => (
                    <button
                      key={day.id}
                      onClick={() => toggleDay(sIndex, day.id)}
                      className={`w-10 h-10 rounded-xl font-bold text-xs transition-all border ${
                        service.days.includes(day.id)
                          ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100"
                          : "bg-gray-50 border-gray-100 text-gray-400 hover:border-blue-200"
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
                
                <div className="mt-6">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">
                    Icône
                  </label>
                  <div className="flex gap-3">
                    {ICONS.map((icon) => (
                      <button
                        key={icon}
                        onClick={() => updateService(sIndex, { icon })}
                        className={`p-3 rounded-xl border transition-all ${
                          service.icon === icon
                            ? "bg-gray-100 border-blue-400 text-blue-600"
                            : "bg-gray-50 border-gray-100 text-gray-400 hover:border-gray-200"
                        }`}
                      >
                        {/* Mocking icons display for now */}
                        <div className="w-5 h-5 capitalize text-[10px] flex items-center justify-center font-bold">
                          {icon[0]}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={handleAddService}
          className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/30 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Ajouter un type de collecte
        </button>
      </div>
    </div>
  );
}
