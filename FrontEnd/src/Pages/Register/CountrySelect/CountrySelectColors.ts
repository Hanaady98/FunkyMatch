export interface CountrySelectColors {
    bg: string;
    border: string;
    text: string;
    disabledBg: string;
    placeholder: string;
    icon: string;
    dropdownBg: string;
    dropdownBorder: string;
    searchBg: string;
    searchBorder: string;
    searchText: string;
    hover: string;
    selected: string;
    cacheText: string;
}

export const getCountrySelectColors = (darkMode: boolean, invertedColors: boolean): CountrySelectColors => {
    if (!invertedColors) {
        return {
            bg: darkMode ? 'bg-gray-700' : 'bg-white',
            border: darkMode ? 'border-gray-600' : 'border-gray-300',
            text: darkMode ? 'text-white' : 'text-gray-900',
            disabledBg: darkMode ? 'bg-gray-800' : 'bg-gray-100',
            placeholder: darkMode ? 'text-gray-400' : 'text-gray-500',
            icon: darkMode ? 'text-gray-300' : 'text-gray-500',
            dropdownBg: darkMode ? 'bg-gray-700' : 'bg-white',
            dropdownBorder: darkMode ? 'border-gray-600' : 'border-gray-300',
            searchBg: darkMode ? 'bg-gray-600' : 'bg-white',
            searchBorder: darkMode ? 'border-gray-500' : 'border-gray-300',
            searchText: darkMode ? 'text-white' : 'text-gray-900',
            hover: darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100',
            selected: darkMode ? 'bg-gray-600' : 'bg-blue-50',
            cacheText: darkMode ? 'text-gray-400' : 'text-gray-500'
        };
    } else {
        return {
            bg: darkMode ? 'bg-white' : 'bg-gray-700',
            border: darkMode ? 'border-gray-300' : 'border-gray-600',
            text: darkMode ? 'text-gray-900' : 'text-white',
            disabledBg: darkMode ? 'bg-gray-100' : 'bg-gray-800',
            placeholder: darkMode ? 'text-gray-500' : 'text-gray-400',
            icon: darkMode ? 'text-gray-500' : 'text-gray-300',
            dropdownBg: darkMode ? 'bg-white' : 'bg-gray-700',
            dropdownBorder: darkMode ? 'border-gray-300' : 'border-gray-600',
            searchBg: darkMode ? 'bg-white' : 'bg-gray-600',
            searchBorder: darkMode ? 'border-gray-300' : 'border-gray-500',
            searchText: darkMode ? 'text-gray-900' : 'text-white',
            hover: darkMode ? 'hover:bg-gray-100' : 'hover:bg-gray-600',
            selected: darkMode ? 'bg-blue-50' : 'bg-gray-600',
            cacheText: darkMode ? 'text-gray-500' : 'text-gray-400'
        };
    }
};