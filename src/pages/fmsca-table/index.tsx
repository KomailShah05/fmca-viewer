// libraries
import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import axios from "axios";

import PivotTableUI from "react-pivottable/PivotTableUI";
import { format } from "date-fns";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
// components
import TopAppBar from "../../components/fmsca-table/AppBar";
import TableRenderers from "react-pivottable/TableRenderers";
import AppFooter from "../../components/fmsca-table/AppFooter";
import { useLocation } from "react-router-dom";
import TextField from "@mui/material/TextField";

// constants
import { COLUMNS_TO_INCLUDE } from "../../config/constants";
// styles
import "react-pivottable/pivottable.css";
import Plot from "react-plotly.js";
import createPlotlyRenderers from "react-pivottable/PlotlyRenderers";
import TableHeader from "../../components/fmsca-table/AppHeader";
import Filter from "../../components/fmsca-table/AppFilter";
import { BarChart } from "@mui/x-charts";
import SaveDialog from "../../components/fmsca-table/Modal";
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
  const location = useLocation();

  // Convert the query string into a URLSearchParams object
  const queryParams = new URLSearchParams(location.search);

  // Get the value of 'template_id' from query parameters
  const templateId = queryParams.get("template_id");
  const [data, setData] = useState<RowData[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [pivotState, setPivotState] = useState(defaultPivotState);
  const [paginatedData, setPaginatedData] = useState<RowData[]>([]);
  const [showPivotTable, setShowPivotTable] = useState<boolean>(true);
  const [viewGraph, setViewGrap] = useState<boolean>(false);
  const [filters, setFilters] = useState<{ [key: string]: string }>({}); // Store filter values for each column
  const [isDataChanged, setIsDataChanged] = useState(false);
  const apiKey = process.env.REACT_APP_API_KEY;
  const [loading, setloading] = useState(false);
  const PlotlyRenderers = createPlotlyRenderers(Plot);
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<string>(COLUMNS_TO_INCLUDE[0]);

  const [cellValues, setCellValues] = useState<{ [key: string]: string }>({});
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const handleRequestSort = (property: string) => {
    const isAscending = orderBy === property && order === "asc";
    setOrder(isAscending ? "desc" : "asc");
    setOrderBy(property);
  };

  useEffect(() => {
    if (showPivotTable) {
      setIsDataChanged(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pivotState]);

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

        processData(formattedData);
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
  const saveTemplate = async () => {
    setloading(true);
    localStorage.setItem("pivotTableState", JSON.stringify(pivotState));
    try {
      const response = await axios.post(
        "https://fcma-backend.onrender.com/api/pivot-state/save",
        {
          state: pivotState,
        }
      );
      setloading(false);

      // Assuming response.data.template_id contains the template_id
      const templateId = response.data.templateId;

      if (templateId) {
        // Create a new URL object based on the current location
        const url = new URL(window.location.href);

        // Set or update the template_id query parameter
        url.searchParams.set("template_id", templateId);

        // Use the history API to change the URL without reloading the page
        window.history.pushState({}, "", url);
        setIsDataChanged(false);
        handleClose();
        // Alternatively, you could use window.location.replace(url) if you prefer replacing the entire URL.
      }
    } catch (error) {
      setloading(false);
      handleClose();
    }
  };

  // Reset pivot table state to default
  const resetTemplate = () => {
    setPivotState(defaultPivotState);
    setIsDataChanged(false);
    localStorage.removeItem("pivotTableState");
    const url = new URL(window.location.href);
    url.search = ""; // Clear all query parameters
    window.history.replaceState({}, "", url.toString());
  };

  const fetchPivotState = async () => {
    try {
      const response = await axios.get(
        `https://fcma-backend.onrender.com/api/pivot-state/${templateId}`
      );

      setPivotState(response.data.state);
    } catch (error) {}
  };

  // Check for saved state in local storage
  useEffect(() => {
    const savedState = localStorage.getItem("pivotTableState");
    if (templateId) {
      fetchPivotState();
      return;
    } else if (savedState) {
      const parsedState = JSON.parse(savedState);

      if (parsedState) {
        setPivotState(parsedState);
        return;
      }
    } else {
      setPivotState(defaultPivotState); // Use default state if invalid
    }
    // eslint-disable-next-line
  }, []);

  // Handle page unload

  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    if (isDataChanged) {
      event.preventDefault();
      handleClickOpen();
    }
  };
  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDataChanged, pivotState]);

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

    const data = filteredData.slice(start, end).sort((a, b) => {
      if (orderBy === "") return 0;
      if (a[orderBy] < b[orderBy]) return order === "asc" ? -1 : 1;
      if (a[orderBy] > b[orderBy]) return order === "asc" ? 1 : -1;
      return 0;
    });
    setPaginatedData(data);
  }, [filteredData, page, rowsPerPage, orderBy, order]);

  // Convert paginatedData to a 2D array of strings for PivotTableUI
  const pivotData = useMemo(() => {
    if (paginatedData.length === 0) return [];

    // Get headers
    const headers = Object.keys(paginatedData[0]);

    // Create a 2D array where the first row is headers
    const dataRows = paginatedData.map((row) =>
      headers.map((header) => row[header] || "")
    );

    return [headers, ...dataRows];
  }, [paginatedData]);

  const handleFilterChange =
    (column: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFilters({
        ...filters,
        [column]: event.target.value,
      });
    };
  const resetFilters = () => {
    setFilters({});
  };

  interface ProcessedDataEntry {
    month: string;
    [key: string]: number | string; // Index signature to allow dynamic keys for legal names
  }

  interface ProcessedResult {
    dataset: ProcessedDataEntry[];
    allNames: string[];
  }
  const processData = (rawData: RowData[]): ProcessedResult => {
    const monthlyCounts: { [month: string]: { [name: string]: number } } = {};

    rawData.forEach((entry) => {
      if (entry.out_of_service_date) {
        const date = new Date(entry.out_of_service_date);
        const month = date.toLocaleString("default", {
          month: "short",
          year: "numeric",
        }); // e.g., "Jul 2024"
        const name = entry.legal_name || "Unknown";

        if (!monthlyCounts[month]) {
          monthlyCounts[month] = {};
        }

        if (!monthlyCounts[month][name]) {
          monthlyCounts[month][name] = 0;
        }

        monthlyCounts[month][name]++;
      }
    });

    // Convert to dataset format
    const dataset: ProcessedDataEntry[] = [];
    const allNames = new Set<string>();

    for (const [month, names] of Object.entries(monthlyCounts)) {
      const entry: ProcessedDataEntry = { month };

      for (const [name, count] of Object.entries(names)) {
        entry[name] = count;
        allNames.add(name);
      }

      dataset.push(entry);
    }

    return {
      dataset,
      allNames: Array.from(allNames),
    };
  };

  const { dataset, allNames } = processData(paginatedData);
  const series = allNames.map((name) => ({
    dataKey: name,
    label: name,
    // valueFormatter: (value: number) => value.toString(),
  }));

  const [isEditing, setIsEditing] = useState<boolean>(false);

  const validateDateTime = (value: string): boolean => {
    // Regex for YYYY-MM-DD HH:MM:SS format
    const dateTimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
    if (!dateTimeRegex.test(value)) return false;

    // Split the date and time
    const [datePart, timePart] = value.split(" ");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hours, minutes, seconds] = timePart.split(":").map(Number);

    // Check if the date and time are valid
    const date = new Date(year, month - 1, day, hours, minutes, seconds);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day &&
      date.getHours() === hours &&
      date.getMinutes() === minutes &&
      date.getSeconds() === seconds
    );
  };
  const validatePhone = (value: string): boolean => {
    // Regex for (XXX) XXX-XXXX format
    const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
    return phoneRegex.test(value);
  };
  type ColumnType = "datetime-local" | "number" | "text";

  const getColumnType = (column: string): ColumnType => {
    switch (column) {
      case "created_dt":
      case "data_source_modified_dt":
      case "out_of_service_date":
        return "datetime-local";
      case "phone":
      case "usdot_number":
      case "mc_mx_ff_number":
      case "power_units":
        return "number";
      default:
        return "text";
    }
  };

  const validateField = (columnName: string, value: string): boolean => {
    if (value === "" || value === undefined) {
      // Skip validation for empty or undefined values
      return true;
    }
    switch (columnName) {
      case "phone":
        // Validate phone number (example: must be 10 digits)
        return validatePhone(value);
      case "usdot_number":
        // Validate USDOT number (example: must be numeric and between 6 and 10 digits)
        return /^\d{6,10}$/.test(value);
      case "email":
        // Example validation for email
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      // Add other cases for other fields as necessary

      case "created_dt": // Example date column
      case "data_source_modified_dt":
      case "out_of_service_date":
        return validateDateTime(value);
      default:
        return true; // By default, consider valid if no specific validation
    }
  };

  const formatDate = (dateString: string) => {
    // Parse and format the date using date-fns
    const date = new Date(dateString);
    const formatDate = format(date, "yyyy-MM-dd HH:mm:ss");
    return formatDate;
  };
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
        {!showPivotTable && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => setViewGrap(!viewGraph)}
            sx={{ marginRight: "8px" }}
          >
            {viewGraph ? "View table" : "View Graph"}
          </Button>
        )}
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowPivotTable(!showPivotTable)}
          sx={{ marginRight: "8px" }}
        >
          Toggle table
        </Button>
        {showPivotTable && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleClickOpen}
            sx={{ marginRight: "8px" }}
          >
            Save Template
          </Button>
        )}
        {showPivotTable && (
          <Button variant="contained" color="secondary" onClick={resetTemplate}>
            Reset
          </Button>
        )}
      </Box>
      <Box sx={{ margin: "2.5rem 2rem 2rem" }}>
        <Paper sx={{ width: "100%", overflow: "hidden" }}>
          {showPivotTable ? (
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
                    renderers={Object.assign(
                      {},
                      TableRenderers,
                      PlotlyRenderers
                    )}
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
          ) : (
            <div>
              <Filter
                handleFilterChange={handleFilterChange}
                resetFilters={resetFilters}
                filterLength={Object.keys(filters).length}
              />

              {viewGraph ? (
                <BarChart
                  dataset={dataset}
                  xAxis={[{ scaleType: "band", dataKey: "month" }]}
                  series={series}
                  // width={500}
                  height={500}
                  // Add any additional chart settings here
                />
              ) : (
                <div>
                  <TableContainer
                    sx={{
                      height: "82vh",
                      "&::-webkit-scrollbar": {
                        width: "0",
                        height: "0",
                      },
                    }}
                  >
                    <Table stickyHeader aria-label="sticky table">
                      <TableHeader
                        onRequestSort={handleRequestSort}
                        order={order}
                        orderBy={orderBy}
                      />
                      <TableBody sx={{ position: "relative" }}>
                        {isDataLoading ? (
                          <CircularProgress
                            color="inherit"
                            sx={{
                              position: "absolute",
                              top: "30vh",
                              left: "50%",
                            }}
                          />
                        ) : filteredData.length === 0 ? (
                          <Typography
                            sx={{
                              position: "absolute",
                              top: "30vh",
                              left: "50%",
                            }}
                          >
                            No Data Found
                          </Typography>
                        ) : (
                          paginatedData.map((row, index) => {
                            const rowId = row.legal_name; // Using 'phone' as the unique identifier

                            return (
                              <TableRow
                                hover
                                role="checkbox"
                                tabIndex={-1}
                                key={index}
                              >
                                {Object.keys(data[0] || {}).map((column) => {
                                  const value = row[column];
                                  const cellKey = `${index}-${column}`; // Unique key using phone and column name
                                  const isDateColumn =
                                    column === "created_dt" ||
                                    column === "data_source_modified_dt" ||
                                    column === "out_of_service_date";
                                  return (
                                    <TableCell
                                      key={cellKey}
                                      sx={{ padding: 1, width: "200px" }}
                                    >
                                      {value === "" ? (
                                        "---"
                                      ) : (
                                        <TextField
                                          type={getColumnType(column)}
                                          value={
                                            isDateColumn && value
                                              ? formatDate(value)
                                              : cellValues[cellKey] ||
                                                value ||
                                                ""
                                          }
                                          onChange={(e) => {
                                            // Update the cell value in the cellValues state using phone as the key
                                            const newValue =
                                              isDateColumn && e.target.value
                                                ? formatDate(e.target.value)
                                                : e.target.value;

                                            if (
                                              newValue === "" ||
                                              validateField(column, newValue) ||
                                              isEditing
                                            ) {
                                              setCellValues((prevValues) => ({
                                                ...prevValues,
                                                [`${rowId}-${column}`]:
                                                  newValue,
                                              }));

                                              // Update the data state with the new cell value
                                              setData((prevData) => {
                                                const rowIndex =
                                                  prevData.findIndex(
                                                    (row) =>
                                                      row.legal_name === rowId
                                                  );
                                                if (rowIndex !== -1) {
                                                  const updatedData = [
                                                    ...prevData,
                                                  ];
                                                  updatedData[rowIndex] = {
                                                    ...updatedData[rowIndex],
                                                    [column]: newValue,
                                                  };
                                                  return updatedData;
                                                }
                                                return prevData;
                                              });
                                            }
                                          }}
                                          onFocus={() => {
                                            setIsEditing(true);
                                          }}
                                          onBlur={() => {
                                            setIsEditing(false);
                                          }}
                                          fullWidth
                                          error={
                                            !validateField(
                                              column,
                                              cellValues[cellKey] || value || ""
                                            )
                                          }
                                          helperText={
                                            !validateField(
                                              column,
                                              cellValues[cellKey] || value || ""
                                            )
                                              ? "Invalid field"
                                              : ""
                                          }
                                          sx={{
                                            width: "100%",
                                            "& .MuiInputBase-input": {
                                              padding: "8px",
                                            },
                                          }}
                                        />
                                      )}
                                    </TableCell>
                                  );
                                })}
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </div>
              )}
              <TablePagination
                rowsPerPageOptions={[10, 25]}
                component="div"
                count={filteredData.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
              />
            </div>
          )}
        </Paper>
        <SaveDialog
          open={open}
          handleClickOpen={handleClickOpen}
          handleClose={handleClose}
          saveTemplate={saveTemplate}
          loading={loading}
        />
      </Box>
      <AppFooter />
    </>
  );
}
