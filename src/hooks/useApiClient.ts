import { useEffect } from "react";
import axios from "axios";
import { getApiBase, setApiBaseCentral, setApiBaseTenant } from "@/config/api";
import { useUserContext } from "@/hooks/useUserContext";

// Axios instance bound to current base
const api = axios.create({ baseURL: getApiBase() });

export function useApiClient() {
  const { data: userCtx } = useUserContext();

  useEffect(() => {
    if (!userCtx) return;
    if (userCtx.scope === "tenant") {
      // Try to use a saved tenant domain/slug or from context
      const slug = (userCtx as any)?.tenant?.slug || localStorage.getItem("tenant_domain") || undefined;
      setApiBaseTenant(slug);
    } else {
      setApiBaseCentral();
    }
    api.defaults.baseURL = getApiBase();
  }, [userCtx]);

  return { api };
}
