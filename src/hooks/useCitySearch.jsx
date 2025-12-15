import { useRef, useCallback, useEffect } from "react";
import { getCitySearchApiHandler } from "../services/masterService";

export const useCitySearch = () => {
  const debounceRef = useRef(null);

  const loadCities = useCallback((inputValue) => {
    return new Promise((resolve) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(async () => {
        try {
          const cities = await getCitySearchApiHandler(inputValue);

          if (Array.isArray(cities)) {
            const modifiedData = cities.map((item) => {
              return {
                label: item.name,
                value: item.id || item.name,
                ...item,
              };
            });

            resolve(modifiedData);
          } else {
            resolve([]);
          }
        } catch (error) {
          console.error("City fetch error:", error);
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

  return { loadCities };
};
