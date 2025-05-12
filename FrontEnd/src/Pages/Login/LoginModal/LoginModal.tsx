import { useContext } from 'react';
import { ThemeContext } from '../../../Components/Layout/Header/ThemeToggle.tsx';
import LoginForm from "../Login.tsx";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
    const { darkMode } = useContext(ThemeContext);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black bg-opacity-50 sm:p-4">
            <div className={`relative w-full max-w-xs p-4 rounded-lg shadow-xl sm:max-w-sm md:max-w-md sm:p-6 md:p-8 ${darkMode ? 'bg-white text-gray-900' : 'bg-gray-800 text-white'
                }`}>
                <button
                    onClick={onClose}
                    className={`absolute z-10 text-xl sm:text-2xl right-3 top-3 sm:right-4 sm:top-4 hover:text-gray-700 ${darkMode ? 'text-gray-500' : 'text-gray-300'
                        }`}
                >
                    &times;
                </button>
                <LoginForm onSuccess={onClose} darkMode={darkMode} />
            </div>
        </div>
    );
};

export default LoginModal;