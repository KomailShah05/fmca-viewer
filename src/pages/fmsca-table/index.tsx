// libraries
import * as React from "react";
import { useState } from "react";
import axios from "axios";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
} from "@mui/material";
import TableHeader from "../../components/fmsca-table/header";
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

  //  functions loads data from spreadsheet
  const fetchData = async () => {
    try {
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
    } catch (error) {
      console.error("There was an error fetching the data!", error);
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

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer sx={{ height: "86vh" }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHeader handleFilterChange={handleFilterChange} />
          <TableBody>
            {filteredData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => (
                <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                  {Object.keys(data[0] || {}).map((column) => {
                    const value = row[column];
                    return <TableCell key={column}>{value}</TableCell>;
                  })}
                </TableRow>
              ))}
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
  );
}
