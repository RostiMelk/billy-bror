import { useEffect, useState } from "react";

export function useIsPwa() {
  const [isPwa, setIsPwa] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsPwa(true);
    }
  }, []);

  return isPwa;
}
