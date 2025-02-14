import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { Input } from "@material-tailwind/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { toast } from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

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
        name: 'Cake',
        price: 300,
        weight: '1kg',
        description: 'Decadent chocolate cake with rich frosting',
        category: 'desserts',
        image: '/img/cake.jpg'
      },
      {
        id: 5,
        name: 'Ice Cream',
        price: 150,
        description: 'Creamy ice cream with a variety of flavors',
        category: 'desserts',
        image: '/img/icecream.jpg'
      },
      {
        id: 6,
        name: 'Pasta',
        price: 200,
        description: 'Creamy pasta with a variety of sauces',
        category: 'breakfast',
        image: '/img/pasta.jpg'
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
      setQuantities(prev => ({ ...prev, [item.id]: 1 }));
      toast.success(`${item.name} removed from cart`);
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
      
      toast.custom(
        (t) => (
          <div className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
            <div className="flex-1 w-0 p-4">
              <div className="flex items-center">
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {item.name} added to cart
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-200">
              <button
                onClick={() => {
                  navigate('/cart');
                  toast.dismiss(t.id);
                }}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
              >
                Go to Cart
              </button>
            </div>
          </div>
        ),
        {
          duration: Infinity, // Make toast persist indefinitely
          position: 'top-center',
        }
      );
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
      {/* Logo */}
      <div className="hidden md:block pt-4 pl-4">
        <img 
          src="/img/Tastoria.jpg"
          alt="Tastoria Logo"
          className="h-20 w-32 lg:h-26 lg:w-40"
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 pb-28 md:pb-24">
        {/* Search Bar */}
        <div className="sticky top-0 z-10 bg-[#d0b290]/90 backdrop-blur-sm px-3 py-3 sm:px-4 sm:py-4">
          <div className="relative w-full max-w-xl mx-auto">
            <Input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 pl-11 text-sm 
                text-gray-700 bg-white/95 backdrop-blur-sm border border-gray-200/80 
                rounded-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-all duration-200"
              labelProps={{
                className: "hidden",
              }}
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="px-3 sm:px-4 pt-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mb-4">
            {filteredMenu.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-md overflow-hidden transform transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]">
                <div className="relative h-48 sm:h-52">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                    <span className="text-gray-800 font-semibold">₹{item.price}</span>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 text-lg mb-1">{item.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>
                  
                  <div className="flex gap-2">
                    <div className="flex items-center justify-center gap-1 bg-gray-50 rounded-full p-1">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-8 h-8 flex items-center justify-center text-red-500 hover:text-red-600 
                          rounded-full hover:bg-gray-100 transition-colors duration-200"
                      >-</button>
                      <span className="w-8 text-center font-medium text-gray-800">{quantities[item.id] || 1}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-8 h-8 flex items-center justify-center text-green-500 hover:text-green-600 
                          rounded-full hover:bg-gray-100 transition-colors duration-200"
                      >+</button>
                    </div>
                    
                    <button
                      onClick={() => addToCart(item)}
                      className={`flex-1 py-2 px-4 rounded-full text-sm font-medium
                        transition-all duration-200 ${
                          itemsInCart[item.id]
                            ? 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700'
                            : 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'
                        }`}
                    >
                      {itemsInCart[item.id] ? 'Remove' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories Bar */}
      <div className="fixed bottom-0 left-0 w-full z-20">
        <div className="bg-white/95 backdrop-blur-sm p-3 shadow-lg border-t border-gray-200/50">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-safe snap-x snap-mandatory">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 
                  rounded-full text-sm font-medium snap-start
                  transition-all duration-200 ${
                    selectedCategory === category.id 
                      ? 'bg-blue-500 text-white shadow-md scale-105'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <span className="text-lg">{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <Toaster />
    </div>
  );
}

export default PreorderPage;
