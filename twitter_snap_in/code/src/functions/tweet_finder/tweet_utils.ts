import {Message} from '../utils/message';
import axios from 'axios'


function getStringFromHtml(html: string): string {
    return html.replace(/<[^>]*>?/gm, '');
  }
  
  function removeNecessaryWhitespace(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
  }

const fetchData = async (hashtag:string, fromTimestamp:number, toTimestamp:number,numTweets:string,apiKey:string,appName:string) => {
    const options = {
        method: 'GET',
        url: 'https://twitter154.p.rapidapi.com/hashtag/hashtag',
        params: {
        hashtag: hashtag,
        limit: numTweets,
        section: 'latest'
        },
        headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'twitter154.p.rapidapi.com'
        }
    };

    try {
        const response = await axios.request(options);
        if (response.data && response.data.results && Array.isArray(response.data.results)) {
        const filteredTweets = response.data.results.filter((tweet:any) => {
            const tweetTimestamp = Date.parse(tweet.creation_date);
            return tweetTimestamp >= fromTimestamp && tweetTimestamp <= toTimestamp;
        });

        const formattedTweets:Message[] = filteredTweets.map((tweet:any) => {
            return {
            title: tweet.user.name,
            text: removeNecessaryWhitespace(getStringFromHtml(tweet.text)),
            date: tweet.timestamp,
            source: 'twitter',
            app: appName,
            metadata: {
                tweetId: tweet.id,
                retweetCount: tweet.retweet_count,
                likeCount: tweet.like_count,
                numViews: tweet.views,
                source:tweet.source,
                user:tweet.user
            }
            };
        });

        return formattedTweets;
        } else {
        return [];
        }
    } catch (error:any) {
        console.error(`Error fetching tweets for hashtag ${hashtag}:`, error);
        return [];
    }
};

export const fetchTweetFromHashtags = async (hashtags:any, fromTimestamp:number, toTimestamp:number,numTweets:string,apiKey:string,appName:string):Promise<Message[]> => {
    const responses:Message[] = [];
    for (const hashtag of hashtags) {
      const response = await fetchData(hashtag, fromTimestamp, toTimestamp,numTweets,apiKey,appName);
      // console.log(response.tweets)
      responses.push(...response);
    }
    return responses;
  };