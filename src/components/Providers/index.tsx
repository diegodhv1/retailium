import * as React from "react";
import * as AuthContextUtils from "../../context/AuthContextUtils";
import { type GridColDef } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import DataTable from "../shared/DataTable";
import { getProviders, deleteProvider, type Provider } from "../../services/providers";
import useNotifications from "../../hooks/useNotifications/useNotifications";

const INITIAL_PAGE_SIZE = 10;

export default function ProvidersList() {
  const navigate = useNavigate();
  const { company } = AuthContextUtils.useAuthContext();
  const notifications = useNotifications();

  const fetchProviders = React.useCallback(
    async () => {
      if (!company?.id) return { items: [], itemCount: 0 };

      try {
        const data = await getProviders(company.id);
        return { items: data, itemCount: data.length };
      } catch (error) {
        notifications.show(`Error cargando proveedores: ${(error as Error).message}`, { severity: "error" });
        return { items: [], itemCount: 0 };
      }
    },
    [company?.id, notifications],
  );

  const handleDelete = React.useCallback(async (row: Provider) => {
    if (!confirm(`¿Eliminar al proveedor "${row.name}"?`)) return;
    try {
      if (row.id) {
        await deleteProvider(row.id);
        notifications.show("Proveedor eliminado correctamente", { severity: "success" });
      }
    } catch (error) {
      notifications.show(`Error al eliminar proveedor: ${(error as Error).message}`, { severity: "error" });
    }
  }, [notifications]);

  const columns = React.useMemo<GridColDef<Provider>[]>(() => [
    { field: "name", headerName: "Nombre", flex: 1.5 },
    { field: "identification", headerName: "Cédula o Nit", flex: 1 },
    { field: "contact_phone", headerName: "Teléfono", flex: 1 },
    { field: "address", headerName: "Dirección", flex: 1.5 },
  ], []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Listado de Proveedores</h1>
      <DataTable<Provider>
        columns={columns}
        fetchData={fetchProviders}
        initialPageSize={INITIAL_PAGE_SIZE}
        onRowClick={(row) => navigate(`/proveedores/${row.id}`)}
        onCreate={() => navigate("/proveedores/nuevo")}
        actions={{
          onEdit: (row) => navigate(`/proveedores/${row.id}`),
          onDelete: handleDelete,
        }}
        rowIdField="id"
      />
    </div>
  );
}
