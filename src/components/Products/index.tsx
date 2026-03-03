import * as React from "react";
import { type GridColDef, GridActionsCellItem } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import DataTable from "../shared/DataTable";
import DeleteIcon from "@mui/icons-material/Delete";
import { supabase } from "../../supabaseClient"; // adjust path if needed

type Product = {
  id: number;
  name: string;
  purchase_price?: number;
  selling_price?: number;
  stock?: number;
  sku?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

const INITIAL_PAGE_SIZE = 10;

export default function ProductsList() {
  const navigate = useNavigate();

  const fetchProducts = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async ({ paginationModel, sortModel, filterModel }: any) => {
      // Basic Supabase server-side pagination/sort/filter example.
      // Adapt to your schema and filtering needs.
      const page = paginationModel.page ?? 0;
      const pageSize = paginationModel.pageSize ?? INITIAL_PAGE_SIZE;
      const from = page * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from("products")
        .select("*", { count: "exact" })
        .range(from, to);

      // Sorting (take first sort instruction)
      if (sortModel && sortModel.length > 0) {
        const s = sortModel[0];
        query = query.order(s.field, { ascending: s.sort === "asc" });
      }

      // Quick filter implementation (search in name) using quickFilterValues
      const quick = filterModel?.quickFilterValues;
      if (quick && quick.length > 0) {
        // simple: use first quick value to ilike name
        query = query.ilike("name", `%${quick[0]}%`);
      }

      const { data, error, count } = await query;
      if (error) throw error;
      return { items: (data as Product[]) || [], itemCount: count || 0 };
    },
    [],
  );

  const handleDelete = React.useCallback(async (row: Product) => {
    if (!confirm(`Delete product "${row.name}"?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", row.id);
    if (error) throw error;
  }, []);

  const columns = React.useMemo<GridColDef<Product>[]>(() => {
    const base: GridColDef[] = [
      { field: "name", headerName: "Name", flex: 110 },
      {
        field: "purchase_price",
        headerName: "Purchase Price",
        type: "number",
        flex: 110,
      },
      {
        field: "selling_price",
        headerName: "Selling Price",
        type: "number",
        flex: 110,
      },
      { field: "stock", headerName: "Stock", type: "number", flex: 100 },
    ];

    const actionsCol: GridColDef = {
      field: "actions",
      type: "actions",
      headerName: "",
      width: 120,
      getActions: ({ row }) => [
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="Delete"
          onClick={async () => await handleDelete(row)}
        />,
      ],
    };

    return [...base, actionsCol];
  }, [handleDelete]);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Listado de Productos</h1>
      <DataTable<Product>
        columns={columns}
        fetchData={fetchProducts}
        initialPageSize={INITIAL_PAGE_SIZE}
        onRowClick={(row) => navigate(`/productos/${row.id}`)}
        onCreate={() => navigate("/productos/nuevo")}
        rowIdField="id"
      />
    </div>
  );
}
