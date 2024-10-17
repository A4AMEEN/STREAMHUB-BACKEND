export class Category {
    constructor(
      public readonly name: string,
      public readonly _id?: string
    ) {}
  }
  

export interface CategoryResponse {
    name: string;
    _id?: string;
  }
  