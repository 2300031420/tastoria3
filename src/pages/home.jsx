import React, { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardBody,
  CardHeader,
  Typography,
  Button,
  IconButton,
} from "@material-tailwind/react";
import { FeatureCard } from "@/widgets/cards";
import { featuresData } from "@/data";
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { CalendarIcon } from '@heroicons/react/24/outline';

export function Home() {
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);

  // Scroll handlers
  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    const scrollAmount = 400; // Adjust this value to control scroll distance
    
    if (container) {
      const targetScroll = container.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      container.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  const handleCafeClick = (e, cafeId) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/preorder/${cafeId}`);
  };

  const partneredCafes = [
    {
      id: "hangout-cafe",
      name: "Hangout Cafe",
      image: "/img/Hangout.jpg",
      description: "Authentic Italian pizzas and pasta",
      rating: 4.5,
      specialty: "Italian Cuisine",
      location: "Parbhani",
      menu: [
        {
          id: 1,
          name: "Margherita Pizza",
          price: 12.99,
          description: "Fresh tomatoes, mozzarella, and basil",
          image: "/img/pizza.jpg"
        },
      ]
    },
    {
      id: "ttmm",
      name: "TTmm",
      image: "/img/ttmm.jpg",
      description: "Gourmet burgers and fries",
      rating: 4.3,
      specialty: "American Cuisine",
      location: "Parbhani",
      menu: []
    },
    {
      id: "cafe-house",
      name: "Cafe House",
      image: "/img/cafeHouse.jpg",
      description: "Fresh and authentic Japanese sushi",
      rating: 4.7,
      specialty: "Japanese Cuisine",
      location: "Parbhani",
      menu: []
    },
    {
      id: "golden-bakery",
      name: "Golden Bakery",
      image: "/img/golden.jpg",
      description: "Authentic Indian cuisine",
      rating: 4.4,
      specialty: "Indian Cuisine",
      location: "Parbhani",
      menu: []
    }
  ];

  return (
    <>
      <div className="relative flex h-[60vh] content-center items-center justify-center pt-16 pb-32">
        <div className="absolute top-0 h-full w-full bg-[url('/img/background-3.jpg')] bg-cover bg-center" />
        <div className="absolute top-0 h-full w-full bg-black/60 bg-cover bg-center" />
        <div className="max-w-8xl container relative mx-auto">
          <div className="flex flex-wrap items-center">
            <div className="ml-auto mr-auto w-full px-4 text-center lg:w-8/12">
              <Typography
                variant="h1"
                color="white"
                className="mb-6 font-black text-7xl md:text-8xl lg:text-9xl" 
              >
                Tastoria  
              </Typography>
              <Typography variant="lead" color="white" className="opacity-80 text-xl md:text-2xl lg:text-2xl">
                Welcome to Tastoria - Where Every Meal Tells a Story. Discover a world
                of culinary delights, from local favorites to global cuisines, all at
                your fingertips.
              </Typography>
            </div>
          </div>
        </div>
      </div>

      <section className="-mt-32 bg-white-100 px-4 pb-20 pt-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuresData.map(({ color, title, icon, description, bgColor, iconColor, hoverBg }) => (
              <FeatureCard
                key={title}
                color={color}
                title={title}
                icon={React.createElement(icon, {
                  className: `w-10 h-10 ${iconColor}`,
                })}
                description={description}
                className={`${bgColor} ${hoverBg} transition-colors duration-300`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* New Trending Items Section */}
      <section className="px-4 pt-20 pb-20 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Typography variant="h2" color="blue-gray" className="mb-3">
              Trending Items
            </Typography>
            <Typography variant="lead" className="text-blue-gray-500">
              Most loved dishes from our restaurants
            </Typography>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: "Pizza",
                restaurant: "Hangout Cafe",
                price: "₹299",
                image: "/img/pizza.jpg",
                rating: 4.8,
                orders: "1.2k+ orders this week"
              },
              {
                name: "Chocolate Cake",
                restaurant: "Golden Bakery",
                price: "₹399",
                image: "/img/cake.jpg",
                rating: 4.9,
                orders: "800+ orders this week"
              },
              {
                name: "Cappuccino",
                restaurant: "Cafe House",
                price: "₹149",
                image: "/img/Cappuccino.jpg",
                rating: 4.7,
                orders: "950+ orders this week"
              },
              {
                name: "Classic Burger",
                restaurant: "TTmm",
                price: "₹199",
                image: "/img/burger.jpg",
                rating: 4.6,
                orders: "700+ orders this week"
              }
            ].map((item) => (
              <Card 
                key={item.name} 
                className="overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
                onClick={() => navigate(`/preorder/${item.restaurant.toLowerCase().replace(/\s+/g, '-')}`)}
              >
                <CardHeader floated={false} className="h-48 relative">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" 
                  />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                    <Typography className="flex items-center gap-1 text-sm">
                      <span className="text-yellow-700">★</span>
                      {item.rating}
                    </Typography>
                  </div>
                </CardHeader>
                <CardBody className="p-6 hover:bg-gray-50 transition-colors duration-300">
                  <Typography variant="h5" color="blue-gray" className="mb-1">
                    {item.name}
                  </Typography>
                  <Typography color="gray" className="mb-2 text-sm">
                    {item.restaurant}
                  </Typography>
                  <div className="flex justify-between items-center">
                    <Typography color="blue-gray" className="font-medium">
                      {item.price}
                    </Typography>
                    <Typography color="gray" className="text-sm">
                      {item.orders}
                    </Typography>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* New Launches Section */}
      <section className="px-4 pt-20 pb-20 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Typography variant="h2" color="blue-gray" className="mb-3">
              New Launches
            </Typography>
            <Typography variant="lead" className="text-blue-gray-500">
              Exciting new additions to our menu
            </Typography>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Pizza",
                restaurant: "Hangout Cafe",
                price: "₹299",
                image: "/img/pizza.jpg",
                tag: "New",
                description: "Loaded with fresh vegetables and exotic herbs",
                restaurantId: "hangout-cafe",
                itemId: "1"
              },
              {
                name: "Chocolate Cake",
                restaurant: "Golden Bakery",
                price: "₹399",
                image: "/img/cake.jpg",
                tag: "New",
                description: "Rich and creamy with fresh blueberry topping",
                restaurantId: "golden-bakery",
                itemId: "4"
              },
              {
                name: "Classic Burger",
                restaurant: "TTmm",
                price: "₹199",
                image: "/img/burger.jpg",
                tag: "Special",
                description: "Juicy grilled chicken with special sauce",
                restaurantId: "ttmm",
                itemId: "2"
              }
            ].map((item) => (
              <Card 
                key={item.name} 
                className="overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <CardHeader floated={false} className="h-56 relative">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" 
                  />
                  <div className="absolute top-2 left-2 bg-red-500 px-3 py-1 rounded-full">
                    <Typography className="text-white text-sm font-medium">
                      {item.tag}
                    </Typography>
                  </div>
                </CardHeader>
                <CardBody className="p-6 hover:bg-gray-50 transition-colors duration-300">
                  <Typography variant="h5" color="blue-gray" className="mb-1">
                    {item.name}
                  </Typography>
                  <Typography color="gray" className="mb-2 text-sm">
                    {item.restaurant}
                  </Typography>
                  <Typography color="gray" className="mb-3 text-sm">
                    {item.description}
                  </Typography>
                  <div className="flex justify-between items-center">
                    <Typography color="blue-gray" className="font-medium">
                      {item.price}
                    </Typography>
                    <Button 
                      size="sm" 
                      color="blue" 
                      className="rounded-full transform transition-all duration-300 hover:scale-105"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/preorder/${item.restaurantId}`, {
                          state: { selectedItemId: item.itemId }
                        });
                      }}
                    >
                      Order Now
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pt-20 pb-48 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Typography variant="h2" color="blue-gray" className="mb-3">
              Our Partnered Restaurants
            </Typography>
            <Typography variant="lead" className="text-blue-gray-500">
              Explore our curated selection of top-rated restaurants
            </Typography>
          </div>

          {/* Cafes section with scroll buttons */}
          <div className="relative w-full">
            {/* Left scroll button */}
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
            </button>

            {/* Scrollable container */}
            <div 
              ref={scrollContainerRef}
              className="overflow-x-auto flex-1 scrollbar-hide pb-4 scroll-smooth"
              style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              <div className="flex gap-6 px-8">
                {partneredCafes.map((cafe) => (
                  <Card 
                    key={cafe.id} 
                    className="shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl w-[400px] flex-shrink-0 bg-white cursor-pointer"
                    onClick={(e) => handleCafeClick(e, cafe.id)}
                  >
                    <div>
                      <CardHeader floated={false} className="relative h-72 overflow-hidden">
                        <img
                          src={cafe.image}
                          alt={cafe.name}
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                        />
                        <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-full shadow-md">
                          <Typography className="flex items-center gap-1.5 text-lg">
                            <span className="text-yellow-600">★</span>
                            {cafe.rating}
                          </Typography>
                        </div>
                      </CardHeader>
                      <CardBody className="p-6 hover:bg-gray-50 transition-colors duration-300">
                        <Typography variant="h5" color="blue-gray" className="mb-3 font-bold text-xl">
                          {cafe.name}
                        </Typography>
                        <Typography className="font-normal text-blue-gray-500 mb-3 text-lg">
                          {cafe.description}
                        </Typography>
                        <div className="flex flex-wrap gap-2 mt-4">
                          <span className="bg-blue-gray-50 px-4 py-2 rounded-full text-base hover:bg-blue-gray-100 transition-colors">
                            {cafe.specialty}
                          </span>
                          <span className="bg-blue-gray-50 px-4 py-2 rounded-full text-base hover:bg-blue-gray-100 transition-colors">
                            {cafe.location}
                          </span>
                        </div>
                        <button 
                          onClick={(e) => handleCafeClick(e, cafe.id)}
                          className="w-full mt-6 bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 transition-colors duration-300 transform hover:scale-105 text-lg"
                        >
                          View Menu
                        </button>
                      </CardBody>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Right scroll button */}
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronRightIcon className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          <div className="text-center mt-12">
            <Link to="/preorder">
              <Button variant="filled" size="lg" className="mt-6">
                Order Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-[#1c1816] text-white pt-12 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* About Section */}
            <div>
              <img src="/img/Tastoria.jpg" alt="Tastoria Logo" className="h-24 w-18 mb-4" />
              <p className="text-gray-400 mb-4">
                Tastoria - Where Every Meal Tells a Story. Experience the finest dining with our curated selection of restaurants.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/home" className="text-gray-400 hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/preorder" className="text-gray-400 hover:text-white transition-colors">
                    Order Now
                  </Link>
                </li>
                <li>
                  <Link to="/sign-in" className="text-gray-400 hover:text-white transition-colors">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link to="/sign-up" className="text-gray-400 hover:text-white transition-colors">
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
              <div className="space-y-2 text-gray-400">
                <p>Email: info@tastoria.com</p>
                <p>Phone: +91 8055221419</p>
                <p>Address: 123 Food Street, Cuisine City, FC 12345</p>
              </div>
              <div className="mt-4 flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="fab fa-facebook"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="fab fa-instagram"></i>
                </a>
                {/*<a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="fab fa-twitter"></i>
                </a>*/}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Tastoria. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Home;
