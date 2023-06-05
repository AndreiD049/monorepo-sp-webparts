import * as React from "react";
import {
    RouterProvider,
  createHashRouter,
} from "react-router-dom";
import { Main } from "./pages/Main";
import { IFeedbackWebPartProps } from "./FeedbackWebPart";
import { Settings } from "./pages/Settings";
import { Board } from "./pages/Board";
import { Home } from "./pages/Home";

const router =  createHashRouter([
    {
        path: "/",
        element: <Main />,
        children: [
            {
                path: "/",
                element: <Home />
            },
            {
                path: "settings",
                element: <Settings />
            },
            {
                path: "new",
                element: <div>New</div>,
            },
            {
                path: "board",
                element: <Board />
            }
        ]
    }
]);

export const Router: React.FC<IFeedbackWebPartProps> = (props) => {
    return <RouterProvider router={router} />;
}