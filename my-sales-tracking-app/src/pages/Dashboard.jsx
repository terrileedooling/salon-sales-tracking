import React from "react";

const Dashboard = ({ user }) => {
    return (
        <div>
            <h2>Welcome, {user.email}</h2>
            <p>This is your Dashboard. Sales tracking coming soon!</p>
        </div>
    );
};

export default Dashboard;