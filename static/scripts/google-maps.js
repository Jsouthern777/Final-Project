function initMapForEvent(eventId, latitude, longitude, eventName) {
    const eventLocation = { lat: latitude, lng: longitude };
    const map = new google.maps.Map(document.getElementById(`map-container-${eventId}`), {
        center: eventLocation,
        zoom: 12,
    });
    const marker = new google.maps.Marker({
        position: eventLocation,
        map: map,
        title: eventName,
    });
}
window.initializeEventMaps = function (events) {
    if (!events || events.length === 0) {
        console.error("No events data available.");
        return;
    }
    events.forEach(event => {
        initMapForEvent(event.id, event.latitude, event.longitude, event.name);
    });
};
export {};
