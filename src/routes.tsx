import { createBrowserRouter } from "react-router";
import App from "./App";
import InvitadosPage from "./InvitadosPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
  },
  {
    path: "/invitados",
    Component: InvitadosPage,
  },
]);
