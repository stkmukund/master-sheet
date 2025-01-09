export interface CampaignName {
    secretLane?: string;
    scarlettEnvy?: string;
    Mangolift?: string;
    checkoutChamp?: string;
    bankSites?: string;
    [key: string]: string | undefined; // For additional properties if needed
}

export interface apiDescription {
    projectedRebillRevenue: brandDescription
}

export interface brandDescription {
    method: string;
    name: string;
    url: string;
    description: string;
    table: {
        title: string[];
        values: string[][];
    }
}