import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
} from "@heroicons/react/24/solid";
import { Home, Profile, Tables, Notifications } from "@/pages/dashboard";
import { SignIn, SignUp } from "@/pages/auth";
import Logout from "./pages/auth/log-out";
import Invoices from "./pages/dashboard/Invoices";
import InvoicesManagement from "./pages/dashboard/remindus";
import AddCustomer from "./pages/dashboard/addcustomer";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      // {
      //   icon: <HomeIcon {...icon} />,
      //   name: "dashboard",
      //   path: "/home",
      //   element: <Home />,
      // },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "Expense and Income",
        path: "/expenseandincome",
        element: <Profile />,
      },
      {
        icon:<UserCircleIcon {...icon} /> ,
        
        name: "Add User",
        path: "/adduser",
        element: <SignUp />,
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "All Users",
        path: "/tables",
        element: <Tables />,
      },
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "Add Customer",
        path: "/addcustomer",
        element: <AddCustomer />,
      },
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "Salary Manager",
        path: "/slaryslips",
        element: <Notifications />,
      },
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "Invoices",
        path: "/invoices",
        element: <Invoices />,
      },
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "Remind us",
        path: "/remindus",
        element: <InvoicesManagement />,
      },
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "logout",
        path: "/logout",
        element: <Logout />,
      },
    
    ],
  },
  {
    title: "auth pages",
    layout: "auth",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "sign in",
        path: "/sign-in",
        element: <SignIn />,
      },
      
    ],
  },
];

export default routes;
