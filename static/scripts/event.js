"use strict";
async function fetchEvents() {
    try {
        const response = await fetch('/api/events/');
        if (!response.ok) {
            throw new Error(`Failed to fetch events: ${response.statusText}`);
        }
        return await response.json();
    }
    catch (error) {
        console.error("Error fetching events:", error);
        return [];
    }
}
async function fetchRsvpCount(eventId) {
    try {
        const response = await fetch(`/api/v1/events/${eventId}/rsvp_count`);
        if (!response.ok) {
            throw new Error(`Failed to fetch RSVP count: ${response.statusText}`);
        }
        const data = await response.json();
        return data.rsvp_count;
    }
    catch (error) {
        console.error("Error fetching RSVP count:", error);
        return 0;
    }
}
async function updateRsvpCount(eventId) {
    const rsvpCount = await fetchRsvpCount(eventId);
    const rsvpElement = document.getElementById(`rsvp-count-${eventId}`);
    if (rsvpElement) {
        rsvpElement.textContent = `${rsvpCount} people RSVPed`;
    }
}
async function fetchUserActions(eventId) {
    try {
        const [rsvpResponse, reportResponse] = await Promise.all([
            fetch(`/fetchuserrsvp/${eventId}/`),
            fetch(`/fetchuserreport/${eventId}/`)
        ]);
        if (!rsvpResponse.ok || !reportResponse.ok) {
            throw new Error(`Failed to fetch user actions for event ${eventId}`);
        }
        const rsvpData = await rsvpResponse.json();
        const reportData = await reportResponse.json();
        return {
            rsvpStatus: rsvpData.rsvp,
            reportStatus: reportData.report
        };
    }
    catch (error) {
        console.error("Error fetching user actions:", error);
        return { rsvpStatus: false, reportStatus: false };
    }
}
function toggleButtonState(button, currentText, newText, actionType) {
    button.textContent = button.textContent === currentText ? newText : currentText;
    button.dataset.action = actionType;
}
function handleRsvp(event) {
    return async (e) => {
        const button = e.target;
        const isRsvp = button.dataset.action === "rsvp";
        toggleButtonState(button, "RSVP", "Un-RSVP", isRsvp ? "unrsvp" : "rsvp");
        try {
            const response = await fetch(`/rsvp/${event.id}/`, { method: "POST" });
            if (!response.ok) {
                console.error(`Failed to update RSVP for event ${event.id}`);
            }
            await updateRsvpCount(event.id);
        }
        catch (error) {
            console.error("Error updating RSVP:", error);
        }
    };
}
function handleReport(event) {
    return async (e) => {
        const button = e.target;
        const isReport = button.dataset.action === "report";
        toggleButtonState(button, "Report", "Unreport", isReport ? "unreport" : "report");
        try {
            const response = await fetch(`/report/${event.id}/`, { method: "POST" });
            if (!response.ok) {
                console.error(`Failed to update report status for event ${event.id}`);
            }
        }
        catch (error) {
            console.error("Error updating report:", error);
        }
    };
}
async function renderEvents(events) {
    const container = document.getElementById('events-container');
    if (!container)
        return;
    if (events.length === 0) {
        container.innerHTML = '<p>No events found.</p>';
        return;
    }
    const eventHTML = await Promise.all(events.map(async (event) => {
        const { rsvpStatus, reportStatus } = await fetchUserActions(event.id);
        return `
            <div class="event-card">
                <h3>${event.name}</h3>
                <p><strong>Group:</strong> ${event.groupName}</p>
                ${event.logo ? `<img src="/static/${event.logo}" alt="Event Logo">` : ''}
                <p>${event.description || 'No description available.'}</p>
                <p><strong>Date and time:</strong> ${event.dateTime || 'Not specified.'}</p>
                <p id="rsvp-count-${event.id}">${event.numRSVP !== null ? `${event.numRSVP} people RSVPed` : 'No RSVPs yet.'}</p>
                <div class="event-btn-container">
                    <form action="/more_info/${event.id}" method="get">
                        <button type="submit" class="button">More Info</button>
                    </form>
                    <button class="rsvp-btn button" data-action="${rsvpStatus ? 'unrsvp' : 'rsvp'}" data-event-id="${event.id}">${rsvpStatus ? 'Un-RSVP' : 'RSVP'}</button>
                    <button class="report-btn button" data-action="${reportStatus ? 'unreport' : 'report'}" data-event-id="${event.id}">${reportStatus ? 'Unreport' : 'Report'}</button>
                </div>
            </div>
        `;
    }));
    container.innerHTML = `<div class="event-list">${eventHTML.join('')}</div>`;
    const rsvpButtons = container.querySelectorAll('.rsvp-btn');
    const reportButtons = container.querySelectorAll('.report-btn');
    rsvpButtons.forEach((button, index) => {
        button.addEventListener('click', handleRsvp(events[index]));
    });
    reportButtons.forEach((button, index) => {
        button.addEventListener('click', handleReport(events[index]));
    });
}
document.addEventListener('DOMContentLoaded', async () => {
    const events = await fetchEvents();
    renderEvents(events);
});
