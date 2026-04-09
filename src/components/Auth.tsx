import React, { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  collection, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { motion } from 'motion/react';
import { LogIn, UserPlus, Mail, Lock, User, Building, Hammer, Wrench, ShieldCheck, Zap } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../lib/firestore-utils';

export const Auth = ({ onDemoAccess }: { onDemoAccess: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        // 1. Create Auth User
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Update Profile
        await updateProfile(user, { displayName: fullName });

        // 3. Create Empresa
        let empresaId = '';
        try {
          const empresaRef = await addDoc(collection(db, 'empresas'), {
            nombre: companyName,
            created_at: serverTimestamp()
          });
          empresaId = empresaRef.id;
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, 'empresas');
        }

        // 4. Create Usuario Profile
        try {
          await setDoc(doc(db, 'usuarios', user.uid), {
            empresa_id: empresaId,
            nombre: fullName,
            rol: 'admin',
            created_at: serverTimestamp()
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `usuarios/${user.uid}`);
        }
      } else {
        // Sign In
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error('Auth Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #334155 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        
        {/* Decorative Icons */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 right-20 text-slate-800 opacity-10"
        >
          <Wrench size={120} />
        </motion.div>
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 left-20 text-slate-800 opacity-10"
        >
          <Hammer size={100} />
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white/95 backdrop-blur-xl w-full max-w-md rounded-3xl md:rounded-[3rem] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.5)] border border-white/20 overflow-hidden p-6 md:p-10 relative z-10 mx-4"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.5, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-orange-500 to-yellow-400 rounded-2xl md:rounded-[2rem] flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-2xl shadow-orange-500/30"
          >
            <Hammer className="text-white" size={32} strokeWidth={2.5} />
          </motion.div>
          <div className="space-y-1">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter flex items-center justify-center gap-2">
              SurBytes
              <span className="text-orange-600">.</span>
            </h2>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Ferretero ERP</p>
          </div>
          <p className="text-slate-500 font-medium mt-4 md:mt-6 text-sm md:text-base">
            {isRegister ? 'Crea tu cuenta industrial' : 'Bienvenido de nuevo al almacén'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          {isRegister && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-5"
            >
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nombre Completo</label>
                <div className="relative group">
                  <User className="absolute left-4 top-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                  <input 
                    type="text" 
                    required
                    placeholder="Ej. Juan Pérez"
                    className="w-full pl-12 pr-6 py-4 bg-slate-100/50 rounded-2xl border-2 border-transparent focus:border-orange-500 focus:bg-white outline-none font-bold transition-all"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nombre de la Ferretería</label>
                <div className="relative group">
                  <Building className="absolute left-4 top-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                  <input 
                    type="text" 
                    required
                    placeholder="Ej. Ferretería El Martillo"
                    className="w-full pl-12 pr-6 py-4 bg-slate-100/50 rounded-2xl border-2 border-transparent focus:border-orange-500 focus:bg-white outline-none font-bold transition-all"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
              </div>
            </motion.div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Correo Electrónico</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
              <input 
                type="email" 
                required
                placeholder="correo@ejemplo.com"
                className="w-full pl-12 pr-6 py-4 bg-slate-100/50 rounded-2xl border-2 border-transparent focus:border-orange-500 focus:bg-white outline-none font-bold transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Contraseña</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
              <input 
                type="password" 
                required
                placeholder="••••••••"
                className="w-full pl-12 pr-6 py-4 bg-slate-100/50 rounded-2xl border-2 border-transparent focus:border-orange-500 focus:bg-white outline-none font-bold transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100 flex items-center gap-3"
            >
              <ShieldCheck size={18} className="shrink-0" />
              {error}
            </motion.div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-lg shadow-2xl shadow-slate-900/40 hover:bg-orange-600 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-wider mt-4"
          >
            {loading ? (
              <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              isRegister ? <><UserPlus size={24} /> Registrarse</> : <><LogIn size={24} /> Entrar</>
            )}
          </button>

          {!isRegister && (
            <button 
              type="button"
              onClick={onDemoAccess}
              className="w-full py-4 bg-blue-600/10 text-blue-600 rounded-[1.5rem] font-black text-sm shadow-sm hover:bg-blue-600 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest mt-2 border-2 border-blue-600/20"
            >
              <Zap size={20} /> Acceso Rápido (Demo)
            </button>
          )}
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsRegister(!isRegister)}
            className="text-slate-400 font-bold hover:text-orange-600 transition-colors text-sm"
          >
            {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate gratis'}
          </button>
        </div>
      </motion.div>

      {/* Footer Branding */}
      <div className="absolute bottom-8 left-0 right-0 text-center z-10">
        <p className="text-slate-500 text-xs font-black uppercase tracking-[0.4em]">Powered by SurBytes Startup</p>
      </div>
    </div>
  );
};
