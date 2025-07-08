import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';
import { AuthorizationType, FieldLogLevel, GraphqlApi, Definition, Values, MappingTemplate, PrimaryKey, Code, FunctionRuntime } from 'aws-cdk-lib/aws-appsync'
import {AttributeType, Table} from 'aws-cdk-lib/aws-dynamodb'
import path from 'path';

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class AppsyncProjectStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //dynamodb table furnituretable
    const table = new Table(this, 'FurnitureTable',{
      partitionKey: {name: 'id', type: AttributeType.STRING},
      tableName: 'FurnitureTable'
    })

    //cognito user pool and user client
    const userpool = new UserPool(this, 'FurnitureUserPool', {
      selfSignUpEnabled: true,
      signInAliases:{
        username: true,
        email: true
      }
    })
    const userpoolclient = userpool.addClient('FurnitureUserPoolClient', {
      authFlows: {
        adminUserPassword: true,
        custom:true,
        userPassword:true,
        userSrp:true
      }
    })

    //appsync new api
    const api = new GraphqlApi(this, 'myApi', {
      name: 'FurnitureApi',
      definition: Definition.fromFile(path.join(__dirname, 'schema.graphql')),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: AuthorizationType.USER_POOL,
          userPoolConfig: {
            userPool: userpool,
          },
        },
      },
      logConfig: {
        fieldLogLevel: FieldLogLevel.ALL,
      },
      xrayEnabled: true,
    });


    //resolvers
    
    const dataSource = api.addDynamoDbDataSource('furnDS', table)

    dataSource.createResolver('GetFurnResolver', {
      typeName: 'Query',
      fieldName: 'getFurn',
      runtime: FunctionRuntime.JS_1_0_0,
      code: Code.fromAsset(path.join(__dirname,'jsfunctions/getFurn.js')),
    });

    dataSource.createResolver('CreateFurnResolver', {
      typeName: 'Mutation',
      fieldName: 'createFurn',
      runtime: FunctionRuntime.JS_1_0_0,
      code: Code.fromAsset(path.join(__dirname,'jsfunctions/createFurn.js')),
    });
    
    dataSource.createResolver('UpdateFurnResolver', {
      typeName: 'Mutation',
      fieldName: 'updateFurn',
      runtime: FunctionRuntime.JS_1_0_0,
      code: Code.fromAsset(path.join(__dirname,'jsfunctions/updateFurn.js')),
    });

    dataSource.createResolver('DeleteFurnResolver', {
      typeName: 'Mutation',
      fieldName: 'deleteFurn',
      runtime: FunctionRuntime.JS_1_0_0,
      code: Code.fromAsset(path.join(__dirname,'jsfunctions/deleteFurn.js')),
    });
    
    //outputs
    new cdk.CfnOutput(this, 'GraphqlApiUrl', { value: api.graphqlUrl});
    new cdk.CfnOutput(this, 'FurnitureUserPoolID', {value: userpool.userPoolId});
    new cdk.CfnOutput(this, 'FurnitureUserPoolClientID', {value: userpoolclient.userPoolClientId})
  }
}

   /*
   resolver used before:
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
    */