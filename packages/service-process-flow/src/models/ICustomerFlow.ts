/**
 * Represents the Customer linked to a particular team.
 * Different teams can have same customer handled by them which has different database codes etc.
 * For unifiyng it, Customer group should be used, which should mostly match the company name.
 */
export interface ICustomerFlow {
    Id: number;
    Title: string;
    CustomerGroup: string;
    DBCustomers: string[];
    Team: string;
}
