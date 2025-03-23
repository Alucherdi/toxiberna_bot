import { Command, CommandContext, createUserOption, Declare, Options } from "seyfert";
import OpenAI from "openai";
import { buildPrompt } from "../utils/constants";

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
        const prompt = buildPrompt(users);
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


