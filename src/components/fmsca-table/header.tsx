// libraries
import { TableCell, TableHead, TableRow, TextField } from "@mui/material";
import { COLUMNS_TO_INCLUDE, headerColumns } from "../../config/constants";

interface Props {
  handleFilterChange: (
    column: string
  ) => (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const TableHeader = ({ handleFilterChange }: Props) => {
  return (
    <TableHead>
      <TableRow>
        {COLUMNS_TO_INCLUDE.map((colName) => (
          <TableCell
            key={colName}
            style={{
              minWidth: 170,
              background: "#e3f2fd",
              fontWeight: "700",
              textTransform: "capitalize",
            }}
          >
            <TextField
              label={colName}
              variant="outlined"
              size="small"
              onChange={handleFilterChange(colName)}
              fullWidth
            />
          </TableCell>
        ))}
      </TableRow>
      <TableRow>
        {headerColumns.map((colName) => (
          <TableCell
            key={colName}
            style={{
              minWidth: 170,
              background: "#e3f2fd",
              fontWeight: "700",
              textTransform: "capitalize",
            }}
          >
            {colName}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

export default TableHeader;
