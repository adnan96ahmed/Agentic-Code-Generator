import { render, screen } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { describe, it, expect } from "vitest";
import CarCard from "@/components/CarCard";
import type { Car } from "@/types";

const mockCar: Car = {
  id: "1",
  make: "Toyota",
  model: "Camry",
  year: 2024,
  color: "Silver",
  mobile: "https://placehold.co/640x360?text=Toyota+Camry+Mobile",
  tablet: "https://placehold.co/1023x576?text=Toyota+Camry+Tablet",
  desktop: "https://placehold.co/1440x810?text=Toyota+Camry+Desktop",
};

describe("CarCard component", () => {
  it("renders car data", () => {
    render(
      <MockedProvider>
        <CarCard car={mockCar} />
      </MockedProvider>
    );

    expect(screen.getByText("2024 Toyota Camry")).toBeInTheDocument();
    expect(screen.getByText("Silver")).toBeInTheDocument();
  });
});