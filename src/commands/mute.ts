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
    name: "mute",
    description: "Silencia a alguien (N * 15 min)"
})
export default class Mute extends Command {
    async run(ctx: CommandContext<typeof options>) {
        const udb = await UserDB.load()

        const opt = ctx.options;
        const target = opt.user;

        if (!udb.spend(ctx.author.id, opt.payment)) {
            ctx.write({ content: 'No tienes créditos suficientes' });
            return;
        }

        let member = await (await (await ctx.guild()).members.fetch(target.id)).voice();
        const time = 900_000 * opt.payment;
        await member.setMute(true);
        setTimeout(async () => {
            await member.setMute(false);
        }, time);

        udb.register(ctx.author.id, target.id, AuditType.MUTE, time, Date.now());
        udb.write();
        ctx.write({ content: `Silenciaste a <@${target.id}>` });
    }
}

