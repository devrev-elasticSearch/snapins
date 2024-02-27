import { publishToSqs } from "../utils/aws_utils";
import { fetchReviews } from "./playstore_utils";
import { ApiUtils, HTTPResponse } from '../utils/utils';
import {Message} from '../utils/message';


export const run = async (events: any[]) => {
    for (const event of events) {
      const endpoint: string = event.execution_metadata.devrev_endpoint;
      const token: string = event.context.secrets.service_account_token;
  
      const awsAccessKey: string = event.input_data.keyrings.aws_access_key;
      const awsSecretKey: string = event.input_data.keyrings.aws_secret_key;
      const region: string = event.input_data.keyrings.aws_region_name;
  
      const apiUtil: ApiUtils = new ApiUtils(endpoint, token);
      // Get the number of reviews to fetch from command args.
      const snapInId = event.context.snap_in_id;
      const inputs = event.input_data.global_values;
  
      let parameters: string = '15';
      let numReviews = 15;
      let commentID: string | undefined;
      let postResp: HTTPResponse = await apiUtil.postTextMessageWithVisibilityTimeout(
        snapInId,
        'Fetching Reviews from Google play store',
        1
      );
      if (!postResp.success) {
        console.error(`Error while creating timeline entry: ${postResp.message}`);
        continue;
      }
      try {
        numReviews = parseInt(parameters);
  
        if (!Number.isInteger(numReviews)) {
          throw new Error('Not a valid number');
        }
      } catch (err) {
        postResp = await apiUtil.postTextMessage(snapInId, 'Please enter a valid number', commentID);
        if (!postResp.success) {
          console.error(`Error while creating timeline entry: ${postResp.message}`);
          continue;
        }
        commentID = postResp.data.timeline_entry.id;
      }
      // Make sure number of reviews is <= 100.
      if (numReviews > 100) {
        postResp = await apiUtil.postTextMessage(snapInId, 'Please enter a number less than 100', commentID);
        if (!postResp.success) {
          console.error(`Error while creating timeline entry: ${postResp.message}`);
          continue;
        }
        commentID = postResp.data.timeline_entry.id;
      }
      // Call google playstore scraper to fetch those number of reviews.
      const app_id: string = inputs['app_id'];
      const app_name: string = inputs['app_name'];
      let getReviewsResponse: Message[] = await fetchReviews(app_id,numReviews,app_name);
      // Post an update about the number of reviews fetched.
      postResp = await apiUtil.postTextMessageWithVisibilityTimeout(
        snapInId,
        `Fetched ${numReviews} reviews.`,
        1
      );
      if (!postResp.success) {
        console.error(`Error while creating timeline entry: ${postResp.message}`);
        continue;
      }
      commentID = postResp.data.timeline_entry.id;
      console.log(getReviewsResponse)
      let reviews = getReviewsResponse;
      
      if(reviews.length > 0){
        publishToSqs(reviews, inputs['queue_url'], awsAccessKey, awsSecretKey, region);
    }
  
      for (const review of reviews) {
        postResp = await apiUtil.postTextMessageWithVisibilityTimeout(
          snapInId,
          `Processed Review: ${review.title}`,
          1
        );
        if (!postResp.success) {
          console.error(`Error while creating timeline entry: ${postResp.message}`);
          continue;
        }
      }
      // Call an LLM to categorize the review as Bug, Feature request, or Question.
    }
  };
  
  export default run;