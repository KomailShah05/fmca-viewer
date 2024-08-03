// libraries
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// components
import FMCATable from "./pages/fmsca-table";
import ErrorPage from "./pages/error-page";

//constants

// styles
import "./App.css";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <FMCATable />,
      errorElement: <ErrorPage />,
    },
  ]);
  return <RouterProvider router={router} />;
}

export default App;
