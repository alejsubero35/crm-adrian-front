declare namespace google.maps.places {
  interface PlaceResult {
    formatted_address?: string;
    geometry?: {
      location?: {
        lat(): number;
        lng(): number;
      };
    };
  }

  class Autocomplete {
    constructor(
      inputField: HTMLInputElement,
      opts?: {
        fields?: string[];
        types?: string[];
        componentRestrictions?: { country: string | string[] };
      }
    );
    addListener(eventName: string, handler: () => void): MapsEventListener;
    getPlace(): PlaceResult;
  }

  interface MapsEventListener {
    remove(): void;
  }
}

declare namespace google.maps {
  namespace event {
    function clearInstanceListeners(instance: object): void;
  }
}

declare namespace google {
  const maps: {
    places: typeof google.maps.places;
    event: typeof google.maps.event;
  };
}

interface Window {
  google?: typeof google;
}
