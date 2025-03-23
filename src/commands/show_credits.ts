import { Command, CommandContext, Declare, GuildRole } from "seyfert";
import UserDB from "../utils/db";

@Declare({
    name: "showcredits",
    description: "Mostrar tus créditos"
})
export default class Credits extends Command {
    async run(ctx: CommandContext) {
        const udb = await UserDB.load()
        const id = ctx.member?.id;

        ctx.write({ content: `${udb.retrieve(id).credits} credits` });
    }
}
