import {Navigate} from "react-router-dom";
import AuthService from "../service/auth-service";
import React, { JSX } from "react";

export type PrivateRouteProps = {
    outlet: JSX.Element;
};

export default function PrivateRoute({outlet}: PrivateRouteProps) {
    if(AuthService.loggedUserAT()) {
        return outlet;
    } else {
        return <Navigate to={{ pathname: "/login" }} />;
    }
};