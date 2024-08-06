// libraries
import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import {
  Box,
  CircularProgress,
  Paper,
  TableContainer,
  TablePagination,
  Typography,
} from "@mui/material";
import PivotTableUI from "react-pivottable/PivotTableUI";

// components
import TopAppBar from "../../components/fmsca-table/AppBar";
import TableRenderers from "react-pivottable/TableRenderers";
import AppFooter from "../../components/fmsca-table/AppFooter";

// constants
import { COLUMNS_TO_INCLUDE } from "../../config/constants";

// styles
import "react-pivottable/pivottable.css";

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

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
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

  return (
    <>
      <TopAppBar />
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
                  data={paginatedData}
                  onChange={(s: any) => {
                    const newState = { ...s };
                    delete newState.data;
                    setPivotState(newState);
                  }}
                  {...pivotState}
                  renderers={{ ...TableRenderers }}
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
