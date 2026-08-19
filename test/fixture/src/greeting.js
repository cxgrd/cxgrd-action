import { greetingPrefix } from './config.js';

export function formatGreeting(name) {
  return `${greetingPrefix}, ${name}!`;
}
