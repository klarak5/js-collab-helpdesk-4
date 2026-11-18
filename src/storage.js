import { validateTickets } from './validate.js';

const KEY = 'tickets';

export function loadTickets() {
    const text = localStorage.getItem(KEY);
    if (text === null) return [];
    return validateTickets(JSON.parse(text));
}

export function saveTickets(tickets) {
    localStorage.setItem(KEY, JSON.stringify(tickets));
    return true;
}
