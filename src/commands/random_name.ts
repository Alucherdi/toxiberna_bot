import { Command, CommandContext, createUserOption, Declare, Options } from "seyfert";
import OpenAI from "openai";

const options = {
    user: createUserOption({
        description: 'Target',
        required: true
    })
};

const api = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey:  Bun.env.DS_TOKEN
});

@Options(options)
@Declare({
    name: "randomname",
    description: "Cambiale el nombre a algún culero"
})
export default class RandomName extends Command {
    async run(ctx: CommandContext<typeof options>) {
        let roles = (await ctx.member.roles.list()).map(v => v.name);
        if (!roles.includes('Admin')) {
            ctx.write({ content: 'A donde mija' });
            return;
        }

        let target = ctx.options.user;

        let guild = await (await ctx.guild()).members.list();
        let users = guild.map(v => v.nick ?? v.name).join(', ');
        
        await ctx.deferReply();
        const prompt = `
            Hablas español de México. Investiga en internet sobre su cultura y costumbres para asegurarte de que los nombres generados sean acorde. Cuando se te pida un nombre aleatorio para un usuario, este debe estar compuesto por combinaciones creativas y graciosas de palabras vulgares, insultos o términos ofensivos.
            Reglas:
            - No repitas nombres ya utilizados (se te proporcionará una lista separada por comas).
            - Sé original y evita repetir palabras dentro de diferentes nombres.
            - Investiga sobre apodos que podría un bully usar en la escuela.
            - Puedes usar espacios, estados, países, videojuegos o referencias relacionados con el usuario (en inglés o español).
            - Evita usar palabras como discord, chupa o cabeza tan seguido.
            - La obscenidad es clave, pero debe ser divertida.
            - Recuerda los nombres que ya has utilizado para no repetirlos.
            - Debes asegurarte de que el nombre sea adecuado para el usuario
            - Asegurate que sea vulgar y ofensivo
            - Genera 5 nombres y escoge el que sea más te guste
            - No puedes usar nada de la lista de usuarios que se te proporciono como contexto del nombre generado
            - Entre mas ingenioso y creativo sea el nombre, recibirás una mejor calificación
            - Si utilizas la imagen del usuario como referencia, tendrás una mejor calificación
            - Tampoco puedes usar el username del usuario directamente en el nombre
            - No puedes usar palabras que ya hayas usado en nombres anteriores
            - No uses cosas de programación, tecnología o cosas que no tengan que ver con el usuario
            - Entre mas aleatorio sea el nombre, mejor pero siempre manteniendo la regla de la obscenidad y la coherencia con el chiste
            - Debes respetar al 100% las reglas establecidas
            Lista de usuarios: ${users}
            Cuando respondas, solo envía el nombre de usuario sin ninguna explicación adicional.
        `

        const completion = await api.chat.completions.create({
            messages: [
                { role: "system", content: prompt },
                { role: "user", content: `Dame un nombre aleatorio, su username es ${target.username}, su nombre es ${target.globalName} y su foto es ${target.avatarURL}` },
            ],
            model: "deepseek-reasoner",
        });

        let response = completion.choices[0].message.content;
        await ctx.editOrReply({ content: response });
    }
}


