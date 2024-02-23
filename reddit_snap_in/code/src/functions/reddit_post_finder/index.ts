import { publishToSqs } from "../utils/aws_utils";
import { getAccessToken,fetchHotPosts } from "./reddit_utils";
import { ApiUtils, HTTPResponse } from '../utils/utils';
import {Message} from '../utils/message';


export const run = async (events: any[]) => {
    for (const event of events) {
      const endpoint: string = event.execution_metadata.devrev_endpoint;
      const token: string = event.context.secrets.service_account_token;
  
      const awsAccessKey: string = event.input_data.keyrings.aws_access_key;
      const awsSecretKey: string = event.input_data.keyrings.aws_secret_key;
      const region: string = event.input_data.keyrings.aws_region_name;

      const clientId: string = event.input_data.keyrings.reddit_client_id;
      const clientSecret: string = event.input_data.keyrings.reddit_client_secret;
  
      const apiUtil: ApiUtils = new ApiUtils(endpoint, token);
      // Get the number of reviews to fetch from command args.
      const snapInId = event.context.snap_in_id;
      const inputs = event.input_data.global_values;
  
      let parameters: string = '15';
      let numReviews = 15;
      let commentID: string | undefined;
      let postResp: HTTPResponse = await apiUtil.postTextMessageWithVisibilityTimeout(
        snapInId,
        'Fetching Hot Posts from Reddit',
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
      const subreddit: string = inputs['subreddit'];
      
      let accessToken = await getAccessToken(clientId, clientSecret);
      let getReviewsResponse: Message[] = await fetchHotPosts(accessToken,subreddit,numReviews);
      // Post an update about the number of reviews fetched.
      postResp = await apiUtil.postTextMessageWithVisibilityTimeout(
        snapInId,
        `Fetched ${numReviews} reviews, creating tickets now.`,
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
          `Creating ticket for Review: ${review.title}`,
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