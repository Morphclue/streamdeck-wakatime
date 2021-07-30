const axios = require("axios");

export const fetchWakatimeStats = async ({ username }) => {
    try {
        const { data } = await axios.get(
            `https://wakatime.com/api/v1/users/${username}/durations?date=today`,
        );

        return data.data;
    } catch (err) {
        if (err.response.status < 200 || err.response.status > 299) {
            throw new Error(
                "Wakatime user not found.",
            );
        }
        throw err;
    }
};
