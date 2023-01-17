import React, {FC, ReactElement} from 'react';
import '../App.css'
import {Link} from "react-router-dom";
import {navStyle} from "../constants";

const Nav: FC = (): ReactElement => {
    return (
        <nav>
            <ul className="nav-links">
                <Link style={navStyle} to={"/"}>
                    <li>Home</li>
                </Link>
                <Link style={navStyle} to={"/seasons"}>
                    <li>Seasons</li>
                </Link>
                <Link style={navStyle} to={"/players"}>
                    <li>Players</li>
                </Link>
            </ul>
        </nav>
    )
};


export default Nav;
