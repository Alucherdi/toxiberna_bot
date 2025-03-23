import { Command, CommandContext, createUserOption, Declare, Options } from "seyfert";
import { load, write } from "../utils/db";

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

        let member = await (await (await ctx.guild()).members.fetch(target.id)).voice();
        await member.setMute(true);
        setTimeout(async () => {
            await member.setMute(false);
        }, 1_800_000);

        await write(db);
        ctx.write({ content: `Silenciaste a <@${target.id}>, tu nuevo saldo es de: ${db[ctx.author.id].credits}.` });
    }
}

