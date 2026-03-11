import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Alert from "@mui/material/Alert";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  DataGrid,
  GridActionsCellItem,
  type GridColDef,
  type GridFilterModel,
  type GridPaginationModel,
  type GridSortModel,
  type GridEventListener,
  gridClasses,
} from "@mui/x-data-grid";

export interface DataTableFetchParams {
  paginationModel: GridPaginationModel;
  sortModel: GridSortModel;
  filterModel: GridFilterModel;
}

export interface DataTableFetchResult<T> {
  items: T[];
  itemCount: number;
}

export interface DataTableProps<T> {
  columns: GridColDef[];
  fetchData: (params: DataTableFetchParams) => Promise<DataTableFetchResult<T>>;
  initialPageSize?: number;
  pageSizeOptions?: number[];
  onRowClick?: (row: T) => void;
  onCreate?: () => void;
  actions?: {
    onEdit?: (row: T) => void;
    onDelete?: (row: T) => Promise<void>;
  };
  rowIdField?: string;
  title?: string;
}

const DEFAULT_PAGE_SIZE = 10;

export default function DataTable<T extends Record<string, unknown>>(
  props: DataTableProps<T>,
) {
  const {
    columns,
    fetchData,
    initialPageSize = DEFAULT_PAGE_SIZE,
    pageSizeOptions = [5, DEFAULT_PAGE_SIZE, 25],
    onRowClick,
    onCreate,
    actions,
    rowIdField = "id",
  } = props;

  const [paginationModel, setPaginationModel] =
    React.useState<GridPaginationModel>({
      page: 0,
      pageSize: initialPageSize,
    });
  const [filterModel, setFilterModel] = React.useState<GridFilterModel>({
    items: [],
  });
  const [sortModel, setSortModel] = React.useState<GridSortModel>([]);
  const [rowsState, setRowsState] = React.useState<{
    rows: T[];
    rowCount: number;
  }>({
    rows: [],
    rowCount: 0,
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchData({ paginationModel, sortModel, filterModel });
      setRowsState({ rows: res.items, rowCount: res.itemCount });
    } catch (err) {
      setError(err as Error);
      setRowsState({ rows: [], rowCount: 0 });
    } finally {
      setLoading(false);
    }
  }, [fetchData, paginationModel, sortModel, filterModel]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePaginationModelChange = React.useCallback(
    (model: GridPaginationModel) => {
      setPaginationModel(model);
    },
    [],
  );

  const handleFilterModelChange = React.useCallback(
    (model: GridFilterModel) => {
      setFilterModel(model);
    },
    [],
  );

  const handleSortModelChange = React.useCallback((model: GridSortModel) => {
    setSortModel(model);
  }, []);

  const handleRefresh = React.useCallback(() => {
    if (!loading) loadData();
  }, [loading, loadData]);

  const handleRowClick = React.useCallback<GridEventListener<"rowClick">>(
    ({ row }) => {
      if (onRowClick) onRowClick(row);
    },
    [onRowClick],
  );

  // add actions column if handlers provided
  const effectiveColumns = React.useMemo(() => {
    if (!actions) return columns;
    const actionCol: GridColDef = {
      field: "actions",
      type: "actions",
      headerName: "",
      flex: 1,
      align: "right",
      getActions: ({ row }) =>
        [
          actions.onEdit && (
            <GridActionsCellItem
              key="edit"
              label="Edit"
              icon={<EditIcon />}
              onClick={() => actions.onEdit!(row)}
              showInMenu={false}
            />
          ),
          actions.onDelete && (
            <GridActionsCellItem
              key="delete"
              label="Delete"
              icon={<DeleteIcon />}
              onClick={async () => await actions.onDelete!(row)}
              showInMenu={false}
            />
          ),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ].filter(Boolean) as any,
    };
    return [...columns, actionCol];
  }, [columns, actions]);

  return (
    <Box sx={{ flex: 1, width: "100%" }}>
      {error ? (
        <Alert severity="error">{error.message}</Alert>
      ) : (
        <>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <Tooltip title="Reload data" placement="right" enterDelay={500}>
              <div>
                <IconButton
                  size="small"
                  aria-label="refresh"
                  onClick={handleRefresh}
                >
                  <RefreshIcon />
                </IconButton>
              </div>
            </Tooltip>
            {onCreate && (
              <Button
                variant="contained"
                onClick={onCreate}
                startIcon={<AddIcon />}
              >
                Create
              </Button>
            )}
          </Stack>

          <DataGrid
            rows={rowsState.rows}
            rowCount={rowsState.rowCount}
            columns={effectiveColumns}
            pagination
            sortingMode="server"
            filterMode="server"
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationModelChange}
            sortModel={sortModel}
            onSortModelChange={handleSortModelChange}
            filterModel={filterModel}
            onFilterModelChange={handleFilterModelChange}
            disableRowSelectionOnClick
            onRowClick={handleRowClick}
            loading={loading}
            pageSizeOptions={pageSizeOptions}
            sx={{
              [`& .${gridClasses.columnHeader}, & .${gridClasses.cell}`]: {
                outline: "transparent",
              },
              [`& .${gridClasses.columnHeader}:focus-within, & .${gridClasses.cell}:focus-within`]:
                { outline: "none" },
              [`& .${gridClasses.row}:hover`]: {
                cursor: "pointer",
              },
              // Horizontal borders only, white background for rows
              [`& .${gridClasses.row}`]: {
                borderBottom: "1px solid",
                borderColor: "divider",
                backgroundColor: "background.paper",
              },
            }}
            slotProps={{
              baseIconButton: { size: "small" },
            }}
            getRowId={(row) => row[rowIdField]}
          />
        </>
      )}
    </Box>
  );
}
