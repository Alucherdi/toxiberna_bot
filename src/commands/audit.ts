import { Command, CommandContext, createUserOption, Declare, Options } from "seyfert";
import UserDB from "../utils/db";

const options = {
    user: createUserOption({
        description: 'El usuario al que vas a auditar',
        required: true
    }),
};

@Options(options)
@Declare({
    name: "audit",
    description: "Audita a un usuario corrupto alv"
})
export default class Credits extends Command {
    async run(ctx: CommandContext<typeof options>) {
        const udb = await UserDB.load()
        let roles = (await ctx.member.roles.list()).map(v => v.name);
        if (!roles.includes('Admin')) {
            ctx.write({ content: 'A ver hijo de tu putísima madre tu no eres admin saquese a la verga' });
            return;
        }

        let target = ctx.options.user.id;
        let formatted = (await udb.audit())
            .filter(v => v.from == target)
        
        if (formatted.length == 0) {
            ctx.write({ content: `No hay datos para mostrar` });
            return;
        }

        let output = `History from <@${target}>:\n`;
        for (let i = 0; i < formatted.length; i++) {
            const { type, to, amount, timestamp } = formatted[i];
            let date = new Date(timestamp).toLocaleString();
            if(to) {
                output += `\n${i + 1}. ${type} ${amount} to <@${to}> at ${date}`;
            } else {
                output += `\n${i + 1}. ${type} ${amount} at ${date}`;
            }
        }

        ctx.write({ content: output });
    }
}

