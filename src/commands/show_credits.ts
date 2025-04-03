import { Command, CommandContext, Declare } from "seyfert";
import { DB } from "../utils/db";

@Declare({
    name: "showcredits",
    description: "Mostrar tus créditos"
})
export default class Credits extends Command {
    async run(ctx: CommandContext) {
        const user = DB.getUser(+ctx.author.id);
        ctx.write({ content: `${user.credits} credits` });
    }
}
