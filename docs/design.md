# Design

## Design Principles

EZ-MEAL should feel calm, clean and practical. The UI is mobile-first, readable and focused on repeated daily use.

Prefer:

- simple surfaces;
- clear hierarchy;
- restrained color;
- consistent action icons;
- compact but comfortable spacing.

Avoid:

- gaming-like visuals;
- decorative clutter;
- low-contrast chips;
- buttons that look interactive when they are labels;
- oversized marketing-style sections.

## Layout

- Mobile is the primary layout.
- Use full-width primary actions on narrow screens when they start a main flow.
- Keep bottom navigation readable and visually separated from content.
- Avoid placing important inputs behind the keyboard.
- Hide bottom navigation while the keyboard is open when it improves usable space.
- Lists should scroll reliably and keep newly added items easy to find.

## Palette

Core brand direction:

- dark base: `#121412`;
- fresh green accent: `#6CCF9D`;
- white/near-white for high-contrast content;
- neutral grays for inactive chips, borders and secondary text.

Semantic colors:

- success: green family;
- warning/swap: yellow family;
- destructive/delete: red family;
- info/neutral: gray or muted accent family.

Meal tags should use distinct colors for breakfast, lunch and dinner while staying coherent with the palette. Selected tags must be visibly different from unselected tags.

## Typography

- Use the platform/system font unless a deliberate brand font is introduced.
- Keep headings compact inside cards and panels.
- Avoid viewport-scaled type.
- Letter spacing should remain neutral.
- Text must not wrap awkwardly inside chips or action buttons.

## Components

Buttons:

- Use icon buttons for repeated actions such as add, edit, delete, swap and save.
- Destructive buttons use the trash icon and red styling.
- Add buttons use a plus icon and green styling.
- Swap buttons use a swap-style icon and warning styling.
- Save buttons use a clear save icon and green styling.

Chips:

- Meal chips have fixed/minimum width so labels remain stable.
- Selected state carries color; unselected state remains readable with neutral styling.

Cards:

- Use cards for repeated items such as ingredients, recipes and plan days.
- Avoid nested card structures.
- Plan day cards should visually separate weekday title from meal content.

Forms:

- Reveal create fields only when the user chooses to add an item.
- Multi-select ingredient selection should be dropdown-based, filterable and scrollable.
- Dropdowns should show at most six visible items before scrolling.

Settings:

- Section titles should use consistent chip/title treatment.
- Import/export should start from two clear actions: import CSV and export CSV.

## Icons and Images

- Prefer established icon libraries already used by the app.
- Keep icon sizes consistent and not oversized.
- App logo should remain minimal and readable as favicon/app icon.
- Avoid AI clichés such as robots, brains, chips or circuits.

## UX Guidelines

- Confirm destructive actions such as reset/delete where data loss is possible.
- Show progress for import/export.
- For import, show validation steps with pending/success/error states only after the user selects a file.
- Empty states should tell the user what action is available next.
- Errors should be short, specific and localized.

## Accessibility

- Maintain sufficient contrast in light and dark modes.
- Touch targets should be comfortable on mobile.
- Focus states must be visible on web.
- Form controls need clear labels.
- Icon-only actions need accessible labels.
- Content must remain usable with keyboard open.

## Motion

Use motion sparingly:

- short transitions for field reveal/hide;
- loading indicators for import/export and long operations;
- no decorative or distracting animation.

## Consistency

Do:

- reuse shared action buttons;
- keep meal tag sizes consistent;
- align related actions together;
- use the same edit/delete/save semantics across screens.

Do not:

- introduce one-off button styles;
- use text buttons where an established icon action exists;
- add colors without updating this document;
- make labels look like tappable controls.

## UI Implementation Rules

New colors, fonts, component states or icon patterns should be reflected here. Shared components should be preferred over screen-local duplicates.
