import React from "react";
import { useSelector } from "react-redux";
import { TRootState } from "../../../Store/BigPie.ts";
import Home from "../Home.tsx";
import LoggedInHome from "../LoggedInHome.tsx";
import RouteGuard from "../../../Shared/RouteGuard.tsx";

const HomeSwitcher: React.FC = () => {
    const isLoggedIn = useSelector((state: TRootState) => state.UserSlice.isLoggedIn);

    if (isLoggedIn) {
        return (
            <RouteGuard>
                <LoggedInHome />
            </RouteGuard>
        );
    }

    return <Home />;
};

export default HomeSwitcher;
