# discord-filter

## Overview

`discord-filter` is a lightweight yet powerful message filtering library designed for Discord.js bots. It provides an easy way to moderate unwanted content such as profanity and advertisements.

**What it does:**

-  Detects profanity and advertisement links.
-  Uses a smart matching algorithm to catch bypassed words (e.g., "b.a.d").
-  Offers efficient, offline filtering without external API dependencies.

**What it does NOT do:**

-  It does not automatically ban/kick users (it returns a check result to the developer).
-  It is not an AI-based toxicity detector.

## Target Audience

-  **Discord Bot Developers:** Developers looking for a reliable, local filtering solution.
-  **Bot Owners:** Users who want to protect their servers from spam and abuse with minimal configuration.

## Key Features

-  **Class-Based Architecture:** Modern, object-oriented design for easy integration.
-  **Smart Matching:** Ignores repeated characters (e.g., "heeeey") to reduce false positives while catching evasive spellings.
-  **Built-in Blocklists:** Comes with default profanity (TR/EN) and advertisement lists ready to use.
-  **Customizable:** Add your own words or disable default lists entirely.
-  **Type Safety:** Includes TypeScript definitions.

## How It Works

1. **Initialization:** You create an instance of the `Filter` class, optionally configuring custom words or disabling defaults.
2. **Checking:** When a message is received (e.g., in `messageCreate` event), you pass the content to the `filter.check()` method.
3. **Result:** The method returns an object indicating if a match was found (`match: true`), the type of match (profanity/ad), and the specific word detected.

## Installation

```bash
npm install discord-filter
```

**Prerequisites:** Node.js 14+ is recommended.

## Usage

```javascript
const { Filter } = require('discord-filter');

// Initialize with default settings
const filter = new Filter();

// Or customize
/* 
const filter = new Filter({
    useDefaults: true,
    words: ['custombadword'],
    ads: ['myserver.gg']
});
*/

// Simulate a message check
const messageContent = 'Hello world';
const result = filter.check(messageContent);

if (result.match) {
   console.log(`Blocked: ${result.word} (${result.type})`);
   // message.delete();
}
```

## Configuration

| Option        | Type       | Default | Description                                                               |
| :------------ | :--------- | :------ | :------------------------------------------------------------------------ |
| `words`       | `string[]` | `[]`    | Custom list of words to block.                                            |
| `ads`         | `string[]` | `[]`    | Custom list of advertisement domains/keywords.                            |
| `cleanCheck`  | `boolean`  | `true`  | Whether to normalize and clean text (remove repetitions) before checking. |
| `useDefaults` | `boolean`  | `true`  | Whether to load built-in Turkish and English blocklists.                  |

## Known Limitations

-  **Aggressive Cleaning:** While creating the `cleanCheck` feature, care was taken to avoid false positives (e.g. "book"), but very specific edge cases might still exist.
-  **No Async:** The check is synchronous, which is generally faster for local arrays but might block the event loop on extremely huge custom lists (millions of words).

## Contribution

Contributions are welcome! Please open an issue or submit a pull request on GitHub for improvements or bug fixes.

## License

ISC
