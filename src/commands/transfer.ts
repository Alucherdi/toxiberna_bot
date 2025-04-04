import { Command, CommandContext, createIntegerOption, createUserOption, Declare, Options } from "seyfert";
import { DB } from "../utils/db";

const options = {
    user: createUserOption({
        description: 'El usuario al que le enviaras créditos',
        required: true
    }),

    credits: createIntegerOption({
        description: 'Los créditos que quieres enviar',
        required: true
    }),
};

@Options(options)
@Declare({
    name: "transfer",
    description: "Transfierele un vergazo a alguien"
})
export default class Transfer extends Command {
    async run(ctx: CommandContext<typeof options>) {
        const user = DB.getUser(ctx.author.id);
        const { credits } = ctx.options;

        if (credits <= 0) {
            ctx.write({ content: 'No puedes transferir créditos negativos o 0 HDTPM' });
            return;
        }

        if (!user.spend(credits)) {
            ctx.write({ content: 'No tienes créditos suficientes' });
            return;
        }

        const target = DB.getUser(ctx.options.user.id);
        target.modify(credits);

        ctx.write({ content: `Transferiste ${credits} créditos a <@${ctx.options.user.id}>, tu nuevo saldo es de: ${user.credits}` });
    }
}

