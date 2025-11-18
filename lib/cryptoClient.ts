// lib/cryptoClient.ts
// (FIXED: Added type assertions 'as BufferSource' to resolve TypeScript errors)

/**
 * Helper: Converts a HEX string (e.g., "a3f9...") into a Byte Array.
 */
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Helper: Converts a standard String (the Key) into a Byte Array (UTF-8).
 */
function stringToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

/**
 * The Main Decryption Function.
 * @param encryptedPackage - The string from the .dat file (Format: "IV_HEX:ENCRYPTED_DATA_HEX")
 * @param keyString - The 32-character master key fetched from /api/get-key
 * @returns The decrypted JSON object (The Explanation)
 */
export async function decryptExplanation(encryptedPackage: string, keyString: string): Promise<any> {
  try {
    // 1. Parse the "Package" (IV : Data)
    const parts = encryptedPackage.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted format. Expected IV:Data');
    }
    
    const ivHex = parts[0];
    const encryptedHex = parts[1];

    // 2. Convert everything to Bytes
    const iv = hexToBytes(ivHex);
    const encryptedData = hexToBytes(encryptedHex);
    const keyBytes = stringToBytes(keyString);

    // 3. Import the Key into the Browser's Crypto Engine
    const key = await window.crypto.subtle.importKey(
      'raw', 
      // FIX 1: Force TypeScript to accept this as a BufferSource
      keyBytes as unknown as BufferSource, 
      { name: 'AES-CBC' }, 
      false, 
      ['decrypt']
    );

    // 4. Perform the Decryption
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-CBC',
        // FIX 2: Force TypeScript to accept this as a BufferSource
        iv: iv as unknown as BufferSource,
      },
      key,
      // FIX 3: Force TypeScript to accept this as a BufferSource
      encryptedData as unknown as BufferSource
    );

    // 5. Decode result back to Text -> JSON
    const decryptedText = new TextDecoder().decode(decryptedBuffer);
    return JSON.parse(decryptedText);

  } catch (error) {
    console.error('Decryption Logic Failed:', error);
    throw new Error('Failed to decrypt explanation. The key might be invalid or the data corrupted.');
  }
}