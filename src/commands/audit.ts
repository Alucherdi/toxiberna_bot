import { Command, CommandContext, createUserOption, Declare, Options } from "seyfert";
import { Binnacle, DB } from "../utils/db";

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
        let roles = (await ctx.member.roles.list()).map(v => v.name);
        if (!roles.includes('Admin')) {
            ctx.write({ content: 'A ver hijo de tu putísima madre tu no eres admin saquese a la verga' });
            return;
        }
        const target = ctx.options.user.id;

        const history = Binnacle.getHistory(target);

        if (history.length == 0) {
            ctx.write({ content: `No hay datos para mostrar` });
            return;
        }

        const output = `<@${target}> history:\n` + 
            history.map(({ type, recipient, user, amount, timestamp }) =>
                `${type} ${amount} <@${user}> ${recipient ? `<@${recipient}>` : ''} at ${new Date(timestamp).toLocaleString()}`).join('\n');

        ctx.write({ content: output });
    }
}

