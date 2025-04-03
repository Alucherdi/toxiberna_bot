import { Command, CommandContext, createIntegerOption, createUserOption, Declare, Options } from "seyfert";
import { DB } from "../utils/db";

const options = {
    user: createUserOption({
        description: 'El usuario al que agregarás créditos',
        required: true
    }),

    credits: createIntegerOption({
        description: 'Los créditos que quieres agregar',
        required: true
    }),
};

@Options(options)
@Declare({
    name: "addcredits",
    description: "Deposita un vergazo a alguien"
})
export default class Credits extends Command {
    async run(ctx: CommandContext<typeof options>) {
        const user = DB.getUser(+ctx.options.user);

        let roles = (await ctx.member.roles.list()).map(v => v.name);
        if (!roles.includes('Admin')) {
            ctx.write({ content: 'A ver hijo de tu putísima madre tu no eres admin saquese a la verga' });
            return;
        }

        user.modify(ctx.options.credits);
        ctx.write({ content: `Créditos de <@${ctx.options.user.id}>: ${user.credits}` });
    }
}

