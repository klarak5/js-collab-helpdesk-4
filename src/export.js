import { validateTickets } from './validate.js';

export const EXPORT_MIME = 'application/json';
export const EXPORT_FILENAME = 'tickets.json';

export function ticketsToJson(tickets) {
    return JSON.stringify(validateTickets(tickets), null, 2);
}
