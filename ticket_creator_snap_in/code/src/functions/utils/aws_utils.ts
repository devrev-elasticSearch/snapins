import { DeleteMessageCommand, ReceiveMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { Ticket } from './ticket';

interface Message {
  Body: any;
  ReceiptHandle: string;
}

async function pollSqsQueue(
  sqs: any,
  queueUrl: string,
  maxMessages: number = 1,
  waitTimeSeconds: number = 5
): Promise<Message[]> {
  // Poll the SQS queue
  const command = new ReceiveMessageCommand({
    QueueUrl: queueUrl,
    AttributeNames: ['All'],
    MaxNumberOfMessages: maxMessages,
    MessageAttributeNames: ['All'],
    WaitTimeSeconds: waitTimeSeconds,
  });

  const response = await sqs.send(command);
  const messages: Message[] = response.Messages || [];
  console.log(`Received ${messages} messages from the queue`)
  return messages;
}

export async function loop(
  accessKey: string,
  secretKey: string,
  region: string,
  queueUrl: string,
  maxMessages: number = 1
): Promise<Ticket[]> {
  const sqs = new SQSClient({ region: region, credentials: { accessKeyId: accessKey, secretAccessKey: secretKey } });
  const messages = await pollSqsQueue(sqs, queueUrl, maxMessages);
  const totalMessages: Ticket[] = [];

  if (messages.length > 0) {
    for (const message of messages) {
      console.log(`Received ${message} message from the queue`)
      //print type of messsage body
      console.log(`Type of message body: ${typeof message.Body}`)
      const parsedBody = message.Body ? JSON.parse(message.Body) : [];
      console.log(`Received ${parsedBody} messages body from the queue`)

      for(const body of parsedBody){
        totalMessages.push(body);
      }

      // Delete the message from the queue after processing
      const receiptHandle = message.ReceiptHandle;

      const deleteCommand = new DeleteMessageCommand({
        QueueUrl: queueUrl,
        ReceiptHandle: receiptHandle,
      });

      await sqs.send(deleteCommand);
    }
  }
  console.log(`Returning ${totalMessages.length} messages`)
  return totalMessages;
}
