declare module "bun" {
    interface Env {
        BOT_TOKEN: string;
        DS_TOKEN: string;
        DB_PATH: string;
    }
}
