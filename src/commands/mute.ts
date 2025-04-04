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
    name: "mute",
    description: "Silencia a alguien (N * 15 min)"
})
export default class Mute extends Command {
    async run(ctx: CommandContext<typeof options>) {
        const user = DB.getUser(ctx.author.id);

        const opt = ctx.options;
        const target = opt.user;

        if (!user.spend(opt.payment)) {
            ctx.write({ content: 'No tienes créditos suficientes' });
            return;
        }

        let member = await (await (await ctx.guild()).members.fetch(target.id)).voice();
        const time = 900_000 * opt.payment;
        await member.setMute(true);
        setTimeout(async () => {
            await member.setMute(false);
        }, time);

 
        report({
            type: AuditType.RENAME,
            user: ctx.author.id,
            recipient: target.id,
            amount: time,
            timestamp: Date.now()
        });

        ctx.write({ content: `Silenciaste a <@${target.id}>` });
    }
}

