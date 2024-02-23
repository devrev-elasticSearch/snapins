import { Message } from "../utils/message";

function getStringFromHtml(html: string): string {
    return html.replace(/<[^>]*>?/gm, '');
  }
  
  function removeNecessaryWhitespace(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
  }


const userAgent:string = 'test'

export async function getAccessToken(clientId:string, clientSecret:string) {
    try {
      const response = await fetch('https://www.reddit.com/api/v1/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
          'User-Agent': userAgent,
        },
        body: 'grant_type=client_credentials',
      });
      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Error fetching access token:', error);
      return null;
    }
  }

export async function fetchHotPosts(accessToken:string,subreddit:string,parameter:number):Promise<Message[]> {
    try {
      const response = await fetch(`https://oauth.reddit.com/r/${subreddit}/hot?limit=${parameter}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'User-Agent': userAgent,
        }
      });
      const data = await response.json();
      const dataArray = data.data.children;
      return dataArray.map((post:any) => {
        return {
          title: post.data.title,
          text: post.data.selftext ? removeNecessaryWhitespace(getStringFromHtml(post.data.selftext)) : post.data.title,
          date: new Date(post.data.created_utc*1000),
          source: 'reddit',
          metadata: {
            numComments: post.data.num_comments,
          },
        };
      })
    } catch (error) {
      console.error('Error fetching hot posts from worldnews:', error);
      return [];
    }
  }