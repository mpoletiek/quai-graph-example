# Third-Party Notices

The source code in this repository is licensed under
[GPL-3.0](./LICENSE). The brand assets and fonts bundled under `public/`
are **not** covered by that license and are governed by their respective
owners' terms. They are included here for use within the Quai Network
developer ecosystem.

## Brand mark

- **File:** `public/brand/quai-mark.svg`
- **Source:** mirrored from <https://supply.qu.ai/brand/quai-mark.svg>
- **Owner:** Quai Network / Dominant Strategies
- **Use:** trademark; intended for use in projects within the Quai
  ecosystem. Third parties redistributing this repository should obtain
  written permission before continuing to display the Quai mark, or
  replace it with their own.

## Fonts (`public/fonts/`)

| Font | File | License | Notes |
| --- | --- | --- | --- |
| Bai Jamjuree | `BaiJamjuree-Regular.woff2` | [SIL Open Font License 1.1](https://openfontlicense.org/) | By Cadson Demak; also available via [Google Fonts](https://fonts.google.com/specimen/Bai+Jamjuree). Freely redistributable under OFL. |
| Monorama | `Monorama-Regular.woff2` | Commercial / proprietary | By [HEX](https://www.hex-type.com/typefaces/monorama). Bundled here because Quai uses it for in-ecosystem properties. Not freely redistributable — third-party forks should obtain a license or substitute a different monospace face (e.g. JetBrains Mono, IBM Plex Mono). |
| Yapari | `Yapari-SemiBold.woff2` | Commercial / proprietary | By [ExtraSet](https://extraset.ch/typefaces/yapari/). Bundled for the same reason as Monorama. Same redistribution caveat applies. |

### If you are forking this repository outside the Quai ecosystem

Before publishing, consider one of the following:

1. **Remove the proprietary fonts** and adjust `src/styles.css` to fall
   back to system / OFL alternatives. Suggested substitutions:
   - `Monorama` → `JetBrains Mono`, `IBM Plex Mono`, or system `ui-monospace`
   - `YapariSemBd` → `Space Grotesk` (SemiBold), `Inter` (700), or system sans
2. **Obtain licenses** for Monorama and Yapari from their respective foundries.

The `src/styles.css` font-family declarations already include sensible
fallback stacks, so removing the `@font-face` rules and the corresponding
files from `public/fonts/` will leave the app functional with system
fonts.
