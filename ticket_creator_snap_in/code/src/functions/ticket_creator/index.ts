import { ApiUtils } from '../utils/utils';
import { loop } from '../utils/aws_utils';
import { Ticket } from '../utils/ticket';
import { createTickets,postTextMessage } from './ticket_utils';

export const run = async (events: any[]) => {
  for (const event of events) {
    const endpoint: string = event.execution_metadata.devrev_endpoint;
    const token: string = event.context.secrets.service_account_token;

    const awsAccessKey: string = event.input_data.keyrings.aws_access_key;
    const awsSecretKey: string = event.input_data.keyrings.aws_secret_key;
    const region: string = event.input_data.keyrings.aws_region_name;
    const apiUtil: ApiUtils = new ApiUtils(endpoint, token);
    const snapInId = event.context.snap_in_id;

    // Get the number of reviews to fetch from command args.
    const inputs = event.input_data.global_values;

    let parameters: string = event.payload.parameters.trim();
    if (!parameters) {
      // Default to 10 reviews.
      parameters = '1';
    }
    let numReviews = parseInt(parameters);

    const queueUrl = inputs['queue_url'];

    const tickets: Ticket[] = await loop(awsAccessKey, awsSecretKey, region, queueUrl, numReviews);
    // console.log(tickets);
    // console.log(tickets[0].title)
    if(tickets.length > 0){
        await createTickets(tickets, endpoint, token, inputs['default_owner_id'], inputs['default_part_id']);
        await postTextMessage(apiUtil, snapInId, `Created ${tickets.length} tickets`);
    }
  }
};

export default run;
