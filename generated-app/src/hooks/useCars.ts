import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { Car } from "@/types";
import { GET_CARS, ADD_CAR } from "@/graphql/queries";

interface UseCarsResult {
  cars: Car[];
  loading: boolean;
  error: Error | undefined;
  addCar: (make: string, model: string, year: number, color: string) => Promise<void>;
  filterCarsByModel: (model: string) => void;
  sortCarsByYear: () => void;
}

export const useCars = (): UseCarsResult => {
  const { data, loading, error } = useQuery(GET_CARS);
  const [addCarMutation] = useMutation(ADD_CAR);
  const [cars, setCars] = useState<Car[]>([]);

  useMemo(() => {
    if (data?.cars) {
      setCars(data.cars);
    }
  }, [data]);

  const addCar = async (make: string, model: string, year: number, color: string) => {
    await addCarMutation({
      variables: { make, model, year, color },
      refetchQueries: [{ query: GET_CARS }],
    });
  };

  const filterCarsByModel = (model: string) => {
    setCars(data?.cars.filter((car: Car) => car.model.includes(model)) || []);
  };

  const sortCarsByYear = () => {
    setCars((prevCars) => [...prevCars].sort((a, b) => b.year - a.year));
  };

  return {
    cars,
    loading,
    error,
    addCar,
    filterCarsByModel,
    sortCarsByYear,
  };
};