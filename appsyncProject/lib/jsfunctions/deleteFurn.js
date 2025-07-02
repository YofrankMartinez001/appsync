import * as ddb from "@aws-appsync/utils/dynamodb";

export function request(ctx){
    return ddb.remove({
        key: { id: ctx.arguments.FurnID }
    });
}

export function response(ctx){
    return ctx.result;
}