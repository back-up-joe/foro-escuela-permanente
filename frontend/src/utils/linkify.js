import React from 'react';

// TLDs comunes
const TLDS = 'com|net|org|edu|gov|cl|ar|mx|pe|co|es|info|io|app|dev|me|tv|xyz|site|online';

// Regex unificado (una sola pasada, no doble match)
const URL_REGEX = new RegExp(
  // 1) http(s)://...  o  2) www...  o  3) dominio.tld[/path]
  `(https?:\\/\\/[^\\s<]+|www\\.[^\\s<]+|[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\\.(?:${TLDS})\\b(?:\\/[^\\s<]*)?)`,
  'gi'
);

export function linkify(text) {
  if (!text) return text;

  const nodes = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  // Reset regex (por seguridad al ser global)
  URL_REGEX.lastIndex = 0;

  while ((match = URL_REGEX.exec(text)) !== null) {
    const matchedUrl = match[0];
    const startIndex = match.index;

    // Texto normal antes del match
    if (startIndex > lastIndex) {
      nodes.push(
        <React.Fragment key={`text-${key++}`}>
          {text.substring(lastIndex, startIndex)}
        </React.Fragment>
      );
    }

    // Determinar href
    let href = matchedUrl;
    if (matchedUrl.startsWith('www.')) {
      href = `https://${matchedUrl}`;
    } else if (!/^https?:\/\//i.test(matchedUrl)) {
      href = `https://${matchedUrl}`;
    }

    // Agregar link
    nodes.push(
      <a
        key={`link-${key++}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{ wordBreak: 'break-word' }}
      >
        {matchedUrl}
      </a>
    );

    lastIndex = startIndex + matchedUrl.length;
  }

  // Texto restante después del último match
  if (lastIndex < text.length) {
    nodes.push(
      <React.Fragment key={`text-${key++}`}>
        {text.substring(lastIndex)}
      </React.Fragment>
    );
  }

  return nodes.length > 0 ? nodes : text;
}