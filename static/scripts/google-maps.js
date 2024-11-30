let map;
export async function initMap(lat, lng, elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        const { Map } = await google.maps.importLibrary("maps");
        const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
        const eventLocation = { lat: lat, lng: lng };
        map = new Map(element, {
            zoom: 15,
            center: eventLocation
        });
        const marker = new google.maps.Marker({
            position: eventLocation,
            map: map,
        });
    }
    else {
        console.error(`Element with ID ${elementId} not found.`);
    }
}

window.initMap = initMap;