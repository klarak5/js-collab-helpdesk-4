# Podział ról w zespole (3 osoby)

Podział opiera się na `03_PROWADZENIE.md` (wariant dla trójki: A reguły, B interfejs, C próby i adaptery). Dopisane są do niego pliki, wspólne interfejsy i kolejność pracy.

## Kto jaką rolę bierze

- **Osiołek → B (interfejs i integracja).** Zna kod z C03, opiekuje się repo i scala branche, więc najlepiej, żeby trzymał `app.js` i DOM.
- **Osoba, która zostaje z C03 → A (reguły).** Zna kontrakt danych zespołu, więc pisze walidator.
- **Nowa osoba → C (próby i adaptery).** Fixture'y testowe zmuszają ją do poznania kontraktu danych, czyli jest to najszybszy sposób wdrożenia się w kod.

## Osoba A: reguły, czyli domena i walidacja

**Pliki:** `domain.js`, `validate.js`

- Wydziela reguły z C03 do `domain.js` jako eksporty ESM (krok 2).
- `validateTickets(raw)` zwraca **nową** kolekcję z czterema polami albo rzuca `Error` (krok 3):
  - sprawdza `Array.isArray`, czy każdy rekord to obiekt różny od `null`, wymagane pola i dozwolone wartości (np. status);
  - unikalność ID sprawdza przez `new Set(ids).size === ids.length`;
  - sprawdza limit;
  - działa na zasadzie *all or nothing*: błędny ostatni rekord odrzuca cały import.
- Pilnuje, żeby zmiana stanu (dodanie, zmiana statusu, usunięcie) szła wyłącznie przez funkcje domeny.

## Osoba B: interfejs, czyli `app.js`, DOM i integracja

**Pliki:** `index.html`, `app.js`, `style.css`

- Zostawia jeden `<script type="module">` i importuje moduły w `app.js` (krok 2).
- Pisze wspólną funkcję `importFrom(load)` (sekcja „Naprawa i porządkowanie”):
  1. `busy = true` ustawia **przed** pierwszym `await`;
  2. przy włączonym `busy` blokuje formularz, statusy, usuwanie i przyciski importu;
  3. `const raw = await load()`, potem `validateTickets(raw)`, potem `confirm(...)`;
  4. dopiero po zgodzie podmienia `tickets`, zapisuje do storage i renderuje;
  5. w `catch` pokazuje komunikat i zostawia poprzednią listę;
  6. w `finally` ustawia `busy = false` i odblokowuje UI.
- Dodaje kontrolkę `<input type="file">` i przycisk „Importuj z serwera”.
- Pokazuje ostrzeżenie, gdy zapis do storage się nie uda.
- Robi code review i merge branchy po każdym etapie.

## Osoba C: próby i adaptery danych

**Pliki:** `storage.js`, `loaders.js`, `tickets.json`, folder `fixtures/`

- `storage.js` (krok 4):
  - `loadTickets()`: brak klucza (`getItem` zwraca `null`) daje `[]`; istniejący tekst przechodzi `parse` i `validateTickets`; błąd jest pokazywany, ale zapis nie jest kasowany;
  - `saveTickets(list)`: `stringify` i `setItem` w `try`, przy błędzie zwraca lub rzuca informację dla B.
- `loaders.js`, czyli adaptery dla `importFrom` (kroki 5 i 6):
  - `loadFromHttp(url)`: `fetch`, sprawdzenie `response.ok` (404 nie odrzuca obietnicy samo z siebie), potem `response.json()`;
  - `loadFromFile(file)`: `await file.text()`, potem `JSON.parse`;
  - opcjonalnie CSV, a w wersji hardcore XML.
- Fixture'y odpowiadające liście „Do sprawdzenia”: `empty.json` (`[]`), `duplicate.json`, `bad-last.json`, `broken.json`, `page.html` (HTML zamiast JSON). Do tego 404 (nieistniejący URL), zły JSON w storage (ręcznie w DevTools) i wolna sieć (throttling w DevTools).
- Prowadzi checklistę końcowej próby zespołu i sprawdza ją przed i po każdej refaktoryzacji.

## Najpierw ustalcie interfejsy (dzień 1, wszyscy razem)

```js
// validate.js (A)
export function validateTickets(raw) { /* → Ticket[] albo throw Error */ }

// loaders.js (C), każdy zwraca Promise<unknown> (surowe dane przed walidacją)
export async function loadFromHttp(url) {}
export async function loadFromFile(file) {}

// storage.js (C)
export function loadTickets() {}       // → Ticket[] albo throw
export function saveTickets(tickets) {} // → true / throw przy odmowie zapisu

// app.js (B)
async function importFrom(load) {}      // wspólne zatwierdzanie, blokada i obsługa błędów
```

## Kolejność pracy i branche

| Etap | A | B | C |
|---|---|---|---|
| 1. HTTP i moduły | eksport `domain.js` | `type="module"`, importy, Live Server | `tickets.json` i fixture'y |
| 2. Walidator i storage | `validateTickets` | podpięcie zapisu po każdej zmianie | `storage.js` |
| 3. Import | review adapterów | `importFrom`, blokada, `finally` | `loadFromFile`, `loadFromHttp` |
| 4. Próba końcowa | naprawy reguł | naprawy UI | checklista przed i po |
| Nice to have | eksport CSV/XML | lepszy CSS | eksport JSON |

- Każdy pracuje na małym branchu (np. `feat/validator`, `feat/storage`, `feat/import-ui`), a B scala go po review drugiej osoby. Nie czekajcie z merge'owaniem do końca collabu.
- Zgodnie z sugestią z prowadzenia, po pierwszym działającym przyroście (np. po etapie 2) możecie się zamienić rolami, żeby każdy dotknął każdej warstwy.
