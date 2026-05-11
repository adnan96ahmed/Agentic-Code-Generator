import { ChangeEvent, useState } from "react";
import {
  Grid,
  CircularProgress,
  Alert,
  TextField,
  Button,
} from "@mui/material";
import CarCard from "./CarCard";
import { useCars } from "@/hooks/useCars";

export default function CarList() {
  const { cars, loading, error, filterCarsByModel, sortCarsByYear } = useCars();
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    filterCarsByModel(event.target.value);
  };

  const handleSort = () => {
    sortCarsByYear();
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error.message}</Alert>;

  return (
    <>
      <TextField
        label="Search by Model"
        variant="outlined"
        value={searchTerm}
        onChange={handleSearchChange}
        sx={{ mb: 2 }}
      />
      <Button variant="contained" onClick={handleSort} sx={{ mb: 2 }}>
        Sort by Year
      </Button>
      <Grid container spacing={2}>
        {cars.map((car) => (
          <Grid item xs={12} sm={6} md={4} key={car.id}>
            <CarCard car={car} />
          </Grid>
        ))}
      </Grid>
    </>
  );
}