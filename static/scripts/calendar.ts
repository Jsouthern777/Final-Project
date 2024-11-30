namespace HolidaysAPI {
    export let currentMeme: Holiday | null = null;
    export const baseURL: string = "https://holidayapi.com";
    export interface Holiday {
        country: string;
        date: string;
        name: string;
        observed: string;
        public: boolean;
        uuid: string;
        weekday: [Obj];
    }
    export interface Obj {
        name: string 
        numeric: string
    }
    export interface observed extends Obj{
        Prototype: string
    }
    export interface date extends Obj{
        Prototype: string
    }

    export interface HolidayList {
        success: boolean;
        data: undefined | { holidays: Array<Holiday>; };
        [Symbol.iterator](): Iterator<Holiday>;
    }

    // definees a 'subclass' of HTMLDivElement which allows it to store a meme
    export interface HolidayDiv extends HTMLDivElement {
        holiday: undefined | Holiday;
    }

    export const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    export const monthStartDays = [0, 3, 3, 6, 1, 4, 6, 2, 5, 0, 3, 5]
    export const numDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    export let currentMonth = 1;
}

namespace EventsAPI{
    export const baseURL: string = '/api/v1/events';
    export interface Event {
        dateTime: string,
        description: string | null,
        groupname: string | null,
        id: number,
        logo: string | null, 
        name: string | null,
        numRSVP: string | null,
        numReports: string | null
    }
    export interface EventList {
        events: Array<Event>;
        [Symbol.iterator](): Iterator<Event>;
    }
}


document.addEventListener("DOMContentLoaded", async () => {
    const currentDate = new Date();
    const month = currentDate.getMonth();
    setMonth(month);

    const previousButton = document.getElementById("previous-month");
    const nextButton = document.getElementById("next-month");
    
    if (previousButton) {
        previousButton.addEventListener("click", backMonth);
    } else {
        console.error("Previous button not found");
    }

    if (nextButton) {
        nextButton.addEventListener("click", nextMonth);
    } else {
        console.error("Next button not found");
    }
});



async function getHolidays(month: number): Promise<HolidaysAPI.HolidayList> {
    const url = `${HolidaysAPI.baseURL}/v1/holidays`;
    const params = new URLSearchParams({
      country: "US",
      year: "2023",
      month: `${month+1}`,
      pretty: "true",
      key: "bac573e4-8382-420b-8953-b809ce98d3bf",
    });
    
    const response = await fetch(`${url}?${params.toString()}`);
    const holidays = <HolidaysAPI.HolidayList> (await validateJSON(response))
    return holidays;
  }


async function getEvents(month: number): Promise<EventsAPI.EventList> {
    const url =`${EventsAPI.baseURL}/${month}`
    const response = await fetch(`${url}`);
    const events = <EventsAPI.EventList> (await validateJSON(response))
    return events;
}


function backMonth(){
    let month = HolidaysAPI.currentMonth
    if(month > 0){
        month-=1
        setMonth(month)
    }
}


function nextMonth(){
    let month = HolidaysAPI.currentMonth
    if(month < 11){
        month+=1
        setMonth(month)
    }
}


function setMonth(month: number) {
    HolidaysAPI.currentMonth = month;
    const monthDiv = document.getElementById("month-name");

    if (monthDiv) {
        monthDiv.innerText = HolidaysAPI.months[month];
    } else {
        console.error("Month name div not found");
    }

    const startDay = HolidaysAPI.monthStartDays[month];
    const numDays = HolidaysAPI.numDays[month];

    fillMonth(startDay, numDays, month);
}



async function fillMonth(startDay: number, numDays: number, month: number) {
    const eventsPromise: Promise<EventsAPI.EventList> = getEvents(month);
    const holidaysPromise: Promise<HolidaysAPI.HolidayList> = getHolidays(month);

    const events = await eventsPromise;
    console.log(events)
    const holidays = await holidaysPromise;
    console.log(holidays)

    const dateTable = <HTMLTableElement> document.getElementById("date-table-contents");
    dateTable.innerHTML = "";
    let day = 1
    let  monthFilled = false

    for (let week=1; week <= 6; week++) {

        if(monthFilled){
            continue
        }

        const row = dateTable.insertRow()

        for(let i = 1; i <= 7; i++){
            const cell = row.insertCell(); 

            if(week == 1 && i < startDay) {
                cell.innerText = "    "
            }

            else if(day > numDays){
                cell.innerText = "    "
            }

            else{
                cell.innerText = day.toString()
                if (events) {
                    checkForEvent(day, cell, events);
                    
                }else {
                    console.log("Error: No events found");
                }

                if (holidays) {
                    console.log("Checking for holidays on day:", day);
                    console.log(holidays)
                    checkForHoliday(day, cell, holidays);
                }else {
                    console.log("Error: No holidays found");
                }

                day+=1
                if(day > numDays){
                    monthFilled = true
                }
            }
        }
    }
}

function checkForEvent(day: number, element: HTMLElement, events: EventsAPI.EventList): void{
    for (const event of events) {
        const eventDate = new Date(event.dateTime); 
        if (eventDate.getDate() === day) {
            element.innerText += ` - ${event.name}`; 
            element.classList.add("event-day"); 
        }
    }
}


function checkForHoliday(day: number, element: HTMLElement, holidays: HolidaysAPI.HolidayList): void{
    for (const holiday of holidays.holidays) {
        const eventDate = new Date(holiday.date); 
        if (eventDate.getDate() === day) {
            element.innerText += ` ${holiday.name}`; 
            element.classList.add("holiday-day"); 
        }
    }
}


async function validateJSON(response: Response): Promise<any> {
    if (response.ok) {
        return response.json();
    } else {
        return Promise.reject(response);
    }
}