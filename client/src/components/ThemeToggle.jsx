import React, {useEffect, useState} from "react";
import {Sun, Moon} from 'lucide-react';

const ThemeToggle = () => {
    const [isDark, setIsDark] = useState(false);
    const toggleDark = () => {
        setIsDark(!isDark);
        if (!isDark) {
            localStorage.setItem("theme", 'dark');
        }
        else {
            localStorage.setItem("theme", 'light');
        }
    }
    useEffect(() => {
        if (localStorage.getItem("theme") === 'dark') {
            setIsDark(true);
        }
        else {
            setIsDark(false);
        }
    }, [])
    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add("dark");
        }
        else {
            document.documentElement.classList.remove("dark");
        }
    }, [isDark]);
    return (
        <button onClick={toggleDark}
                className='fixed bottom-3 right-3 z-50'>
            {isDark ?
                <Sun size={25}/>
                :
                <Moon size={25}/>
            }
        </button>
    )
}
export default ThemeToggle;