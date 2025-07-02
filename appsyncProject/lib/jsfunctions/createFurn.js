import * as ddb from "@aws-appsync/utils/dynamodb";
import { util } from "@aws-appsync/utils";

export function request(ctx){
    const input = ctx.arguments.input;

    const item = {
        id: input?.id ?? util.autoId(),
        name: input?.name ?? "Unnamed Furn",
    }

    return ddb.put({
        key: {id: item.id},
        item,
    });
}

export function response(ctx){
    return ctx.result;
}