import { useLayoutEffect, useState } from "react";

/** True after the component has mounted on the client. */
export function useClientMounted() {
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
