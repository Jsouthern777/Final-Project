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
document.addEventListener("DOMContentLoaded", () => __awaiter(this, void 0, void 0, function* () {
    const currentDate = new Date();
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
        return holidays;
    });
}
function getEvents(month) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `${EventsAPI.baseURL}/${month}`;
        const response = yield fetch(`${url}`);
        const events = (yield validateJSON(response));
        return events;
    });
}
function backMonth() {
    let month = HolidaysAPI.currentMonth;
    if (month > 0) {
        month -= 1;
        setMonth(month);
    }
}
function nextMonth() {
    let month = HolidaysAPI.currentMonth;
    if (month < 11) {
        month += 1;
        setMonth(month);
    }
}
function setMonth(month) {
    HolidaysAPI.currentMonth = month;
    const monthDiv = document.getElementById("month-name");
    monthDiv.innerText = HolidaysAPI.months[month];
    const startDay = HolidaysAPI.monthStartDays[month];
    const numDays = HolidaysAPI.numDays[month];
    fillMonth(startDay, numDays, month);
}
function fillMonth(startDay, numDays, month) {
    return __awaiter(this, void 0, void 0, function* () {
        const eventsPromise = getEvents(month);
        const holidaysPromise = getHolidays(month);
        const events = yield eventsPromise;
        const holidays = yield holidaysPromise;
        const dateTable = document.getElementById("date-table-contents");
        dateTable.innerHTML = "";
        let day = 1;
        let monthFilled = false;
        for (let week = 1; week <= 6; week++) {
            if (monthFilled) {
                continue;
            }
            const row = dateTable.insertRow();
            for (let i = 1; i <= 7; i++) {
                const cell = row.insertCell();
                if (week == 1 && i < startDay) {
                    cell.innerText = "    ";
                }
                else if (day > numDays) {
                    cell.innerText = "    ";
                }
                else {
                    cell.innerText = day.toString();
                    if (events) {
                        checkForEvent(day, cell, events);
                    }
                    else {
                        console.log("Error: No events found");
                    }
                    if (holidays) {
                        console.log("Checking for holidays on day:", day);
                        checkForHoliday(day, cell, holidays);
                    }
                    else {
                        console.log("Error: No events found");
                    }
                    day += 1;
                    if (day > numDays) {
                        monthFilled = true;
                    }
                }
            }
        }
    });
}
function checkForEvent(day, element, events) {
    for (const event of events) {
        const eventDate = new Date(event.dateTime);
        if (eventDate.getDate() === day) {
            element.innerText += ` - ${event.name}`;
            element.classList.add("event-day");
        }
    }
}
function checkForHoliday(day, element, holidays) {
    for (const holiday of holidays.holidays) {
        const eventDate = new Date(holiday.date);
        if (eventDate.getDate() === day) {
            element.innerText += ` ${holiday.name}`;
            element.classList.add("holiday-day");
        }
    }
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
