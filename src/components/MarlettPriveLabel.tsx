import React from 'react';

export default function MarlettPriveLabel() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <img src="/marlett_clean.png" alt="Marlett" style={{ height: 28, width: 'auto', display: 'block' }} />
      <em style={{ fontStyle: 'italic', color: '#c9a84c', fontFamily: '"Playfair Display", serif', fontWeight: 500 }}>Privé</em>
    </span>
  );
}
