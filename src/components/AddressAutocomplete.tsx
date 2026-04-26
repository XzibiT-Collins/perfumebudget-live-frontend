import React, { useEffect, useRef, useState } from 'react';
import { LocateFixed, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from 'use-places-autocomplete';
import { cn } from '../utils';

interface AddressAutocompleteProps {
  label?: string;
  error?: string;
  placeholder?: string;
  defaultValue?: string;
  onAddressSelect: (address: {
    addressLine1: string;
    city: string;
    region: string;
  }) => void;
  className?: string;
  required?: boolean;
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  label,
  error,
  placeholder = 'Start typing your address...',
  defaultValue = '',
  onAddressSelect,
  className,
  required = false,
}) => {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      /* Define search scope here if needed, e.g., country: 'gh' */
    },
    debounce: 300,
  });

  const [isLocating, setIsLocating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue, false);
    }
  }, [defaultValue, setValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        clearSuggestions();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [clearSuggestions]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue(val);
    // Ensure the parent state is updated even for manual input
    onAddressSelect({
      addressLine1: val,
      city: '',
      region: '',
    });
  };

  const handleSelect = ({ description }: { description: string }) => () => {
    setValue(description, false);
    clearSuggestions();

    getGeocode({ address: description }).then((results) => {
      const components = results[0].address_components;
      
      let streetNumber = '';
      let route = '';
      let city = '';
      let region = '';

      components.forEach((component) => {
        const types = component.types;
        if (types.includes('street_number')) {
          streetNumber = component.long_name;
        }
        if (types.includes('route')) {
          route = component.long_name;
        }
        if (types.includes('locality')) {
          city = component.long_name;
        } else if (types.includes('administrative_area_level_2') && !city) {
          city = component.long_name;
        }
        if (types.includes('administrative_area_level_1')) {
          region = component.long_name;
        }
      });

      onAddressSelect({
        addressLine1: `${streetNumber} ${route}`.trim() || description.split(',')[0],
        city,
        region,
      });
    }).catch(() => {
      // Fallback if geocoding fails after selection
      onAddressSelect({
        addressLine1: description.split(',')[0],
        city: '',
        region: '',
      });
    });
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        getGeocode({ location: { lat: latitude, lng: longitude } })
          .then((results) => {
            if (results && results.length > 0) {
              const result = results[0];
              const description = result.formatted_address;
              setValue(description, false);
              clearSuggestions();
              
              const components = result.address_components;
              let streetNumber = '';
              let route = '';
              let city = '';
              let region = '';

              components.forEach((component) => {
                const types = component.types;
                if (types.includes('street_number')) {
                  streetNumber = component.long_name;
                }
                if (types.includes('route')) {
                  route = component.long_name;
                }
                if (types.includes('locality')) {
                  city = component.long_name;
                } else if (types.includes('administrative_area_level_2') && !city) {
                  city = component.long_name;
                }
                if (types.includes('administrative_area_level_1')) {
                  region = component.long_name;
                }
              });

              onAddressSelect({
                addressLine1: `${streetNumber} ${route}`.trim() || description.split(',')[0],
                city,
                region,
              });
              
              toast.success('Location found successfully');
            }
          })
          .catch((error) => {
            toast.error('Could not determine address from location');
            console.error('Reverse geocoding error:', error);
          })
          .finally(() => {
            setIsLocating(false);
          });
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          toast.error('Location permission denied. Please enable it in your settings.');
        } else {
          toast.error('Unable to retrieve your location');
        }
      }
    );
  };

  return (
    <div className="w-full space-y-1.5 relative" ref={dropdownRef}>
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-[#666666] dark:text-zinc-400">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <input
          value={value}
          onChange={handleInput}
          placeholder={placeholder}
          required={required}
          className={cn(
            'flex w-full rounded-xl border border-[#E5E5E5] bg-white px-4 py-2.5 pr-10 text-sm transition-all placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/5 focus:border-[#1A1A1A] dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:focus:border-accent dark:focus:ring-accent/5',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/5',
            className
          )}
        />
        <div className="absolute right-3 group/locbtn">
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={isLocating}
            className="flex items-center justify-center text-[#999999] hover:text-[#1A1A1A] dark:text-zinc-500 dark:hover:text-white transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Use current location"
          >
            {isLocating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LocateFixed className="h-4 w-4" />
            )}
          </button>
          {/* Tooltip */}
          <div
            className="
              pointer-events-none absolute bottom-full right-0 mb-2
              w-max max-w-[160px]
              rounded-lg bg-[#1A1A1A] dark:bg-zinc-700
              px-2.5 py-1.5
              text-[11px] font-medium leading-tight text-white
              shadow-lg
              opacity-0 translate-y-1 scale-95
              group-hover/locbtn:opacity-100 group-hover/locbtn:translate-y-0 group-hover/locbtn:scale-100
              transition-all duration-150 ease-out
              z-[200]
            "
          >
            Use my current location
            {/* Arrow */}
            <span className="absolute top-full right-3 -translate-x-1/2 border-4 border-transparent border-t-[#1A1A1A] dark:border-t-zinc-700" />
          </div>
        </div>
      </div>
      {status === 'OK' && (
        <ul className="absolute z-[100] w-full bg-white dark:bg-zinc-900 border border-[#E5E5E5] dark:border-zinc-800 rounded-xl mt-1 shadow-xl max-h-60 overflow-auto py-2">
          {data.map((suggestion) => {
            const {
              place_id,
              structured_formatting: { main_text, secondary_text },
            } = suggestion;

            return (
              <li
                key={place_id}
                onClick={handleSelect(suggestion)}
                className="px-4 py-2.5 hover:bg-[#F5F5F5] dark:hover:bg-zinc-800 cursor-pointer transition-colors"
              >
                <p className="text-sm font-bold dark:text-white">{main_text}</p>
                <p className="text-[10px] text-[#999999] dark:text-zinc-500 truncate">{secondary_text}</p>
              </li>
            );
          })}
        </ul>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
