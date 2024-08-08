// libraries
import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  TableContainer,
  TablePagination,
  Typography,
} from "@mui/material";
import PivotTableUI from "react-pivottable/PivotTableUI";
import { format } from "date-fns";

// components
import TopAppBar from "../../components/fmsca-table/AppBar";
import TableRenderers from "react-pivottable/TableRenderers";
import AppFooter from "../../components/fmsca-table/AppFooter";

// constants
import { COLUMNS_TO_INCLUDE } from "../../config/constants";
// styles
import "react-pivottable/pivottable.css";
import Plot from "react-plotly.js";
import createPlotlyRenderers from "react-pivottable/PlotlyRenderers";
interface RowData {
  [key: string]: string;
}

const defaultPivotState = {
  rows: [
    "created_dt",
    "data_source_modified_dt",
    "entity_type",
    "operating_status",
    "legal_name",
    "dba_name",
    "physical_address",
    "phone",
    "usdot_number",
    "mc_mx_ff_number",
    "power_units",
    "out_of_service_date",
  ],
  aggregatorName: "Count",
  vals: [],
  valueFilter: {
    created_dt: { defaultValue: true },
    data_source_modified_dt: { defaultValue: true },
    entity_type: { defaultValue: true },
    operating_status: { defaultValue: true },
    legal_name: { defaultValue: true },
    dba_name: { defaultValue: true },
    physical_address: { defaultValue: true },
    phone: { defaultValue: true },
    usdot_number: { defaultValue: true },
    mc_mx_ff_number: { defaultValue: true },
    power_units: { defaultValue: true },
    out_of_service_date: { defaultValue: true },
  },
};
const RANGE = "FMSCA_records (2)";

export default function FMCATable() {
  const [data, setData] = useState<RowData[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters] = useState<{ [key: string]: string }>({});
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [pivotState, setPivotState] = useState(defaultPivotState);
  const [paginatedData, setPaginatedData] = useState<RowData[]>([]);

  const apiKey = process.env.REACT_APP_API_KEY;
  const PlotlyRenderers = createPlotlyRenderers(Plot);
  // Fetch data from the spreadsheet

  const fetchData = async () => {
    try {
      setIsDataLoading(true);
      const response = await axios.get<{ values: string[][] }>(
        `https://sheets.googleapis.com/v4/spreadsheets/1hB_LjBT9ezZigXnC-MblT2PXZledkZqBnvV23ssfSuE/values/${RANGE}?key=${apiKey}`
      );

      const rows = response.data.values;

      if (rows.length > 0) {
        const headers: string[] = rows[0];
        const columnsIndex = headers.reduce(
          (acc: { [key: string]: number }, header: string, index: number) => {
            if (COLUMNS_TO_INCLUDE.includes(header)) {
              acc[header] = index;
            }
            return acc;
          },
          {}
        );

        const formattedData: RowData[] = rows.slice(1).map((row) => {
          let rowData: RowData = {};
          for (const [column, index] of Object.entries(columnsIndex)) {
            let value = row[index] || "";

            // Format date fields if present
            if (
              [
                "created_dt",
                "data_source_modified_dt",
                "out_of_service_date",
              ].includes(column) &&
              value
            ) {
              const date = new Date(value);
              value = format(date, "yyyy-MM-dd HH:mm:ss");
            }

            rowData[column] = value;
          }
          return rowData;
        });

        setData(formattedData);
      }
      setIsDataLoading(false);
    } catch (error) {
      setIsDataLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  // Save pivot table state to local storage
  const saveTemplate = () => {
    localStorage.setItem("pivotTableState", JSON.stringify(pivotState));
    alert("Template saved!");
  };

  // Reset pivot table state to default
  const resetTemplate = () => {
    setPivotState(defaultPivotState);
    localStorage.removeItem("pivotTableState");
  };

  // Check for saved state in local storage
  useEffect(() => {
    const savedState = localStorage.getItem("pivotTableState");
    if (savedState) {
      const parsedState = JSON.parse(savedState);

      if (parsedState) {
        setPivotState(parsedState);
        return;
      }
      setPivotState(defaultPivotState); // Use default state if invalid
    }
  }, []);

  // Handle page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ""; // This is required for some browsers to show the prompt
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Update page number
  const handlePageChange = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  // Update rows per page
  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      return Object.keys(filters).every((key) => {
        return row[key]
          ?.toString()
          .toLowerCase()
          .includes(filters[key].toLowerCase());
      });
    });
  }, [data, filters]);

  useEffect(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    setPaginatedData(filteredData.slice(start, end));
  }, [filteredData, page, rowsPerPage]);

  // Convert paginatedData to a 2D array of strings for PivotTableUI
  const pivotData = useMemo(() => {
    if (paginatedData.length === 0) return [];

    // Get headers
    const headers = Object.keys(paginatedData[0]);

    // Create a 2D array where the first row is headers
    const dataRows = paginatedData.map((row) =>
      headers.map((header) => row[header] || "")
    );

    // You can add additional logic here if you need to include grouping fields
    // For example, if you want to group by year, month, or week in pivot data,
    // you can add those fields dynamically here if they are required for your pivot table

    return [headers, ...dataRows];
  }, [paginatedData]);
  return (
    <>
      <TopAppBar />
      <Box
        sx={{
          padding: "8px",
          display: "flex",
          justifyContent: "flex-end", // Aligns buttons to the right
          position: "relative",
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={saveTemplate}
          sx={{ marginRight: "8px" }}
        >
          Save Template
        </Button>
        <Button variant="contained" color="secondary" onClick={resetTemplate}>
          Reset
        </Button>
      </Box>
      <Box sx={{ margin: "2.5rem 2rem 2rem" }}>
        <Paper sx={{ width: "100%", overflow: "hidden" }}>
          <TableContainer
            sx={{
              height: "82vh",
              "&::-webkit-scrollbar": {
                width: "0",
                height: "0",
              },
            }}
          >
            {isDataLoading ? (
              <CircularProgress
                color="inherit"
                sx={{ position: "absolute", top: "30vh", left: "50%" }}
              />
            ) : filteredData.length === 0 ? (
              <Typography
                sx={{ position: "absolute", top: "30vh", left: "50%" }}
              >
                No Data Found
              </Typography>
            ) : (
              <>
                <PivotTableUI
                  unusedOrientationCutoff={200}
                  data={pivotData}
                  onChange={(s: any) => {
                    const newState = { ...s };
                    delete newState.data;
                    delete newState["aggregators"];
                    delete newState["renderers"];
                    delete newState["rendererOptions"];
                    delete newState["localeStrings"];
                    setPivotState(newState);
                  }}
                  {...pivotState}
                  renderers={Object.assign({}, TableRenderers, PlotlyRenderers)}
                  plotlyOptions={{ width: 1600 }}
                />
                <TablePagination
                  rowsPerPageOptions={[10, 25, 100]}
                  component="div"
                  count={filteredData.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handlePageChange}
                  onRowsPerPageChange={handleRowsPerPageChange}
                />
              </>
            )}
          </TableContainer>
        </Paper>
      </Box>
      <AppFooter />
    </>
  );
}
