export class User {
    isblocked: any;
    constructor(
        public readonly email: string,
        public  password: string,
        public readonly role: string = 'admin', 
    ) {}
}