import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from 'react';

interface Location {
  latitude: number;

  longitude: number;
}

interface LocationContextType {
  location: Location | null;

  setLocation: (
    location: Location
  ) => void;
}

const LocationContext =
  createContext<LocationContextType>({
    location: null,

    setLocation: () => {},
  });

export const LocationProvider =
  ({
    children,
  }: {
    children: ReactNode;
  }) => {
    const [location,
      setLocation] =
      useState<Location | null>(
        null
      );

    return (
      <LocationContext.Provider
        value={{
          location,
          setLocation,
        }}
      >
        {children}
      </LocationContext.Provider>
    );
  };

export const useLocation =
  () =>
    useContext(
      LocationContext
    );