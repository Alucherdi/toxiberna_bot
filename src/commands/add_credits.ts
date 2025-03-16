import { Command, CommandContext, createIntegerOption, createUserOption, Declare, Options } from "seyfert";
import db from './db.json';

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
        let roles = (await ctx.member.roles.list()).map(v => v.name);
        if (!roles.includes('Admin')) {
            ctx.write({ content: 'A donde mija' });
            return;
        }

        let target = ctx.options.user.id;
        if (!db[target]) db[target] = { credits: 0 };
        db[target].credits += ctx.options.credits;

        Bun.write('./db.json', JSON.stringify(db));
        ctx.write({ content: `Créditos de ${ctx.options.user.name}: ${db[target].credits}` });
    }
}

