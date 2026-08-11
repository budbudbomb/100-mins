import React from 'react';
import { useIntl } from 'react-intl';

export default function StatusBadge({ status }) {
  const { formatMessage } = useIntl();
  
  let label;
  try {
    label = formatMessage({ id: `status.${status}` });
  } catch {
    label = status;
  }

  return (
    <span className={`status-badge status-${status}`}>
      {label}
    </span>
  );
}
