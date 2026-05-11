import { Card, CardContent, Typography, CardMedia } from "@mui/material";
import { useMediaQuery } from "@mui/material";
import type { Car } from "@/types";

interface CarCardProps {
  car: Car;
}

export default function CarCard({ car }: CarCardProps) {
  const isMobile = useMediaQuery("(max-width:640px)");
  const isTablet = useMediaQuery("(min-width:641px) and (max-width:1023px)");
  
  const imageUrl = isMobile ? car.mobile : isTablet ? car.tablet : car.desktop;

  return (
    <Card sx={{ mb: 2 }}>
      <CardMedia
        component="img"
        height="200"
        image={imageUrl}
        alt={`${car.make} ${car.model}`}
      />
      <CardContent>
        <Typography variant="h6">
          {car.year} {car.make} {car.model}
        </Typography>
        <Typography color="text.secondary">{car.color}</Typography>
      </CardContent>
    </Card>
  );
}