/**
 * Flip a value to disable a feature without deleting code.
 *
 * scatterText — intro hover letter burst.
 *   Off: set to false.
 *   Remove later:
 *     1. Delete client/src/components/ScatterText.jsx
 *     2. Delete client/src/scatterText.mjs
 *     3. Delete client/src/scatterText.test.mjs
 *     4. In IntroPanel.jsx, drop the ScatterText import and unwrap IntroBlurb
 *        back to a plain div.
 *     5. Remove this flag.
 */
export const FEATURES = {
  scatterText: true,
};
