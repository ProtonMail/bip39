# BIP39

JavaScript implementation of [Bitcoin BIP39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki).

## Installation

Add the following to dependencies in `package.json`

```json
"bip39": "github:ProtonMail/bip39#semver:PACKAGE_VERSION",
```

## Example Usage

```ts
import { entropyToMnemonic, mnemonicToEntropy, validateMnemonic } from 'bip39';

const entropy = new Uint8Array(16); // Use a CSPRNG to generate the random bytes
// => Uint8Array(16) [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, … ]

const mnemonic = await entropyToMnemonic(entropy);
// => abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about

const recoveredEntropy = await mnemonicToEntropy(mnemonic);
// => Uint8Array(16) [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, … ]

const isValid = await validateMnemonic(mnemonic);
// => true
```

## API

### `entropyToMnemonic`

Takes `Uint8Array` entropy and outputs a mnemonic based on the wordlist.

### `mnemonicToEntropy`

Takes a mnemonic and outputs the `Uint8Array` entropy.

### `validateMnemonic`

Validates a given mnemonic. Returns `true` if valid and `false` if invalid.

### wordlist

Each function can take a wordlist - a string array of length 2048. If a wordlist is not specified, it will default to [English](https://github.com/ProtonMail/bip39/blob/main/src/wordlists/english.json).
