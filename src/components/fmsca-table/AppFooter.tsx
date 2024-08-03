import * as React from "react";
import { Box, Typography, Container } from "@mui/material";

export default function AppFooter() {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "primary.main",
        color: "white",
        py: 2, // Padding on the y-axis
        mt: "auto", // Push the footer to the bottom of the page
        textAlign: "center",
      }}
    >
      <Container>
        <Typography variant="body2" color="inherit">
          © {new Date().getFullYear()} FMCSA. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}
