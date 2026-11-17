import {ticketsToJson} from "./export.js";
import {addTicket, changeStatus, STATUSES} from "./domain.js";

function throwTicketError(message) {
    if (typeof globalThis.alert === 'function') {
        globalThis.alert(message);
    }
    throw new Error(message);
}

let tickets = [];
let filter = 'all';
let nextId = 1;

const form = document.querySelector('#form');
const file = document.querySelector('#file');
const importButton = document.querySelector('#import');
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

async function importFrom(load){
    if(busy){
        busy=true;
        form.disabled=true;
        file.disabled=true;
        importButton.disabled=true;
        message.textContent = "Anulowano import";
        return;
    }

    try{
        const raw=ticketsToJson(await load());

        if(confirm("Importowac liste?")){
            tickets=raw;
            file.value="";
            render();
        }
        else{
            message.textContent = "Anulowano import";
        }
    }
    catch(error){
        message.textContent = `Import nieudany. ${error.message}`;
    }
    finally{
        busy=false;
        form.disabled=false;
        file.disabled=false;
        importButton.disabled=false;
        message.textContent="Import udany";
    }
}

importButton.addEventListener("click",()=>void importFrom(async()=>{
    const response=await fetch("./tickets.json");
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    return await response.json();
}));

render();
