import { useState } from "react";
import { useMutation } from "@apollo/client";
import { TextField, Button, CircularProgress, Alert } from "@mui/material";
import { ADD_CAR, GET_CARS } from "@/graphql/queries";

export default function AddCarForm() {
  const [make, setMake] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [year, setYear] = useState<number>(2023);
  const [color, setColor] = useState<string>("");
  const [addCar, { loading, error }] = useMutation(ADD_CAR, {
    refetchQueries: [{ query: GET_CARS }],
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await addCar({ variables: { make, model, year, color } });
      setMake("");
      setModel("");
      setYear(2023);
      setColor("");
    } catch (e) {
      console.error("Failed to add car", e);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label="Make"
        value={make}
        onChange={(e) => setMake(e.target.value)}
        margin="normal"
        fullWidth
        required
      />
      <TextField
        label="Model"
        value={model}
        onChange={(e) => setModel(e.target.value)}
        margin="normal"
        fullWidth
        required
      />
      <TextField
        label="Year"
        value={year}
        onChange={(e) => setYear(parseInt(e.target.value, 10))}
        margin="normal"
        fullWidth
        required
        type="number"
      />
      <TextField
        label="Color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        margin="normal"
        fullWidth
        required
      />
      <Button type="submit" variant="contained" color="primary" disabled={loading}>
        {loading ? <CircularProgress size={24} /> : "Add Car"}
      </Button>
      {error && <Alert severity="error">{error.message}</Alert>}
    </form>
  );
}