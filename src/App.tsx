// libraries
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Box } from "@mui/material";

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
  return (
    <Box sx={{ margin: ".9375rem" }}>
      <RouterProvider router={router} />
    </Box>
  );
}

export default App;
