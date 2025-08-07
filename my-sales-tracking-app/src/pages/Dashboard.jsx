import React from "react";
import { logoutUser } from "../firebase/authService";

const Dashboard = ({ user, onLogout }) => {

    const handleLogout = async () => {
        await logoutUser();
        onLogout();
    };
    return (
        <div>
            <h2>Welcome, {user.email}</h2>
            <button onClick={handleLogout}>Logout</button>
            <p>This is your Dashboard. Sales tracking coming soon!</p>
        </div>
    );
};

export default Dashboard;