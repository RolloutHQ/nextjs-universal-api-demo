"use client";

import { useEffect, useState } from "react";
import { RolloutLinkProvider, CredentialsManager } from "@rollout/link-react";
import "@rollout/link-react/style.css";

export default function LosSystemsPage() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      const newUserId = crypto.randomUUID();
      localStorage.setItem("userId", newUserId);
      setUserId(newUserId);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      getToken();
    }
  }, [userId]);

  async function getToken() {
    try {
      const response = await fetch(`/api/rollout-token?userId=${userId}`);
      const data = await response.json();
      setToken(data.token || data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch rollout token");
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <p className="text-gray-500">Loading token...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <p className="text-red-500">{error}</p>
      </main>
    );
  }

  if (!token) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <p className="text-red-500">No token available</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="max-w-[600px] w-full">
        <h1 className="text-2xl font-semibold mb-6">LOS Systems</h1>
        <RolloutLinkProvider token={token}>
          <CredentialsManager
            apiCategories={{ los: true }}
            shouldRenderConnector={(connector) => {
              if (connector.appKey === "kw-command") {
                return false;
              }

              return connector.entities?.los != null;
            }}
          />
        </RolloutLinkProvider>
      </div>
    </main>
  );
}
