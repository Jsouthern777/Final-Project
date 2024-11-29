export {};

// Extend the Window interface to include `initializeEventMaps`
declare global {
    interface Window {
      initializeEventMaps: (events: Event[]) => void;
    }
  }
  
  interface Event {
    id: string;
    latitude: number;
    longitude: number;
    name: string;
  }
  
  function initMapForEvent(eventId: string, latitude: number, longitude: number, eventName: string): void {
    const eventLocation = { lat: latitude, lng: longitude };
    const map = new google.maps.Map(document.getElementById(`map-container-${eventId}`) as HTMLElement, {
      center: eventLocation,
      zoom: 12,
    });
  
    const marker = new google.maps.Marker({
      position: eventLocation,
      map: map,
      title: eventName,
    });
  }
  
  // Attach initializeEventMaps to the global window object
  window.initializeEventMaps = function (events: Event[]): void {
    if (!events || events.length === 0) {
      console.error("No events data available.");
      return;
    }
  
    events.forEach(event => {
      initMapForEvent(event.id, event.latitude, event.longitude, event.name);
    });
  };