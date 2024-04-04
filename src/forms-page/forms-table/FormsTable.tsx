import { ErrorState } from '@openmrs/esm-framework';
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
} from '@carbon/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import EmptyState from '../../empty-state/EmptyState';
import styles from './styles.scss';

const FormsTable = ({ rows, error, isLoading, activeForms, activeGroupForms }) => {
  const { t } = useTranslation();

  const tableHeaders = [
    {
      key: 'display',
      header: t('formName', 'Form Name'),
      isSortable: true,
    },
    {
      key: 'actions',
      header: t('actions', 'Actions'),
    },
    {
      key: 'actions2',
      header: '',
    },
  ];

  const augmentedRows = rows?.map((row) => ({
    ...row,
    actions: (
      <Link to={`form/${row.uuid}`}>
        {activeForms.includes(row.uuid) ? t('resumeSession', 'Resume Session') : t('fillForm', 'Fill Form')}
      </Link>
    ),
    actions2: (
      <Link to={`groupform/${row.uuid}`}>
        {activeGroupForms.includes(row.uuid)
          ? t('resumeGroupSession', 'Resume Group Session')
          : t('startGroupSession', 'Start Group Session')}
      </Link>
    ),
  }));

  if (isLoading) return <DataTableSkeleton />;
  if (error) {
    return <ErrorState headerTitle={t('errorLoadingData', 'Error Loading Data')} error={error} />;
  }
  if (augmentedRows.length === 0) {
    return (
      <EmptyState
        headerTitle={t('noFormsFound', 'No Forms To Show')}
        displayText={t(
          'noFormsFoundMessage',
          'No forms could be found for this category. Please double check the form concept uuids and access permissions.',
        )}
      />
    );
  }
  return (
    <DataTable rows={augmentedRows} headers={tableHeaders}>
      {({ rows, headers, getTableProps, getHeaderProps, getRowProps, onInputChange }) => {
        return (
          <TableContainer>
            <div className={styles.toolbarWrapper}>
              <TableToolbar className={styles.tableToolbar}>
                <TableToolbarContent>
                  <TableToolbarSearch onChange={onInputChange} />
                </TableToolbarContent>
              </TableToolbar>
            </div>
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader
                      {...getHeaderProps({
                        header,
                        isSortable: header.isSortable,
                      })}
                    >
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
