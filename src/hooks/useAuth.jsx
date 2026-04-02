import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEYS = {
  user: "sca-demo-user",
  session: "sca-demo-session"
};

const AuthContext = createContext(null);

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

export function AuthProvider({ children }) {
  const [storedUser, setStoredUser] = useState(null);
  const [sessionEmail, setSessionEmail] = useState("");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setStoredUser(readStoredUser());
    setSessionEmail(localStorage.getItem(STORAGE_KEYS.session) ?? "");
    setIsReady(true);
  }, []);

  const register = ({ name, email, password }) => {
    const nextUser = { name, email, password };
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(nextUser));
    localStorage.setItem(STORAGE_KEYS.session, email);
    setStoredUser(nextUser);
    setSessionEmail(email);
    return nextUser;
  };

  const signIn = ({ email, password }) => {
    const currentUser = readStoredUser();

    if (!currentUser) {
      return {
        ok: false,
        error: "No registered account found yet. Please create one first."
      };
    }

    if (currentUser.email !== email || currentUser.password !== password) {
      return {
        ok: false,
        error: "Email or password does not match the saved demo account."
      };
    }

    localStorage.setItem(STORAGE_KEYS.session, email);
    setStoredUser(currentUser);
    setSessionEmail(email);

    return {
      ok: true,
      user: currentUser
    };
  };

  const signOut = () => {
    localStorage.removeItem(STORAGE_KEYS.session);
    setSessionEmail("");
  };

  const value = useMemo(
    () => ({
      isReady,
      storedUser,
      currentUser:
        storedUser && sessionEmail && storedUser.email === sessionEmail ? storedUser : null,
      isAuthenticated: Boolean(sessionEmail),
      register,
      signIn,
      signOut
    }),
    [isReady, sessionEmail, storedUser]
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
