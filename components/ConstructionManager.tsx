"use client";

import React, { useState, useEffect } from "react";
import { Hammer, Plus, X, Calendar, MapPin, Check, Save, Loader2, AlertTriangle, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

interface ConstructionWork {
  id?: number;
  title: string;
  description: string;
  locationName: string;
  startDate: string;
  endDate: string;
  status: string; // 'Programmé', 'En cours', 'Terminé', 'Annulé'
  impactType: string;
}

export default function ConstructionManager({ cityId }: { cityId: string }) {
  const toast = useToast();
  const [works, setWorks] = useState<ConstructionWork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingWork, setEditingWork] = useState<ConstructionWork | null>(null);

  useEffect(() => {
    fetchWorks();
  }, [cityId]);

  const fetchWorks = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/construction-works`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      const data = await response.json();
      setWorks(data);
    } catch (error) {
      console.error("Error fetching works:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (work: ConstructionWork) => {
    setIsSaving(true);
    try {
      const method = work.id ? 'PATCH' : 'POST';
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/construction-works${work.id ? `/${work.id}` : ''}`;
      
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(work)
      });

      if (response.ok) {
        toast("success", `Chantier ${work.id ? 'mis à jour' : 'ajouté'} avec succès !`);
        setEditingWork(null);
        fetchWorks();
      } else {
        toast("error", "Erreur lors de l'enregistrement.");
      }
    } catch (error) {
      toast("error", "Une erreur est survenue.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Voulez-vous vraiment supprimer ce chantier ?")) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/construction-works/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });

      if (response.ok) {
        toast("success", "Chantier supprimé.");
        fetchWorks();
      }
    } catch (error) {
      toast("error", "Erreur lors de la suppression.");
    }
  };

  if (isLoading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" /></div>;

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Chantiers</h2>
          <p className="text-gray-500 text-sm mt-1">Informez les citoyens des travaux de voirie en temps réel.</p>
        </div>
        <button
          onClick={() => setEditingWork({
            title: "",
            description: "",
            locationName: "",
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
            status: "Programmé",
            impactType: "Circulation alternée"
          })}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-200"
        >
          <Plus className="w-4 h-4" />
          Nouveau chantier
        </button>
      </div>

      {editingWork && (
        <div className="bg-white border-2 border-blue-100 rounded-2xl p-6 mb-8 shadow-xl shadow-blue-50/50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">{editingWork.id ? 'Modifier le chantier' : 'Nouveau chantier'}</h3>
            <button onClick={() => setEditingWork(null)}><X className="w-5 h-5 text-gray-400" /></button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Titre du chantier</label>
                <input 
                  type="text" 
                  value={editingWork.title}
                  onChange={(e) => setEditingWork({...editingWork, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-400"
                  placeholder="ex: Réfection Avenue République"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Description / Impact</label>
                <textarea 
                  value={editingWork.description}
                  onChange={(e) => setEditingWork({...editingWork, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-400 h-24"
                  placeholder="Détails des travaux..."
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Lieu</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input 
                    type="text" 
                    value={editingWork.locationName}
                    onChange={(e) => setEditingWork({...editingWork, locationName: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-400"
                    placeholder="Adresse ou quartier"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Début</label>
                  <input 
                    type="date" 
                    value={editingWork.startDate.split('T')[0]}
                    onChange={(e) => setEditingWork({...editingWork, startDate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Fin prévue</label>
                  <input 
                    type="date" 
                    value={editingWork.endDate.split('T')[0]}
                    onChange={(e) => setEditingWork({...editingWork, endDate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-400"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Statut</label>
                <select 
                  value={editingWork.status}
                  onChange={(e) => setEditingWork({...editingWork, status: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-400 bg-white"
                >
                  <option>Programmé</option>
                  <option>En cours</option>
                  <option>Terminé</option>
                  <option>Annulé</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Type d'impact</label>
                <select 
                  value={editingWork.impactType}
                  onChange={(e) => setEditingWork({...editingWork, impactType: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-400 bg-white"
                >
                  <option>Circulation alternée</option>
                  <option>Rue barrée</option>
                  <option>Stationnement interdit</option>
                  <option>Trottoir réduit</option>
                  <option>Bruit important</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button 
              onClick={() => setEditingWork(null)}
              className="px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
            >
              Annuler
            </button>
            <button 
              onClick={() => handleSave(editingWork)}
              disabled={isSaving}
              className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-100 flex items-center gap-2"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Enregistrer le chantier
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {works.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <Hammer className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Aucun chantier enregistré pour le moment.</p>
          </div>
        ) : (
          works.map((work) => (
            <div key={work.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  work.status === 'En cours' ? 'bg-orange-100 text-orange-600' : 
                  work.status === 'Annulé' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  <Hammer className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-gray-900">{work.title}</h4>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      work.status === 'En cours' ? 'bg-orange-50 text-orange-700' : 
                      work.status === 'Annulé' ? 'bg-red-50 text-red-700' : 
                      work.status === 'Terminé' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {work.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {work.locationName} • <Calendar className="w-3.5 h-3.5 ml-1" /> du {new Date(work.startDate).toLocaleDateString()} au {new Date(work.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => setEditingWork(work)}
                  className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                >
                  <Save className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => work.id && handleDelete(work.id)}
                  className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
