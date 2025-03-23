export async function load() {
    const file = Bun.file(Bun.env.DB_PATH);
    return await file.json();
}

export async function write(data: any) {
    Bun.write(Bun.env.DB_PATH, JSON.stringify(data));
}
