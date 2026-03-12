import * as React from "react";
import * as AuthContextUtils from "../../context/AuthContextUtils";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import PrintIcon from "@mui/icons-material/Print";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { getDailyDashboardData, type DailySummary, type InventoryMovement } from "../../services/dashboard";
import useNotifications from "../../hooks/useNotifications/useNotifications";

export default function Dashboard() {
  const notifications = useNotifications(); 
  const { selectedBranchId } = AuthContextUtils.useAuthContext();
  const [loading, setLoading] = React.useState(true);
  const [summary, setSummary] = React.useState<DailySummary | null>(null);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(val);

  React.useEffect(() => {
    let active = true;
    const fetchDashboard = async () => {
      if (!selectedBranchId) return;
      try {
        setLoading(true);
        // Using today's date
        const today = new Date().toISOString(); 
        const data = await getDailyDashboardData(today, selectedBranchId);
        if (active) {
          setSummary(data);
        }
      } catch (err) {
        if (active) {
          notifications.show(`Error cargando dashboard: ${(err as Error).message}`, { severity: "error" });
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchDashboard();
    return () => {
      active = false;
    };
  }, [notifications, selectedBranchId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading || !summary) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <CircularProgress />
      </Box>
    );
  }

  // Define data grid columns for the inventory movement
  const columns: GridColDef<InventoryMovement>[] = [
    { field: "name", headerName: "Producto", flex: 1 },
    { field: "quantitySold", headerName: "Vendidos", type: "number", width: 120 },
    { field: "finalStock", headerName: "Stock Final", type: "number", width: 120 },
    {
      field: "status",
      headerName: "Estado",
      width: 150,
      renderCell: (params) => {
        const isLow = params.row.finalStock < 5;
        const isOut = params.row.finalStock <= 0;
        
        if (isOut) {
          return (
            <Stack direction="row" alignItems="center" spacing={1} sx={{ color: "error.main" }}>
              <ErrorOutlineIcon fontSize="small" />
              <Typography variant="body2">Agotado</Typography>
            </Stack>
          );
        }
        
        if (isLow) {
          return (
            <Stack direction="row" alignItems="center" spacing={1} sx={{ color: "warning.main" }}>
              <ErrorOutlineIcon fontSize="small" />
              <Typography variant="body2">Stock Bajo</Typography>
            </Stack>
          );
        }

        return (
          <Stack direction="row" alignItems="center" spacing={1} sx={{ color: "success.main" }}>
            <CheckCircleOutlineIcon fontSize="small" />
            <Typography variant="body2">Ok</Typography>
          </Stack>
        );
      },
    },
  ];

  return (
    <Box sx={{ p: 3 }} className="dashboard-container">
      {/* CSS specific for PDF export/print */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-dashboard, #printable-dashboard * {
              visibility: visible;
            }
            #printable-dashboard {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>

      <Box id="printable-dashboard">
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold">Liquidación Diaria</Typography>
            <Typography variant="body1" color="text.secondary">Resumen de operaciones del día</Typography>
          </Box>
          <Stack direction="row" spacing={3} alignItems="center">
            <Typography variant="h6" color="text.secondary">
              Fecha: {dayjs().format('DD/MM/YYYY')}
            </Typography>
            <Button 
              className="no-print"
              variant="contained" 
              color="success" 
              startIcon={<PrintIcon />} 
              onClick={handlePrint}
              sx={{
                // On mobile, only show PDF
                '& .MuiButton-startIcon': { mr: { xs: 0, sm: 1 } }
              }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                Exportar PDF / Imprimir
              </Box>
              <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                PDF
              </Box>
            </Button>
          </Stack>
        </Stack>

        {/* FINANCIAL SUMMARY CARDS */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Card 1: Ventas Totales */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Paper sx={{ 
              p: 3, 
              bgcolor: "#1a3a4c", // Dark Blue
              color: "white", 
              borderRadius: 2,
              height: "100%",
            }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ opacity: 0.9 }}>
                Ventas Totales
              </Typography>
              <Typography variant="h3" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
                {formatCurrency(summary.totalSales)}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <CheckCircleOutlineIcon fontSize="small" />
                <Typography variant="body2">Incluye Crédito y Contado</Typography>
              </Stack>
            </Paper>
          </Grid>

          {/* Card 2: Ventas de Contado */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Paper sx={{ 
              p: 3, 
              bgcolor: "#1d5c3f", // Dark Green
              color: "white", 
              borderRadius: 2,
              height: "100%",
            }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ opacity: 0.9 }}>
                Ventas de Contado
              </Typography>
              <Typography variant="h3" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
                {formatCurrency(summary.totalCash)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Efectivo / Transferencia en caja
              </Typography>
            </Paper>
          </Grid>

          {/* Card 3: Ventas a Crédito */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Paper sx={{ 
              p: 3, 
              bgcolor: "#b35900", // Dark Orange
              color: "white", 
              borderRadius: 2,
              height: "100%",
            }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ opacity: 0.9 }}>
                Ventas a Crédito
              </Typography>
              <Typography variant="h3" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
                {formatCurrency(summary.totalCredit)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Cuentas por cobrar generadas
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* DETAILS SECTION */}
        <Grid container spacing={3}>
          {/* Inventory Movements */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 3, borderRadius: 2, height: "100%" }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Movimiento de Inventario Diario
              </Typography>
              <Box sx={{ height: 400, width: "100%" }}>
                <DataGrid
                  rows={summary.inventoryMovements}
                  columns={columns}
                  disableRowSelectionOnClick
                  hideFooterSelectedRowCount
                />
              </Box>
              <Box sx={{ mt: 3, p: 2, bgcolor: "info.main", color: "info.contrastText", borderRadius: 1 }}>
                <Typography variant="h6" fontWeight="bold">
                  Total Dinero Físico a Entregar: {formatCurrency(summary.totalCash)}
                </Typography>
                <Typography variant="body2">
                  (Corresponde a las ventas de contado del día)
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Key Metrics / Top Product */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, borderRadius: 2, height: "100%", display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Métricas Clave del Día
              </Typography>

              {summary.topProduct ? (
                <Box sx={{ p: 2, bgcolor: "background.default", borderRadius: 2, mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Producto Estrella:
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 1, mb: 0.5, fontWeight: "bold" }}>
                    {summary.topProduct.name}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    Generó {formatCurrency(summary.topProduct.revenue)} hoy
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    ({summary.topProduct.quantitySold} unidades vendidas)
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ p: 2, bgcolor: "background.default", borderRadius: 2, mb: 3 }}>
                   <Typography variant="body2" color="text.secondary">
                    No hay ventas registradas hoy para calcular el producto estrella.
                  </Typography>
                </Box>
              )}

              <Box sx={{ mt: 'auto' }}>
                 <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Resumen de Operaciones
                 </Typography>
                 <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">Total Operaciones:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {summary.inventoryMovements.reduce((sum, i) => sum + i.quantitySold, 0)} arts.
                      </Typography>
                    </Stack>
                 </Stack>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
