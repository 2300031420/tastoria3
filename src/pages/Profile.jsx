import React, { useState, useEffect } from "react";
import { getAuth, updateProfile, deleteUser } from "firebase/auth";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Avatar,
  Input,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
  Badge,
  Progress,
} from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import { 
  UserCircleIcon, 
  ShoppingBagIcon, 
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  PencilIcon,
  BellIcon,
  CakeIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "react-hot-toast";

export function Profile() {
  const auth = getAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    displayName: "",
    phoneNumber: "",
    address: "",
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activeOrders, setActiveOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    favoriteRestaurant: "",
    memberSince: "",
    rewardPoints: 0,
    nextRewardAt: 0,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');
        
        console.log("Stored user:", storedUser); // Debug log
        console.log("Token:", token); // Debug log
        
        if (!storedUser || !token) {
          console.log("No stored user or token found"); // Debug log
          localStorage.setItem('redirectAfterLogin', '/profile');
          navigate('/sign-in', { 
            state: { 
              message: "Please sign in to view your profile",
              from: "/profile"
            }
          });
          return;
        }

        setIsLoading(true);
        
        // Fetch profile data from backend
        const response = await fetch('http://localhost:5000/api/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        console.log("Profile response:", response); // Debug log

        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }

        const data = await response.json();
        console.log("Profile data:", data); // Debug log

        // Update user state with backend data
        setUser(data.user);
        setEditedProfile({
          displayName: data.user.displayName || data.user.name,
          phoneNumber: data.user.phoneNumber || '',
          address: data.user.address || ''
        });

      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Failed to load profile data');
        
        // If there's an auth error, redirect to sign in
        if (error.message.includes('unauthorized') || error.message.includes('invalid token')) {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          navigate('/sign-in');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
          <Typography className="text-blue-gray-500">Loading profile...</Typography>
        </div>
      </div>
    );
  }

  // If no user, show message
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <Typography className="text-blue-gray-500">Please sign in to view your profile.</Typography>
      </div>
    );
  }

  const handleEditProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/profile/update', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(editedProfile)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      setUser(data.user);
      setIsEditMode(false);
      toast.success('Profile updated successfully');

      // Update local storage
      const storedUser = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({
        ...storedUser,
        ...data.user
      }));

    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/profile/delete', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      // Clear local storage
      localStorage.removeItem('user');
      localStorage.removeItem('token');

      toast.success('Account deleted successfully');
      navigate('/sign-in');

    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    }
  };

  const handleReorder = (order) => {
    // Navigate to restaurant page with cart items pre-filled
    navigate(`/preorder/${order.restaurant.toLowerCase().replace(' ', '-')}`, {
      state: { reorderItems: order.items }
    });
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadError(null);

      // Initialize storage
      const storage = getStorage();
      const storageRef = ref(storage, `profile-photos/${user.uid}/${file.name}`);

      // Upload file
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);

      // Update user profile in backend
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/profile/update', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ photoURL })
      });

      if (!response.ok) {
        throw new Error('Failed to update profile photo');
      }

      // Update local state and storage
      setUser({ ...user, photoURL });
      const storedUser = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({
        ...storedUser,
        photoURL
      }));
      
      toast.success('Profile photo updated successfully!');
    } catch (error) {
      console.error('Error uploading photo:', error);
      setUploadError('Failed to upload photo. Please try again.');
      toast.error('Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="mb-8">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-700">
          <CardBody className="flex flex-col md:flex-row items-center gap-8 p-8">
            <div className="relative">
              <Avatar
                src={user?.photoURL || "/img/default-avatar.png"}
                alt="Profile Picture"
                size="xxl"
                className="h-32 w-32 ring-4 ring-white"
              />
              <div className="absolute bottom-0 right-0 flex gap-2">
                <label htmlFor="photo-upload">
                  <Button 
                    size="sm" 
                    color="white" 
                    className="rounded-full p-2"
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <PencilIcon className="h-4 w-4" />
                    )}
                  </Button>
                </label>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </div>
            </div>
            <div className="text-center md:text-left text-white">
              <Typography variant="h3" className="mb-2">
                {user?.displayName || user?.name || "User"}
              </Typography>
              <Typography variant="paragraph" className="mb-4 opacity-80">
                Member since {new Date(user?.memberSince).toLocaleDateString('en-US', { 
                  month: 'long',
                  year: 'numeric'
                })}
              </Typography>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <Button variant="outlined" color="white" className="flex items-center gap-2">
                  <BellIcon className="h-4 w-4" />
                  Notifications
                </Button>
              </div>
              {uploadError && (
                <Typography variant="small" className="mt-2 text-red-200">
                  {uploadError}
                </Typography>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardBody>
            <Typography variant="h6" color="blue-gray" className="mb-2">
              Reward Points
            </Typography>
            <Typography variant="h4" color="blue">
              {stats.rewardPoints}
            </Typography>
            <Progress value={(stats.rewardPoints/stats.nextRewardAt) * 100} color="blue" className="mt-2" />
            <Typography variant="small" className="mt-2">
              {stats.nextRewardAt - stats.rewardPoints} points until next reward
            </Typography>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Typography variant="h6" color="blue-gray" className="mb-2">
              Total Orders
            </Typography>
            <Typography variant="h4" color="green">
              {stats.totalOrders}
            </Typography>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Typography variant="h6" color="blue-gray" className="mb-2">
              Favorite Restaurant
            </Typography>
            <Typography variant="h5" color="blue-gray">
              {stats.favoriteRestaurant}
            </Typography>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Typography variant="h6" color="blue-gray" className="mb-2">
              Member Status
            </Typography>
            <div className="flex items-center gap-2">
              <CakeIcon className="h-6 w-6 text-amber-500" />
              <Typography variant="h5" color="amber">
                Gold Member
              </Typography>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} className="mb-8">
        <TabsHeader>
          <Tab value="profile" className="flex items-center gap-2">
            <UserCircleIcon className="h-4 w-4" />
            Profile
          </Tab>
          <Tab value="active-orders" className="flex items-center gap-2">
            <ShoppingBagIcon className="h-4 w-4" />
            Active Orders
          </Tab>
          <Tab value="order-history" className="flex items-center gap-2">
            <ShoppingBagIcon className="h-4 w-4" />
            Order History
          </Tab>
        </TabsHeader>

        <TabsBody animate={{ initial: { y: 20 }, animate: { y: 0 } }}>
          <TabPanel value="profile">
            <Card>
              <CardBody className="p-6">
                <Typography variant="h5" color="blue-gray" className="mb-4">
                  Personal Information
                </Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                      Email
                    </Typography>
                    <div className="flex items-center gap-4">
                      <EnvelopeIcon className="h-5 w-5 text-blue-gray-500" />
                      <Typography>{user?.email}</Typography>
                    </div>
                  </div>
                  <div>
                    <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                      Phone
                    </Typography>
                    <div className="flex items-center gap-4">
                      <PhoneIcon className="h-5 w-5 text-blue-gray-500" />
                      <Typography>{editedProfile.phoneNumber || "Add phone number"}</Typography>
                    </div>
                  </div>
                  <div>
                    <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                      Address
                    </Typography>
                    <div className="flex items-center gap-4">
                      <MapPinIcon className="h-5 w-5 text-blue-gray-500" />
                      <Typography>{editedProfile.address || "Add address"}</Typography>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex gap-4">
                  <Button 
                    color="blue" 
                    className="flex items-center gap-2"
                    onClick={() => setIsEditMode(true)}
                  >
                    <PencilIcon className="h-4 w-4" />
                    Edit Profile
                  </Button>
                  <Button 
                    color="red" 
                    variant="outlined"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    Delete Account
                  </Button>
                </div>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Active Orders Panel */}
          <TabPanel value="active-orders">
            <div className="space-y-6">
              {activeOrders.map((order) => (
                <Card key={order.id} className="overflow-hidden">
                  <CardBody>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <Typography variant="h5">{order.restaurant}</Typography>
                        <Typography color="gray">Order ID: {order.id}</Typography>
                      </div>
                      <Badge color="blue" content={order.status} />
                    </div>

                    {/* Order Progress */}
                    <div className="w-full flex justify-between mb-8">
                      {order.trackingSteps.map((step, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div className={`w-6 h-6 rounded-full ${
                            step.completed ? 'bg-green-500' : 'bg-gray-300'
                          } mb-2`} />
                          <Typography variant="small">{step.step}</Typography>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Typography>Items: {order.items.join(", ")}</Typography>
                      <Typography>Total: {order.total}</Typography>
                      <Typography>Estimated Delivery: {order.estimatedDelivery}</Typography>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </TabPanel>

          {/* Order History Panel */}
          <TabPanel value="order-history">
            <div className="space-y-4">
              {orderHistory.map((order) => (
                <Card key={order.id}>
                  <CardBody>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <Typography variant="h5">{order.restaurant}</Typography>
                        <Typography color="gray">Order ID: {order.id}</Typography>
                      </div>
                      <div className="text-right">
                        <Typography variant="h6">{order.total}</Typography>
                        <Badge color="green" content={order.status} />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Typography>Items: {order.items.join(", ")}</Typography>
                      <Typography>Date: {new Date(order.date).toLocaleDateString()}</Typography>
                      {order.rating && (
                        <div className="flex items-center gap-2">
                          <Typography>Rating:</Typography>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon 
                                key={i} 
                                className={`h-5 w-5 ${i < order.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      {order.review && (
                        <Typography className="italic">"{order.review}"</Typography>
                      )}
                    </div>
                    
                    <Button
                      variant="text"
                      color="blue"
                      size="sm"
                      className="mt-4"
                      onClick={() => handleReorder(order)}
                    >
                      Reorder
                    </Button>
                  </CardBody>
                </Card>
              ))}
            </div>
          </TabPanel>
        </TabsBody>
      </Tabs>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditMode} handler={() => setIsEditMode(false)}>
        <DialogHeader>Edit Profile</DialogHeader>
        <DialogBody>
          <div className="space-y-4">
            <Input
              label="Display Name"
              value={editedProfile.displayName}
              onChange={(e) => setEditedProfile({...editedProfile, displayName: e.target.value})}
            />
            <Input
              label="Phone Number"
              value={editedProfile.phoneNumber}
              onChange={(e) => setEditedProfile({...editedProfile, phoneNumber: e.target.value})}
            />
            <Input
              label="Address"
              value={editedProfile.address}
              onChange={(e) => setEditedProfile({...editedProfile, address: e.target.value})}
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="gray" onClick={() => setIsEditMode(false)}>
            Cancel
          </Button>
          <Button color="blue" onClick={handleEditProfile}>
            Save Changes
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} handler={() => setShowDeleteDialog(false)}>
        <DialogHeader>Confirm Account Deletion</DialogHeader>
        <DialogBody>
          Are you sure you want to delete your account? This action cannot be undone.
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="gray" onClick={() => setShowDeleteDialog(false)}>
            Cancel
          </Button>
          <Button color="red" onClick={handleDeleteAccount}>
            Delete Account
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default Profile; 