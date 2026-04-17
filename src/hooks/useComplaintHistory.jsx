import { useEffect, useState } from "react";
import { useAuth } from "./useAuth.jsx";
import { apiBaseUrl } from "../utils/complaints.js";

export function useComplaintHistory() {
  const { currentUser, isReady } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isReady) {
      return undefined;
    }

    if (!currentUser?.name) {
      setComplaints([]);
      setIsLoading(false);
      setError("");
      return undefined;
    }

    const abortController = new AbortController();

    const loadComplaintHistory = async () => {
      setIsLoading(true);
      setError("");

      try {
        const query = new URLSearchParams({
          name: currentUser.name
        });

        if (currentUser.email) {
          query.set("email", currentUser.email);
        }

        const response = await fetch(
          `${apiBaseUrl}/api/complaints/history?${query.toString()}`,
          {
            signal: abortController.signal
          }
        );

        const rawResponse = await response.text();
        const result = rawResponse ? JSON.parse(rawResponse) : null;

        if (!response.ok || !result?.success) {
          throw new Error(result?.message || "Unable to load complaint history right now.");
        }

        setComplaints(result.complaints || []);
      } catch (fetchError) {
        if (fetchError.name === "AbortError") {
          return;
        }

        setError(fetchError.message);
        setComplaints([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadComplaintHistory();

    return () => {
      abortController.abort();
    };
  }, [currentUser?.email, currentUser?.name, isReady]);

  return {
    complaints,
    latestComplaint: complaints[0] || null,
    isLoading,
    error
  };
}
