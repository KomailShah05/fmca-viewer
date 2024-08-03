// libraries
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  AccordionSummary,
  Accordion,
} from "@mui/material";

// constants
import { COLUMNS_TO_INCLUDE } from "../../config/constants";
import { useState } from "react";

interface Props {
  handleFilterChange: (
    column: string
  ) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  resetFilters: () => void;
  filterLength: number;
}

export default function Filter({
  handleFilterChange,
  resetFilters,
  filterLength,
}: Props) {
  const [filterValues, setFilterValues] = useState<{ [key: string]: string }>(
    COLUMNS_TO_INCLUDE.reduce((acc, col) => {
      acc[col] = "";
      return acc;
    }, {} as { [key: string]: string })
  );

  const handleTextFieldChange =
    (colName: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      setFilterValues((prevValues) => ({
        ...prevValues,
        [colName]: newValue,
      }));
      handleFilterChange(colName)(event);
    };

  const handleResetFilters = () => {
    setFilterValues(
      COLUMNS_TO_INCLUDE.reduce((acc, col) => {
        acc[col] = "";
        return acc;
      }, {} as { [key: string]: string })
    );
    resetFilters();
  };
  return (
    <Box sx={{ marginBottom: "1rem" }}>
      <Accordion sx={{ padding: 2, background: "#e3f2fd" }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2-content"
          id="panel2-header"
        >
          <Typography fontWeight={700}>
            {filterLength > 0
              ? `Filter Applied (${filterLength})`
              : "Apply Filter"}
          </Typography>
        </AccordionSummary>
        <Grid container spacing={2}>
          {COLUMNS_TO_INCLUDE.map((colName) => (
            <Grid item xs={12} sm={6} md={2} key={colName}>
              <Box
                sx={{
                  background: "#e3f2fd",
                }}
              >
                <TextField
                  label={colName}
                  variant="outlined"
                  size="small"
                  value={filterValues[colName]} // Set the value of each TextField
                  onChange={handleTextFieldChange(colName)}
                  sx={{ background: "white", fontSize: ".6875rem" }}
                  fullWidth
                />
              </Box>
            </Grid>
          ))}
        </Grid>
        <Button
          onClick={handleResetFilters} // Use handleResetFilters to reset the filters
          variant="outlined"
          color="primary"
          sx={{ marginTop: "1rem" }}
        >
          Reset Filters
        </Button>
      </Accordion>
    </Box>
  );
}
