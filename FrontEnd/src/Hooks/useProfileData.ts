import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Country } from '../Pages/Register/StyledInputs/Types.ts';
import { TUser } from '../Types/TUser.ts';

export const useProfileData = (userId?: string, isPublic: boolean = false) => {
    const [user, setUser] = useState<TUser | null>(null);
    const [countries, setCountries] = useState<Country[]>([]);
    const hasFetched = useRef(false);

    const fetchUserData = async () => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        try {
            const token = localStorage.getItem('token');
            const endpoint = isPublic
                ? `http://localhost:8181/users/public/${userId}`
                : `http://localhost:8181/users/${userId}`;

            const response = await axios.get(endpoint, {
                headers: { 'x-auth-token': token }
            });

            if (!response.data.username) {
                response.data.username = response.data.email.split('@')[0];
            }
            setUser(response.data);
        } catch (error) {
            Swal.fire({
                title: 'Failed to load profile!',
                icon: 'error',
                timer: 2000,
            });
        }
    };

    const fetchCountries = async () => {
        try {
            const cachedData = localStorage.getItem('countriesData');
            const cachedTime = localStorage.getItem('countriesCacheTime');

            if (cachedData && cachedTime) {
                const parsedTime = parseInt(cachedTime);
                if (Date.now() - parsedTime < 86400000) {
                    setCountries(JSON.parse(cachedData));
                    return;
                }
            }

            const response = await axios.get<Country[]>('https://restcountries.com/v3.1/all');
            const sortedCountries = response.data.sort((a: Country, b: Country) =>
                a.name.common.localeCompare(b.name.common)
            );
            localStorage.setItem('countriesData', JSON.stringify(sortedCountries));
            localStorage.setItem('countriesCacheTime', Date.now().toString());
            setCountries(sortedCountries);
        } catch (error) {
            console.error("Error fetching countries:", error);
        }
    };

    const calculateAge = (birthDate: string) => {
        const today = new Date();
        const birthDateObj = new Date(birthDate);
        let age = today.getFullYear() - birthDateObj.getFullYear();
        const monthDiff = today.getMonth() - birthDateObj.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
            age--;
        }
        return age;
    };

    useEffect(() => {
        fetchCountries();
        if (userId) {
            fetchUserData();
        }
    }, [userId]);

    return {
        user,
        countries,
        calculateAge,
        selectedCountry: countries.find((c: Country) => c.name.common === user?.address?.country)
    };
};