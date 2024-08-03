// libraries
import { TableCell, TableHead, TableRow } from "@mui/material";
import { headerColumns } from "../../config/constants";

const TableHeader = () => {
  return (
    <TableHead>
      <TableRow>
        {headerColumns.map((colName) => (
          <TableCell
            key={colName}
            style={{
              minWidth: 100,
              background: "#e3f2fd",
              fontWeight: "700",
              textTransform: "capitalize",
              fontSize: ".8125rem",
              padding: "10px",
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
