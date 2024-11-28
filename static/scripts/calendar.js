var HolidaysAPI;
(function (HolidaysAPI) {
    HolidaysAPI.currentMeme = null;
    HolidaysAPI.baseURL = "https://holidayapi.com";
    HolidaysAPI.months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
})(HolidaysAPI || (HolidaysAPI = {}));
document.addEventListener("DOMContentLoaded", async () => {
    getHolidays();
    const currentDate = Date();
});
async function getHolidays() {
    const url = `${HolidaysAPI.baseURL}/v1/holidays`;
    const params = new URLSearchParams({
        country: "US",
        year: "2023",
        pretty: "true",
        key: "bac573e4-8382-420b-8953-b809ce98d3bf",
    });
    const response = await fetch(`${url}?${params.toString()}`);
    const holidays = (await validateJSON(response));
    console.log("Holidays:", holidays);
}
async function validateJSON(response) {
    if (response.ok) {
        return response.json();
    }
    else {
        return Promise.reject(response);
    }
}
