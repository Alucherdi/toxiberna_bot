import { Command, CommandContext, createUserOption, Declare, Options } from "seyfert";
import { load, write } from "../utils/db";

const options = {
    user: createUserOption({
        description: 'Target',
        required: true
    })
};

const cost = 6;

@Options(options)
@Declare({
    name: "timeout",
    description: "Aísla a algún culero por 1 hora"
})
export default class Timeout extends Command {
    async run(ctx: CommandContext<typeof options>) {
        const db = await load();
        const dbUser = db[ctx.author.id];
        let credits = 0; 

        if (dbUser) {
            credits = dbUser.credits;
        }

        const target = ctx.options.user;

        if (credits < cost) {
            ctx.write({ content: 'No tienes créditos suficientes' });
            return;
        }

        dbUser.credits -= cost;

        (await (await ctx.guild()).members.fetch(target.id)).timeout(3600, `${ctx.author.name} te ha aislado`);

        await write(db);
        ctx.write({ content: `Aislaste a <@${target.id}>, tu nuevo saldo es de: ${db[ctx.author.id].credits}.` });
    }
}
