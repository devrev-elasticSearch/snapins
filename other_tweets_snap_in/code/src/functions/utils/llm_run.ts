import {LLMUtils} from './llm_utils';
import {Message} from './message';
import {Feature} from './feature';
import {translate} from './translate'


const systemPrompt = `You are an expert at labelling a twitter tweet as a featurerequest or norequest. You are given a tweet regarding a payment and UPI application. You have to label the tweet as feature request or no feature request. The output should be a JSON with fields "category" and "reason" and "title". The "category" field should be one of "norequest", "featurerequest". The "reason" field should be a string explaining the reason for the category. The "title" field should be string giving an appropriate title based on the reason you provided.\n\nTweet: {tweet}\n\nOutput:`;
const humanPrompt = ""

export async function getFeatureRequests(messages:Message[],googleApiKey:string,fireworksKey:string):Promise<Feature[]>{
    const llmutils = new LLMUtils(fireworksKey,`accounts/fireworks/models/mixtral-8x7b-instruct`,200);
    console.log(messages)
    const featureRequests:Feature[] = [];

    for(const message of messages){
        const translatedMessage = await translate(googleApiKey,message.text,'en');
        const response:any = await llmutils.chatCompletion(systemPrompt,humanPrompt, {'tweet':translatedMessage});
        const category = response['category'];
        const title = response['title'];
        const text= response['reason']
        const date = message.date;

        if(category === 'featurerequest'){
            featureRequests.push({title,text,date});
        }
    }

    return featureRequests;
}

