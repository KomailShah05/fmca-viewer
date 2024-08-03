// libraries
import * as React from "react";
import { useState } from "react";
import axios from "axios";
import {
  Box,
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
import TableHeader from "../../components/fmsca-table/AppHeader";
import Filter from "../../components/fmsca-table/AppFilter";
import TopAppBar from "../../components/fmsca-table/AppBar";

// constants
import { COLUMNS_TO_INCLUDE } from "../../config/constants";

interface RowData {
  [key: string]: string;
}
const RANGE = "FMSCA_records (2)"; // Adjust the range based on your data

export default function FMCATable() {
  const [data, setData] = useState<RowData[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState<{ [key: string]: string }>({}); // Store filter values for each column
  const [isDataLoading, setIsDataLoading] = useState(false);

  //  functions loads data from spreadsheet
  const fetchData = async () => {
    try {
      setIsDataLoading(true);
      const response = await axios.get<{ values: string[][] }>(
        `https://sheets.googleapis.com/v4/spreadsheets/1hB_LjBT9ezZigXnC-MblT2PXZledkZqBnvV23ssfSuE/values/${RANGE}?key=AIzaSyABMiPUGdBbbjQBovGe6Lx4AJxK-1yasyE`
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
            rowData[column] = row[index] || "";
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

  React.useEffect(() => {
    fetchData();
  }, []);

  // function is called when the page number has changed
  const handlePageChange = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  // function is called when the page lenght has changed
  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // function is called when the user type in textfeild to search
  const handleFilterChange =
    (column: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFilters({
        ...filters,
        [column]: event.target.value,
      });
    };

  const filteredData = data.filter((row) => {
    return Object.keys(filters).every((key) => {
      return row[key]
        ?.toString()
        .toLowerCase()
        .includes(filters[key].toLowerCase());
    });
  });
  const resetFilters = () => {
    setFilters({});
  };

  return (
    <>
      <TopAppBar />
      <Box sx={{ margin: "0.5rem 2rem 2rem" }}>
        <Filter
          handleFilterChange={handleFilterChange}
          resetFilters={resetFilters}
          filterLength={Object.keys(filters).length}
        />
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
            <Table stickyHeader aria-label="sticky table">
              <TableHeader />
              <TableBody sx={{ position: "relative" }}>
                {isDataLoading ? (
                  <CircularProgress
                    color="inherit"
                    sx={{ position: "absolute", top: "30vh", left: "50%" }}
                  />
                ) : filteredData.length === 0 ? (
                  <Typography
                    sx={{ position: "absolute", top: "30vh", left: "50%" }}
                  >
                    {" "}
                    No Data Found
                  </Typography>
                ) : (
                  filteredData
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, index) => (
                      <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                        {Object.keys(data[0] || {}).map((column) => {
                          const value = row[column];
                          return (
                            <TableCell
                              key={column}
                              style={{ padding: 12, fontSize: ".6875rem" }}
                            >
                              {value}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 100]}
            component="div"
            count={filteredData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </Paper>
      </Box>
    </>
  );
}
