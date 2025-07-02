import * as ddb from "@aws-appsync/utils/dynamodb";
import { util } from "@aws-appsync/utils";

export function request(ctx) {
    const input = ctx.arguments.input;

    const item = {
        id: input.id,
        name: input.name ?? "Unnamed Furniture",
    };

    return ddb.put({
        key: { id: item.id },
        item,
    });
}

export function response(ctx){
    return ctx.result;
}