
export async function loadFromHttp(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            'Błąd pobierania danych. Status: ' + response.status
        );
    }

    return await response.json();
}

export async function loadFromFile(file) {
    const text = await file.text();

    return JSON.parse(text);
}
