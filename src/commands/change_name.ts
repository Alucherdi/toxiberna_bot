import { Command, CommandContext, createStringOption, createUserOption, Declare, Options } from "seyfert";
import db from './db.json';

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

@Options(options)
@Declare({
    name: "changename",
    description: "Cambiale el nombre a algún culero"
})
export default class ChangeName extends Command {
    async run(ctx: CommandContext<typeof options>) {
        const credits = db[ctx.author.id];
        const target = ctx.options.user;

        let response = await (await ctx.guild()).members.edit(
            target.id, { nick: ctx.options.nickname }, 'Por mis huevos'
        );

        console.log(response);

        if (!credits) {
            ctx.write({ content: 'No tienes créditos suficientes' });
        }
    }
}


