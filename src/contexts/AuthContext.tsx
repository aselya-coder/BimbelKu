
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// MOCK ADMIN CREDENTIALS
const MOCK_ADMIN_EMAIL = "admin@bimbelku.com";
const MOCK_ADMIN_PASSWORD = "password123";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isSupabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY);

  useEffect(() => {
    // 1. Check Supabase Session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setIsAdmin(true); // Assuming any logged in user is admin for now
        setIsLoading(false);
      } else {
        if (!isSupabaseConfigured) {
          const storedUser = localStorage.getItem("bimbelku_user");
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setIsAdmin(parsedUser.email === MOCK_ADMIN_EMAIL);
          }
        }
        setIsLoading(false);
      }
    });

    // Listen for Supabase Auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setIsAdmin(true);
        // Clear mock storage if real auth is active
        localStorage.removeItem("bimbelku_user");
      } else {
        // If supabase logs out, we might still have mock user? 
        // Usually logout clears everything.
        if (!isSupabaseConfigured || !localStorage.getItem("bimbelku_user")) {
           setUser(null);
           setIsAdmin(false);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [isSupabaseConfigured]);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);

    // 1. Try Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error && data.user) {
      setUser(data.user);
      setIsAdmin(true);
      setIsLoading(false);
      return { error: null };
    }

    if (!isSupabaseConfigured && email === MOCK_ADMIN_EMAIL && password === MOCK_ADMIN_PASSWORD) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        id: "mock-admin-id",
        app_metadata: {},
        user_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString(),
        email: email,
        role: "authenticated"
      };
      
      setUser(mockUser);
      setIsAdmin(true);
      localStorage.setItem("bimbelku_user", JSON.stringify(mockUser));
      setIsLoading(false);
      return { error: null };
    }

    setIsLoading(false);
    return { error: error || new Error("Email atau password salah") };
  };

  const signOut = async () => {
    setIsLoading(true);
    
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Clear Mock storage
    localStorage.removeItem("bimbelku_user");
    
    setUser(null);
    setIsAdmin(false);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
