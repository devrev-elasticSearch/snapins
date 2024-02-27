export interface Message {
    app: string;
    title: string;
    text: string;
    date: string|Date;
    source : string;
    metadata?: Object;
}

export function filterMessagesInDateRange(messages:Message[],baselineInMonths:number,rangeInMinutes:number):Message[]{
    const baseline = new Date();
    baseline.setMonth(baseline.getMonth()-baselineInMonths);
    return messages.filter((message:Message)=>{
        const messageDate = new Date(message.date);
        return messageDate > baseline && messageDate < new Date(baseline.getTime() + rangeInMinutes*60000);
    });
}