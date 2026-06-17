// Backward-compatible export for code that previously imported EmailUser.
// The migration now stores every account in the single User collection.
export { default } from './User.js';
