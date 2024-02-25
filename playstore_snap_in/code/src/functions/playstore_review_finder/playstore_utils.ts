import * as gplay from "google-play-scraper";
import { Message } from "../utils/message";

export async function fetchReviews(appId: string, numReviews: number):Promise<Message[]> {
    const reviews:any = await gplay.reviews({
        appId,
        sort: gplay.sort.NEWEST,
        num: numReviews,
    });

    const reviewsData:gplay.IReviewsItem[] = reviews.data;

    const removeTitleTextDate = (review:any) => {
        delete review.title;
        delete review.text;
        delete review.date;

        return review;
    }

    return reviewsData.map((review) => {
        return {
        title: review.title || `From ${review.url}`,
        text: review.text,
        date: review.date,
        source: "playstore",
        metadata: removeTitleTextDate(review),
        };
    });
}