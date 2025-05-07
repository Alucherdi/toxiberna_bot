import { Command, CommandContext, createIntegerOption, createUserOption, Declare, Options } from "seyfert";
import { AuditType, Binnacle, DB } from "../utils/db";

const options = {
    user: createUserOption({
        description: 'Target',
        required: true
    }),
    payment: createIntegerOption({
        description: 'Payment',
        required: true
    }),
    mask: createUserOption({
        description: 'Hide as user (Makes it %300 more expensive)',
        required: false
    })
};

@Options(options)
@Declare({
    name: "timeout",
    description: "Aísla a algún culero por (N * 10 min)"
})
export default class Timeout extends Command {
    async run(ctx: CommandContext<typeof options>) {
        const opt = ctx.options;
        if (opt.payment <= 0) {
            ctx.write({ content: 'Eres pendejo o te haces' });
            return;
        }

        const user = DB.getUser(ctx.author.id);
        const target = opt.user;
        let from = opt.mask ? opt.mask!.id : ctx.author.id;

        if (!user.spend(opt.payment * (opt.mask ? 3 : 1))) {
            ctx.write({ content: 'No tienes créditos suficientes' });
            return;
        }

        const time = 600 * opt.payment;

        (await (await ctx.guild()).members.fetch(target.id))
            .timeout(time, `${ctx.author.name} te ha aislado`);

        Binnacle.report({
            type: AuditType.TIMEOUT,
            user: ctx.author.id,
            recipient: target.id,
            amount: time,
            timestamp: Date.now()
        });

        return ctx.client.messages.write(ctx.channelId, { content:` <@${from}> Aisló a <@${target.id}>` });
    }
}
