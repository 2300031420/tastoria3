import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';

function PreorderModal() {
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [authStatus, setAuthStatus] = useState('checking');
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setAuthStatus('authenticated');
        setShowLoginPopup(true);
        setTimeout(() => {
          setShowLoginPopup(false);
        }, 3000);
      } else {
        localStorage.setItem('redirectAfterLogin', '/preorder');
        navigate('/sign-in', { replace: true });
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  const restaurants = [
    {
      id: '1',
      name: 'HangOut',
      image: '/img/Hangout.jpg',
      description: 'A cozy café known for its artisanal coffee and fresh pastries',
      rating: 4.5,
      reviews: 128
    },
    {
      id: '2',
      name: 'TTMM',
      image: '/img/ttmm.jpg',
      description: 'Modern fusion cuisine with a focus on healthy ingredients',
      rating: 4.3,
      reviews: 95
    },
    {
      id: '3',
      name: 'Cafe House',
      image: '/img/cafeHouse.jpg',
      description: 'Classic comfort food and specialty beverages in a rustic setting',
      rating: 4.7,
      reviews: 156
    },
    {
      id: '4',
      name: 'Golden Bakery',
      image: '/img/golden.jpg',
      description: 'Authentic Indian cuisine',
      rating: 4.4,
      reviews: 100
    }
  ];

  const handleRestaurantSelect = (e) => {
    e.preventDefault();
    if (selectedRestaurant) {
      if (authStatus === 'authenticated') {
        navigate(`/preorder/${selectedRestaurant}`);
      } else {
        localStorage.setItem('redirectAfterLogin', `/preorder/${selectedRestaurant}`);
        navigate('/sign-in');
      }
      setIsModalOpen(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (authStatus === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#d0b290]">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (authStatus === 'authenticated') {
    return (
      <div className={`min-h-screen flex flex-col bg-[#d0b290] ${isModalOpen ? '' : 'hidden'}`}>
        {showLoginPopup && (
          <div className="fixed top-4 right-4 z-30 animate-fade-in-down">
            <div className="bg-green-100 text-green-700 px-4 py-3 rounded-md shadow-lg">
              ✓ Successfully logged in!
            </div>
          </div>
        )}
        <div className="fixed top-4 left-4 sm:top-7 sm:left-10 z-20">
          <img 
            src="/img/Tastoria.jpg"
            alt="Tastoria Logo"
            className="h-20 w-32 sm:h-34 sm:w-48 mt-1"
          />
        </div>
        <div className="flex-1 px-4 sm:px-8 pt-32 sm:pt-40 pb-8">
          <div className="bg-white p-4 sm:p-8 rounded-xl shadow-xl max-w-5xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-800">
              Our Partner Restaurants
            </h2>
            
            <div className="space-y-4 sm:space-y-8">
              {restaurants.map((restaurant) => (
                <div 
                  key={restaurant.id} 
                  className={`flex flex-col sm:flex-row gap-4 sm:gap-8 p-4 sm:p-6 border-2 rounded-xl 
                    cursor-pointer hover:border-blue-500 transition-all duration-300 hover:shadow-lg 
                    ${selectedRestaurant === restaurant.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                  onClick={() => setSelectedRestaurant(restaurant.id)}
                >
                  <div className="w-full sm:w-48 h-48 flex-shrink-0">
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="w-full h-full object-cover rounded-xl shadow-md"
                    />
                  </div>
                  <div className="flex-grow py-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                        {restaurant.name}
                      </h3>
                      <div className="flex items-center bg-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-md">
                        <span className="text-yellow-500 text-lg sm:text-xl">★</span>
                        <span className="ml-1 text-base sm:text-lg font-semibold">
                          {restaurant.rating}
                        </span>
                        <span className="text-gray-500 text-sm sm:text-base ml-1">
                          ({restaurant.reviews} reviews)
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-base sm:text-lg mb-4 sm:mb-6 leading-relaxed">
                      {restaurant.description}
                    </p>
                    <button
                      onClick={handleRestaurantSelect}
                      className="w-full sm:w-auto mt-2 sm:mt-4 bg-blue-500 text-white py-2.5 sm:py-3 px-6 sm:px-8 
                        rounded-lg text-base sm:text-lg font-semibold hover:bg-blue-600 transition-all 
                        duration-300 hover:shadow-md active:transform active:scale-95"
                    >
                      Browse Menu
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default PreorderModal;
