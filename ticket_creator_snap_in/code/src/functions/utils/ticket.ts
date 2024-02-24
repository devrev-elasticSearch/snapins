export interface Ticket {
    title: string;
    description: string;
    date: string|Date;
    priority : number;
    metadata?: Object;
    tags?: string[];
}