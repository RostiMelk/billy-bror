import { client } from "@/lib/client";
import { useState, useCallback, useEffect } from "react";

export function useClient<T>(query: string) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const revalidate = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await client.fetch<T>(query);
      setData(result);
      return result;
    } catch (error) {
      console.error("Error executing query:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    revalidate();
  }, [revalidate]);

  return { data, revalidate, isLoading };
}
