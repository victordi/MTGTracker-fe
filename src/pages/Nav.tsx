import React, { FC, ReactElement } from 'react';
import '../App.css'

const Nav: FC = (): ReactElement => {
    return (
        <nav className="nav">
            <ul className="nav-links">
                <li>Seasons</li>
                <li>Players</li>
            </ul>
        </nav>
    )
};


export default Nav;
