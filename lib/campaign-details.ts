export const tableDetails: tableHeading = {
    projectedRebillRevenue: {
        tableHeading: {
            NYMBUS: ["Date (Next 30)", "Total Revenue", "Report Date", "Projected Approved Rebill Count"],
            CREATUNITY: ["Date (Next 30)", "Total Revenue", "Report Date", "Projected Approved Rebill Count"],
            HELIKON: ["Date (Next 30)", "Total Revenue", "Report Date", "Projected Approved Rebill Count"]
        }
    },
    totalVipTracking: {
        tableHeading: {
            NYMBUS: ["Date Pulled", "Lash Cosmetics", "Brow Charm", "Floral Secrets", "Invisilift", "Indestructible Tights", "Fitcharm", "Brow Pro", "Total Nymbus VIPs", "Total VIP Recycling"],
            CREATUNITY: ["Date Pulled", "Lash Cosmetics", "Brow Charm", "Floral Secrets", "Invisilift", "Indestructible Tights", "Fitcharm", "Brow Pro", "Total Nymbus VIPs", "Total VIP Recycling"],
            HELIKON: ["Date Pulled", "mLab™", "CheckoutChamp", "Flexi Health™", "Bank Sites", "Total Andor VIPs", "Total VIP Recycling", "Total Andor VIP's Paused Status"],
        },
        campaignIds: {
            NYMBUS: {
                lashCosmetics: "61, 47, 1, 68, 9, 6, 67, 69, 70",
                browCharm: "88, 48, 24, 8, 20, 10, 28, 34, 35, 45, 83, 82",
                floralSecrets: "38, 46, 85, 12, 71, 55, 21, 15",
                secretLane: "39, 42, 41",
                invisilift: "16, 53, 31, 19",
                indestructibleTights: "56, 58, 59",
                scarlettEnvy: "999", // it not exists in campaign
                Mangolift: "72, 75, 73",
                fitcharm: "76, 81, 79",
                browPro: "97, 101, 99"
            },
            HELIKON: {
                mLab: "1,2,4,5,7,8,9,13,21",
                checkoutChamp: "6,20",
                flexiHealth: "11",
                bankSites: "14,15,16,17,18"
            }
        }
    },
    upsellTakeRateReport: {
        tableHeading: {
            NYMBUS: ["Date", " ", "Expedited Shipping", "Discounted Expedited Shipping", "FlexiKnee™️ - Natural Knee Pain Patches - Offer 2", "FlexiKnee™️ - Natural Knee Pain Patches - Offer 2_1", "Knee Relieve Pro™️ - Nano-Fiber Compression Sleeve - Offer 3", "mLab™️ - Side Sleeper Knee Pillow - Offer", "Total"],
            CREATUNITY: ["Date", " ", "Expedited Shipping", "Discounted Expedited Shipping", "FlexiKnee™️ - Natural Knee Pain Patches - Offer 2", "FlexiKnee™️ - Natural Knee Pain Patches - Offer 2_1", "Knee Relieve Pro™️ - Nano-Fiber Compression Sleeve - Offer 3", "mLab™️ - Side Sleeper Knee Pillow - Offer", "Total"],
            HELIKON: ["Date", " ", "Expedited Shipping", "Discounted Expedited Shipping", "FlexiKnee™️ - Natural Knee Pain Patches - Offer 2", "FlexiKnee™️ - Natural Knee Pain Patches - Offer 2_1", "Knee Relieve Pro™️ - Nano-Fiber Compression Sleeve - Offer 3", "mLab™️ - Side Sleeper Knee Pillow - Offer", "Total"],
        },
        productIds: {
            offer1_upProdId: '1047,103,542,174,698,362,986,919,802,1179,8,51,791,249,220,452,1200,1100',
            offer1_downProductId: '699,221,496,9,1201,543,52,250,920,363,987,1101,104,1048,175,308,1251,803,453,406',
            offer2_upProdId: '498,316,1258,399,656,408',
            offer2_downProductId: '499,1259,657,409',
            offer3_upProdId: '317,1240,294,398,488,662',
            offer3_downProductId: '318,394,1229,146,110'
        }
    }
};

// type
type tableHeading = {
    projectedRebillRevenue: tableSheet;
    totalVipTracking: tableSheet;
    upsellTakeRateReport: tableSheet;
}

type tableSheet = {
    tableHeading: {
        NYMBUS: string[];
        CREATUNITY: string[];
        HELIKON: string[];
        [key: string]: string[]; // Index signature
    };
    campaignIds?: {
        NYMBUS?: {
            lashCosmetics: string;
            browCharm: string;
            floralSecrets: string;
            invisilift: string;
            indestructibleTights: string;
            fitcharm: string;
            browPro: string;
            [key: string]: string;
        };
        HELIKON?: {
            mLab: string;
            checkoutChamp: string;
            flexiHealth: string;
            bankSites: string;
        };
        [key: string]: object | undefined; // This allows other dynamic keys with object values
    };
    productIds?: upsellProductIdsInterface
}

type upsellProductIdsInterface = {
    offer1_upProdId: string;
    offer1_downProductId: string;
    offer2_upProdId: string;
    offer2_downProductId: string;
    offer3_upProdId: string;
    offer3_downProductId: string;
}