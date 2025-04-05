import { Command, CommandContext, Declare } from "seyfert";
import SlotMachine from "../utils/slot_machine";
import { AuditType, Binnacle, DB } from "../utils/db";

const cost = 1;
const intentions = [1, 1, 1, 1, 1, 4, 10];
const prizes = [2, 3, 5, 7, 10, -5];

@Declare({
    name: "slotmachine",
    description: "Jugar a la máquina tragamonedas"
})
export default class SlotMachineC extends Command {
    async run(ctx: CommandContext) {
        const user = DB.getUser(ctx.author.id);

        if (!user.spend(cost)) {
            ctx.write({ content: 'No tienes créditos suficientes' });
            return;
        }

        await ctx.deferReply();
        const slotMachine = new SlotMachine(intentions);
        const gif = await slotMachine.generateGif();
        await ctx.editOrReply({ content: "¡Buena suerte!", files: [{ filename: "slot.gif", data: gif }] });

        setTimeout(async () => {
            const choosen = slotMachine.getChoosen();
            const win = choosen < 6;

            if (win) {
                let credits = prizes[choosen];
                user.modify(credits);

                Binnacle.report({
                    type: AuditType.SLOTMACHINE,
                    user: ctx.author.id,
                    recipient: ctx.author.id,
                    amount: credits,
                    timestamp: Date.now()
                });

                if(credits < 0) {
                    await ctx.editResponse({ content: `:skull_crossbones: ¡Has perdido ${Math.abs(credits)} creditos, suerte la próxima vez!`, attachments: []});
                } else {
                    await ctx.editResponse({ content: `¡Has ganado ${credits} creditos`, attachments: []});
                }
            } else {
                await ctx.editResponse({ content: "¡Has perdido!", attachments: []});
            }
        }, 2200 * 3);
    }
}
