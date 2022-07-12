import { ErrorState } from "@openmrs/esm-framework";
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
import EmptyState from "../empty-state/EmptyState";

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

const FormsTable = ({ rows, error, isLoading }) => {
  const augmenteRows = rows?.map((row) => ({
    ...row,
    actions: <Link to={row.uuid}>Fill Form</Link>,
  }));

  if (isLoading) return <DataTableSkeleton />;
  if (error) {
    return (
      <EmptyState
        headerTitle="Error Loading Data"
        displayText={`Something went wrong loading data from the server. "${error?.response?.status}: ${error?.response?.statusText}"`}
      />
    );
  }
  if (augmenteRows.length === 0) {
    return (
      <EmptyState
        headerTitle="No Forms To Show"
        displayText="No forms could be found for this category. Please double check the form concept uuids and access permissions."
      />
    );
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
