import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiBaseUrl } from "../utils/complaints.js";

const STORAGE_KEYS = {
  accessToken: "jan-resolve-access-token",
  user: "jan-resolve-user"
};

const LEGACY_STORAGE_KEYS = {
  user: "sca-demo-user",
  session: "sca-demo-session"
};

const AuthContext = createContext(null);

function clearLegacyDemoSession() {
  localStorage.removeItem(LEGACY_STORAGE_KEYS.user);
  localStorage.removeItem(LEGACY_STORAGE_KEYS.session);
}

function readStoredUser() {
  const rawUser = localStorage.getItem(STORAGE_KEYS.user);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    localStorage.removeItem(STORAGE_KEYS.user);
    return null;
  }
}

async function requestJson(path, { accessToken, ...options } = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(options.headers || {})
    }
  });

  const rawResponse = await response.text();
  let result = null;

  if (rawResponse) {
    try {
      result = JSON.parse(rawResponse);
    } catch {
      throw new Error("Server returned an invalid response.");
    }
  }

  if (!response.ok || result?.success === false) {
    throw new Error(result?.message || "Request failed. Please try again.");
  }

  return result;
}

function toAuthError(error) {
  if (error instanceof TypeError) {
    return "Cannot reach the authentication server. Start the backend and try again.";
  }

  return error.message || "Authentication failed. Please try again.";
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [accessToken, setAccessToken] = useState("");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      clearLegacyDemoSession();

      const storedAccessToken = localStorage.getItem(STORAGE_KEYS.accessToken) || "";
      const storedUser = readStoredUser();

      if (!storedAccessToken || !storedUser) {
        if (isMounted) {
          setIsReady(true);
        }

        return;
      }

      if (isMounted) {
        setAccessToken(storedAccessToken);
        setCurrentUser(storedUser);
      }

      try {
        const result = await requestJson("/api/auth/me", {
          accessToken: storedAccessToken,
          method: "GET"
        });

        if (isMounted) {
          persistSession({
            token: storedAccessToken,
            user: result.user
          });
        }
      } catch {
        if (isMounted) {
          clearSession();
        }
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const persistSession = ({ token, user }) => {
    localStorage.setItem(STORAGE_KEYS.accessToken, token);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    setAccessToken(token);
    setCurrentUser(user);
  };

  const clearSession = () => {
    localStorage.removeItem(STORAGE_KEYS.accessToken);
    localStorage.removeItem(STORAGE_KEYS.user);
    clearLegacyDemoSession();
    setAccessToken("");
    setCurrentUser(null);
  };

  const register = async ({ name, email, password }) => {
    try {
      const result = await requestJson("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password })
      });

      persistSession({ token: result.accessToken, user: result.user });

      return {
        ok: true,
        user: result.user
      };
    } catch (error) {
      return {
        ok: false,
        error: toAuthError(error)
      };
    }
  };

  const signIn = async ({ email, password }) => {
    try {
      const result = await requestJson("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });

      persistSession({ token: result.accessToken, user: result.user });

      return {
        ok: true,
        user: result.user
      };
    } catch (error) {
      return {
        ok: false,
        error: toAuthError(error)
      };
    }
  };

  const signOut = async () => {
    const token = accessToken;
    clearSession();

    if (!token) {
      return;
    }

    try {
      await requestJson("/api/auth/logout", {
        accessToken: token,
        method: "POST"
      });
    } catch {
      // Local session is already cleared.
    }
  };

  const value = useMemo(
    () => ({
      isReady,
      accessToken,
      storedUser: currentUser,
      currentUser,
      isAuthenticated: Boolean(accessToken && currentUser),
      register,
      signIn,
      signOut
    }),
    [accessToken, currentUser, isReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
