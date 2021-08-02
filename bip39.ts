import englishWordlist from './wordlists/english.json';

const DEFAULT_WORDLIST = englishWordlist;

const INVALID_MNEMONIC = 'Invalid mnemonic';
const INVALID_ENTROPY = 'Invalid entropy';
const INVALID_CHECKSUM = 'Invalid mnemonic checksum';
const WORDLIST_REQUIRED =
    'A wordlist is required but a default could not be found.\nPlease pass a 2048 word array explicitly.';

function lpad(str: string, padString: string, length: number) {
    while (str.length < length) {
        str = padString + str;
    }
    return str;
}

function binaryToByte(bin: string) {
    return parseInt(bin, 2);
}

function bytesToBinary(bytes: Uint8Array): string {
    const binaryArray: string[] = [];
    bytes.forEach((byte) => binaryArray.push(lpad(byte.toString(2), '0', 8)));
    return binaryArray.join('');
}

async function deriveChecksumBits(entropyArray: Uint8Array) {
    const ENT = entropyArray.length * 8;
    const CS = ENT / 32;
    const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', entropyArray));
    return bytesToBinary(hash).slice(0, CS);
}

export async function mnemonicToEntropy(mnemonic: string, wordlist: string[] = DEFAULT_WORDLIST) {
    if (!wordlist) {
        throw new Error(WORDLIST_REQUIRED);
    }
    const words = mnemonic.normalize('NFKD').trim().split(/\s+/);
    if (words.length % 3 !== 0) {
        throw new Error(INVALID_MNEMONIC);
    }
    // convert word indices to 11 bit binary strings
    const bits = words
        .map((word) => {
            const index = wordlist.indexOf(word);
            if (index === -1) {
                throw new Error(INVALID_MNEMONIC);
            }
            return lpad(index.toString(2), '0', 11);
        })
        .join('');
    // split the binary string into ENT/CS
    const dividerIndex = Math.floor(bits.length / 33) * 32;
    const entropyBits = bits.slice(0, dividerIndex);
    const checksumBits = bits.slice(dividerIndex);
    // calculate the checksum and compare
    const entropyBytes = entropyBits.match(/(.{1,8})/g)?.map(binaryToByte) || [];
    if (entropyBytes.length < 16) {
        throw new Error(INVALID_ENTROPY);
    }
    if (entropyBytes.length > 32) {
        throw new Error(INVALID_ENTROPY);
    }
    if (entropyBytes.length % 4 !== 0) {
        throw new Error(INVALID_ENTROPY);
    }
    const entropy = new Uint8Array(entropyBytes);
    const newChecksum = await deriveChecksumBits(entropy);
    if (newChecksum !== checksumBits) {
        throw new Error(INVALID_CHECKSUM);
    }
    return entropy;
}

export async function entropyToMnemonic(entropy: Uint8Array, wordlist: string[] = DEFAULT_WORDLIST) {
    if (!wordlist) {
        throw new Error(WORDLIST_REQUIRED);
    }
    // 128 <= ENT <= 256
    if (entropy.length < 16) {
        throw new TypeError(INVALID_ENTROPY);
    }
    if (entropy.length > 32) {
        throw new TypeError(INVALID_ENTROPY);
    }
    if (entropy.length % 4 !== 0) {
        throw new TypeError(INVALID_ENTROPY);
    }
    const entropyBits = bytesToBinary(entropy);
    const checksumBits = await deriveChecksumBits(entropy);
    const bits = entropyBits + checksumBits;
    const chunks = bits.match(/(.{1,11})/g) || [];
    const words = chunks.map((binary) => {
        const index = binaryToByte(binary);
        return wordlist[index];
    });
    return wordlist[0] === '\u3042\u3044\u3053\u304f\u3057\u3093' // Japanese wordlist
        ? words.join('\u3000')
        : words.join(' ');
}

export async function validateMnemonic(mnemonic: string, wordlist?: string[]) {
    try {
        await mnemonicToEntropy(mnemonic, wordlist);
    } catch (e) {
        return false;
    }
    return true;
}
