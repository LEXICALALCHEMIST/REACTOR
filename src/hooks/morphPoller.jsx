import { useEffect, useRef } from 'react';

export function useMorphPoller(morphID, executeMorphOp) {
  const pollingInterval = useRef(null);

  useEffect(() => {
    console.log('useMorphPoller initialized with toID:', morphID);
    if (!morphID || typeof morphID !== 'string' || morphID.trim() === '') {
      console.log('No valid toID provided, skipping polling');
      return;
    }

    async function pollMorphs() {
      console.log('Polling MorphOps for toID:', morphID);
      try {
        const res = await fetch(`http://192.168.1.166:3001/morphQueue/getMorphs?toID=${encodeURIComponent(morphID)}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) {
          console.error('Error fetching MorphQueue:', res.status, 'URL:', res.url);
          return;
        }
        const data = await res.json(); // Store the raw response
        console.log('MorphQueue entries for toID:', morphID, ':', data); // Log the raw array directly
      } catch (err) {
        console.error('Error fetching MorphQueue:', morphID, ':', err.message);
      }
    }

    pollingInterval.current = setInterval(pollMorphs, 3000); // Poll every 3 seconds
    return () => {
      console.log('Cleaning up useMorphPoller interval for toID:', morphID);
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [morphID, executeMorphOp]); // Re-run when morphID changes
}