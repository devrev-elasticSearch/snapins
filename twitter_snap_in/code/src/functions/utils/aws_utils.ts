import {SQS,SendMessageRequest} from '@aws-sdk/client-sqs';
import {Message} from './message';


export function publishToSqs(message:Message[],
    queueUrl:string,
    accesskey:string,
    secretkey:string,
    region:string){

    const sqs = new SQS({
        region: region,
        credentials: {
            accessKeyId: accesskey,
            secretAccessKey: secretkey
        }
    });

    const params: SendMessageRequest = {
        MessageBody: JSON.stringify(message),
        QueueUrl: queueUrl
    }

    sqs.sendMessage(params, (err, data) => {
        if (err) {
            console.log("Error", err);
        } else {
            if(data){
                console.log("Success", data.MessageId);
            }
        }
    })

}