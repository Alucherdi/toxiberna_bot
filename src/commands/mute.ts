import { Command, CommandContext, createUserOption, Declare, Options } from "seyfert";
import UserDB from "../utils/db";

const options = {
    user: createUserOption({
        description: 'Target',
        required: true
    })
};

const cost = 2;

@Options(options)
@Declare({
    name: "mute",
    description: "Silencia a alguien en la llamada"
})
export default class Mute extends Command {
    async run(ctx: CommandContext<typeof options>) {
        const udb = await UserDB.load()

        const target = ctx.options.user;

        if (!(await udb.spend(ctx.author.id, cost))) {
            ctx.write({ content: 'No tienes créditos suficientes' });
            return;
        }

        let member = await (await (await ctx.guild()).members.fetch(target.id)).voice();
        await member.setMute(true);
        setTimeout(async () => {
            await member.setMute(false);
        }, 1_800_000);

        await udb.write();
        ctx.write({ content: `Silenciaste a <@${target.id}>, tu nuevo saldo es de: ${(await udb.retrieve(ctx.author.id))!.credits}` });
    }
}

