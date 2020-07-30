import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as path from 'path';
import * as efs from '@aws-cdk/aws-efs';
import * as ec2 from '@aws-cdk/aws-ec2';
import { JsonSchemaType, RestApi, LambdaIntegration } from '@aws-cdk/aws-apigateway';

interface SingleProcessorStackProps extends cdk.StackProps {
    envName: string
}

export class SingleProcessorStack extends cdk.Stack {
    constructor(scope: cdk.App, id: string, props?: SingleProcessorStackProps) {
        super(scope, id, props);

        const vpc = new ec2.Vpc(this, 'single-processor-vpc');

        const fileSystem = new efs.FileSystem(this, 'Efs', {
            vpc
        });

        const accessPoint = fileSystem.addAccessPoint('AccessPoint', {
            path: '/export/lambda',
            createAcl: {
                ownerUid: '1001',
                ownerGid: '1001',
                permissions: '750',
            },
            posixUser: {
                uid: '1001',
                gid: '1001',
            },
        });

        const standardLayer = new lambda.LayerVersion(this, 'single-processor-std-layer', {
            code: lambda.AssetCode.fromAsset(path.resolve(__dirname, "lambda", "layers", "standard-layer")),
            compatibleRuntimes: [lambda.Runtime.NODEJS_12_X]
        });

        const processorLambda = new lambda.Function(this, 'single-processor-stack', {
            code: lambda.Code.fromAsset(path.resolve(__dirname, "lambda", "single-processor")),
            handler: "main.lambda_handler",
            runtime: lambda.Runtime.NODEJS_12_X,
            filesystem: lambda.FileSystem.fromEfsAccessPoint(accessPoint, '/mnt/msg'),
            layers: [standardLayer]
        });

        const api = new RestApi(this, 'single-processor-api', {
            cloudWatchRole: true
        });

        api.root.addMethod('ANY');

        const renderResponse = api.addModel('RenderResponseModel', {
            contentType: 'application/json',
            modelName: 'RenderResponseModel',
            schema: {
                "title": "documentUUID",
                "type": JsonSchemaType.OBJECT,
                "properties": {
                    "documentId": {
                        "type": JsonSchemaType.STRING
                    }
                }
            }
        });

        const errorResponse = api.addModel('ErrorResponseModel', {
            contentType: 'application/json',
            modelName: 'ErrorResponseModel',
            schema: {
                "title": "documentUUID",
                "type": JsonSchemaType.OBJECT,
                "properties": {
                    "error": {
                        "type": JsonSchemaType.OBJECT
                    }
                }
            }
        });

        const bodyValidator = api.addRequestValidator('bodyValidator', {
            validateRequestBody: true,
            validateRequestParameters: false
        });

        const rendererEndpoint = api.root.addResource('render');
        rendererEndpoint.addMethod('POST', new LambdaIntegration(processorLambda), {
            requestValidator: bodyValidator,
            methodResponses: [
                {
                    statusCode: "200",
                    responseModels: {
                        "application/json": renderResponse
                    }
                },
                {
                    statusCode: "400",
                    responseModels: {
                        "application/json": errorResponse
                    }
                }
            ],
        });
    };
}