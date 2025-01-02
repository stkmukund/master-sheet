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
            NYMBUS: ["Date Pulled", "Lash Cosmetics", "Brow Charm", "Floral Secrets", "Secret Lane", "Invisilift", "Indestructible Tights", "Scarlett Envy", "Mangolift", "Fitcharm", "Brow Pro", "Total Nymbus VIPs", "Total VIP Recycling"],
            CREATUNITY: ["Date Pulled", "Lash Cosmetics", "Brow Charm", "Floral Secrets", "Invisilift", "Indestructible Tights", "Fitcharm", "Brow Pro", "Total Nymbus VIPs", "Total VIP Recycling"],
            HELIKON: ["Date Pulled", "mLab™", "CheckoutChamp", "Flexi Health™", "Bank Sites", "Total Andor VIPs", "Total VIP Recycling", "Total Andor VIP's Paused Status"],
        },
        campaignIds: {
            NYMBUS: {
                lashCosmetics: "61,47, 1, 68, 9, 6, 67, 69, 70",
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
            NYMBUS: {
                lashCosmetics: ["Date", " ", "Lash Cosmetics Vibely Mascara Offered", "Lash Cosmetics Vibely Mascara - Discounted", "Lash Cosmetics Vibely EyeLiner Offered", "Lash Cosmetics Vibely EyeLiner Discounted", "Expedited Shipping", "Discounted Expedited Shipping", "Total"],

                browCharm: ["Date", " ", "Brow Charm Stencil Kit Offered", "Brow Charm Stencil Kit Discounted", "Brow Charm Vibely Mascara Offered", "Brow Charm Vibely Mascara Discounted", "Brow Charm Vibely EyeLiner Offered", "Brow Charm Vibely EyeLiner Discounted", "Expedited Shipping", "Discounted Expedited Shipping", "Total"],

                floralSecrets: ["Date", " ", "Floral Secrets Comfort Rose Bra Offered", "Floral Secrets Comfort Rose Bra Discounted", "Floral Secrets Butterfly Back Bra Offered", "Floral Secrets Butterfly Back Bra Discounted", "Expedited Shipping", "Discounted Expedited Shipping", "Total"],

                invisilift: ["Date", " ", "InvisiLift Bra Offered", "InvisiLift Bra Discounted", "InvisiLift Breast Lift Strapless Bra", "InvisiLift Breast Lift Strapless Bra-Discounted", "Expedited Shipping", "Discounted Expedited Shipping", "Total"],

                indestructibleTights: ["Date", " ", "Indestructible Tights Sheer SlimTights Offered", "Indestructible Tights Sheer SlimTights Discounted", "Indestructible Thigh Highs Offered", "Indestructible Thigh Highs Discounted", "Expedited Shipping", "Discounted Expedited Shipping", "Total"],

                fitcharm: ["Date", " ", "SecretPlunge Bra-Offered", "SecretPlunge Bra-Discounted", "FitCharm Breast Lift Strapless Bra", "FitCharm Breast Lift Strapless Bra-Discounted", "Seamless Bralette-Offered", "Seamless Bralette-Discounted", "Expedited Shipping", "Discounted - Expedited Shipping", "Total"],

                browPro: ["Date", " ", "BrowPro™ Simone Stamp Offered", "BrowPro™ Simone Stamp Discounted", "BrowPro™ Stencil Kit Offered", "BrowPro™ Stencil Kit Discounted", "Expedited Shipping", "Discounted Expedited Shipping", "Total"],

            },
            CREATUNITY: ["Date", " ", "Expedited Shipping", "Discounted Expedited Shipping", "FlexiKnee™️ - Natural Knee Pain Patches - Offer 2", "FlexiKnee™️ - Natural Knee Pain Patches - Offer 2_1", "Knee Relieve Pro™️ - Nano-Fiber Compression Sleeve - Offer 3", "mLab™️ - Side Sleeper Knee Pillow - Offer", "Total"],
            HELIKON: {
                mLab: ["Date", " ", "Expedited Shipping", "Discounted Expedited Shipping", "FlexiKnee™️ - Natural Knee Pain Patches - Offer 2", "FlexiKnee™️ - Natural Knee Pain Patches - Offer 2_1", "Knee Relieve Pro™️ - Nano-Fiber Compression Sleeve - Offer 3", "mLab™️ - Side Sleeper Knee Pillow - Offer", "Total"],

                flexiHealth: ["Date", " ", "Deep Sleep™ - Orthopedic Memory Foam Pillow", " ", "DreamPatch™️ - Natural Sleep Patches - Offer2", "DreamPatch™️ - Natural Sleep Patches - Offer2_1", "Expedited Shipping", "Discounted Expedited Shipping", "Total"],
            },
        },
        productIds: {
            NYMBUS: {
                lashCosmetics: {
                    offer1_upProdId: '8',
                    offer1_downProductId: '9',
                    offer2_upProdId: '72',
                    offer2_downProductId: '73',
                    offer3_upProdId: '10',
                    offer3_downProductId: '11'
                },
                browCharm: {
                    offer1_upProdId: '451',
                    offer1_downProductId: '450',
                    offer2_upProdId: '453',
                    offer2_downProductId: '454',
                    offer3_upProdId: '2821',
                    offer3_downProductId: '2822',
                    offer4_upProdId: '104',
                    offer4_downProductId: '105'
                },
                floralSecrets: {
                    offer1_upProdId: '181',
                    offer1_downProductId: '182',
                    offer2_upProdId: '3155',
                    offer2_downProductId: '2826',
                    offer3_upProdId: '183',
                    offer3_downProductId: '184'
                },
                invisilift: {
                    offer1_upProdId: '258',
                    offer1_downProductId: '259',
                    offer2_upProdId: '3156',
                    offer2_downProductId: '3157',
                    offer3_upProdId: '255',
                    offer3_downProductId: '256'
                },
                indestructibleTights: {
                    offer1_upProdId: '749',
                    offer1_downProductId: '750',
                    offer2_upProdId: '751',
                    offer2_downProductId: '2864',
                    offer3_upProdId: '747',
                    offer3_downProductId: '748'
                },
                fitcharm: {
                    offer1_upProdId: '1444',
                    offer1_downProductId: '1445',
                    offer2_upProdId: '3978',
                    offer2_downProductId: '3979',
                    offer3_upProdId: '2866',
                    offer3_downProductId: '2867',
                    offer4_upProdId: '1440',
                    offer4_downProductId: '1441'
                },
                browPro: {
                    offer1_upProdId: '3043',
                    offer1_downProductId: '3042',
                    offer2_upProdId: '3072',
                    offer2_downProductId: '3070',
                    offer3_upProdId: '3032',
                    offer3_downProductId: '3033'
                }
            },
            HELIKON: {
                mLab: {
                    offer1_upProdId: '8',
                    offer1_downProductId: '9',
                    offer2_upProdId: '408',
                    offer2_downProductId: '409',
                    offer3_upProdId: '294',
                    offer3_downProductId: '146'
                },
                flexiHealth: {
                    offer1_upProdId: '625',
                    offer1_downProductId: '625',
                    offer2_upProdId: '793',
                    offer2_downProductId: '795',
                    offer3_upProdId: '542',
                    offer3_downProductId: '543'
                },

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
        [key: string]: string[] | {
            [key: string]: string[]; // Each campaign for a brand will have an array of strings
        };
    };
    campaignIds?: {
        [key: string]: {
            [key: string]: string;
        };
    };
    productIds?: upsellProductIdsInterface;
};

type upsellProductIdsInterface = {
    NYMBUS: {
        [key: string]: {
            offer1_upProdId: string;
            offer1_downProductId: string;
            offer2_upProdId: string;
            offer2_downProductId: string;
            offer3_upProdId: string;
            offer3_downProductId: string;
            offer4_upProdId?: string;
            offer4_downProductId?: string;
        };
    };
    HELIKON: {
        [key: string]: {
            offer1_upProdId: string;
            offer1_downProductId: string;
            offer2_upProdId: string;
            offer2_downProductId: string;
            offer3_upProdId: string;
            offer3_downProductId: string;
        };
    };
    [key: string]: {
        [key: string]: {
            offer1_upProdId: string;
            offer1_downProductId: string;
            offer2_upProdId: string;
            offer2_downProductId: string;
            offer3_upProdId: string;
            offer3_downProductId: string;
            offer4_upProdId?: string;
            offer4_downProductId?: string;
        };
    };
};
