import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import AppNavbar from "../sideMenu/AppNavbar";
import SideMenu from "../sideMenu/SideMenu";
import AppTheme from "../../../theme/AppTheme";
import { useAuthUser } from "../../hooks/useAuthUser";
import ProductForm from "../ProductForm/ProductForm";
// import Table from "../table/Table";

export default function Dashboard(props: { disableCustomTheme?: boolean }) {
  useAuthUser();
  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex" }}>
        <SideMenu />
        <AppNavbar />
        {/* <Table
          onHandleRowEdit={() => {}}
          columnsDefault={[
            { field: "id", headerName: "ID" },
            { field: "name", headerName: "Name" },
            { field: "SKU", headerName: "SKU" },
          ]}
          onHandleCreateClick={() => {}}
          onHandleRefresh={() => {}}
          onHandleRowClick={() => {}}
          onHandleRowDelete={async () => {}}
        /> */}
        <ProductForm
          formState={{ values: {}, errors: {} }}
          onSubmit={async () => Promise.resolve()}
          onFieldChange={() => {}}
          submitButtonLabel="Create Product"
        />
      </Box>
    </AppTheme>
  );
}
