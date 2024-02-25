import { Feature } from "./feature"
import {publicSDK} from '@devrev/typescript-sdk';
import { ApiUtils, HTTPResponse } from '../utils/utils';

export async function createTickets(features: Feature[], endpoint: string, token: string,defaultOwnerId: string,defaultPartId: string) {
    const apiUtil: ApiUtils = new ApiUtils(endpoint, token);
    let severity:publicSDK.TicketSeverity = publicSDK.TicketSeverity.Low;

    console.log(`Creating ${features.length} tickets`)
    try{
    for(const feature of features){

            let createTicketResp: HTTPResponse;
            createTicketResp = await apiUtil.createTicket({
                title: "Feature Request " +feature.title,
                body: feature.text,
                type: publicSDK.WorkType.Ticket,
                owned_by: [defaultOwnerId],
                applies_to_part: defaultPartId,
                severity: severity
            })


            if(createTicketResp.success)
                console.log(`Ticket created successfully: ${feature.title}`)
            else
                console.log(`Failed to create ticket: ${feature.title}. Err: ${createTicketResp.message}`)
        }
    }
    catch(err){
        console.log(`Error creating tickets: ${err}`)
    }
    return;
}

export async function postTextMessage(apiUtil:ApiUtils,snapInId: string, text:string){
    await apiUtil.postTextMessageWithVisibilityTimeout(snapInId, text, 1);
}