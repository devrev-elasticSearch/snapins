import { Ticket } from "../utils/ticket";
import {publicSDK} from '@devrev/typescript-sdk';
import { ApiUtils, HTTPResponse } from '../utils/utils';

export async function createTickets(tickets: Ticket[], endpoint: string, token: string,defaultOwnerId: string,defaultPartId: string) {
    const apiUtil: ApiUtils = new ApiUtils(endpoint, token);
    let severity:publicSDK.TicketSeverity = publicSDK.TicketSeverity.Medium;

    console.log(`Creating ${tickets} tickets`)
    try{
    for(const ticket of tickets){
            if(ticket.priority >= 1){
                severity = publicSDK.TicketSeverity.High;
            }

            else {
                severity = publicSDK.TicketSeverity.Medium;
            }
            let createTicketResp: HTTPResponse;
            if(ticket.tags){
                const lis = ticket.tags.map((tag)=>{
                    return {id:tag}
                })
                createTicketResp = await apiUtil.createTicket({
                    title: ticket.title,
                    body: ticket.description,
                    type: publicSDK.WorkType.Ticket,
                    owned_by: [defaultOwnerId],
                    applies_to_part: defaultPartId,
                    severity: severity
                })
            }

            else{
                createTicketResp = await apiUtil.createTicket({
                    title: ticket.title,
                    body: ticket.description,
                    type: publicSDK.WorkType.Ticket,
                    owned_by: [defaultOwnerId],
                    applies_to_part: defaultPartId,
                    severity: severity
                })
            }

            if(createTicketResp.success)
                console.log(`Ticket created successfully: ${ticket.title}`)
            else
                console.log(`Failed to create ticket: ${ticket.title}. Err: ${createTicketResp.message}`)
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