import {
  DataTable,
  DataTableSkeleton,
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
import { Link } from "react-router-dom";

const formsHeader = [
  {
    key: "name",
    header: "Form name",
  },
  {
    key: "actions",
    header: "Actions",
  },
];

const FormsTable = ({ rows }) => {
  const augmenteRows = rows?.map((row) => ({
    ...row,
    actions: <Link to={row.uuid}>Fill Form</Link>,
  }));
  if (!rows || !rows?.length) {
    return <DataTableSkeleton />;
  }
  return (
    <DataTable rows={augmenteRows} headers={formsHeader} isSortable>
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
            <div
              style={{
                position: "relative",
                display: "flex",
                height: "3rem",
                justifyContent: "flex-end",
              }}
            >
              <TableToolbar style={{ width: "20%", minWidth: "200px" }}>
                <TableToolbarContent>
                  <TableToolbarSearch onChange={onInputChange} />
                </TableToolbarContent>
              </TableToolbar>
            </div>
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
                {rows?.map((row) => (
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
