export const STATUSES = ['new', 'doing', 'done'];
export const PRIORITIES = ['low', 'normal', 'high'];
export const MAX_TICKETS = 1000;
export const MAX_ID_LENGTH = 100;
export const MIN_TITLE_LENGTH = 3;
export const MAX_TITLE_LENGTH = 80;

const TICKET_STATUSES = new Set(STATUSES);
const TICKET_PRIORITIES = new Set(PRIORITIES);

export function isPlainObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function assertTickets(tickets) {
    if (!Array.isArray(tickets)) {
        throw new Error('Zgłoszenia muszą być tablicą.');
    }
}

export function assertId(id) {
    if (typeof id !== 'string' || id.trim().length === 0 || id.length > MAX_ID_LENGTH) {
        throw new Error(`ID zgłoszenia musi być niepustym tekstem o długości do ${MAX_ID_LENGTH} znaków.`);
    }
    // "1" i " 1" wyglądają tak samo w UI, ale Set uznałby je za różne ID.
    if (id !== id.trim()) {
        throw new Error('ID zgłoszenia nie może zaczynać się ani kończyć spacją.');
    }
}

// Zwraca przycięty tytuł albo rzuca Error.
export function normalizeTitle(title) {
    if (typeof title !== 'string') {
        throw new Error('Tytuł zgłoszenia musi być tekstem.');
    }
    const trimmed = title.trim();
    if (trimmed.length < MIN_TITLE_LENGTH || trimmed.length > MAX_TITLE_LENGTH) {
        throw new Error(`Tytuł zgłoszenia musi mieć od ${MIN_TITLE_LENGTH} do ${MAX_TITLE_LENGTH} znaków.`);
    }
    return trimmed;
}

export function assertStatus(status) {
    if (!TICKET_STATUSES.has(status)) {
        throw new Error(`Status zgłoszenia musi mieć wartość: ${STATUSES.join(', ')}.`);
    }
}

export function assertPriority(priority) {
    if (!TICKET_PRIORITIES.has(priority)) {
        throw new Error(`Priorytet zgłoszenia musi mieć wartość: ${PRIORITIES.join(', ')}.`);
    }
}

// Sprawdza jeden rekord i zwraca NOWY obiekt z dokładnie czterema polami.
// Nadmiarowe pola z wejścia są pomijane.
export function normalizeTicket(raw) {
    if (!isPlainObject(raw)) {
        throw new Error('Zgłoszenie musi być obiektem.');
    }
    const { id, title, status, priority } = raw;
    assertId(id);
    const cleanTitle = normalizeTitle(title);
    assertStatus(status);
    assertPriority(priority);
    return { id, title: cleanTitle, status, priority };
}

export function addTicket(tickets, ticket) {
    assertTickets(tickets);
    if (tickets.length >= MAX_TICKETS) {
        throw new Error(`Można dodać maksymalnie ${MAX_TICKETS} zgłoszeń.`);
    }
    if (!isPlainObject(ticket)) {
        throw new Error('Zgłoszenie musi być obiektem.');
    }
    // Nowe zgłoszenie zawsze startuje ze statusem "new".
    const created = normalizeTicket({ ...ticket, status: 'new' });
    if (tickets.some((existing) => existing.id === created.id)) {
        throw new Error('ID zgłoszenia musi być unikatowe.');
    }
    return [...tickets, created];
}

export function changeStatus(tickets, id, status) {
    assertTickets(tickets);
    assertId(id);
    assertStatus(status);
    if (!tickets.some((ticket) => ticket.id === id)) {
        throw new Error('Nie znaleziono zgłoszenia.');
    }
    return tickets.map((ticket) => (ticket.id === id ? { ...ticket, status } : ticket));
}

export function removeTicket(tickets, id) {
    assertTickets(tickets);
    assertId(id);
    if (!tickets.some((ticket) => ticket.id === id)) {
        throw new Error('Nie znaleziono zgłoszenia.');
    }
    return tickets.filter((ticket) => ticket.id !== id);
}

// Następne wolne ID liczbowe (jako tekst) — przydatne po imporcie lub odczycie
// ze storage, gdy licznik nextId w app.js trzeba ustawić od nowa.
export function nextTicketId(tickets) {
    assertTickets(tickets);
    const numericIds = tickets
        .map((ticket) => Number(ticket.id))
        .filter((n) => Number.isSafeInteger(n) && n > 0);
    return String(numericIds.length ? Math.max(...numericIds) + 1 : 1);
}
