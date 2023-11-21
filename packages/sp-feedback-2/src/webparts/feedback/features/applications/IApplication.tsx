export interface IApplication {
    ID: number;
    Title: string;
    Data: {
        name: string;
        imageUrl: string;
        active: boolean;
    }
}