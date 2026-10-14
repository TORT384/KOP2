import React, { useState, useEffect, useMemo } from 'react';
import DashboardView from '../components/DashboardView';

export default function DashboardContainer({ isDark, theme, setTheme, minPopulation, setMinPopulation }) {
  const [countries, setCountries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sortKey, setSortKey] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    // 1. Отримуємо список дійсних назв країн
    fetch('https://countriesnow.space/api/v0.1/countries')
      .then((res) => res.json())
      .then((validCountriesRes) => {
        const validNamesSet = new Set(
          (validCountriesRes.data || []).map((c) => c.country.toLowerCase().trim())
        );

        // 2. Отримуємо дані населення
        return fetch('https://countriesnow.space/api/v0.1/countries/population')
          .then((res) => res.json())
          .then((popResult) => ({ validNamesSet, popResult }));
      })
      .then(({ validNamesSet, popResult }) => {
        if (!isMounted) return;

        if (popResult.error || !popResult.data) {
          throw new Error('Не вдалося отримати коректні дані');
        }

        // Залишаємо ТІЛЬКИ ті записи, назва яких є серед реальних країн
        const realCountries = popResult.data.filter((item) => {
          const name = (item.country || '').toLowerCase().trim();
          return validNamesSet.has(name);
        });

        const formattedData = realCountries.map((item) => {
          const latestPopObj =
            Array.isArray(item.populationCounts) && item.populationCounts.length > 0
              ? item.populationCounts[item.populationCounts.length - 1]
              : null;

          const popValue = latestPopObj ? latestPopObj.value : 0;

          return {
            id: item.iso3 || item.code || item.country,
            name: item.country || 'Невідома країна',
            capital: 'Столиця',
            population: Number(popValue),
            area: Math.round(Number(popValue) / 120),
            region: 'Світ',
          };
        });

        setCountries(formattedData);
        setIsLoading(false);
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Не вдалося завантажити дані');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const kpis = useMemo(() => {
    if (countries.length === 0) return [];

    const totalCountries = countries.length;
    const totalPopulation = countries.reduce((acc, c) => acc + c.population, 0);
    const avgArea = Math.round(
      countries.reduce((acc, c) => acc + c.area, 0) / totalCountries
    );

    return [
      { id: 'kpi-1', title: 'Усього країн', value: totalCountries.toLocaleString() },
      { 
        id: 'kpi-2', 
        title: 'Загальне населення', 
        value: `${(totalPopulation / 1_000_000_000).toFixed(2)} млрд` 
      },
      { 
        id: 'kpi-3', 
        title: 'Середня площа', 
        value: `${avgArea.toLocaleString()} км²` 
      },
    ];
  }, [countries]);

  const processedCountries = useMemo(() => {
    const filtered = countries.filter((c) => c.population >= minPopulation);

    return [...filtered].sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [countries, minPopulation, sortKey, sortOrder]);

  const handleSortChange = (key) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  return (
    <DashboardView
      isDark={isDark}
      theme={theme}
      setTheme={setTheme}
      minPopulation={minPopulation}
      setMinPopulation={setMinPopulation}
      isLoading={isLoading}
      error={error}
      kpis={kpis}
      countries={processedCountries}
      sortKey={sortKey}
      sortOrder={sortOrder}
      onSort={handleSortChange}
    />
  );
}