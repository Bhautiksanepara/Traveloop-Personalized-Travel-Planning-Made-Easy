import { useEffect, useState } from 'react';
import { getSelectedTripId, setSelectedTripId } from '../lib/storage';

export function useSelectedTrip() {
  const [selectedTripId, setSelectedTripIdState] = useState(() => getSelectedTripId());

  useEffect(() => {
    setSelectedTripId(selectedTripId);
  }, [selectedTripId]);

  return {
    selectedTripId,
    setSelectedTripId: setSelectedTripIdState
  };
}
