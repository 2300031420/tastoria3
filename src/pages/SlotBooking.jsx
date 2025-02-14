import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardBody,
  Typography,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
} from "@material-tailwind/react";

export function SlotBooking() {
  const { cafeId } = useParams();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [partySize, setPartySize] = useState(1);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');

  // Add function to fetch available slots
  const fetchAvailableSlots = async (date) => {
    setIsLoading(true);
    try {
      // Temporary mock data for testing
      const mockSlots = [
        "09:00 AM",
        "10:00 AM",
        "11:00 AM",
        "12:00 PM",
        "01:00 PM",
        "02:00 PM",
        "03:00 PM"
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setAvailableSlots(mockSlots);
      
      /* Comment out the actual API call for now
      const response = await fetch(`/api/cafes/${cafeId}/slots?date=${date}`);
      const data = await response.json();
      setAvailableSlots(data.slots);
      */
      
    } catch (error) {
      console.error('Error fetching slots:', error);
      alert('Failed to fetch available slots');
    } finally {
      setIsLoading(false);
    }
  };

  // Update date selection handler
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    setSelectedTime(''); // Reset selected time when date changes
    fetchAvailableSlots(newDate);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      cafeId,
      date: selectedDate,
      time: selectedTime,
      partySize,
      name,
      contact
    });
    
    setOpenDialog(true);
    
    setTimeout(() => {
      setOpenDialog(false);
      navigate('/booking-confirmation');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-400 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto mt-20">
        <Card className="w-full shadow-xl">
          <CardBody className="p-8 md:p-12">
            <Typography variant="h3" color="blue-gray" className="mb-6">
              Reserve Your Table
            </Typography>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Contact Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number
                </label>
                <input
                  type="tel"
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Enter your contact number"
                />
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={handleDateChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Time Slots */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Time
                </label>
                {isLoading ? (
                  <div className="text-center py-4">Loading available slots...</div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTime(slot)}
                        className={`px-4 py-2 text-sm rounded-md ${
                          selectedTime === slot
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
                {selectedDate && availableSlots.length === 0 && !isLoading && (
                  <p className="text-red-500 mt-2">No available slots for this date</p>
                )}
              </div>

              {/* Party Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Guests
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => setPartySize(Math.max(1, partySize - 1))}
                    className="px-3 py-1 bg-gray-200 rounded-md"
                  >
                    -
                  </button>
                  <span className="text-lg font-medium">{partySize}</span>
                  <button
                    type="button"
                    onClick={() => setPartySize(Math.min(10, partySize + 1))}
                    className="px-3 py-1 bg-gray-200 rounded-md"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-16 bg-blue-500 hover:bg-blue-600"
                disabled={!selectedDate || !selectedTime}
              >
                Confirm Reservation
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>

      <Dialog open={openDialog} handler={() => setOpenDialog(false)}>
        <DialogHeader className="flex items-center justify-center">
          <div className="rounded-full bg-green-100 p-3">
            <svg
              className="h-8 w-8 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </DialogHeader>
        <DialogBody className="text-center">
          <Typography variant="h5" color="blue-gray" className="mb-2">
            Booking Successful!
          </Typography>
          <Typography variant="paragraph" color="gray" className="mb-6">
            Your table has been reserved successfully.
          </Typography>
        </DialogBody>
      </Dialog>
    </div>
  );
}

export default SlotBooking; 