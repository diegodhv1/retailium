import * as React from "react";
import * as AuthContextUtils from "../../context/AuthContextUtils";
import { type GridColDef } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import DataTable from "../shared/DataTable";
import { getCustomers, deleteCustomer, type Customer } from "../../services/customers";
import useNotifications from "../../hooks/useNotifications/useNotifications";

const INITIAL_PAGE_SIZE = 10;

export default function CustomersList() {
  const navigate = useNavigate();
  const { company } = AuthContextUtils.useAuthContext();
  const notifications = useNotifications();

  const fetchCustomers = React.useCallback(
    async () => {
      if (!company?.id) return { items: [], itemCount: 0 };

      try {
        // Current implementation of getCustomers fetches all for the company
        // If the API grows, we should add pagination support to the service
        const data = await getCustomers(company.id);
        
        let filteredData = [...data];

        // Basic client-side filtering/sorting if needed, but since we are using server-mode in DataTable
        // we should ideally update the service to handle this.
        // For now, let's just return the data.

        return { items: filteredData, itemCount: filteredData.length };
      } catch (error) {
        notifications.show(`Error cargando clientes: ${(error as Error).message}`, { severity: "error" });
        return { items: [], itemCount: 0 };
      }
    },
    [company?.id, notifications],
  );

  const handleDelete = React.useCallback(async (row: Customer) => {
    if (!confirm(`¿Eliminar al cliente "${row.full_name}"?`)) return;
    try {
      if (row.id) {
        await deleteCustomer(row.id);
        notifications.show("Cliente eliminado correctamente", { severity: "success" });
      }
    } catch (error) {
      notifications.show(`Error al eliminar cliente: ${(error as Error).message}`, { severity: "error" });
    }
  }, [notifications]);

  const columns = React.useMemo<GridColDef<Customer>[]>(() => [
    { field: "full_name", headerName: "Nombre Completo", flex: 1.5 },
    { field: "id_number", headerName: "Cédula", flex: 1 },
    { field: "email", headerName: "Correo", flex: 1.5 },
    { field: "phone", headerName: "Teléfono", flex: 1 },
  ], []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Listado de Clientes</h1>
      <DataTable<Customer>
        columns={columns}
        fetchData={fetchCustomers}
        initialPageSize={INITIAL_PAGE_SIZE}
        onRowClick={(row) => navigate(`/clientes/${row.id}`)}
        onCreate={() => navigate("/clientes/nuevo")}
        actions={{
          onEdit: (row) => navigate(`/clientes/${row.id}`),
          onDelete: handleDelete,
        }}
        rowIdField="id"
      />
    </div>
  );
}
