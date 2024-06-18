import JellyfinClient from "./client";

export const client = new JellyfinClient(process.env.JELLYFIN_HOST!, process.env.JELLYFIN_USERNAME!, process.env.JELLYFIN_PASSWORD!);

client.authenticate().then(async (success) => {

    if (!success) {
        console.error("Failed to authenticate with Jellyfin server");
        process.exit(1);
    }

});
