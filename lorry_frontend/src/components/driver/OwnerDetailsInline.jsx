import React, { useEffect, useState } from 'react';
import { fetchOwnerPublicProfile } from '../../services/goodsOwnerService';

const OwnerDetailsInline = ({ ownerId }) => {
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    setOwner(null);
    fetchOwnerPublicProfile(ownerId)
      .then(data => { if (isMounted) setOwner(data); })
      .catch(() => { if (isMounted) setError('Failed to fetch owner details.'); })
      .finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, [ownerId]);

  return (
    <div style={{ marginTop: '1em', border: '1px solid var(--border-color)', borderRadius: 4, padding: '0.75em', background: 'var(--input-inside)' }}>
      {loading && <p>Loading owner details...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {owner && !error && (
        <>
          <p><strong>Username:</strong> {owner.username || 'N/A'}</p>
          <p><strong>Email:</strong> {owner.email || 'N/A'}</p>
          <p><strong>Phone Number:</strong> {owner.phone_number || 'N/A'}</p>
        </>
      )}
    </div>
  );
};

export default OwnerDetailsInline;
