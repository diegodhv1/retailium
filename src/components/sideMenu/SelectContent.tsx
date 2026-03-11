import * as React from "react";
import * as AuthContextUtils from "../../context/AuthContextUtils";
import MuiAvatar from "@mui/material/Avatar";
import MuiListItemAvatar from "@mui/material/ListItemAvatar";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import Select, { type SelectChangeEvent, selectClasses } from "@mui/material/Select";
import { styled } from "@mui/material/styles";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import { getBranches, type Branch } from "../../services/branches";

const Avatar = styled(MuiAvatar)(({ theme }) => ({
  width: 28,
  height: 28,
  backgroundColor: (theme.vars || theme).palette.background.paper,
  color: (theme.vars || theme).palette.text.secondary,
  border: `1px solid ${(theme.vars || theme).palette.divider}`,
}));

const ListItemAvatar = styled(MuiListItemAvatar)({
  minWidth: 0,
  marginRight: 12,
});

export default function SelectContent() {
  const { user, company, selectedBranchId, setSelectedBranchId } = AuthContextUtils.useAuthContext();
  const [branches, setBranches] = React.useState<Branch[]>([]);

  React.useEffect(() => {
    async function fetchBranches() {
      if (!company?.id) return;
      try {
        const data = await getBranches(company.id);
        setBranches(data);
        
        // Default to the user's branch if available and no branch is selected yet
        if (!selectedBranchId) {
          if (user?.branch_id && data.some(b => b.id === user.branch_id)) {
            setSelectedBranchId(user.branch_id);
          } else if (data.length > 0) {
            setSelectedBranchId(data[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to load branches", error);
      }
    }
    fetchBranches();
  }, [user?.branch_id, company?.id, selectedBranchId, setSelectedBranchId]);

  const handleChange = (event: SelectChangeEvent) => {
    setSelectedBranchId(event.target.value);
  };

  return (
    <Select
      labelId="branch-select"
      id="branch-simple-select"
      value={selectedBranchId || ""}
      onChange={handleChange}
      displayEmpty
      inputProps={{ "aria-label": "Select branch" }}
      fullWidth
      sx={{
        maxHeight: 56,
        width: 215,
        "&.MuiList-root": {
          p: "8px",
        },
        [`& .${selectClasses.select}`]: {
          display: "flex",
          alignItems: "center",
          gap: "2px",
          pl: 1,
        },
      }}
    >
      <ListSubheader sx={{ pt: 0 }}>Sucursales</ListSubheader>
      {branches.map((branch) => (
        <MenuItem key={branch.id} value={branch.id}>
          <ListItemAvatar>
            <Avatar alt={branch.name}>
              <StorefrontRoundedIcon sx={{ fontSize: "1rem" }} />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={branch.name} secondary="Tienda o Sucursal" />
        </MenuItem>
      ))}
    </Select>
  );
}
