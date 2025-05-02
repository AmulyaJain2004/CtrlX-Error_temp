import {
    LuLayoutDashboard,
    LuBug,
    LuClipboardCheck,
    LuSquarePlus,
    LuUser,
    LuLogOut,
} from "react-icons/lu";

// Admin's side menu
export const SIDE_MENU_ADMIN_DATA = [
    {
        id: "01",
        label: "Dashboard",
        icon: LuLayoutDashboard,
        path: "/admin/dashboard",
    },
    {
        id: "02",
        label: "Manage Bugs",
        icon: LuBug,
        path: "/admin/bugs", // Adjusted to 'bugs' from 'tasks'
    },
    {
        id: "03",
        label: "Create Bug Report",
        icon: LuSquarePlus,
        path: "/admin/create-bug", // Adjusted to 'bugs'
    },
    {
        id: "04",
        label: "Team Members",
        icon: LuUser,
        path: "/admin/users",
    },
    {
        id: "05",
        label: "Logout",
        icon: LuLogOut,
        path: "logout",
    }
];

// Tester's side menu
export const SIDE_MENU_TESTER_DATA = [
    {
        id: "01",
        label: "Dashboard",
        icon: LuLayoutDashboard,
        path: "/tester/dashboard",
    },
    {
        id: "02",
        label: "My Reported Bugs",
        icon: LuClipboardCheck,
        path: "/tester/reported-bugs", // Adjusted for reported bugs
    },
    {
        id: "03",
        label: "Create Bug Report",
        icon: LuSquarePlus,
        path: "/tester/create-bug", // Adjusted for 'create bug'
    },
    {
        id: "04",
        label: "Logout",
        icon: LuLogOut,
        path: "logout",
    }
];

// Developer's side menu
export const SIDE_MENU_DEVELOPER_DATA = [
    {
        id: "01",
        label: "Dashboard",
        icon: LuLayoutDashboard,
        path: "/developer/dashboard",
    },
    {
        id: "02",
        label: "Assigned Bugs",
        icon: LuClipboardCheck,
        path: "/developer/assigned-bugs", // Adjusted for assigned bugs
    },
    {
        id: "03",
        label: "Update Bug Status",
        icon: LuClipboardCheck,
        path: "/developer/update-bug-status", // Adjusted for updating status
    },
    {
        id: "04",
        label: "Logout",
        icon: LuLogOut,
        path: "logout",
    }
];

// Priority levels for bugs
export const PRIORITY_DATA = [
    {
        label: "Low",
        value: "Low",
    },
    {
        label: "Medium",
        value: "Medium",
    },
    {
        label: "High",
        value: "High",
    }
];

// Status options for bugs
export const STATUS_DATA = [
    {
        label: "Pending",
        value: "Pending",
    },
    {
        label: "In Progress",
        value: "In Progress",
    },
    {
        label: "Resolved",
        value: "Resolved", // Adjusted for resolved status instead of 'Completed'
    }
];
