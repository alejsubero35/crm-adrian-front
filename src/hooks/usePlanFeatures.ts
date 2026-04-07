import { useUserContext } from "./useUserContext";

export function usePlanFeatures() {
  const { data: userCtx } = useUserContext();
  const features: string[] = userCtx?.features || [];

  function hasFeature(key: string | string[]): boolean {
    if (!features) return false;
    if (Array.isArray(key)) return key.every((k) => features.includes(k));
    return features.includes(key);
  }

  return { features, hasFeature };
}
