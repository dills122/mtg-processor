import { APIGatewayEvent, Handler } from 'aws-lambda';
import { S3 } from 'aws-sdk';
import * as MTG from 'mtg-card-analyzer-sdk';
import { writeFile, } from 'fs';
import { basename } from 'path';
const { Processor } = MTG.default;

interface IOutput {
    statusCode: number,
    body: string,
    headers?: object
}

export const lambda_handler: Handler = async (event: APIGatewayEvent): Promise<IOutput> => {
    if (!event.body) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: new Error('Recieved an empty body')
            }),
            headers: {
                "content-type": "application/json"
            }
        };
    }
    const body = JSON.parse(event.body);
    if (!body.imageLocation) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: new Error('Body did not contain required param, imageLocation')
            }),
            headers: {
                "content-type": "application/json"
            }
        };
    }
    const s3 = new S3();
    s3.getObject({
        Bucket: 'single-processor-bucket',
        Key: body.imageLocation
    }, (err, s3Obj) => {
        if (err || !s3Obj.Body) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: err || new Error('No object body returned')
                }),
                headers: {
                    "content-type": "application/json"
                }
            };
        }
        const fPath = `/mnt/msg/${basename(body.imageLocation)}`;
        return writeFile(fPath, s3Obj.Body.toString('base64'), {
            encoding: "utf8"
        }, (err) => {
            if (err) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        error: err
                    }),
                    headers: {
                        "content-type": "application/json"
                    }
                };
            }
            return Processor.Processor.create({
                filePath: fPath
            }).execute((err) => {
                if (err) {
                    return {
                        statusCode: 400,
                        body: JSON.stringify({
                            error: err
                        }),
                        headers: {
                            "content-type": "application/json"
                        }
                    };
                }
                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        body: event.body
                    }),
                    headers: {
                        "content-type": "application/json"
                    }
                };
            });
        });
    });
}  