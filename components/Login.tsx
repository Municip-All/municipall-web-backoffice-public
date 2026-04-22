import React, { useState } from "react";
import { Shield, Lock, Mail, ArrowRight, AlertTriangle } from "lucide-react";
import clsx from "clsx";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.error) {
        setError(response.error);
        return;
      }

      if (response.data) {
        const { access_token, user } = response.data;
        login(access_token, user);
      }
    } catch (err) {
      setError("Impossible de contacter le serveur d'authentification.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-50 to-transparent"></div>
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-municipall-blue/5 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4"></div>
      
      <div className="relative z-10 w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-municipall-blue rounded-2xl flex items-center justify-center shadow-lg shadow-municipall-blue/20 mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Municip'All</h1>
          <p className="text-gray-500 font-medium mt-1">Espace de Gestion Municipale</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-start gap-2 border border-red-100">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="font-medium">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email Institutionnel</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="agent@ville.gouv.fr"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-municipall-blue focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-municipall-blue focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={clsx(
                "w-full btn-primary py-3.5 text-base rounded-xl mt-2 flex items-center justify-center gap-2",
                isLoading && "opacity-75 cursor-wait"
              )}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="font-bold">Connexion Sécurisée</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 border-t border-gray-100 pt-6">
            <div className="flex items-start gap-3 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50">
              <Shield className="w-5 h-5 text-municipall-blue shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600 leading-relaxed">
                Ce portail est <strong>réservé au personnel habilité</strong> des collectivités territoriales. Toute tentative d'accès non autorisée est enregistrée.
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 font-medium mt-8">
          © 2026 Municip'All - Technologies Civiques
        </p>
      </div>
    </div>
  );
}
