import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { TRootState } from "../Store/BigPie.ts";
import { TUserState } from "../Store/UserSlice.ts";

type TRouteGuard = {
    children: React.ReactNode,
    moderOnly?: boolean,
    adminOnly?: boolean,
};


const RouteGuard = (props: TRouteGuard) => {
    const { children, moderOnly, adminOnly } = props;
    const userState = useSelector((state: TRootState) => state.UserSlice) as TUserState;
    const user = userState.user!;

    if (!userState.isLoggedIn) {
        return <Navigate to="/" />
    };

    if (moderOnly && !user.isModerator) {
        return <Navigate to="/" />
    };

    if (adminOnly && !user.isAdmin) {
        return <Navigate to="/" />
    };

    return <>{children}</>;
};

export default RouteGuard;