import { Command, CommandContext, createStringOption, createUserOption, Declare, Options } from "seyfert";
import { load, write } from "../utils/db";

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
        await (await ctx.guild()).members.edit(
            target.id, { nick: ctx.options.nickname }, 'Por mis huevos'
        );

        await write(db);
        ctx.write({ content: `Le cambiaste el nombre a <@${target.id}>, tu nuevo saldo es de: ${db[ctx.author.id].credits}.` });
    }
}


