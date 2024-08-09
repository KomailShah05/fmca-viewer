// libraries
import { TableCell, TableHead, TableRow } from "@mui/material";
import { COLUMNS_TO_INCLUDE, formatColumnName } from "../../config/constants";

interface TableHeaderProps {
  onRequestSort: (property: string) => void;
  order: "asc" | "desc";
  orderBy: string;
}

const TableHeader = ({ onRequestSort, order, orderBy }: TableHeaderProps) => {
  const handleSortRequest = (property: string) => {
    onRequestSort(property);
  };

  return (
    <TableHead>
      <TableRow>
        {COLUMNS_TO_INCLUDE.map((colName) => (
          <TableCell
            key={colName}
            style={{
              minWidth: 200,
              background: "#e3f2fd",
              fontWeight: "700",
              textTransform: "capitalize",
              fontSize: ".8125rem",
              padding: "10px",

              cursor: "pointer", // Add cursor style for better UX
            }}
            onClick={() => handleSortRequest(colName)}
            sortDirection={orderBy === colName ? order : false}
          >
            {formatColumnName(colName)}
            {orderBy === colName ? (order === "desc" ? " ▼" : " ▲") : null}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

export default TableHeader;
