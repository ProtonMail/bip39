import FixedLengthArray from "./fixedLengthArray"; // We know that we are working with wordlist of fixed length (2048 words). 

// Let's define the possible languages. I would recommend using an international standard like ISO 639-2.
//type languages = "english" | "japanese" | "spanish" | "chinese-simplified" | "chinese-traditional" | "french" | "italian" | "korean" | "czech" | "portuguese";
type languages = "english";

// Then, we have to tell that the wordlist is an object with a language from languages as its key, containing an list (array) with 2048 words (strings).
export type wordlist {
  [language in languages]: FixedLengthArray<string, 2048>;
};

// Let's also make this type the default export.
export default wordlist;