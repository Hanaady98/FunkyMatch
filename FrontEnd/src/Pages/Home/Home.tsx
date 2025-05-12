import React, { useState } from "react";
import RegisterModal from "../Register/RegisterModal/RegisterModal";
import LoginModal from "../Login/LoginModal/LoginModal.tsx";

const Home: React.FC = () => {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  return (
    <div className="relative flex h-[calc(100vh-4rem)] w-full items-center justify-center bg-[url('/FunkyMatch1.png')] bg-cover bg-center bg-no-repeat">
      <div className="relative z-10 flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
        <LoginModal
          isOpen={loginModalOpen}
          onClose={() => setLoginModalOpen(false)}
        />
        <RegisterModal
          isOpen={registerModalOpen}
          onClose={() => setRegisterModalOpen(false)}
          onRegisterSuccess={() => {
            setRegisterModalOpen(false);
            setLoginModalOpen(true);
          }}
        />

        <button
          onClick={() => setLoginModalOpen(true)}
          className="relative inline-flex items-center justify-center h-12 overflow-hidden font-medium bg-white border rounded-md group border-neutral-200"
        >
          <div className="inline-flex h-12 translate-y-0 items-center justify-center px-6 text-neutral-950 transition duration-500 group-hover:-translate-y-[150%]">
            Login
          </div>
          <div className="absolute inline-flex items-center justify-center w-full h-12 transition duration-500 translate-y-full text-neutral-50 group-hover:translate-y-0">
            <span className="absolute transition duration-500 scale-y-0 translate-y-full skew-y-12 bg-blue-500 size-full group-hover:translate-y-0 group-hover:scale-150"></span>
            <span className="z-10">Login</span>
          </div>
        </button>

        <button
          onClick={() => setRegisterModalOpen(true)}
          className="relative inline-flex items-center justify-center h-12 overflow-hidden font-medium bg-white border rounded-md group border-neutral-200"
        >
          <div className="inline-flex h-12 translate-y-0 items-center justify-center px-6 text-neutral-950 transition duration-500 group-hover:-translate-y-[150%]">
            Register
          </div>
          <div className="absolute inline-flex items-center justify-center w-full h-12 transition duration-500 translate-y-full text-neutral-50 group-hover:translate-y-0">
            <span className="absolute transition duration-500 scale-y-0 translate-y-full skew-y-12 bg-blue-500 size-full group-hover:translate-y-0 group-hover:scale-150"></span>
            <span className="z-10">Register</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Home;