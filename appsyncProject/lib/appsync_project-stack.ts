import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AuthorizationType, FieldLogLevel, GraphqlApi, Definition, Values, MappingTemplate, PrimaryKey } from 'aws-cdk-lib/aws-appsync'
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

    const dataSource = api.addDynamoDbDataSource('furnDS', table)

    //resolvers
    dataSource.createResolver('GetFurnResolver',{
      typeName:'Query',
      fieldName:'getFurn',
      requestMappingTemplate: MappingTemplate.dynamoDbGetItem('id', 'id'),
      responseMappingTemplate: MappingTemplate.dynamoDbResultItem(),
    });

    dataSource.createResolver('CreateFurnResolver', {
      typeName: 'Mutation',
      fieldName: 'createFurn',
      requestMappingTemplate: MappingTemplate.dynamoDbPutItem(
        PrimaryKey.partition('id').is('input.id'),
        Values.projecting('input'),
      ),
      responseMappingTemplate: MappingTemplate.dynamoDbResultItem()
    });

    dataSource.createResolver('UpdateFurnResolver', {
      typeName: 'Mutation',
      fieldName: 'updateFurn',
      requestMappingTemplate: MappingTemplate.dynamoDbPutItem(
        PrimaryKey.partition('id').is('input.id'),
        Values.projecting('input'),
      ),
      responseMappingTemplate: MappingTemplate.dynamoDbResultItem(),
    });

    dataSource.createResolver('DeleteFurnResolver', {
      typeName: 'Mutation',
      fieldName: 'deleteFurn',
      requestMappingTemplate: MappingTemplate.dynamoDbDeleteItem('id','FurnID'),
      responseMappingTemplate: MappingTemplate.dynamoDbResultItem(),
    });

    new cdk.CfnOutput(this, 'GraphqlApiUrl', { value: api.graphqlUrl});
  }
}
