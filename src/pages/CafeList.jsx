import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardBody,
  CardHeader,
  Typography,
  Button,
} from "@material-tailwind/react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export function CafeList() {
  const [cafes, setCafes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    // Set up authentication listener
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Auth state changed:", currentUser); // Debug log
      setUser(currentUser);
    });

    fetchCafes();

    // Cleanup subscription
    return () => unsubscribe();
  }, [auth]);

  const fetchCafes = async () => {
    try {
      const mockCafes = [
        {
          id: "hangout-cafe",
          name: "Hangout Cafe",
          image: "/img/Hangout.jpg",
          description: "Authentic Italian pizzas and pasta",
          rating: 4.5,
          location: "Parbhani",
          availableSeats: 20
        },
        {
          id: "ttmm",
          name: "TTmm",
          image: "/img/ttmm.jpg",
          description: "Gourmet burgers and fries",
          rating: 4.3,
          location: "Parbhani",
          availableSeats: 15
        },
        {
          id: "cafe-house",
          name: "Cafe House",
          image: "/img/cafeHouse.jpg",
          description: "Fresh and authentic Japanese sushi",
          rating: 4.7,
          location: "Parbhani",
          availableSeats: 25
        },
        // ... your existing cafes
      ];

      await new Promise(resolve => setTimeout(resolve, 500));
      setCafes(mockCafes);
    } catch (error) {
      console.error('Error fetching cafes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookTable = (cafeId) => {
    console.log("Current user:", user); // Debug log
    if (!user) {
      console.log("User not authenticated, redirecting to sign in"); // Debug log
      navigate('/sign-in', { 
        state: { returnUrl: `/book-slot/${cafeId}` }
      });
      return;
    }
    console.log("User authenticated, proceeding to booking"); // Debug log
    navigate(`/book-slot/${cafeId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Typography>Loading cafes...</Typography>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Typography variant="h2" color="blue-gray" className="mb-8 text-center">
          Book a Table
        </Typography>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cafes.map((cafe) => (
            <Card key={cafe.id} className="overflow-hidden">
              <CardHeader
                floated={false}
                className="h-48 m-0 rounded-b-none"
              >
                <img
                  src={cafe.image}
                  alt={cafe.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-full shadow-md">
                  <Typography className="flex items-center gap-1.5">
                    <span className="text-yellow-600">★</span>
                    {cafe.rating}
                  </Typography>
                </div>
              </CardHeader>
              <CardBody>
                <Typography variant="h5" color="blue-gray" className="mb-2">
                  {cafe.name}
                </Typography>
                <Typography color="gray" className="mb-2">
                  {cafe.location}
                </Typography>
                <Typography color="gray" className="mb-4">
                  Available Seats: {cafe.availableSeats}
                </Typography>
                <Button
                  fullWidth
                  onClick={() => handleBookTable(cafe.id)}
                  className="mt-4"
                >
                  Book a Table
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CafeList; 