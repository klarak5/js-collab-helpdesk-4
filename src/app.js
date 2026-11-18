import { STATUSES, addTicket, changeStatus, removeTicket, nextTicketId } from './domain.js';
import { validateTickets } from './validate.js';
import { loadTickets, saveTickets } from './storage.js';
import { loadFromHttp, loadFromFile } from './loaders.js';
import { ticketsToJson } from './export.js';

let tickets = [];
let filter = 'all';
let busy = false;

const form = document.querySelector('#form');
const titleInput = document.querySelector('#title');
const fileInput = document.querySelector('#file');
const importButton = document.querySelector('#import');
const exportButton = document.querySelector('#export');
const filterSelect = document.querySelector('#filter');
const list = document.querySelector('#list');
const counter = document.querySelector('#counter');
const message = document.querySelector('#message');
const empty = document.querySelector('#empty');

function update(newTickets, text) {
    tickets = newTickets;
    message.textContent = text;
    try {
        saveTickets(tickets);
    } catch {
        message.textContent = text + ' Uwaga: nie udało się zapisać danych!';
    }
    render();
}

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
    select.disabled = busy;
    select.addEventListener('change', () => {
        try {
            update(changeStatus(tickets, ticket.id, select.value), 'Zmieniono status.');
        } catch (error) {
            message.textContent = error.message;
        }
    });

    const remove = document.createElement('button');
    remove.textContent = 'Usuń';
    remove.disabled = busy;
    remove.addEventListener('click', () => {
        update(removeTicket(tickets, ticket.id), 'Usunięto zgłoszenie.');
    });

    li.append(select, remove);
    return li;
}

function render() {
    const visible = tickets.filter((t) => filter === 'all' || t.status === filter);
    list.replaceChildren(...visible.map(createTicketRow));
    counter.textContent = visible.length + '/' + tickets.length;
    empty.hidden = visible.length > 0;
}

function setBusy(value) {
    busy = value;
    for (const element of form.elements) element.disabled = value;
    fileInput.disabled = value;
    importButton.disabled = value;
    render();
}

async function importFrom(load) {
    if (busy) return;
    setBusy(true);
    try {
        const imported = validateTickets(await load());
        if (confirm('Zastąpić listę zaimportowanymi danymi?')) {
            update(imported, 'Zaimportowano dane.');
        } else {
            message.textContent = 'Anulowano import.';
        }
    } catch (error) {
        message.textContent = 'Błąd importu: ' + error.message;
    } finally {
        fileInput.value = '';
        setBusy(false);
    }
}

form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    try {
        update(addTicket(tickets, {
            id: nextTicketId(tickets),
            title: String(data.get('title')),
            priority: String(data.get('priority'))
        }), 'Dodano zgłoszenie.');
        titleInput.value = '';
    } catch (error) {
        message.textContent = error.message;
    }
});

fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) importFrom(() => loadFromFile(fileInput.files[0]));
});

importButton.addEventListener('click', () => importFrom(() => loadFromHttp('tickets.json')));

exportButton.addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([ticketsToJson(tickets)], { type: 'application/json' }));
    link.download = 'tickets.json';
    link.click();
});

filterSelect.addEventListener('change', () => {
    filter = filterSelect.value;
    render();
});

try {
    tickets = loadTickets();
} catch (error) {
    message.textContent = 'Błąd odczytu zapisanych danych: ' + error.message;
}
render();
