// google credentials
import { google } from "googleapis";
const googleJSON = {
    "type": "service_account",
    "project_id": "nymbus-vips",
    "private_key_id": "3c1d03a0226927b08c2a1b8f97389ace1382eb54",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDQxaSiUHXjSgbb\nKxhyaOV2DyijrDhoQb//bALfjLOaonUlEC1ufXVN0YvrLzysx56pvvhXFwVF5+Xi\nYyYoi3Na1z4zRQzE/PhLRBgkE3UTie3f/CGmbwrRwAj7AlVjo/BGxm8Ox9YK8nk1\noOe09NXgyPRzSLH9ZB/SeHruUpjb6rU8Htthn/s19bSqynGgGEV0q7LXwQZk22aS\nMHIcw0whhFdmH6UUvr/A4dV3GGocGVdrv9i8ZfI0wjCygWgw98hnN3D7liiXvNld\nT4y/XgFY8YOG+tcyXLmt4XbeUlc1dYX5S5CJfaUGUPr8uRCF/IjTLOz10b65+y8V\niFAnZwUrAgMBAAECggEAGxAb1NyoQ4PzmpKeEyqs4B577qejEkS/rk0inDcBi0CW\n/ex4bzO9Mo7A3AZeD6m61BdI2wVFbjfu8WdX6XaWSAbR7dR8IMcIKr2TgY2yJgvB\ntcDZ3djUJreFkoBNcGKugYY0nE5kXTvsYXrPvoHkfcSfB5i7VfUWOPLcQKudXBh3\nJiKwobCdNM7RSuRtChKThfl6L73WDbzT8Y/STizx1EiPZ8uIFFs+Pa5GF592wQV9\nvS7v0dxLVfmoQSQBAhQWVKwE9dfnV8drvUvLIi2GIDy1bZW07EV2L7qz46camhdI\nUQBudl7UFf0Ga4EwfxbfsW9RhS2dp4Zi5SCNJZ5hbQKBgQDTy4NSCbDQJAvJJ5WX\nACSnUo1TURK8hAf+gFWnFiu3gEJPNuWkIyCDas5Q/GWGXnKOU+GdNfSt7ewv53x6\nH6VTtuSW1TC59zl+7HDH+4fKjA2M8VJlcu2rmFjnI22+GBzmS0f3Zdaj2wx57uTy\nb7Iop59S90vzsys/NYjNdWkVZwKBgQD8WJxq2hbEVPH6SWdUcJ+SfDAd8uPP4U+/\nUy0jGznhSG1rLX7sSmWkUIQiM6CDBwjVGKGWq5vayTGxVjqMV4fPYhI6Bi//6SCL\nbn0XuUFQljutWeJJGSUfnbnAP99sKhx62RFHqfqr/KHryU0t4j0X4qjb1hRI66kg\nmcIewIfTnQKBgQCxYkzdI+KjoN0CH5Yo/uS0Au78rfU8UHSFkiSqqWX57YEb6UWS\nIB12E7kymQHK9UWKsPRQAEWqeo+LW5ykh+am45I2Rd3mkwnjpNGcnK0RVhVvSxqQ\nfx5Rzmn/RGwAfx+NPdXLfc60M50SbqPv7N7RL/q/uQEy3YfGC+dE9SYK1wKBgQCg\naMOluNTYIRdg/uBMcPs+5uq/XvMp5hQHjxwWQOxeJOhJRTZ1hiVuejBEfYT/Ra17\nqJivao88WMDZ9fJp3Apc7f6gG+bPSqaBe87REdZPH/D3lTefN/i9TEoTx4aC/5Hz\nFaFCaO8L/SAA/omtLS+gy1iDxmZGpGdybctUORcekQKBgDIUSNKI1SXC7kXS8xNQ\nLWBTGPGdZLV650Ism9wAqjAgUvVPkWA5AE2J3gSIHBUZiocMhhPFqLnPMKYYFjJX\ne63JcNwMKJjXO/clgsLMwFNtCXRj1MYRG5L/3SGyfaBPNILs8Rz7iFVuomM6A4xS\nx5ucMiTqViNPCqnOiu/6Rkui\n-----END PRIVATE KEY-----\n",
    "client_email": "nymbus-vips@nymbus-vips.iam.gserviceaccount.com",
    "client_id": "102506474609318836645",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/nymbus-vips%40nymbus-vips.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
}

const auth = new google.auth.GoogleAuth({
    credentials: googleJSON,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth });
export default sheets;