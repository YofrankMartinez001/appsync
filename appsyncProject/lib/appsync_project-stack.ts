import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {Code, AuthorizationType, FieldLogLevel, GraphqlApi, Definition, FunctionRuntime} from 'aws-cdk-lib/aws-appsync'
import {AttributeType, Table} from 'aws-cdk-lib/aws-dynamodb'
import path from 'path';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class AppsyncProjectStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new Table(this, 'FurnitureTable',{
      partitionKey: {name: 'id', type: AttributeType.STRING},
      tableName: 'FurnitureTable'
    })


    const api = new GraphqlApi(this, 'myApi', {
      name: 'FurnitureApi',
      definition: Definition.fromFile(path.join(__dirname, 'schema.graphql')),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: AuthorizationType.API_KEY,
        },
      },
      logConfig: {
        fieldLogLevel: FieldLogLevel.ALL,
      },
      xrayEnabled: true,
    });

    api.addDynamoDbDataSource('furnDS', table)


    new cdk.CfnOutput(this, 'GraphqlApiUrl', { value: api.graphqlUrl});
  }
}
