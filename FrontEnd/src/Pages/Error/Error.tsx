import { Button } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import { MdHeartBroken } from "react-icons/md";

const Error = () => {

    const nav = useNavigate();

    const homePage = () => {
        nav("/");
    };

    return (
        <>
            <div className="flex flex-col items-center justify-center h-screen gap-10">
                <h1 className="text-3xl">404</h1>
                <p className="text-2xl">Sorry, the page you were looking for was not found!</p>
                <MdHeartBroken size={60} />
                <Button onClick={homePage} className="bg-pink-400 dark:border-black dark:bg-gradient-to-r dark:from-gray-700 dark:to-gray-800"> Go Back To Home Page </Button>
            </div>
        </>
    )
};

export default Error;