# Global text breathing room + WCAG AAA design

## Context
The episode page text feels dense. The goal is to improve readability and meet WCAG AAA contrast targets for long-form reading across the site.

## Goals
- Increase line-height and paragraph spacing for long-form text.
- Constrain line length for better readability.
- Raise muted text color to a higher-contrast tone while preserving hierarchy.
- Apply changes globally in the most visible reading areas (episode page + prose content).

## Non-goals
- Redesigning layout structure or typography scale across all UI elements.
- Introducing new components or global CSS files.
- Adjusting brand colors outside text-related tokens.

## Proposed changes
1) **Muted text color**
- Update `--color-text-muted` to a lighter tone (e.g. `#c5d2e6`) to achieve AAA contrast against existing dark surfaces.

2) **Prose readability**
- Increase base line-height for `.prose`.
- Increase paragraph and list item spacing.
- Add a `max-width` for `prose` blocks to keep line length in the 68–72ch range.

3) **Episode page readability**
- Increase line-height and font-size for `.episode__description` and `.episode__knowledge-text`.
- Add a `max-width` to these blocks for consistent line length.

## Accessibility considerations
- Higher contrast for muted text improves readability for low-vision users.
- Increased line-height and whitespace reduce visual crowding.

## Testing
- Manual visual verification in the episode page and show notes.
- No automated tests requested.

