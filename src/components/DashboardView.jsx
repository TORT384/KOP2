import React from 'react';
import KpiCard from './KpiCard';
import PopulationStepper from './PopulationStepper';
import ThemeToggle from './ThemeToggle';

export default function DashboardView({
  isDark,
  theme,
  setTheme,
  minPopulation,
  setMinPopulation,
  isLoading,
  error,
  kpis,
  countries,
  sortKey,
  sortOrder,
  onSort,
}) {
  const styles = {
    container: {
      padding: '24px',
      fontFamily: 'sans-serif',
      minHeight: '100vh',
      backgroundColor: isDark ? '#1a1a1a' : '#f4f6f8',
      color: isDark ? '#ffffff' : '#333333',
      transition: 'all 0.3s ease',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
    },
    kpiGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '24px',
    },
    controls: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '16px',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
      padding: '16px',
      backgroundColor: isDark ? '#2a2a2a' : '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    sortGroup: {
      display: 'flex',
      gap: '8px',
      alignItems: 'center',
    },
    button: (active) => ({
      padding: '6px 12px',
      cursor: 'pointer',
      borderRadius: '4px',
      border: '1px solid #ccc',
      backgroundColor: active ? (isDark ? '#4a4a4a' : '#e0e0e0') : isDark ? '#333' : '#fff',
      color: isDark ? '#fff' : '#000',
    }),
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '16px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      backgroundColor: isDark ? '#2a2a2a' : '#ffffff',
      borderRadius: '8px',
      overflow: 'hidden',
    },
    thTd: {
      padding: '12px 16px',
      textAlign: 'left',
      borderBottom: isDark ? '1px solid #444' : '1px solid #eee',
    },
    statusBox: {
      padding: '32px',
      textAlign: 'center',
      fontSize: '18px',
      backgroundColor: isDark ? '#2a2a2a' : '#ffffff',
      borderRadius: '8px',
      marginTop: '16px',
    },
  };

  const getSortIcon = (key) => {
    if (sortKey !== key) return '↕';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Країни — Панель керування</h1>
        <ThemeToggle theme={theme} setTheme={setTheme} />
      </header>

      {/* Живі KPI */}
      <section style={styles.kpiGrid}>
        {kpis.length > 0
          ? kpis.map((kpi) => (
              <KpiCard key={kpi.id} title={kpi.title} value={kpi.value} isDark={isDark} />
            ))
          : [1, 2, 3].map((id) => (
              <KpiCard key={id} title="Завантаження..." value="..." isDark={isDark} />
            ))}
      </section>

      {/* Панель фільтрів та сортування */}
      <section style={styles.controls}>
        <PopulationStepper
          minPopulation={minPopulation}
          setMinPopulation={setMinPopulation}
          isDark={isDark}
        />

        <div style={styles.sortGroup}>
          <span>Сортувати за:</span>
          <button style={styles.button(sortKey === 'name')} onClick={() => onSort('name')}>
            Назва {getSortIcon('name')}
          </button>
          <button style={styles.button(sortKey === 'population')} onClick={() => onSort('population')}>
            Населення {getSortIcon('population')}
          </button>
          <button style={styles.button(sortKey === 'area')} onClick={() => onSort('area')}>
            Площа {getSortIcon('area')}
          </button>
        </div>
      </section>

      {/* Умовний рендеринг станів (loading, error, empty, data) */}
      <main>
        {isLoading && (
          <div style={styles.statusBox}>
            ⏳ Завантаження даних з API... Зачекайте будь ласка.
          </div>
        )}

        {error && !isLoading && (
          <div style={{ ...styles.statusBox, color: '#ff6b6b' }}>
            ⚠️ Помилка завантаження: {error}
          </div>
        )}

        {!isLoading && !error && countries.length === 0 && (
          <div style={styles.statusBox}>
            📭 За вказаними критеріями країн не знайдено.
          </div>
        )}

        {!isLoading && !error && countries.length > 0 && (
          <table style={styles.table}>
            <thead>
              <tr style={{ backgroundColor: isDark ? '#333' : '#f0f0f0' }}>
                <th style={styles.thTd}>Код</th>
                <th style={styles.thTd}>Країна</th>
                <th style={styles.thTd}>Столиця</th>
                <th style={styles.thTd}>Регіон</th>
                <th style={styles.thTd}>Населення</th>
                <th style={styles.thTd}>Площа (км²)</th>
              </tr>
            </thead>
            <tbody>
              {countries.map((country) => (
                <tr key={country.id}>
                  <td style={styles.thTd}><strong>{country.id}</strong></td>
                  <td style={styles.thTd}>{country.name}</td>
                  <td style={styles.thTd}>{country.capital}</td>
                  <td style={styles.thTd}>{country.region}</td>
                  <td style={styles.thTd}>{country.population.toLocaleString()}</td>
                  <td style={styles.thTd}>{country.area.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}