import React from 'react';

// Lista de TLDs comunes (puedes agregar más si quieres)
const TLDS = 'com|net|org|edu|gov|cl|ar|mx|pe|co|es|info|io|app|dev|me';

/**
 * Convierte URLs en texto plano a enlaces <a> clickeables.
 * Detecta:
 *   - https://dominio.com
 *   - http://dominio.com
 *   - www.dominio.com
 *   - dominio.com (sin protocolo, con TLD válido)
 */
export function linkify(text) {
  if (!text) return text;

  // Regex ampliado:
  //   1) http(s)://...
  //   2) www...
  //   3) dominio.tld (sin protocolo, con TLD de la lista)
  const urlRegex = new RegExp(
    `((https?:\\/\\/|www\\.)[^\\s<]+|\\b[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\\.(?:${TLDS})\\b(?:\\/[^\\s<]*)?)`,
    'g'
  );

  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Detectar si es URL
    const isFullUrl = /^(https?:\/\/|www\.)/.test(part);
    const isBareDomain = new RegExp(`\\b[a-z0-9-]+\\.(?:${TLDS})\\b`, 'i').test(part);

    if (isFullUrl || isBareDomain) {
      // Agregar https:// si no tiene protocolo
      let href = part;
      if (part.startsWith('www.')) {
        href = `https://${part}`;
      } else if (!/^https?:\/\//.test(part)) {
        href = `https://${part}`;
      }

      return (
        <a
          key={index}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{ wordBreak: 'break-word' }}
        >
          {part}
        </a>
      );
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}