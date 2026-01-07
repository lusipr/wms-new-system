"use client";

import { useDebounce } from "@/hooks/use-debounce";
import { GoogleMap, useLoadScript } from "@react-google-maps/api";
import React, {
  ChangeEvent,
  Dispatch,
  MouseEvent,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import { Command, CommandGroup, CommandItem, CommandList } from "./ui/command";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { MapIcon, XCircle } from "lucide-react";
import { apiGMaps } from "@/lib/utils";

const MapPicker = ({
  input,
  setInput,
}: {
  input: any;
  setInput: Dispatch<SetStateAction<any>>;
}) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: apiGMaps,
    libraries: ["places"],
  });

  if (!isLoaded) {
    return <p>Loading....</p>;
  }
  return <Maps input={input} setInput={setInput} />;
};

const Maps = ({
  input,
  setInput,
}: {
  input: {
    address: string;
    kecamatan?: string;
    kabupaten?: string;
    provinsi?: string;
    latitude?: string;
    longitude?: string;
  };
  setInput: Dispatch<
    SetStateAction<{
      address: string;
      kecamatan?: string;
      kabupaten?: string;
      provinsi?: string;
      latitude?: string;
      longitude?: string;
    }>
  >;
}) => {
  // center marker by lat lng
  const center = useMemo(
    () => ({
      lat: -6.175392,
      lng: 106.827153,
    }),
    []
  );

  //   center position
  const [centerPosition, setCenterPosition] = useState(center);

  // Referensi untuk objek Google Map
  const mapRef = useRef<google.maps.Map | null>(null);

  //   use-places-autocomplete
  const {
    ready,
    setValue,
    suggestions: { data, status },
    clearSuggestions,
  } = usePlacesAutocomplete();

  //   fetch data for every setValue to get suggest
  const [fetchData, setFetchData] = useState(false);

  //   to debounce address
  const placeDebounce = useDebounce(input.address);

  //   zoom maps
  const [zoomLevel, setZoomLevel] = useState(14);

  //   debounce at address change
  useEffect(() => {
    setValue(placeDebounce, fetchData);
  }, [placeDebounce]);

  //   handle select suggest
  const handleSelect = async (address: any) => {
    setValue(address, false);
    clearSuggestions();

    const results = await getGeocode({ address });
    const { lat, lng } = getLatLng(results[0]);

    const newAddress = results[0].address_components;

    const hasPlusCode = newAddress[0]?.types.includes("plus_code");
    // Mulai map dari elemen kedua jika `plus_code` ditemukan
    const startIndex = hasPlusCode ? 1 : 0;

    // Map untuk mengambil `short_name` dan menggabungkannya dengan koma
    const formated_address = newAddress
      .slice(startIndex)
      .map((component) => component.short_name)
      .join(", ");

    setInput({
      address: formated_address,
      kecamatan:
        newAddress
          .find((item) => item.types.includes("administrative_area_level_3"))
          ?.long_name.replace("Kecamatan", "")
          .trim() ?? "Not Found",
      kabupaten:
        newAddress
          .find((item) => item.types.includes("administrative_area_level_2"))
          ?.long_name.replace("Kabupaten", "")
          .trim() ?? "Not Found",
      provinsi:
        newAddress.find((item) =>
          item.types.includes("administrative_area_level_1")
        )?.long_name ?? "Not Found",
      latitude: lat.toString(),
      longitude: lng.toString(),
    });
    setFetchData(false);
    setCenterPosition({ lat, lng });
  };

  //   handle drag end
  const handleDragEnd = async () => {
    if (mapRef.current) {
      const newCenter = {
        lat: mapRef.current.getCenter()?.lat() ?? center.lat,
        lng: mapRef.current.getCenter()?.lng() ?? center.lng,
      };
      setCenterPosition(newCenter);

      const results = await getGeocode({ location: newCenter });
      const { lat, lng } = getLatLng(results[0]);

      const newAddress = results[0].address_components;

      const hasPlusCode = newAddress[0]?.types.includes("plus_code");
      // Mulai map dari elemen kedua jika `plus_code` ditemukan
      const startIndex = hasPlusCode ? 1 : 0;

      // Map untuk mengambil `short_name` dan menggabungkannya dengan koma
      const formated_address = newAddress
        .slice(startIndex)
        .map((component) => component.short_name)
        .join(", ");

      setInput({
        address: formated_address,
        kecamatan:
          newAddress
            .find((item) => item.types.includes("administrative_area_level_3"))
            ?.long_name.replace("Kecamatan", "")
            .trim() ?? "Not Found",
        kabupaten:
          newAddress
            .find((item) => item.types.includes("administrative_area_level_2"))
            ?.long_name.replace("Kabupaten", "")
            .trim() ?? "Not Found",
        provinsi:
          newAddress.find((item) =>
            item.types.includes("administrative_area_level_1")
          )?.long_name ?? "Not Found",
        latitude: lat.toString(),
        longitude: lng.toString(),
      });
      setFetchData(false);
    }
  };

  //   handle change zoom
  const handleZoomChanged = async () => {
    if (mapRef.current) {
      const newCenter = {
        lat: mapRef.current.getCenter()?.lat() ?? center.lat,
        lng: mapRef.current.getCenter()?.lng() ?? center.lng,
      };
      setCenterPosition(newCenter);
      setZoomLevel(mapRef.current?.getZoom() ?? 14);

      const results = await getGeocode({ location: newCenter });
      const { lat, lng } = getLatLng(results[0]);

      const newAddress = results[0].address_components;

      const hasPlusCode = newAddress[0]?.types.includes("plus_code");
      // Mulai map dari elemen kedua jika `plus_code` ditemukan
      const startIndex = hasPlusCode ? 1 : 0;

      // Map untuk mengambil `short_name` dan menggabungkannya dengan koma
      const formated_address = newAddress
        .slice(startIndex)
        .map((component) => component.short_name)
        .join(", ");

      setInput({
        address: formated_address,
        kecamatan:
          newAddress
            .find((item) => item.types.includes("administrative_area_level_3"))
            ?.long_name.replace("Kecamatan", "")
            .trim() ?? "Not Found",
        kabupaten:
          newAddress
            .find((item) => item.types.includes("administrative_area_level_2"))
            ?.long_name.replace("Kabupaten", "")
            .trim() ?? "Not Found",
        provinsi:
          newAddress.find((item) =>
            item.types.includes("administrative_area_level_1")
          )?.long_name ?? "Not Found",
        latitude: lat.toString(),
        longitude: lng.toString(),
      });
      setFetchData(false);
    }
  };

  const handleZoomChangeSlider = (e: ChangeEvent<HTMLInputElement>) => {
    const newZoom = parseInt(e.target.value, 10);
    setZoomLevel(newZoom);

    if (mapRef.current) {
      mapRef.current.setZoom(newZoom); // Update zoom level on the map
    }
  };

  //   style maps
  const grayscaleMapStyle = [
    {
      elementType: "geometry",
      stylers: [
        {
          saturation: -100, // Grayscale filter
        },
      ],
    },
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: zoomLevel >= 17 ? "on" : "off" }], // Tampilkan label jika zoom >= 18
    },
    {
      featureType: "administrative",
      elementType: "labels",
      stylers: [
        { visibility: "on" }, // Tampilkan label administratif jika zoom < 18
      ],
    },
    {
      featureType: "road",
      elementType: "labels",
      stylers: [{ visibility: "on" }], // Menampilkan label jalan jika zoom >= 18
    },
  ];

  //   handle clear address
  const handleClear = (e: MouseEvent) => {
    e.preventDefault();
    setInput({
      address: "",
      kecamatan: "",
      kabupaten: "",
      provinsi: "",
      latitude: "0",
      longitude: "0",
    });
    clearSuggestions();
  };

  //   map load
  const handleMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
  };

  //   handle get adress from lat lng
  const handleLatLng = async (lat: number, lng: number) => {
    const results = await getGeocode({ location: { lat, lng } });

    const newAddress = results[0].address_components;

    const hasPlusCode = newAddress[0]?.types.includes("plus_code");
    // Mulai map dari elemen kedua jika `plus_code` ditemukan
    const startIndex = hasPlusCode ? 1 : 0;

    // Map untuk mengambil `short_name` dan menggabungkannya dengan koma
    const formated_address = newAddress
      .slice(startIndex)
      .map((component) => component.short_name)
      .join(", ");

    setInput({
      address: formated_address,
      kecamatan:
        newAddress
          .find((item) => item.types.includes("administrative_area_level_3"))
          ?.long_name.replace("Kecamatan", "")
          .trim() ?? "Not Found",
      kabupaten:
        newAddress
          .find((item) => item.types.includes("administrative_area_level_2"))
          ?.long_name.replace("Kabupaten", "")
          .trim() ?? "Not Found",
      provinsi:
        newAddress.find((item) =>
          item.types.includes("administrative_area_level_1")
        )?.long_name ?? "Not Found",
      latitude: lat.toString(),
      longitude: lng.toString(),
    });
    setFetchData(false);
    setCenterPosition({ lat, lng });
  };

  //   debounce lat lng
  const latDebounce = useDebounce(input.latitude);
  const lngDebounce = useDebounce(input.longitude);

  //   get address every change lat lng
  useEffect(() => {
    if (
      latDebounce &&
      latDebounce !== "0" &&
      lngDebounce &&
      lngDebounce !== "0"
    ) {
      handleLatLng(parseFloat(latDebounce), parseFloat(lngDebounce));
    }
  }, [latDebounce, lngDebounce]);

  return (
    <div className="w-[560px] h-[560px] flex-none relative flex justify-center overflow-hidden">
      <Command className="h-fit absolute top-0 z-10 w-full p-1">
        <div className="w-full relative flex items-center">
          <MapIcon className="size-4 absolute left-3" />
          <Input
            className="px-10 border-sky-400/80 focus-visible:border-sky-500 focus-visible:ring-transparent"
            value={input.address}
            onChange={(e) => {
              setInput((prev) => ({ ...prev, address: e.target.value }));
              setFetchData(true);
            }}
            disabled={!ready}
          />
          {input.address?.length > 0 && (
            <Button
              type="button"
              onClick={handleClear}
              className="px-0 w-8 h-7 bg-transparent justify-start hover:bg-transparent text-black absolute right-0 shadow-none hover:scale-110"
            >
              <XCircle className="size-4" />
            </Button>
          )}
        </div>
        {status === "OK" && (
          <CommandList className="mt-2 rounded-md border border-gray-500">
            <CommandGroup>
              {data.map(({ place_id, description }) => (
                <CommandItem
                  onSelect={() => handleSelect(description)}
                  key={place_id}
                >
                  {description}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        )}
      </Command>
      <div className="w-full h-full mt-12 p-1">
        <div className="w-full h-[505px] relative overflow-hidden rounded border flex items-center justify-center border-sky-400/80 p-3">
          <div className="w-full h-full relative overflow-hidden rounded shadow">
            <GoogleMap
              mapContainerClassName="w-full h-full scale-110"
              options={{
                disableDefaultUI: true, // Menghilangkan semua tombol default
                zoomControl: false, // Menghilangkan tombol zoom (opsional)
                mapTypeControl: false, // Menghilangkan kontrol tipe peta (opsional)
                streetViewControl: false, // Menghilangkan kontrol street view (opsional)
                fullscreenControl: false, // Menghilangkan tombol fullscreen (opsional)
                clickableIcons: false,
                styles: grayscaleMapStyle, // Terapkan gaya grayscale
                maxZoom: 20, // Batas maksimum zoom
                minZoom: 5, // Batas minimum zoom
              }}
              zoom={zoomLevel}
              center={centerPosition}
              onLoad={handleMapLoad} // Simpan referensi objek map
              onDragEnd={handleDragEnd} // Tangani event drag-end
              onZoomChanged={handleZoomChanged}
            />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[calc(50%+20px)] size-10 flex items-center justify-center">
              <svg
                className="size-10"
                xmlns="http://www.w3.org/2000/svg"
                fillRule="evenodd"
                clipRule={"evenodd"}
                imageRendering={"optimizeQuality"}
                style={{
                  shapeRendering: "geometricPrecision",
                  textRendering: "geometricPrecision",
                }}
                viewBox="0 0 1.63 2.02"
              >
                <g>
                  <path
                    className="fill-red-500 stroke-[0.08] stroke-black"
                    d="M1.59 0.82c0,0.48 -0.53,0.99 -0.71,1.14 -0.02,0.01 -0.04,0.02 -0.06,0.02 -0.02,0 -0.04,-0.01 -0.06,-0.02 -0.18,-0.15 -0.72,-0.66 -0.72,-1.14 0,-0.43 0.35,-0.78 0.78,-0.78 0.43,0 0.77,0.35 0.77,0.78zm-0.48 0c0,-0.16 -0.13,-0.29 -0.29,-0.29 -0.16,0 -0.29,0.13 -0.29,0.29 0,0.16 0.13,0.29 0.29,0.29 0.16,0 0.29,-0.13 0.29,-0.29z"
                  />
                </g>
              </svg>
            </div>
            <div className="w-6 h-[150px] bg-white absolute left-3 bottom-3 flex items-center justify-center rounded-md shadow-md border">
              <input
                type="range"
                min="5"
                max="20"
                style={{ accentColor: "#000000" }}
                className="w-[140px] h-2 rounded-full shadow cursor-pointer border border-white -rotate-90 vertical-range"
                value={zoomLevel}
                onChange={handleZoomChangeSlider}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPicker;
