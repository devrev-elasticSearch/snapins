import { publishToSqs } from "../utils/aws_utils";
import { fetchTweetFromHashtags } from "./other_tweet_utils";
import { ApiUtils, HTTPResponse } from '../utils/utils';
import {Message} from '../utils/message';
import { Feature } from "../utils/feature";
import { getFeatureRequests } from "../utils/llm_run";
import { createTickets } from "../utils/ticket_utils";



export const run = async (events: any[]) => {
    for (const event of events) {
      const endpoint: string = event.execution_metadata.devrev_endpoint;
      const token: string = event.context.secrets.service_account_token;
      const rapidApiKey: string = event.input_data.keyrings.rapid_api_key;
      const googleApiKey: string = event.input_data.keyrings.google_api_key;
      const fireworksApiKey: string = event.input_data.keyrings.fireworks_api_key;

  
      const awsAccessKey: string = event.input_data.keyrings.aws_access_key;
      const awsSecretKey: string = event.input_data.keyrings.aws_secret_key;
      const region: string = event.input_data.keyrings.aws_region_name;

      const apiUtil: ApiUtils = new ApiUtils(endpoint, token);
      // Get the number of reviews to fetch from command args.
      const snapInId = event.context.snap_in_id;
      const inputs = event.input_data.global_values;
  
      let parameters: string = '20';
      let numReviews = 20;
      let commentID: string | undefined;
      let postResp: HTTPResponse = await apiUtil.postTextMessageWithVisibilityTimeout(
        snapInId,
        'Fetching Latest Tweets from Twitter',
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
      let otherhashtags: any = inputs['otherhashtags'];
      let otherhashtagsArray = otherhashtags.split(',');

      let currentTimestamp = Date.parse(new Date().toISOString());
      let timeStamp10minutesAgo = currentTimestamp - 6000000;

      let getReviewsResponse:Message[] = await fetchTweetFromHashtags(otherhashtagsArray, timeStamp10minutesAgo, currentTimestamp,'15', rapidApiKey);

      let featureRequests:Feature[] = await getFeatureRequests(getReviewsResponse,googleApiKey,fireworksApiKey);

      if(featureRequests.length > 0){
        publishToSqs(featureRequests,inputs["queue_url"],awsAccessKey,awsSecretKey,region);

        //sample numreviews from feature requests

        //shuffle
        featureRequests.sort(() => Math.random() - 0.5);

        let sampleReviews:Feature[] = featureRequests.slice(0, Math.min(featureRequests.length, numReviews));
        await createTickets(sampleReviews, endpoint, token, inputs['default_owner_id'], inputs['default_part_id']);

        for(let i=0; i<sampleReviews.length; i++){
          postResp = await apiUtil.postTextMessageWithVisibilityTimeout(snapInId, `Created ticket for ${sampleReviews[i].title}`,1);
          if (!postResp.success) {
            console.error(`Error while creating timeline entry: ${postResp.message}`);
            continue;
          }
        }
      }
      else{
        postResp = await apiUtil.postTextMessageWithVisibilityTimeout(snapInId, 'No feature requests found in the reviews', 1);
        if (!postResp.success) {
          console.error(`Error while creating timeline entry: ${postResp.message}`);
          continue;
        }
      
      }
      // Post an update about the number of reviews fetched.
      // Call an LLM to categorize the review as Bug, Feature request, or Question.
    }
  };
  
  export default run;