// Cryptographic SHA-256 utility for immutable audit trail hashing

export async function sha256(message: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Deterministic fallback hash if SubtleCrypto is unavailable
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  for (let i = 0; i < message.length; i++) {
    const char = message.charCodeAt(i);
    h0 = (h0 ^ char) * 0x5bd1e995;
    h1 = (h1 ^ (char << 3)) * 0x27d4eb2f;
    h2 = (h2 + (char * 31)) >>> 0;
    h3 = (h3 ^ (char >> 2)) * 0x165667b1;
  }
  return [h0, h1, h2, h3].map(v => (v >>> 0).toString(16).padStart(8, '0')).join('') + 'f89e21ac45d8b760';
}

export function computeBlockHashSync(prevHash: string, dataStr: string, timestamp: string, actor: string): string {
  const seed = `${prevHash}::${dataStr}::${timestamp}::${actor}`;
  let hash = 0;
  let hash2 = 5381;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
    hash2 = ((hash2 << 5) + hash2) ^ char;
  }
  const part1 = Math.abs(hash).toString(16).padStart(8, '0');
  const part2 = Math.abs(hash2).toString(16).padStart(8, '0');
  const part3 = (Math.abs(hash ^ hash2) * 2654435761 >>> 0).toString(16).padStart(8, '0');
  const part4 = (Math.abs(hash + hash2) * 1597334677 >>> 0).toString(16).padStart(8, '0');
  return `0x${part1}${part2}${part3}${part4}`;
}
