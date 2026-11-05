const STATUSES = ['new', 'doing', 'done'];
const PRIORITIES = ['low', 'normal', 'high'];
const TICKET_STATUSES = new Set(STATUSES);
const TICKET_PRIORITIES = new Set(PRIORITIES);
const MAX_TICKETS = 1000;

function throwTicketError(message) {
    if (typeof globalThis.alert === 'function') {
        globalThis.alert(message);
    }
    throw new Error(message);
}

function assertTickets(tickets) {
    if (!Array.isArray(tickets)) {
        throwTicketError('Zgłoszenia muszą być tablicą.');
    }
}

function addTicket(tickets, ticket) {
    assertTickets(tickets);

    if (tickets.length >= MAX_TICKETS) {
        throwTicketError('Można dodać maksymalnie 1000 zgłoszeń.');
    }
    if (!ticket || typeof ticket !== 'object' || Array.isArray(ticket)) {
        throwTicketError('Zgłoszenie musi być obiektem.');
    }

    const { id, title, priority } = ticket;
    if (typeof id !== 'string' || id.trim().length === 0 || id.length > 100) {
        throwTicketError('ID zgłoszenia musi być niepustym tekstem o długości do 100 znaków.');
    }
    if (tickets.some((existingTicket) => existingTicket.id === id)) {
        throwTicketError('ID zgłoszenia musi być unikatowe.');
    }
    if (typeof title !== 'string') {
        throwTicketError('Tytuł zgłoszenia musi być tekstem.');
    }

    const trimmedTitle = title.trim();
    if (trimmedTitle.length < 3 || trimmedTitle.length > 80) {
        throwTicketError('Tytuł zgłoszenia musi mieć od 3 do 80 znaków.');
    }
    if (!TICKET_PRIORITIES.has(priority)) {
        throwTicketError('Priorytet zgłoszenia musi mieć wartość: niski, normalny lub wysoki.');
    }

    return [...tickets, {
        id,
        title: trimmedTitle,
        status: 'new',
        priority
    }];
}

function changeStatus(tickets, id, status) {
    assertTickets(tickets);

    if (typeof id !== 'string' || id.trim().length === 0 || id.length > 100) {
        throwTicketError('ID zgłoszenia musi być niepustym tekstem o długości do 100 znaków.');
    }
    if (!TICKET_STATUSES.has(status)) {
        throwTicketError('Status zgłoszenia musi mieć wartość: nowe, w trakcie lub zakończone.');
    }

    const ticketIndex = tickets.findIndex((ticket) => ticket.id === id);
    if (ticketIndex === -1) {
        throwTicketError('Nie znaleziono zgłoszenia.');
    }

    return tickets.map((ticket) => (
        ticket.id === id ? { ...ticket, status } : ticket
    ));
}

let tickets = [];
let filter = 'all';
let nextId = 1;

const form = document.querySelector('#form');
const titleInput = document.querySelector('#title');
const filterSelect = document.querySelector('#filter');
const list = document.querySelector('#list');
const counter = document.querySelector('#counter');
const message = document.querySelector('#message');
const empty = document.querySelector('#empty');

function createTicketRow(ticket) {
    const li = document.createElement('li');
    li.textContent = ticket.title + ' (' + ticket.priority + ') ';

    const select = document.createElement('select');
    for (const status of STATUSES) {
        const option = document.createElement('option');
        option.value = status;
        option.textContent = status;
        select.append(option);
    }
    select.value = ticket.status;
    select.setAttribute('aria-label', 'Status zgłoszenia ' + ticket.title);
    select.addEventListener('change', () => {
        try {
            tickets = changeStatus(tickets, ticket.id, select.value);
            message.textContent = 'Zmieniono status na ' + select.value + '.';
        } catch (error) {
            message.textContent = error.message;
        }
        render();
        filterSelect.focus();
    });

    li.append(select);
    return li;
}

function render() {
    const visible = tickets.filter((t) => filter === 'all' || t.status === filter);
    list.replaceChildren(...visible.map(createTicketRow));
    counter.textContent = visible.length + '/' + tickets.length;
    empty.hidden = visible.length > 0;
}

form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    try {
        tickets = addTicket(tickets, {
            id: String(nextId),
            title: String(data.get('title')),
            priority: String(data.get('priority'))
        });
        nextId++;
        titleInput.value = '';
        message.textContent = 'Dodano zgłoszenie.';
        render();
    } catch (error) {
        message.textContent = error.message;
    }
    titleInput.focus();
});

filterSelect.addEventListener('change', () => {
    filter = filterSelect.value;
    render();
});

render();
