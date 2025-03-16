import "../env.declaration";

// https://docs.seyfert.dev/getting-started/declare-module
import { Client, type ParseClient } from "seyfert";

const client = new Client();

client.start().then(() => client.uploadCommands());

declare module "seyfert" {
    interface UsingClient extends ParseClient<Client<true>> { }

    interface InternalOptions {
        withPrefix: true;
        asyncCache: true;
    }
}
