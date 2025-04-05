import { Command, CommandContext, createStringOption, Declare, Options } from "seyfert";
import { AuditType, Binnacle, DB } from "../utils/db";

const filters = [ AuditType.MUTE, AuditType.TIMEOUT, AuditType.RENAME ];

enum QueryType {
    TIMEOUT = AuditType.TIMEOUT,
    MUTE = AuditType.MUTE,
    RENAME = AuditType.RENAME,
};

const options = {
    type: createStringOption({
        required: true,
        description: 'Tipo de scoreboard',
        choices: Object.values(QueryType).map(value => ({ 
            name: value.toLowerCase(), value 
        }))
    }),
};

const names = {
    [AuditType.TIMEOUT]: 'aislamientos',
    [AuditType.MUTE]: 'muteos',
    [AuditType.RENAME]: 'cambios de nombre'
}

@Options(options)
@Declare({
    name: "scoreboard",
    description: "Muestra el scoreboard",
})
export default class Scoreboard extends Command {
    async run(ctx: CommandContext<typeof options>) {
        const type = ctx.options.type;
        const list = Binnacle.getScoreboard(type);
        const target   = type == QueryType.RENAME ? 'user' : 'recipient';
        const criteria = type == QueryType.RENAME ? 'count' : 'total';
        const modifier = {
            RENAME: 1,
            TIMEOUT: 60,
            MUTE: 60_000
        }[type];
        const metric = type == QueryType.RENAME ? '' : 'min';

        let output = `Top ${names[type]}\n` + list
            .map(v => `<@${v[target]}>: ${v[criteria] / modifier} ${metric}`)
            .join('\n');

        ctx.write({ content: output });
    }
}
