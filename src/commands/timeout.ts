import { Command, CommandContext, createIntegerOption, createUserOption, Declare, Options } from "seyfert";
import UserDB, { AuditType } from "../utils/db";

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
        const udb = await UserDB.load()
        const opt = ctx.options;
        const target = opt.user;

        if (!udb.spend(ctx.author.id, opt.payment)) {
            ctx.write({ content: 'No tienes créditos suficientes' });
            return;
        }

        const time = 600 * opt.payment;

        (await (await ctx.guild()).members.fetch(target.id))
            .timeout(time, `${ctx.author.name} te ha aislado`);

        udb.register(ctx.author.id, target.id, AuditType.TIMEOUT, time, Date.now());
        udb.write();
        ctx.write({ content: `Aislaste a <@${target.id}>` });
    }
}
