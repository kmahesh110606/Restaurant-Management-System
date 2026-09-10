/**
 * BookTablePage — Table selection/booking for table-workflow restaurants.
 * Fetches tables from API, shows availability and capacity.
 */

import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  TableSimpleRegular,
  PeopleRegular,
  CheckmarkCircleRegular,
} from '@fluentui/react-icons';
import { getTables } from '../../api/tables';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export default function BookTablePage() {
  const { restaurantConfig, slug } = useOutletContext() || {};
  const navigate = useNavigate();

  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getTables()
      .then(({ data }) => {
        const list = data.results || data;
        setTables(Array.isArray(list) ? list : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const handleSelectTable = (table) => {
    setSelectedTable(table);
  };

  const handleProceed = () => {
    if (selectedTable) {
      navigate(`/${slug}/menu?table=${selectedTable.number}`);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (restaurantConfig?.workflow_type !== 'table') {
    return (
      <EmptyState
        title="Table booking is not available"
        subtitle="This restaurant uses a different ordering workflow."
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-gray-900">Select a Table</h1>
        <p className="text-sm text-gray-500 mt-1">
          Choose your table to start ordering
        </p>
      </div>

      {tables.length === 0 ? (
        <EmptyState
          icon={TableSimpleRegular}
          title="No tables available"
          subtitle="Please check back later or contact the staff."
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {tables.map((table) => {
            const isSelected = selectedTable?.id === table.id;

            return (
              <button
                key={table.id}
                onClick={() => handleSelectTable(table)}
                disabled={!table.is_active}
                className={`glass-card p-5 text-center transition-all duration-200 ${
                  isSelected
                    ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20 shadow-lg'
                    : 'hover:shadow-md'
                } ${!table.is_active ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className={`w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center ${
                  isSelected ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  <span className="text-lg font-extrabold">{table.number}</span>
                </div>

                <h3 className="text-sm font-bold text-gray-900 mb-1">
                  {table.name || `Table ${table.number}`}
                </h3>

                <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                  <PeopleRegular fontSize={12} />
                  <span>{table.capacity} seats</span>
                </div>

                {isSelected && (
                  <CheckmarkCircleRegular
                    fontSize={20}
                    className="text-[var(--color-primary)] mx-auto mt-2 animate-scale-in"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Proceed button */}
      {selectedTable && (
        <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-auto z-30 animate-slide-up">
          <button
            onClick={handleProceed}
            className="btn btn-primary btn-lg w-full sm:w-auto justify-center shadow-xl"
          >
            Continue with Table {selectedTable.number}
          </button>
        </div>
      )}
    </div>
  );
}
