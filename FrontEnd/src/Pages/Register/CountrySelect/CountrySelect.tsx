import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useDebounce } from 'use-debounce';
import { FiSearch, FiChevronDown, FiX } from 'react-icons/fi';
import { Country } from '../StyledInputs/Types';
import { getCountrySelectColors } from './CountrySelectColors.ts';

interface CountrySelectProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    darkMode?: boolean;
    invertedColors?: boolean;
}

const CountrySelect = ({
    value,
    onChange,
    disabled,
    darkMode = false,
    invertedColors = false
}: CountrySelectProps) => {
    const [countries, setCountries] = useState<Country[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounce(search, 300);
    const [isOpen, setIsOpen] = useState(false);
    const [cacheDate, setCacheDate] = useState<number | null>(null);

    // Get color classes based on mode
    const colors = getCountrySelectColors(darkMode, invertedColors);

    useEffect(() => {
        const cachedData = localStorage.getItem('countriesData');
        const cachedTime = localStorage.getItem('countriesCacheTime');

        if (cachedData && cachedTime) {
            const parsedTime = parseInt(cachedTime);
            if (Date.now() - parsedTime < 86400000) {
                setCountries(JSON.parse(cachedData));
                setLoading(false);
                setCacheDate(parsedTime);
                return;
            }
        }

        const fetchCountries = async () => {
            try {
                const response = await axios.get<Country[]>('https://restcountries.com/v3.1/all');
                const sortedCountries = response.data.sort((a: Country, b: Country) =>
                    a.name.common.localeCompare(b.name.common)
                );
                localStorage.setItem('countriesData', JSON.stringify(sortedCountries));
                localStorage.setItem('countriesCacheTime', Date.now().toString());
                setCountries(sortedCountries);
                setCacheDate(Date.now());
            } catch (error) {
                console.error("Error fetching countries:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCountries();
    }, []);

    const filteredCountries = useMemo(() => {
        if (!debouncedSearch) return countries;
        return countries.filter((country: Country) =>
            country.name.common.toLowerCase().includes(debouncedSearch.toLowerCase())
        );
    }, [countries, debouncedSearch]);

    const selectedCountry = countries.find((c: Country) => c.name.common === value);

    return (
        <div className="relative w-full">
            <div
                className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer ${colors.bg} ${colors.border} ${colors.text} ${disabled ? colors.disabledBg : ''}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                {selectedCountry ? (
                    <div className="flex items-center">
                        <img
                            src={selectedCountry.flags.png}
                            alt={`${selectedCountry.name.common} flag`}
                            className="object-cover w-6 h-4 mr-2"
                        />
                        <span>{selectedCountry.name.common}</span>
                    </div>
                ) : (
                    <span className={colors.placeholder}>
                        Select a country
                    </span>
                )}
                <FiChevronDown
                    className={`transition-transform ${isOpen ? 'rotate-180' : ''} ${colors.icon}`}
                />
            </div>

            {isOpen && !disabled && (
                <div className={`absolute z-10 w-full mt-1 overflow-auto border rounded-lg shadow-lg max-h-96 ${colors.dropdownBg} ${colors.dropdownBorder}`}>
                    <div className={`sticky top-0 p-2 border-b ${colors.dropdownBg} ${colors.dropdownBorder}`}>
                        <div className="relative">
                            <FiSearch className={`absolute transform -translate-y-1/2 left-3 top-1/2 ${colors.icon}`} />
                            <input
                                type="text"
                                placeholder="Search countries..."
                                className={`w-full py-2 pl-10 pr-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${colors.searchBg} ${colors.searchBorder} ${colors.searchText}`}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            {search && (
                                <FiX
                                    className={`absolute transform -translate-y-1/2 cursor-pointer right-3 top-1/2 ${colors.icon}`}
                                    onClick={() => setSearch('')}
                                />
                            )}
                        </div>
                    </div>
                    {loading ? (
                        <div className={`p-4 text-center ${colors.placeholder}`}>
                            Loading countries...
                        </div>
                    ) : filteredCountries.length === 0 ? (
                        <div className={`p-4 text-center ${colors.placeholder}`}>
                            No countries found
                        </div>
                    ) : (
                        <ul>
                            {filteredCountries.map((country: Country) => (
                                <li
                                    key={country.cca2}
                                    className={`flex items-center p-3 cursor-pointer ${colors.hover} ${value === country.name.common ? colors.selected : ''}`}
                                    onClick={() => {
                                        onChange(country.name.common);
                                        setIsOpen(false);
                                        setSearch('');
                                    }}
                                >
                                    <img
                                        src={country.flags.png}
                                        alt={`${country.name.common} flag`}
                                        className="object-cover w-6 h-4 mr-3"
                                    />
                                    <span>{country.name.common}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
            {cacheDate && (
                <div className={`mt-1 text-xs ${colors.cacheText}`}>
                    Data cached: {new Date(cacheDate).toLocaleString()}
                </div>
            )}
        </div>
    );
};

export default CountrySelect;