export class User {
    constructor(
        public readonly username: string,
        public readonly email: string,
        public readonly password: string,
        public readonly role: string = 'user', 
        public readonly isblocked:boolean,
        public readonly tokenVersion:number,
        public readonly _id?: string 

    ) {}
}



export class googleUser{
    constructor(
        public readonly googleId: string,
        public readonly username: string,
        public readonly email: string,
        public readonly _id?: string 
    ) {}
}