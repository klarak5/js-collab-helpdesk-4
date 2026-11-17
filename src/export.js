import { validateTickets } from './validate.js';

export const EXPORT_MIME = 'application/json';
export const EXPORT_FILENAME = 'tickets.json';

// Eksport zawsze idzie przez walidator, więc do pliku trafia tylko poprawna lista.
export function ticketsToJson(tickets) {
    return JSON.stringify(validateTickets(tickets), null, 2);
}
