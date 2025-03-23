import { Command, CommandContext, createIntegerOption, createUserOption, Declare, Options } from "seyfert";
import UserDB from "../utils/db";

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
        const udb = await UserDB.load()
        const { credits } = ctx.options;

        if (credits <= 0) {
            ctx.write({ content: 'No puedes transferir créditos negativos o 0 HDTPM' });
            return;
        }

        if (!udb.spend(ctx.author.id, credits)) {
            ctx.write({ content: 'No tienes créditos suficientes' });
            return;
        }

        let target = ctx.options.user.id;
        udb.modify(target, credits);

        await udb.write();
        ctx.write({ content: `Transferiste ${credits} créditos a <@${ctx.options.user.id}>, tu nuevo saldo es de: ${(await udb.retrieve(ctx.author.id))!.credits}` });
    }
}

