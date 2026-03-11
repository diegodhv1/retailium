import Button from "@mui/material/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router";

export interface GoBackButtonProps {
  to: string;
  label?: string;
}

export default function GoBackButton({ to, label = "Regresar" }: GoBackButtonProps) {
  const navigate = useNavigate();

  return (
    <Button
      startIcon={<ArrowBackIcon />}
      onClick={() => navigate(to)}
    >
      {label}
    </Button>
  );
}
