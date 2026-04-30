import React, { useState } from "react";
import { Shield, Lock, Mail, ArrowRight, AlertTriangle } from "lucide-react";
import clsx from "clsx";
import { api } from "@/lib/api";
import { useAuth, User } from "@/context/AuthContext";

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
      const response = await api.post('/api/v1/auth/login', { email, password });
      
      if (response.error) {
        setError(response.error);
        return;
      }

      if (response.data) {
        const { access_token, user } = response.data as { access_token: string; user: User };
        login(access_token, user);
      }
    } catch {
      setError("Impossible de contacter le serveur d'authentification.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--background)] relative overflow-hidden transition-colors duration-500">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--accent)]/5 rounded-full blur-[120px] -translate-y-1/4 translate-x-1/4"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] translate-y-1/4 -translate-x-1/4"></div>
      
      <div className="relative z-10 w-full max-w-lg p-10">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-[var(--accent)] rounded-[28px] flex items-center justify-center shadow-2xl shadow-[var(--accent)]/30 mb-8 border border-white/20">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black text-[var(--foreground)] tracking-tighter">Municip&apos;All</h1>
          <p className="text-apple-muted opacity-50 mt-2 font-black">Espace de Gestion Municipale</p>
        </div>

        <div className="card-premium p-12 bg-glass">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {error && (
              <div className="bg-red-500/10 text-red-500 p-4 rounded-2xl text-xs flex items-start gap-3 border border-red-500/20 font-bold animate-shake">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-apple-muted mb-3 opacity-60">EMAIL INSTITUTIONNEL</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-[var(--accent)] transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="agent@ville.gouv.fr"
                  className="w-full bg-zinc-100 dark:bg-zinc-800/50 border border-transparent dark:border-zinc-700/50 text-[var(--foreground)] text-sm rounded-[20px] pl-12 pr-4 py-4 focus:bg-white dark:focus:bg-zinc-800 border-zinc-200 focus:border-[var(--accent)] outline-none transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-apple-muted mb-3 opacity-60">MOT DE PASSE</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-[var(--accent)] transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-100 dark:bg-zinc-800/50 border border-transparent dark:border-zinc-700/50 text-[var(--foreground)] text-sm rounded-[20px] pl-12 pr-4 py-4 focus:bg-white dark:focus:bg-zinc-800 border-zinc-200 focus:border-[var(--accent)] outline-none transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={clsx(
                "w-full bg-[var(--accent)] text-white py-4 rounded-[22px] text-base font-black shadow-xl shadow-[var(--accent)]/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4",
                isLoading && "opacity-75 cursor-wait"
              )}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Accès Sécurisé</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-[var(--card-border)]">
            <div className="flex items-start gap-4 bg-zinc-100 dark:bg-zinc-800/50 p-5 rounded-[28px] border border-[var(--card-border)]">
              <Shield className="w-6 h-6 text-[var(--accent)] shrink-0 mt-0.5 opacity-60" />
              <p className="text-[11px] text-[var(--muted)] font-medium leading-relaxed">
                Ce portail est <strong>réservé au personnel habilité</strong> des collectivités territoriales. Toute tentative d&apos;accès non autorisée est enregistrée.
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-[10px] font-black text-apple-muted opacity-40 mt-10 tracking-widest">
          © 2026 MUNICIP&apos;ALL • TECHNOLOGIES CIVIQUES
        </p>
      </div>
    </div>
  );
}
