import {
  DataTable,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
} from "carbon-components-react";
import React from "react";
import { tableData } from "./mockData";

const FormsTable = () => {
  const { rows, headers } = tableData;
  return (
    <DataTable rows={rows} headers={headers} isSortable>
      {({
        rows,
        headers,
        getTableProps,
        getHeaderProps,
        getRowProps,
        onInputChange,
      }) => {
        return (
          <TableContainer>
            <TableToolbar style={{ position: "relative" }}>
              <TableToolbarContent>
                <TableToolbarSearch onChange={onInputChange} />
              </TableToolbarContent>
            </TableToolbar>
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header })}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow {...getRowProps({ row })}>
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      }}
    </DataTable>
  );
};

export default FormsTable;
export { FormsTable };
