import { Command, CommandContext, createIntegerOption, createUserOption, Declare, Options } from "seyfert";
import UserDB from "../utils/db";

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
        const udb = await UserDB.load()
        let roles = (await ctx.member.roles.list()).map(v => v.name);
        if (!roles.includes('Admin')) {
            ctx.write({ content: 'A ver hijo de tu putísima madre tu no eres admin saquese a la verga' });
            return;
        }

        let target = ctx.options.user.id;
        udb.modify(target, ctx.options.credits);

        await udb.write();
        ctx.write({ content: `Créditos de <@${ctx.options.user.id}>: ${(await udb.retrieve(target)).credits}` });
    }
}

