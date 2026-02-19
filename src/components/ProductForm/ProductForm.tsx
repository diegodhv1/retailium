import * as React from "react";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import FormHelperText from "@mui/material/FormHelperText";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Select, {
  type SelectChangeEvent,
  type SelectProps,
} from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router";
import PageContainer from "../table/PageContainer";
import { FormLabel } from "@mui/material";
export type EmployeeRole = "Market" | "Finance" | "Development";
export interface Employee {
  id: number;
  name: string;
  age: number;
  joinDate: string;
  role: EmployeeRole;
  isFullTime: boolean;
}

export interface EmployeeFormState {
  values: Partial<Omit<Employee, "id">>;
  errors: Partial<Record<keyof EmployeeFormState["values"], string>>;
}

export type FormFieldValue = string | string[] | number | boolean | File | null;

export interface EmployeeFormProps {
  formState: EmployeeFormState;
  onFieldChange: (
    name: keyof EmployeeFormState["values"],
    value: FormFieldValue
  ) => void;
  onSubmit: (formValues: Partial<EmployeeFormState["values"]>) => Promise<void>;
  onReset?: (formValues: Partial<EmployeeFormState["values"]>) => void;
  submitButtonLabel: string;
  backButtonPath?: string;
}

export default function EmployeeForm(props: EmployeeFormProps) {
  const { formState, onFieldChange, submitButtonLabel, backButtonPath } = props;

  const formValues = formState.values;
  const formErrors = formState.errors;

  const navigate = useNavigate();

  // TODO- implement isSubmitting state
  // const [isSubmitting, setIsSubmitting] = React.useState(false);

  // TODO: implement submit functionality
  // const handleSubmit = React.useCallback(
  //   async (event: React.FormEvent<HTMLFormElement>) => {
  //     event.preventDefault();

  //     setIsSubmitting(true);
  //     try {
  //       await onSubmit(formValues);
  //     } finally {
  //       setIsSubmitting(false);
  //     }
  //   },
  //   [formValues, onSubmit]
  // );

  const handleTextFieldChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFieldChange(
        event.target.name as keyof EmployeeFormState["values"],
        event.target.value
      );
    },
    [onFieldChange]
  );

  const handleNumberFieldChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFieldChange(
        event.target.name as keyof EmployeeFormState["values"],
        Number(event.target.value)
      );
    },
    [onFieldChange]
  );

  const handleCheckboxFieldChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      onFieldChange(
        event.target.name as keyof EmployeeFormState["values"],
        checked
      );
    },
    [onFieldChange]
  );

  const handleSelectFieldChange = React.useCallback(
    (event: SelectChangeEvent) => {
      onFieldChange(
        event.target.name as keyof EmployeeFormState["values"],
        event.target.value
      );
    },
    [onFieldChange]
  );

  // TODO: implement reset functionality
  // const handleReset = React.useCallback(() => {
  //   if (onReset) {
  //     onReset(formValues);
  //   }
  // }, [formValues, onReset]);

  const handleBack = React.useCallback(() => {
    navigate(backButtonPath ?? "/employees");
  }, [navigate, backButtonPath]);

  return (
    <PageContainer title="New Product" breadcrumbs={[{ title: "Product" }]}>
      <FormGroup>
        <Grid container spacing={2} sx={{ mb: 2, width: "100%" }}>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex" }}>
            <FormControl fullWidth>
              <FormLabel htmlFor="email">Name</FormLabel>
              <TextField
                onChange={handleTextFieldChange}
                required
                fullWidth
                id="email"
                placeholder="your@email.com"
                name="email"
                autoComplete="email"
                variant="outlined"
              />
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex" }}>
            <FormControl fullWidth>
              <FormLabel htmlFor="email">Name</FormLabel>
              <TextField
                onChange={handleNumberFieldChange}
                required
                fullWidth
                id="email"
                placeholder="your@email.com"
                name="email"
                autoComplete="email"
                variant="outlined"
              />
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex" }}>
            <FormControl fullWidth>
              <FormLabel htmlFor="email">Name</FormLabel>
              <TextField
                onChange={handleNumberFieldChange}
                required
                fullWidth
                id="email"
                placeholder="your@email.com"
                name="email"
                autoComplete="email"
                variant="outlined"
              />
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex" }}>
            <FormControl error={!!formErrors.role} fullWidth>
              <FormLabel htmlFor="email">Name</FormLabel>
              <Select
                value={formValues.role ?? ""}
                onChange={handleSelectFieldChange as SelectProps["onChange"]}
                labelId="employee-role-label"
                name="role"
                label="Department"
                defaultValue=""
                fullWidth
              >
                <MenuItem value="Market">Market</MenuItem>
                <MenuItem value="Finance">Finance</MenuItem>
                <MenuItem value="Development">Development</MenuItem>
              </Select>
              <FormHelperText>{formErrors.role ?? " "}</FormHelperText>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex" }}>
            <FormControl>
              <FormControlLabel
                name="isFullTime"
                control={
                  <Checkbox
                    size="large"
                    checked={formValues.isFullTime ?? false}
                    onChange={handleCheckboxFieldChange}
                  />
                }
                label="Full-time"
              />
              <FormHelperText error={!!formErrors.isFullTime}>
                {formErrors.isFullTime ?? " "}
              </FormHelperText>
            </FormControl>
          </Grid>
        </Grid>
      </FormGroup>
      <Stack direction="row" spacing={2} justifyContent="space-between">
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Back
        </Button>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => {}}>
          {submitButtonLabel}
        </Button>
      </Stack>
    </PageContainer>
  );
}
