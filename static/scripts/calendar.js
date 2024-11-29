var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var HolidaysAPI;
(function (HolidaysAPI) {
    HolidaysAPI.currentMeme = null;
    HolidaysAPI.baseURL = "https://holidayapi.com";
    HolidaysAPI.months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    HolidaysAPI.monthStartDays = [0, 3, 3, 6, 1, 4, 6, 2, 5, 0, 3, 5];
    HolidaysAPI.numDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    HolidaysAPI.currentMonth = 1;
})(HolidaysAPI || (HolidaysAPI = {}));
var EventsAPI;
(function (EventsAPI) {
    EventsAPI.baseURL = '/api/v1/events';
})(EventsAPI || (EventsAPI = {}));
document.addEventListener("DOMContentLoaded", async () =>  __awaiter(this, void 0, void 0, function* () {
    getHolidays();
    const currentDate = Date();
    const month = currentDate.getMonth();
    setMonth(month);
    const previousButton = document.getElementById("previous-month");
    previousButton.addEventListener("click", backMonth);
    const nextButton = document.getElementById("next-month");
    nextButton.addEventListener("click", nextMonth);
}));
function getHolidays(month) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `${HolidaysAPI.baseURL}/v1/holidays`;
        const params = new URLSearchParams({
            country: "US",
            year: "2023",
        month: `${month + 1}`,
        pretty: "true",
        key: "bac573e4-8382-420b-8953-b809ce98d3bf",
        });
        const response = yield fetch(`${url}?${params.toString()}`);
        const holidays = (yield validateJSON(response));
        console.log("Holidays:", holidays);
    });
}
function validateJSON(response) {
    return __awaiter(this, void 0, void 0, function* () {
        if (response.ok) {
            return response.json();
        }
        else {
            return Promise.reject(response);
        }
    });
}
