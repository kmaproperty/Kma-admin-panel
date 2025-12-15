import { useRef, useCallback, useEffect } from "react";
import { getLocalitySearchApiHandler } from "../services/masterService";

export const useLocalitySearch = () => {
  const debounceRef = useRef(null);

  const loadLocalities = useCallback(({ query, cityId, cityName }) => {
    return new Promise((resolve) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (!cityId && !cityName) {
        resolve([]);
        return;
      }

      debounceRef.current = setTimeout(async () => {
        try {
          const cities = await getLocalitySearchApiHandler({
            query,
            cityId,
            cityName,
          });

          if (Array.isArray(cities)) {
            const modifiedData = cities.map((item) => ({
              label: item.name,
              value: item.id || item.name,
              ...item,
            }));

            resolve(modifiedData);
          } else {
            resolve([]);
          }
        } catch (error) {
          console.error("Building fetch error:", error);
          resolve([]);
        }
      }, 300);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return { loadLocalities };
};
