import { useEffect, useState } from 'react';
import { tripsApi } from '../lib/api';
import { getSelectedTripId, setSelectedTripId } from '../lib/storage';

export function useResolvedTrip(explicitTripId = '') {
  const [tripId, setTripId] = useState(explicitTripId || getSelectedTripId());
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    const loadTrip = async () => {
      setLoading(true);
      setError('');

      try {
        let resolvedTripId = explicitTripId || getSelectedTripId();

        if (!resolvedTripId) {
          const tripsResponse = await tripsApi.list({ limit: 1 });
          const firstTrip = tripsResponse.data?.[0];
          resolvedTripId = firstTrip?.id || '';
        }

        if (!resolvedTripId) {
          if (!ignore) {
            setTripId('');
            setTrip(null);
          }
          return;
        }

        const tripResponse = await tripsApi.get(resolvedTripId);

        if (!ignore) {
          setTripId(resolvedTripId);
          setSelectedTripId(resolvedTripId);
          setTrip(tripResponse.data);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message || 'Failed to load trip.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadTrip();

    return () => {
      ignore = true;
    };
  }, [explicitTripId]);

  return {
    tripId,
    trip,
    loading,
    error,
    setTrip
  };
}
