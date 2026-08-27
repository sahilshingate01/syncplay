/**
 * Fast client-side file fingerprinting without uploading
 */

export async function generateFileFingerprint(file) {
  if (!file) return null;

  try {
    // Read first 64KB and last 64KB for instantaneous hash
    const CHUNK_SIZE = 64 * 1024;
    const size = file.size;
    let chunks = [];

    const firstChunk = file.slice(0, Math.min(CHUNK_SIZE, size));
    chunks.push(await firstChunk.arrayBuffer());

    if (size > CHUNK_SIZE * 2) {
      const lastChunk = file.slice(size - CHUNK_SIZE, size);
      chunks.push(await lastChunk.arrayBuffer());
    }

    // Combine buffers
    let totalLen = chunks.reduce((acc, c) => acc + c.byteLength, 0);
    let combined = new Uint8Array(totalLen);
    let offset = 0;
    for (let c of chunks) {
      combined.set(new Uint8Array(c), offset);
      offset += c.byteLength;
    }

    // Compute SHA-256
    const hashBuffer = await crypto.subtle.digest('SHA-256', combined);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);

    return {
      filename: file.name,
      size: file.size,
      type: file.type,
      fingerprint: hashHex,
    };
  } catch (err) {
    console.warn('Could not generate fingerprint, using fallback:', err);
    return {
      filename: file.name,
      size: file.size,
      type: file.type,
      fingerprint: `${file.name}-${file.size}`,
    };
  }
}

export function compareFileWithRoom(localFileFingerprint, roomMovie) {
  if (!localFileFingerprint || !roomMovie) {
    return { matches: true, reason: 'No validation needed' };
  }

  // If filename matches
  if (localFileFingerprint.filename === roomMovie.filename) {
    return { matches: true, reason: 'Exact filename match' };
  }

  // If size is close within 5%
  if (roomMovie.size && Math.abs(localFileFingerprint.size - roomMovie.size) < 1000000) {
    return { matches: true, reason: 'Matching file size' };
  }

  // Name similarity check
  const cleanLocal = localFileFingerprint.filename.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanRoom = (roomMovie.filename || roomMovie.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  
  if (cleanLocal.includes(cleanRoom) || cleanRoom.includes(cleanLocal)) {
    return { matches: true, reason: 'Matching title keyword' };
  }

  return {
    matches: false,
    reason: `Selected file "${localFileFingerprint.filename}" may differ from host "${roomMovie.filename || roomMovie.title}"`,
  };
}
