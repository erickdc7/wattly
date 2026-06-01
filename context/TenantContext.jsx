"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

export const MONTH_NAMES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
export const MONTH_SHORT = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export function getPrevMonth(month, year) {
  return month === 1 ? { month: 12, year: year - 1 } : { month: month - 1, year };
}

export function getNextMonth(month, year) {
  return month === 12 ? { month: 1, year: year + 1 } : { month: month + 1, year };
}

const TenantContext = createContext(null);

export function TenantProvider({ children }) {
  const [tenants, setTenants] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch tenants from API on mount
  const fetchTenants = useCallback(async () => {
    try {
      const res = await fetch("/api/inquilinos");
      const data = await res.json();
      setTenants(data);
    } catch (err) {
      console.error("Error fetching tenants:", err);
    }
  }, []);

  // Fetch config from API on mount
  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/configuracion");
      const data = await res.json();
      setConfig(data);
    } catch (err) {
      console.error("Error fetching config:", err);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchTenants(), fetchConfig()]).finally(() => setLoading(false));
  }, [fetchTenants, fetchConfig]);

  // Add tenant → POST to API then update state
  const addTenant = async (tenantData) => {
    try {
      const res = await fetch("/api/inquilinos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tenantData),
      });
      const created = await res.json();
      setTenants((prev) => [...prev, created]);
      return created;
    } catch (err) {
      console.error("Error adding tenant:", err);
    }
  };

  // Update tenant → PUT to API then update state
  const updateTenant = async (id, data) => {
    try {
      const res = await fetch("/api/inquilinos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...data }),
      });
      const updated = await res.json();
      setTenants((prev) => prev.map((t) => (t.id === id ? updated : t)));
      return updated;
    } catch (err) {
      console.error("Error updating tenant:", err);
    }
  };

  // Remove tenant → DELETE to API then update state
  const removeTenant = async (id) => {
    try {
      await fetch(`/api/inquilinos?id=${id}`, { method: "DELETE" });
      setTenants((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Error removing tenant:", err);
    }
  };

  // Update config → PUT to API then update state
  const updateConfig = async (data) => {
    try {
      const res = await fetch("/api/configuracion", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const updated = await res.json();
      setConfig(updated);
      return updated;
    } catch (err) {
      console.error("Error updating config:", err);
    }
  };

  return (
    <TenantContext.Provider
      value={{
        tenants,
        setTenants,
        addTenant,
        removeTenant,
        updateTenant,
        config,
        updateConfig,
        loading,
        refetchTenants: fetchTenants,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenants() {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error("useTenants must be inside TenantProvider");
  return ctx;
}
