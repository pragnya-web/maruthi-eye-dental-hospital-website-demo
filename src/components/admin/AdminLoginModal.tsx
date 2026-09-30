import React, { useState } from 'react';
import { Lock, X, AlertCircle, KeyRound, ShieldCheck } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext.tsx';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { login } = useAdminAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      await login(password);
      setPassword('');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Invalid administrator password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-blue-950 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full bg-white/10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-blue-950 flex items-center justify-center font-bold mb-3 shadow-md">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold text-white tracking-tight">
            Hospital Staff Portal
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Access appointment management, OPD scheduling, and hospital settings.
          </p>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3.5 bg-red-50 text-red-800 text-xs rounded-xl flex items-start gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Administrator Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Quick Staff Credential Helper for First-time setup */}
          <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200/80 text-[11px] text-blue-950 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-800 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Initial Administrator Key: </span>
              <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 font-mono text-blue-900 font-bold">
                Admin@Maruthi2026
              </code>
              <p className="text-slate-500 mt-1">
                You can change this password anytime in the dashboard settings.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || !password.trim()}
              className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-blue-950 font-bold text-sm rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Sign In to Dashboard'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Cancel and Return to Website
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
