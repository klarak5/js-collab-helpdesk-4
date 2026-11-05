
import { validateTickets } from './validate.js';

const STORAGE_KEY = 'tickets';

export function loadTickets() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);

        if (savedData === null) {
            return [];
        }

        const rawTickets = JSON.parse(savedData);

        return validateTickets(rawTickets);

    } catch (error) {
        throw new Error(
            'Nie udało się wczytać zgłoszeń: ' + error.message
        );
    }
}

export function saveTickets(tickets) {
    try {
        const json = JSON.stringify(tickets);

        localStorage.setItem(STORAGE_KEY, json);

        return true;

    } catch (error) {
        throw new Error(
            'Nie udało się zapisać zgłoszeń: ' + error.message
        );
    }
}
