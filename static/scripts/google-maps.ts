let map;
export async function initMap(lat: number, lng: number, elementId: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (element) {
    const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

      const eventLocation = { lat: lat, lng: lng };
      map = new Map(element, {
          zoom: 8,
          center: eventLocation
      });
      const marker = new AdvancedMarkerElement({
          position: eventLocation,
          map: map
      });
  } else {
      console.error(`Element with ID ${elementId} not found.`);
  }
}




