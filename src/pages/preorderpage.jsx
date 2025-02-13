import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { Input } from "@material-tailwind/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

function PreorderPage() {
  const { restaurantId } = useParams();
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [addedItemName, setAddedItemName] = useState('');
  const [quantities, setQuantities] = useState({});
  const [itemsInCart, setItemsInCart] = useState({});
  const navigate = useNavigate();
  const auth = getAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMenu, setFilteredMenu] = useState([]);

  const categories = [
    { id: 'all', name: 'All Items', icon: '🍽️' },
    { id: 'breakfast', name: 'Breakfast', icon: '🍳' },
    { id: 'lunch', name: 'Lunch', icon: '🍱' },
    { id: 'dinner', name: 'Dinner', icon: '🍖' },
    { id: 'beverages', name: 'Beverages', icon: '🥤' },
    { id: 'desserts', name: 'Desserts', icon: '🍰' },
    { id: 'snacks', name: 'Snacks', icon: '🍟' },
  ];

  useEffect(() => {
    const dummyMenu = [
      { 
        id: 1, 
        name: 'Pizza', 
        price: 100, 
        description: 'Delicious Italian pizza with fresh toppings',
        category: 'lunch',
        image: '/img/pizza.jpg'
      },
      { 
        id: 2, 
        name: 'Burger', 
        price: 120, 
        description: 'Juicy beef burger with cheese and veggies',
        category: 'snacks',
        image: '/img/burger.jpg'
      },
      { 
        id: 3, 
        name: 'Cappuccino', 
        price: 80, 
        description: 'Rich and creamy Italian coffee',
        category: 'beverages',
        image: '/img/Cappuccino.jpg'
      },
      {
        id: 4,
        name: 'Chocolate Cake',
        price: 300,
        weight: '1kg',
        description: 'Decadent chocolate cake with rich frosting',
        category: 'desserts',
        image: '/img/cake.jpg'
      },
      // Add more items with appropriate categories
    ];
    
    setMenu(dummyMenu);
    setFilteredMenu(dummyMenu);
    setLoading(false);
  }, [restaurantId]);

  // Enhanced search and filter functionality
  useEffect(() => {
    let filtered = menu;

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => 
        item.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredMenu(filtered);
  }, [searchQuery, selectedCategory, menu]);

  useEffect(() => {
    if (auth.currentUser) {
      const savedCart = localStorage.getItem(`cart_${auth.currentUser.uid}`);
      if (savedCart) {
        const cartItems = JSON.parse(savedCart);
        const cartQuantities = cartItems.reduce((acc, item) => {
          acc[item.id] = item.quantity;
          return acc;
        }, {});
        setQuantities(prev => ({ ...prev, ...cartQuantities }));
      }
    }
  }, [auth.currentUser]);

  useEffect(() => {
    if (auth.currentUser) {
      const savedCart = localStorage.getItem(`cart_${auth.currentUser.uid}`);
      if (savedCart) {
        const cartItems = JSON.parse(savedCart);
        const cartStatus = cartItems.reduce((acc, item) => {
          acc[item.id] = true;
          return acc;
        }, {});
        setItemsInCart(cartStatus);
      }
    }
  }, [auth.currentUser]);

  const updateQuantity = (itemId, change) => {
    setQuantities(prev => {
      const currentQuantity = prev[itemId] || 1;
      const newQuantity = currentQuantity + change;
      
      // If item is in cart
      if (itemsInCart[itemId]) {
        const userId = auth.currentUser.uid;
        const savedCart = localStorage.getItem(`cart_${userId}`);
        if (savedCart) {
          const cartItems = JSON.parse(savedCart);
          const itemIndex = cartItems.findIndex(item => item.id === itemId);
          
          if (itemIndex !== -1) {
            if (newQuantity <= 0) {
              // Remove item if quantity becomes 0
              cartItems.splice(itemIndex, 1);
              setItemsInCart(prev => ({ ...prev, [itemId]: false }));
              localStorage.setItem(`cart_${userId}`, JSON.stringify(cartItems));
              window.dispatchEvent(new Event('cartUpdated'));
              
              // Reset quantity to 1 for future additions
              return { ...prev, [itemId]: 1 };
            } else {
              cartItems[itemIndex].quantity = newQuantity;
              localStorage.setItem(`cart_${userId}`, JSON.stringify(cartItems));
              window.dispatchEvent(new Event('cartUpdated'));
            }
          }
        }
      }
      
      // Don't allow quantity to go below 1 for non-cart items
      return { ...prev, [itemId]: Math.max(1, newQuantity) };
    });
  };

  const addToCart = (item) => {
    if (!auth.currentUser) {
      navigate('/sign-in');
      return;
    }

    const userId = auth.currentUser.uid;
    const savedCart = localStorage.getItem(`cart_${userId}`);
    let cartItems = savedCart ? JSON.parse(savedCart) : [];

    if (itemsInCart[item.id]) {
      // Remove from cart
      const updatedCart = cartItems.filter(cartItem => cartItem.id !== item.id);
      localStorage.setItem(`cart_${userId}`, JSON.stringify(updatedCart));
      setItemsInCart(prev => ({ ...prev, [item.id]: false }));
      setAddedItemName(`${item.name} removed from cart`);
      setQuantities(prev => ({ ...prev, [item.id]: 1 })); // Reset quantity to 1
    } else {
      // Add to cart
      const existingItemIndex = cartItems.findIndex(cartItem => cartItem.id === item.id);
      const quantityToAdd = quantities[item.id] || 1;

      if (existingItemIndex !== -1) {
        cartItems[existingItemIndex].quantity = quantityToAdd;
      } else {
        cartItems.push({ ...item, quantity: quantityToAdd });
      }

      localStorage.setItem(`cart_${userId}`, JSON.stringify(cartItems));
      setItemsInCart(prev => ({ ...prev, [item.id]: true }));
      setAddedItemName(`${item.name} added to cart`);
    }

    window.dispatchEvent(new Event('cartUpdated'));
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-[#d0b290] min-h-screen">
      {/* Notification Popup */}
      {showNotification && (
        <div className="fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-xl z-50 transform transition-all duration-300 animate-fade-in">
          <div className="flex items-center gap-2">
            <svg
              className="w-6 h-6"
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
            <span className="font-medium">
              {addedItemName}
            </span>
          </div>
        </div>
      )}

      {/* Main container - removed fixed width container to allow full width */}
      <div className="relative">
        {/* Logo */}
        <div className="absolute top-4 left-4 z-10">
          <img 
            src="/img/Tastoria.jpg"
            alt="Tastoria Logo"
            className="h-26 w-40"
          />
        </div>

        {/* Enhanced Search Bar with modern design */}
        <div className="flex justify-center pt-24 pb-4">
          <div className="relative w-full max-w-xl group">
            <Input
              type="text"
              placeholder="Search for dishes, drinks, desserts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 pl-14 pr-12 text-gray-700 bg-white/90 backdrop-blur-sm
                border-2 border-gray-200/80 rounded-2xl shadow-lg focus:border-blue-400 
                focus:outline-none focus:ring-4 focus:ring-blue-300/30 text-lg transition-all 
                duration-300 hover:border-blue-300 hover:shadow-xl
                group-hover:shadow-lg group-hover:border-blue-300/50"
              labelProps={{
                className: "hidden",
              }}
              containerProps={{
                className: "min-w-[100px]",
              }}
            />
            <div className="absolute left-5 top-1/2 transform -translate-y-1/2 flex items-center">
              <MagnifyingGlassIcon className="h-6 w-6 text-blue-500 transition-transform duration-300 
                group-hover:scale-110 group-hover:text-blue-600" />
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full
                  bg-gray-100/80 hover:bg-red-100 text-gray-400 hover:text-red-500
                  transition-all duration-300 hover:scale-110"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            )}
            {/* Search suggestions - appears when typing */}
            {searchQuery && (
              <div className="absolute mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100
                overflow-hidden transition-all duration-300 z-50">
                <div className="p-2">
                  <div className="text-xs text-gray-500 px-3 py-1">Suggested items</div>
                  {filteredMenu.slice(0, 4).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSearchQuery(item.name);
                        // Additional handling if needed
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-blue-50 rounded-lg
                        flex items-center gap-3 transition-colors duration-200"
                    >
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-800">{item.name}</div>
                        <div className="text-xs text-gray-500">{item.category}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* Search decoration elements */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 
              to-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity 
              duration-500 -z-10"></div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="flex">
          {/* Filters Sidebar - Fixed to left */}
          <div className="w-64 min-w-[16rem] h-[calc(100vh-6rem)] sticky top-4 left-0 ml-4">
            <div className="bg-white rounded-lg shadow-lg p-4 h-full overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Categories</h2>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2
                      ${selectedCategory === category.id 
                        ? 'bg-blue-500 text-white' 
                        : 'hover:bg-gray-100 text-gray-700'
                      }`}
                  >
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                    {selectedCategory === category.id && (
                      <span className="ml-auto text-sm">
                        ({filteredMenu.length})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Menu Grid - Updated with wider cards */}
          <div className="flex-1 px-4 max-w-[1600px] mx-auto">
            <div className="ml-4">
              <h1 className="text-2xl font-bold mb-4 text-gray-800">
                {categories.find(c => c.id === selectedCategory)?.name || 'Menu Items'}
              </h1>
              
              {filteredMenu.length === 0 ? (
                <div className="text-center text-gray-600 text-xl mt-4 bg-white p-6 rounded-lg shadow-md">
                  No items found matching your criteria
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
                  {filteredMenu.map((item) => (
                    <div 
                      key={item.id} 
                      className="bg-white rounded-xl shadow-lg overflow-hidden w-full transform 
                        transition-all duration-300 hover:scale-105 hover:shadow-xl"
                    >
                      <div className="relative h-56">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 right-3 bg-white px-3 py-1.5 rounded-full shadow-md">
                          <span className="text-gray-800 font-semibold text-lg">₹{item.price}</span>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">{item.name}</h3>
                            <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                              {item.category}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-base mb-4 line-clamp-2">{item.description}</p>
                        {item.weight && (
                          <p className="text-gray-600 text-sm mb-3">Weight: {item.weight}</p>
                        )}
                        
                        <div className="flex justify-between items-center mt-4">
                          <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                            <button 
                              onClick={() => updateQuantity(item.id, -1)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-100 w-8 h-8 
                                flex items-center justify-center rounded-full transition-colors 
                                font-bold text-xl"
                            >
                              -
                            </button>
                            <span className="w-10 text-center font-medium text-xl">
                              {quantities[item.id] || 1}
                            </span>
                            <button 
                              onClick={() => updateQuantity(item.id, 1)}
                              className="text-green-500 hover:text-green-700 hover:bg-green-100 
                                w-8 h-8 flex items-center justify-center rounded-full 
                                transition-colors font-bold text-xl"
                            >
                              +
                            </button>
                          </div>
                          
                          <button
                            onClick={() => addToCart(item)}
                            className={`px-6 py-2 rounded-lg transition-colors text-base font-semibold ${
                              itemsInCart[item.id]
                                ? 'bg-red-500 text-white hover:bg-red-600'
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                          >
                            {itemsInCart[item.id] ? 'Remove' : 'Add'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PreorderPage;
