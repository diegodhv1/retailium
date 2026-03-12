import * as React from "react";
import * as AuthContextUtils from "../../context/AuthContextUtils";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import CircularProgress from "@mui/material/CircularProgress";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";

import useNotifications from "../../hooks/useNotifications/useNotifications";
import { supabase } from "../../supabaseClient";
import type { Product } from "../../services/products";
import { searchCustomers, type Customer } from "../../services/customers";
import { processSale, type CartItem } from "../../services/sales";
import CreateCustomerModal from "../users/CreateCustomerModal";
import { SupabaseUserService } from "../../services/user";

export default function Sales() {
  const notifications = useNotifications();
  const { selectedBranchId } = AuthContextUtils.useAuthContext();

  // ----- State: Cart & Products -----
  const [productSearch, setProductSearch] = React.useState("");
  const [productOptions, setProductOptions] = React.useState<Product[]>([]);
  const [cartItems, setCartItems] = React.useState<CartItem[]>([]);
  const [loadingProducts, setLoadingProducts] = React.useState(false);

  // ----- State: Customers -----
  const [customerSearch, setCustomerSearch] = React.useState("");
  const [customerOptions, setCustomerOptions] = React.useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null);
  const [loadingCustomers, setLoadingCustomers] = React.useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = React.useState(false);

  // ----- State: Checkout -----
  const [isCredit, setIsCredit] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);

  // ----- Auto-fetch products on search -----
  React.useEffect(() => {
    let active = true;

    if (productSearch === "" || !selectedBranchId) {
      setProductOptions([]);
      return undefined;
    }

    const fetchProducts = async () => {
      setLoadingProducts(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("branch_id", selectedBranchId)
        .or(`name.ilike.%${productSearch}%,sku.ilike.%${productSearch}%`)
        .limit(20);

      if (error) {
        console.error("Error searching products:", error);
      } else if (active && data) {
        setProductOptions(data as Product[]);
      }
      setLoadingProducts(false);
    };

    fetchProducts();
    return () => {
      active = false;
    };
  }, [productSearch, selectedBranchId]);

  // ----- Auto-fetch customers on search -----
  React.useEffect(() => {
    let active = true;
    if (customerSearch === "") {
      setCustomerOptions([]);
      return undefined;
    }

    const fetchCustomers = async () => {
      setLoadingCustomers(true);
      try {
        const data = await searchCustomers(customerSearch);
        if (active) {
          setCustomerOptions(data);
        }
      } catch (error) {
        console.error("Error searching customers:", error);
      } finally {
        setLoadingCustomers(false);
      }
    };

    fetchCustomers();
    return () => {
      active = false;
    };
  }, [customerSearch]);

  // ----- Handlers: Cart -----
  const handleAddProductToCart = (product: Product | null) => {
    if (!product) return;
    
    // Reset search
    setProductSearch("");

    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          notifications.show(`Stock máximo alcanzado para ${product.name}`, { severity: "warning" });
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      if (product.stock <= 0) {
        notifications.show(`El producto ${product.name} no tiene stock`, { severity: "error" });
        return prev;
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const newQuantity = item.quantity + delta;
          if (newQuantity < 1) return item; // Remove handled separately
          if (newQuantity > item.product.stock) {
            notifications.show(`Solo hay ${item.product.stock} unidades de ${item.product.name} en stock`, { severity: "warning" });
            return item;
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const removeItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(val);

  const cartTotal = cartItems.reduce(
    (acc, item) => acc + item.product.selling_price * item.quantity,
    0
  );

  // ----- Handlers: Checkout -----
  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      notifications.show("El carrito está vacío", { severity: "error" });
      return;
    }

    try {
      setIsProcessing(true);
      const user = await SupabaseUserService.getAuthUser();

      await processSale(
        {
          total_amount: cartTotal,
          is_credit: isCredit,
          customer_id: selectedCustomer?.id || null,
          user_id: user?.id || null,
          branch_id: user?.branch_id || undefined, // Send branch_id from context
        },
        cartItems
      );

      notifications.show("Venta procesada exitosamente", { severity: "success" });
      
      // Reset state
      setCartItems([]);
      setSelectedCustomer(null);
      setIsCredit(false);
      setProductSearch("");
      setCustomerSearch("");

    } catch (error) {
      notifications.show((error as Error).message || "Ocurrió un error al procesar la venta", { severity: "error" });
    } finally {
      setIsProcessing(false);
    }
  };


  // ----- DataGrid Columns -----
  const columns: GridColDef<CartItem>[] = [
    {
      field: "name",
      headerName: "Producto",
      flex: 1,
      valueGetter: (_val, row) => row.product.name,
    },
    {
      field: "price",
      headerName: "Precio Unit.",
      width: 130,
      valueGetter: (_val, row) => row.product.selling_price,
      valueFormatter: (val) => formatCurrency(val as number),
    },
    {
      field: "quantity",
      headerName: "Cant.",
      width: 150,
      renderCell: (params) => (
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton 
            size="small" 
            onClick={() => updateQuantity(params.row.product.id as string, -1)}
            disabled={params.row.quantity <= 1}
          >
            <RemoveIcon fontSize="small" />
          </IconButton>
          <Typography>{params.row.quantity}</Typography>
          <IconButton 
            size="small" 
            onClick={() => updateQuantity(params.row.product.id as string, 1)}
            disabled={params.row.quantity >= params.row.product.stock}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
    {
      field: "subtotal",
      headerName: "Subtotal",
      width: 130,
      valueGetter: (_val, row) => row.product.selling_price * row.quantity,
      valueFormatter: (val) => formatCurrency(val as number),
    },
    {
      field: "actions",
      headerName: "",
      width: 60,
      renderCell: (params) => (
        <IconButton size="small" color="error" onClick={() => removeItem(params.row.product.id as string)}>
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Punto de Venta
      </Typography>

      <Grid container spacing={3}>
        {/* Left Side: Search & Cart */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ mb: 3 }}>
              <Autocomplete
                id="product-search"
                options={productOptions}
                getOptionLabel={(option) => `${option.name} (SKU: ${option.sku})`}
                filterOptions={(x) => x}
                loading={loadingProducts}
                onChange={(_event, newValue) => handleAddProductToCart(newValue)}
                onInputChange={(_event, newInputValue) => {
                  setProductSearch(newInputValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Buscar producto por nombre, SKU o código"
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <React.Fragment>
                          {loadingProducts ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </React.Fragment>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    <Box>
                      <Typography variant="body1">{option.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        SKU: {option.sku} | Stock: {option.stock} | Precio: {formatCurrency(option.selling_price)}
                      </Typography>
                    </Box>
                  </li>
                )}
              />
            </Box>

            <Box sx={{ height: 400, width: "100%" }}>
              <DataGrid
                rows={cartItems}
                columns={columns}
                getRowId={(row) => row.product.id as string}
                disableRowSelectionOnClick
                hideFooter
              />
            </Box>
          </Paper>
        </Grid>

        {/* Right Side: Customer & Checkout */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Resumen de Venta
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Cliente asociado (Opcional)
              </Typography>
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <Autocomplete
                  id="customer-search"
                  sx={{ flexGrow: 1 }}
                  options={customerOptions}
                  getOptionLabel={(option) => `${option.full_name} (${option.id_number})`}
                  filterOptions={(x) => x}
                  loading={loadingCustomers}
                  value={selectedCustomer}
                  onChange={(_event, newValue) => setSelectedCustomer(newValue)}
                  onInputChange={(_event, newInputValue) => {
                    setCustomerSearch(newInputValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Buscar cliente..."
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <React.Fragment>
                            {loadingCustomers ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </React.Fragment>
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      <Box>
                        <Typography variant="body1">{option.full_name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Doc: {option.id_number} {option.phone ? `| Tel: ${option.phone}` : ""}
                        </Typography>
                      </Box>
                    </li>
                  )}
                />
                <Button 
                  variant="outlined" 
                  sx={{ minWidth: "auto", px: 2, py: 1.8 }}
                  onClick={() => setIsCustomerModalOpen(true)}
                  title="Crear nuevo cliente"
                >
                  <PersonAddIcon />
                </Button>
              </Stack>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Método de Pago
              </Typography>
              <FormControlLabel
                control={
                  <Switch 
                    checked={isCredit} 
                    onChange={(e) => setIsCredit(e.target.checked)} 
                  />
                }
                label={isCredit ? "Crédito" : "Contado"}
              />
              {isCredit && (
                <Typography variant="caption" color="warning.main" display="block">
                  * El sistema marcará esta venta como cuenta por cobrar.
                </Typography>
              )}
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h5">Total:</Typography>
                <Typography variant="h4" color="primary.main" fontWeight="bold">
                  {formatCurrency(cartTotal)}
                </Typography>
              </Stack>
            </Box>

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleCheckout}
              disabled={cartItems.length === 0 || isProcessing}
              startIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : null}
              sx={{ 
                py: 1.5, 
                fontSize: "1.1rem",
                "&.Mui-disabled": {
                  bgcolor: "rgba(0, 0, 0, 0.26)", // Standard MUI disabled background
                  color: "#ffffff", // Pure white as requested
                  opacity: 0.8
                }
              }}
            >
              Finalizar Venta
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Shared Customer Modal */}
      <CreateCustomerModal
        open={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSuccess={(customer) => {
          setSelectedCustomer(customer);
          // Optional: You could fetch the updated customer list here if needed
        }}
      />
    </Box>
  );
}
