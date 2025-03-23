import { Command, CommandContext, createUserOption, Declare, Options } from "seyfert";
import UserDB from "../utils/db";

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
        const udb = await UserDB.load()
        const target = ctx.options.user;

        if (!(await udb.spend(ctx.author.id, cost))) {
            ctx.write({ content: 'No tienes créditos suficientes' });
            return;
        }

        (await (await ctx.guild()).members.fetch(target.id)).timeout(3600, `${ctx.author.name} te ha aislado`);

        await udb.write()
        ctx.write({ content: `Aislaste a <@${target.id}>, tu nuevo saldo es de: ${(await udb.retrieve(ctx.author.id))!.credits}` });
    }
}
