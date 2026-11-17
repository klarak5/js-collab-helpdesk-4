import { MAX_TICKETS, normalizeTicket } from './domain.js';

export function validateTickets(raw) {
    if (!Array.isArray(raw)) {
        throw new Error('Dane muszą być tablicą zgłoszeń (JSON: [...]).');
    }
    if (raw.length > MAX_TICKETS) {
        throw new Error(`Za dużo zgłoszeń: ${raw.length} (limit ${MAX_TICKETS}).`);
    }

    const result = raw.map((record, index) => {
        try {
            return normalizeTicket(record);
        } catch (error) {
            throw new Error(`Rekord ${index + 1}: ${error.message}`);
        }
    });

    const ids = result.map((ticket) => ticket.id);
    if (new Set(ids).size !== ids.length) {
        const duplicate = ids.find((id, i) => ids.indexOf(id) !== i);
        throw new Error(`Zduplikowane ID zgłoszenia: "${duplicate}".`);
    }

    return result;
}
