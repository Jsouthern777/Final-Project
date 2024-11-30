"use strict";
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
document.addEventListener("DOMContentLoaded", async () => {
    const currentDate = new Date();
    const month = currentDate.getMonth();
    setMonth(month);
    const previousButton = document.getElementById("previous-month");
    const nextButton = document.getElementById("next-month");
    if (previousButton) {
        previousButton.addEventListener("click", backMonth);
    }
    else {
        console.error("Previous button not found");
    }
    if (nextButton) {
        nextButton.addEventListener("click", nextMonth);
    }
    else {
        console.error("Next button not found");
    }
});
async function getHolidays(month) {
    const url = `${HolidaysAPI.baseURL}/v1/holidays`;
    const params = new URLSearchParams({
        country: "US",
        year: "2023",
        month: `${month + 1}`,
        pretty: "true",
        key: "bac573e4-8382-420b-8953-b809ce98d3bf",
    });
    const response = await fetch(`${url}?${params.toString()}`);
    const holidays = (await validateJSON(response));
    return holidays;
}
async function getEvents(month) {
    const url = `${EventsAPI.baseURL}/${month}`;
    const response = await fetch(`${url}`);
    const events = (await validateJSON(response));
    return events;
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
    if (monthDiv) {
        monthDiv.innerText = HolidaysAPI.months[month];
    }
    else {
        console.error("Month name div not found");
    }
    const startDay = HolidaysAPI.monthStartDays[month];
    const numDays = HolidaysAPI.numDays[month];
    fillMonth(startDay, numDays, month);
}
async function fillMonth(startDay, numDays, month) {
    const eventsPromise = getEvents(month);
    const holidaysPromise = getHolidays(month);
    const events = await eventsPromise;
    const holidays = await holidaysPromise;
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
    for (const holiday of holidays) {
        const eventDate = new Date(holiday.date);
        if (eventDate.getDate() === day) {
            element.innerText += ` ${holiday.name}`;
            element.classList.add("holiday-day");
        }
    }
}
async function validateJSON(response) {
    if (response.ok) {
        return response.json();
    }
    else {
        return Promise.reject(response);
    }
}
