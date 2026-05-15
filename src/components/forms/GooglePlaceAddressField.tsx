import React, { useEffect, useRef, useState } from 'react';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { loadGoogleMapsApi } from '@/utils/googleMaps';

type PlaceInputProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  onCoordinatesChange?: (coordinates: string) => void;
  active: boolean;
  mapsReady: boolean;
  mapsError: string | null;
  placeholder: string;
  inputId: string;
  hasError: boolean;
};

function PlaceAutocompleteInput({
  value,
  onChange,
  onBlur,
  onCoordinatesChange,
  active,
  mapsReady,
  mapsError,
  placeholder,
  inputId,
  hasError,
}: PlaceInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  const onCoordinatesRef = useRef(onCoordinatesChange);

  onChangeRef.current = onChange;
  onCoordinatesRef.current = onCoordinatesChange;

  useEffect(() => {
    if (!active || !mapsReady || !inputRef.current || !window.google?.maps?.places) {
      return;
    }

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      fields: ['formatted_address', 'geometry'],
      types: ['address'],
    });

    const listener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      const formatted = place.formatted_address?.trim();
      if (!formatted) return;

      onChangeRef.current(formatted);

      const location = place.geometry?.location;
      if (location && onCoordinatesRef.current) {
        onCoordinatesRef.current(`${location.lat()},${location.lng()}`);
      }
    });

    return () => {
      listener.remove();
      window.google?.maps?.event?.clearInstanceListeners(autocomplete);
    };
  }, [active, mapsReady]);

  return (
    <Input
      ref={inputRef}
      id={inputId}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={
        mapsError ? 'Escribe la dirección manualmente (Google Maps no configurado)' : placeholder
      }
      autoComplete="off"
      className={cn(hasError && 'border-red-500 pr-10')}
    />
  );
}

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  required?: boolean;
  active?: boolean;
  onCoordinatesChange?: (coordinates: string) => void;
};

export function GooglePlaceAddressField<T extends FieldValues>({
  control,
  name,
  label = 'Dirección',
  placeholder = 'Escribe y selecciona la dirección del cliente…',
  required = false,
  active = true,
  onCoordinatesChange,
}: Props<T>) {
  const [mapsReady, setMapsReady] = useState(false);
  const [mapsError, setMapsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadGoogleMapsApi()
      .then(() => {
        if (!cancelled) setMapsReady(true);
      })
      .catch((error) => {
        if (!cancelled) {
          setMapsError(error instanceof Error ? error.message : 'No se pudo cargar Google Maps.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div className="space-y-2">
          <Label htmlFor={String(name)} className={cn(error && 'text-red-500')}>
            {label} {required ? '*' : null}
          </Label>
          <div className="relative">
            <PlaceAutocompleteInput
              value={field.value ?? ''}
              onChange={field.onChange}
              onBlur={field.onBlur}
              onCoordinatesChange={onCoordinatesChange}
              active={active}
              mapsReady={mapsReady}
              mapsError={mapsError}
              placeholder={placeholder}
              inputId={String(name)}
              hasError={Boolean(error)}
            />
            {error ? (
              <AlertCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-red-500" />
            ) : null}
          </div>
          <p
            className={cn(
              'text-xs',
              mapsError ? 'text-amber-700 dark:text-amber-300' : 'text-muted-foreground'
            )}
          >
            {mapsError
              ? `${mapsError} Puedes escribir la dirección a mano. Para autocompletado Google, configura VITE_GOOGLE_MAPS_API_KEY en .env`
              : mapsReady
                ? 'Busca la dirección indicada por el cliente y elige una opción de la lista de Google.'
                : 'Cargando buscador de direcciones…'}
          </p>
          {error ? <p className="text-xs text-red-500">{error.message}</p> : null}
        </div>
      )}
    />
  );
}
