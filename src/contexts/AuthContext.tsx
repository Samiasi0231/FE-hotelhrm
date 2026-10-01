// src/contexts/AuthContext.tsx — FULL REPLACEMENT
// Same as your existing file — only change: the catch block in loadUser()
// now clears React state (user, hotelId) alongside localStorage, so
// isAuthenticated correctly flips to false when a session goes invalid
// instead of staying stale until the next failed API call.

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authApi, hotelApi } from "@/api/services";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
  staffOf?: {
    id: string;
    hotelId: string;
    employeeId: string;
    department: string;
    position: string;
    hotel?: { id: string; name: string; logo?: string };
  };
}

interface AuthContextType {
  user: User | null;
  hotelId: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginSuperAdmin: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [hotelId, setHotelId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) loadUser();
    else setIsLoading(false);
  }, []);

  async function loadUser() {
    try {
      const { data } = await authApi.getProfile();
      const profile = data.data || data;
      setUser(profile);

      // ── STAFF / ADMIN / ADMIN_HR ──────────────────────────────────────────
      // staffOf is included in the /auth/profile response (see auth.service.ts getProfile)
      if (profile.staffOf?.hotelId) {
        setHotelId(profile.staffOf.hotelId);
        localStorage.setItem("hotelId", profile.staffOf.hotelId);
        return;
      }

      // ── HOTEL_DIRECTOR ────────────────────────────────────────────────────
      // Try cache first; if missing, fetch fresh from /hotels/my-hotel
      const cached = localStorage.getItem("hotelId");
      if (cached) {
        setHotelId(cached);
        return;
      }

      // No cache — fetch the hotel so director hotelId is always available
      try {
        const hotelRes = await hotelApi.getMyHotel();
        const hotel = hotelRes.data?.data || hotelRes.data;
        if (hotel?.id) {
          setHotelId(hotel.id);
          localStorage.setItem("hotelId", hotel.id);
        }
      } catch {
        // Hotel not created yet (during onboarding) — that's fine
      }
    } catch {
      // Session is invalid (expired token, deactivated account, etc.) —
      // clear both storage AND React state, otherwise isAuthenticated
      // (!!user) stays true until the next API call happens to 401.
      localStorage.clear();
      setUser(null);
      setHotelId(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const { data } = await authApi.login({ email, password });
    const payload = data.data || data;

    localStorage.setItem("accessToken", payload.accessToken);
    localStorage.setItem("refreshToken", payload.refreshToken);
    localStorage.setItem("userId", payload.user.id);

    // ⚠️  Login response is a bare user — NO staffOf here.
    // Always call loadUser() after login to get the full profile
    // (which includes staffOf for staff, and fetches hotelId for directors).
    setUser(payload.user);
    await loadUser(); 
  }

  async function loginSuperAdmin(email: string, password: string) {
    const { data } = await authApi.loginSuperAdmin({ email, password });
    const payload = data.data || data;

    localStorage.setItem("accessToken", payload.accessToken);
    localStorage.setItem("refreshToken", payload.refreshToken);
    localStorage.setItem("userId", payload.user.id);

    setUser(payload.user);
    await loadUser(); 
  }

  async function logout() {
    try {
      await authApi.logout();
    } catch {}
    localStorage.clear();
    setUser(null);
    setHotelId(null);
  }

  async function refreshUser() {
    await loadUser();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        hotelId,
        isLoading,
        isAuthenticated: !!user,
        loginSuperAdmin,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
