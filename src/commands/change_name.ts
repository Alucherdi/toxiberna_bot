import { Command, CommandContext, createStringOption, createUserOption, Declare, Options } from "seyfert";
import { AuditType, DB, report } from "../utils/db";

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
        const user = DB.getUser(ctx.author.id);
        const target = ctx.options.user;

        if (!user.spend(cost)) {
            ctx.write({ content: 'No tienes créditos suficientes' });
            return;
        }

        await (await ctx.guild()).members.edit(
            target.id, { nick: ctx.options.nickname }, 'Por mis huevos'
        );

        report({
            type: AuditType.RENAME,
            user: ctx.author.id,
            recipient: target.id,
            amount: cost,
            timestamp: Date.now()
        });

        ctx.write({ content: `Le cambiaste el nombre a <@${target.id}>, tu nuevo saldo es de: ${user.credits}` });
    }
}


