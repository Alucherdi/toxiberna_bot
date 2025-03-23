import { Command, CommandContext, createStringOption, createUserOption, Declare, Options } from "seyfert";
import UserDB from "../utils/db";

const options = {
    user: createUserOption({
        description: 'Target',
        required: true
    }),

    nickname: createStringOption({
        description: 'Nuevo nombre',
        required: true
    }),
};

const cost = 1;

@Options(options)
@Declare({
    name: "changename",
    description: "Cambiale el nombre a algún culero"
})
export default class ChangeName extends Command {
    async run(ctx: CommandContext<typeof options>) {
        const udb = await UserDB.load()
        const target = ctx.options.user;

        if (!(await udb.spend(ctx.author.id, cost))) {
            ctx.write({ content: 'No tienes créditos suficientes' });
            return;
        }

        await (await ctx.guild()).members.edit(
            target.id, { nick: ctx.options.nickname }, 'Por mis huevos'
        );

        await udb.write();
        ctx.write({ content: `Le cambiaste el nombre a <@${target.id}>, tu nuevo saldo es de: ${(await udb.retrieve(ctx.author.id))!.credits}` });
    }
}


