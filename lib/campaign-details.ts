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
            NYMBUS: {
                offer1_upProdId: '1178,1012,8,1204,592,1153,128,1231',
                offer1_downProductId: '32,1179,593,1154,1205,1232,129,1013,9',
                offer2_upProdId: '72,1022,74,1163,1188,132,1214,1241,602',
                offer2_downProductId: '133,1215,1023,603,1242,73,1189,1164',
                offer3_upProdId: '747,3482,931,357,719,3254,423,921,3209,3367,255,317,3442,3663,366,3293,1180,615,3643,1069,941,1440,435,284,3331,594,1051,3595,3516,1080,1014,3405,330,3551,2830,707,1155,385,343,2850,1653,2910,3832,1318,1320,3032,1322,1324,183,1326,1328,3771,10,526,2231,1263,3106,486,3099,2941,472,444,1676,3807,3075,575,1337,1342,1357,130,3923,1206,1425,3022,216,1516,1524,3679,104,2873,33,1658,1632,1233,553,3727,163,3861,2223,3948,3891',
                offer3_downProductId: '445,487,1325,1327,1329,3892,1070,1338,164,3100,3517,1015,285,3552,3862,367,318,3483,3294,708,1052,1343,1081,1323,184,3596,3728,1234,2224,386,1156,2874,3210,256,1207,3644,1181,3680,3772,3033,11,3076,1321,3255,2232,424,576,2831,616,527,3664,2851,436,595,1264,217,3443,942,720,3406,922,105,3332,358,748,34,3924,932,554,473,3949,1654,331,3368,1633,3107,1659,1677,131'
            },
            HELIKON: {
                offer1_upProdId: '1047,103,542,174,698,362,986,919,802,1179,8,51,791,249,220,452,1200,1100',
                offer1_downProductId: '699,221,496,9,1201,543,52,250,920,363,987,1101,104,1048,175,308,1251,803,453,406',
                offer2_upProdId: '498,316,1258,399,656,408',
                offer2_downProductId: '499,1259,657,409',
                offer3_upProdId: '317,1240,294,398,488,662',
                offer3_downProductId: '318,394,1229,146,110'
            }
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
    NYMBUS: { offer1_upProdId: string;
        offer1_downProductId: string;
        offer2_upProdId: string;
        offer2_downProductId: string;
        offer3_upProdId: string;
        offer3_downProductId: string;}
       HELIKON: {
        offer1_upProdId: string;
        offer1_downProductId: string;
        offer2_upProdId: string;
        offer2_downProductId: string;
        offer3_upProdId: string;
        offer3_downProductId: string;
       }
       [key: string]: object | undefined;
}