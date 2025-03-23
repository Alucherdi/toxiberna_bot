import { Command, CommandContext, Declare, GuildRole } from "seyfert";
import { load } from "../utils/db";

@Declare({
    name: "showcredits",
    description: "Mostrar tus créditos"
})
export default class Credits extends Command {
    async run(ctx: CommandContext) {
        const db = await load();
        const id = ctx.member?.id;
        let credits = 0;

        if (db[id]) {
            credits = db[id].credits;
        }

        ctx.write({ content: `${credits} credits` });
    }
}
