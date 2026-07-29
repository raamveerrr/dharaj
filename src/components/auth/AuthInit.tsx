import { useEffect } from "react";
import { useAuth } from "@/stores/auth";

/** Mount once to boot the Firebase auth listener. Client-only. */
export function AuthInit() {
  const init = useAuth((s) => s.init);
  useEffect(() => {
    init();
  }, [init]);
  return null;
}
