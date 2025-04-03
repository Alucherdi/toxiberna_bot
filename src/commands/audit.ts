import { Command, CommandContext, createUserOption, Declare, Options } from "seyfert";
import { DB } from "../utils/db";

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
        const audit = DB.getBinnacle();

        let roles = (await ctx.member.roles.list()).map(v => v.name);
        if (!roles.includes('Admin')) {
            ctx.write({ content: 'A ver hijo de tu putísima madre tu no eres admin saquese a la verga' });
            return;
        }

        let target = ctx.options.user.id;
        let formatted = audit
            .filter(v => v.user == +target)

        if (formatted.length == 0) {
            ctx.write({ content: `No hay datos para mostrar` });
            return;
        }

        let output = `History from @<${target}>:\n`;
        for (let i = 0; i < formatted.length; i++) {
            const { type, recipient, amount, timestamp } = formatted[i];
            let date = new Date(timestamp).toLocaleString();
            if(recipient) {
                output += `\n${i + 1}. ${type} ${amount} to <@${recipient}> at ${date}`;
            } else {
                output += `\n${i + 1}. ${type} ${amount} at ${date}`;
            }
        }

        ctx.write({ content: output });
    }
}

