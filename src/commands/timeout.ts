import { Command, CommandContext, createIntegerOption, createUserOption, Declare, Options } from "seyfert";
import { AuditType, DB, report } from "../utils/db";

const options = {
    user: createUserOption({
        description: 'Target',
        required: true
    }),
    payment: createIntegerOption({
        description: 'Payment',
        required: true
    }),
};

@Options(options)
@Declare({
    name: "timeout",
    description: "Aísla a algún culero por (N * 10 min)"
})
export default class Timeout extends Command {
    async run(ctx: CommandContext<typeof options>) {
        const user = DB.getUser(+ctx.author.id);
        const opt = ctx.options;
        const target = opt.user;

        if (!user.spend(opt.payment)) {
            ctx.write({ content: 'No tienes créditos suficientes' });
            return;
        }

        const time = 600 * opt.payment;

        (await (await ctx.guild()).members.fetch(target.id))
            .timeout(time, `${ctx.author.name} te ha aislado`);

        report({
            type: AuditType.TIMEOUT,
            user: +ctx.author.id,
            recipient: target.id,
            amount: time,
            timestamp: Date.now()
        });

        ctx.write({ content: `Aislaste a <@${target.id}>` });
    }
}
