import { Container, Grid, Typography } from "@mui/material";
import CarList from "@/components/CarList";
import AddCarForm from "@/components/AddCarForm";

export default function App() {
  return (
    <Container sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Car Inventory
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <CarList />
        </Grid>
        <Grid item xs={12} md={4}>
          <AddCarForm />
        </Grid>
      </Grid>
    </Container>
  );
}