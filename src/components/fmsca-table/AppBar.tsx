import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";

export default function TopAppBar() {
  return (
    <Box sx={{ flexGrow: 1, marginBottom: "1rem" }}>
      <AppBar position="static">
        <Toolbar>
          <Box
            component="img"
            src={`${process.env.PUBLIC_URL}/fmsca-logo.png`}
            alt="Example"
            sx={{ width: "17.1875rem", height: "auto", marginLeft: ".875rem" }}
          />
        </Toolbar>
      </AppBar>
    </Box>
  );
}
