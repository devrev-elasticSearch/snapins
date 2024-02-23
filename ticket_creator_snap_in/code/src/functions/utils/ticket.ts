export interface Ticket {
    title: string;
    description: string;
    date: string|Date;
    priority : string;
    metadata?: Object;
    tags?: string[];
}