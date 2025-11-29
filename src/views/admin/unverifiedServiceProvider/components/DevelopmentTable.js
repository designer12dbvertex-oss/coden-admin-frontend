/* eslint-disable */
import {
  Box,
  Flex,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  Button,
  HStack,
  Switch,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Image,
  VStack,
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
  IconButton,
  FormControl,
  FormLabel,
  Textarea,
  Select,
  List,
  ListItem,
  Checkbox,
} from '@chakra-ui/react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import Card from 'components/card/Card';
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DeleteIcon,
  SearchIcon,
} from '@chakra-ui/icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import defaultProfilePic from 'assets/img/profile/profile.webp';
const mapStyle = { width: "100%", height: "250px" };
const columnHelper = createColumnHelper();

// Custom hook for fetching users
const useFetchUsers = (baseUrl, token, navigate) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!baseUrl || !token) {
          throw new Error('Missing API URL or authentication token');
        }
        const response = await axios.get(
          `${baseUrl}api/admin/getAllUnverifiedServiceProvider`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (!response.data?.users) {
          throw new Error('Invalid API response: No users found');
        }
        setData(
          response.data.users.map((user) => ({
            id: user._id,
            full_address:user.full_address,
            profile_pic: user.profile_pic
              ? `${baseUrl}${user.profile_pic}`
              : 'N/A',
            full_name: user.full_name
              ? user.full_name
                  .toLowerCase()
                  .split(' ')
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')
              : 'N/A',
            location: user.location?.address || 'N/A',
            uniqueId: user.unique_id || 'N/A',
            mobile: user.phone || 'N/A',
            createdAt: user.createdAt
              ? new Date(user.createdAt).toISOString().split('T')[0]
              : 'N/A',
            referral_code: user.referral_code || 'N/A',
            createdBy: user.createdBy?.full_name || 'Self-Registered',
            verified: user.verificationStatus ?? false,
            active: user.active ?? true,
            inactivationInfo: user.inactivationInfo || null,
            categoryName: user.category_id?.name || 'N/A',
            subcategoryNames: user.subcategory_ids?.map((sub) => sub.name || 'N/A') || [],
            userDetails: user,
          })),
        );
      } catch (error) {
        console.error('Error fetching data:', error);
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Failed to load data';
        if (
          errorMessage.includes('Session expired') ||
          errorMessage.includes('Un-Authorized')
        ) {
          toast.error('Session expired. Please log in again.', {
            position: 'top-right',
            autoClose: 2000,
          });
          setTimeout(() => {
            localStorage.removeItem('token');
            navigate('/');
          }, 2000);
        } else {
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [baseUrl, token, navigate]);

  return { data, loading, error, setData, setError };
};

// Custom hook for fetching disputes
const useFetchDisputes = (baseUrl, token, userId, navigate) => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    const fetchDisputes = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${baseUrl}api/admin/getAllDisputes/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setDisputes(response.data.disputes || []);
      } catch (error) {
        console.error('Error fetching disputes:', error);
        const errorMessage =
          error.response?.data?.message || 'Failed to load disputes';
        if (
          errorMessage.includes('Session expired') ||
          errorMessage.includes('Un-Authorized')
        ) {
          toast.error('Session expired. Please log in again.', {
            position: 'top-right',
            autoClose: 2000,
          });
          setTimeout(() => {
            localStorage.removeItem('token');
            navigate('/');
          }, 2000);
        } else {
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDisputes();
  }, [baseUrl, token, userId, navigate]);

  return { disputes, loading, error };
};

// Custom hook for fetching categories and subcategories
const useFetchCategories = (baseUrl, token, selectedCategoryId, navigate) => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState({
    categories: false,
    subcategories: false,
  });
  const [error, setError] = useState(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading((prev) => ({ ...prev, categories: true }));
      try {
        const response = await axios.get(`${baseUrl}api/adminWork-category`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(response.data.data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        const errorMessage =
          error.response?.data?.message || 'Failed to load categories';
        if (
          errorMessage.includes('Session expired') ||
          errorMessage.includes('Un-Authorized')
        ) {
          toast.error('Session expired. Please log in again.', {
            position: 'top-right',
            autoClose: 2000,
          });
          setTimeout(() => {
            localStorage.removeItem('token');
            navigate('/');
          }, 2000);
        } else {
          setError(errorMessage);
        }
      } finally {
        setLoading((prev) => ({ ...prev, categories: false }));
      }
    };
    fetchCategories();
  }, [baseUrl, token, navigate]);

  // Fetch subcategories
  useEffect(() => {
    if (!selectedCategoryId) {
      setSubcategories([]);
      return;
    }
    const fetchSubcategories = async () => {
      setLoading((prev) => ({ ...prev, subcategories: true }));
      try {
        const response = await axios.get(
          `${baseUrl}api/adminSubcategories/${selectedCategoryId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setSubcategories(response.data.data || []);
      } catch (error) {
        console.error('Error fetching subcategories:', error);
        const errorMessage =
          error.response?.data?.message || 'Failed to load subcategories';
        if (
          errorMessage.includes('Session expired') ||
          errorMessage.includes('Un-Authorized')
        ) {
          toast.error('Session expired. Please log in again.', {
            position: 'top-right',
            autoClose: 2000,
          });
          setTimeout(() => {
            localStorage.removeItem('token');
            navigate('/');
          }, 2000);
        } else {
          setError(errorMessage);
        }
      } finally {
        setLoading((prev) => ({ ...prev, subcategories: false }));
      }
    };
    fetchSubcategories();
  }, [baseUrl, token, selectedCategoryId, navigate]);

  return { categories, subcategories, loading, error };
};



// Function to update user category and subcategory
const updateUserCategory = async (
  baseUrl,
  token,
  userId,
  categoryId,
  subcategoryIds,
  setData,
  setError,
) => {
  try {
    const response = await axios.put(
      `${baseUrl}api/admin/updateUserCategoryOrSubcategory/${userId}`,
      { category_id: categoryId, subcategory_ids: subcategoryIds },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (response.data.success) {
      toast.success('Category/Subcategory updated successfully!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return response.data; // Return response data for updating table
    } else {
      throw new Error('Failed to update category/subcategory');
    }
  } catch (error) {
    console.error('Error updating category/subcategory:', error);
    const errorMessage =
      error.response?.data?.message || 'Failed to update category/subcategory';
    setError(errorMessage);
    toast.error(errorMessage, {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    return false;
  }
};

// Function to toggle user status
const toggleUserStatus = async (
  baseUrl,
  token,
  userId,
  active,
  setData,
  setError,
  reason = '',
  disputeId = '',
) => {
  try {
    const response = await axios.patch(
      `${baseUrl}api/admin/updateUserStatus`,
      { userId, active, reason, disputeId },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (response.data.success) {
      setData((prevData) =>
        prevData.map((user) =>
          user.id === userId ? { ...user, active } : user,
        ),
      );
      toast.success(`User ${active ? 'enabled' : 'disabled'} successfully!`, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return true;
    } else {
      throw new Error('Failed to update user status');
    }
  } catch (error) {
    console.error('Error toggling user status:', error);
    const errorMessage =
      error.response?.data?.message || 'Failed to update user status';
    setError(errorMessage);
    toast.error(errorMessage, {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    return false;
  }
};

// Function to toggle user verification
const toggleUserVerified = async (
  baseUrl,
  token,
  userId,
  status,
  setData,
  setError,
  reason = '',
) => {
  try {
    const response = await axios.patch(
      `${baseUrl}api/admin/updateUserverified`,
      { userId, status, reason },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (response.data.success) {
      setData((prevData) =>
        prevData.map((user) =>
          user.id === userId
            ? { ...user, verified: status, rejectionReason: status === 'rejected' ? reason : null }
            : user,
        ),
      );
      toast.success('User verification status updated successfully!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return true;
    } else {
      throw new Error('Failed to update user verification status');
    }
  } catch (error) {
    console.error('Error toggling user verification:', error);
    const errorMessage =
      error.response?.data?.message ||
      'Failed to update user verification status';
    setError(errorMessage);
    toast.error(errorMessage, {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    return false;
  }
};

export default function ComplexTable() {
  const [sorting, setSorting] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [toggleLoading, setToggleLoading] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [expandedLocations, setExpandedLocations] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isInactivationModalOpen, setIsInactivationModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedInactivationInfo, setSelectedInactivationInfo] = useState(null);
  const [deactivateReason, setDeactivateReason] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [userId, setUserId] = useState(null);
   const [editName, setEditName] = useState("");
  const [disputeId, setDisputeId] = useState('');
  const [editMobile, setEditMobile] = useState("");
  const [mobileError, setMobileError] = useState(false);
   const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  
  
  const [newImage, setNewImage] = useState(null);
  const [newImagePreview, setNewImagePreview] = useState(null);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const itemsPerPage = 10;
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const baseUrl = useMemo(() => process.env.REACT_APP_BASE_URL || 'http://localhost:3000/', []);
  const token = localStorage.getItem('token');
  const openUserModal = (id, name, full_address, mobile, profile_pic) => {
  
    setUserId(id);
  setSelectedUser({ id, name, full_address, mobile, profile_pic });
console.log(full_address);
  setEditName(name);
  setEditMobile(mobile);
  setNewImagePreview(null);

  setIsUserModalOpen(true);
  
};
  const [tempAddress, setTempAddress] = useState({
    latitude: "",
    longitude: "",
    title: "",
    houseNo: "",
    street: "",
    area: "",
    landmark: "",
    pincode: "",
    address: ""
  });
  const navigate = useNavigate();
        const closeUserModal = () => {
  setIsUserModalOpen(false);
};
const handleSaveUser = async () => {
  try {
    const form = new FormData();
console.log(userId);
    form.append("full_name", editName || "");
    form.append("mobile", editMobile || "");

    // IMAGE ADD KARO — SAME NAME AS BACKEND (profilePic)
    if (newImage) {
      form.append("profilePic", newImage);
    }

    // FULL ADDRESS ARRAY
    form.append("full_address", JSON.stringify(userAddresses));

    console.log("FORM DATA:");
    for (let x of form.entries()) console.log(x[0], x[1]);

    const res = await fetch(`${baseUrl}api/user/updateUserData`, {
      method: "PUT",
      headers: {
        userID: userId, // 👉 Ye hi backend me read hota hai
      },
      body: form, // ❗IMPORTANT — JSON nahi, FormData hi
    });

    const data = await res.json();
    console.log("UPDATE RESPONSE:", data);

    if (data.status) {
       toast.success('Profile Updated Success!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      closeUserModal();
      fetchUsers();
    } else {
      alert(data.message || "Something went wrong");
    }
  } catch (err) {
    console.log("SAVE ERROR:", err);
  }
};

  const { isLoaded } = useLoadScript({
  googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
});

  const [userAddresses, setUserAddresses] = useState([]);
const [mapCenter, setMapCenter] = useState({ lat: 22.7196, lng: 75.8577 });

useEffect(() => {
  if (selectedUser?.full_address) {
    setUserAddresses(selectedUser.full_address);
    setMapCenter({
      lat: selectedUser.full_address[0].latitude,
      lng: selectedUser.full_address[0].longitude,
    });
  }
}, [selectedUser]);

const deleteAddress = (index) => {
  setUserAddresses((prev) => prev.filter((_, i) => i !== index));
};

const handleMapClick = (event) => {
  setMapCenter({
    lat: event.latLng.lat(),
    lng: event.latLng.lng(),
  });
};
const saveAddress = () => {
  const finalAddress = {
    latitude: tempAddress.latitude,
    longitude: tempAddress.longitude,
    title: tempAddress.title,
    houseNo: tempAddress.houseNo,
    street: tempAddress.street,
    area: tempAddress.area,
    landmark: tempAddress.landmark,
    pincode: tempAddress.pincode,
    address: tempAddress.address,  // Full Google formatted address
  };

  setUserAddresses([...userAddresses, finalAddress]);

  setIsAddressModalOpen(false);
};

const addSelectedLocation = () => {
  const latlng = { lat: mapCenter.lat, lng: mapCenter.lng };

  const geocoder = new window.google.maps.Geocoder();

  geocoder.geocode({ location: latlng }, (results, status) => {
    if (status === "OK" && results[0]) {

      setTempAddress({
        latitude: mapCenter.lat,
        longitude: mapCenter.lng,
        title: "",
        houseNo: "",
        street: "",
        area: "",
        landmark: "",
        pincode: "",
        address: results[0].formatted_address
      });

      setIsAddressModalOpen(true);  // <-- OPEN FORM MODAL
    }
  });
};
  const { data, loading, error, setData, setError } = useFetchUsers(
    baseUrl,
    token,
    navigate,
  );
  const {
    disputes,
    loading: disputesLoading,
    error: disputesError,
  } = useFetchDisputes(baseUrl, token, selectedUserId, navigate);
  const {
    categories,
    subcategories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useFetchCategories(baseUrl, token, selectedCategory, navigate);

  // Handle search filtering
  const handleSearch = useCallback(
    (query) => {
      setSearchQuery(query);
      setCurrentPage(1);
      if (!query) {
        setFilteredData(data);
        return;
      }
      const lowerQuery = query.toLowerCase();
      const filtered = data.filter(
        (item) =>
          item.full_name?.toLowerCase().includes(lowerQuery) ||
          item.location?.toLowerCase().includes(lowerQuery) ||
          item.mobile?.toLowerCase().includes(lowerQuery) ||
          item.referral_code?.toLowerCase().includes(lowerQuery) ||
          item.createdBy?.toLowerCase().includes(lowerQuery) ||
          item.uniqueId?.toLowerCase().includes(lowerQuery) ||
          item.categoryName?.toLowerCase().includes(lowerQuery),
      );
      setFilteredData(filtered);
    },
    [data],
  );

  // Initialize filteredData with all data
  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  // Reset toggleLoading when data changes
  useEffect(() => {
    setToggleLoading({});
  }, [data]);

  // Toggle handler for read more/less for location
  const handleToggleLocation = useCallback((userId) => {
    setExpandedLocations((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  }, []);

  // Toggle handler for category subcategories
  const handleToggleCategory = useCallback((userId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  }, []);

  const openDeactivateModal = useCallback((userId) => {
    setSelectedUserId(userId);
    setDeactivateReason('');
    setDisputeId('');
    setIsDeactivateModalOpen(true);
  }, []);

  const closeDeactivateModal = useCallback(() => {
    setIsDeactivateModalOpen(false);
    setSelectedUserId(null);
    setDeactivateReason('');
    setDisputeId('');
  }, []);

  const openInactivationModal = useCallback((userId, inactivationInfo) => {
    setSelectedUserId(userId);
    setSelectedInactivationInfo(inactivationInfo);
    setIsInactivationModalOpen(true);
  }, []);

  const closeInactivationModal = useCallback(() => {
    setIsInactivationModalOpen(false);
    setSelectedUserId(null);
    setSelectedInactivationInfo(null);
  }, []);

  const openCategoryModal = useCallback(
    (userId, currentCategoryId, currentSubcategoryIds) => {
      setSelectedUserId(userId);
      setSelectedCategory(currentCategoryId || '');
      setSelectedSubcategories(currentSubcategoryIds || []);
      setIsCategoryModalOpen(true);
    },
    [],
  );

  const closeCategoryModal = useCallback(() => {
    setIsCategoryModalOpen(false);
    setSelectedUserId(null);
    setSelectedCategory('');
    setSelectedSubcategories([]);
  }, []);

  const openRejectionModal = useCallback((userId) => {
    setSelectedUserId(userId);
    setRejectionReason('');
    setIsRejectionModalOpen(true);
  }, []);

  const closeRejectionModal = useCallback(() => {
    setIsRejectionModalOpen(false);
    setSelectedUserId(null);
    setRejectionReason('');
  }, []);

  // Toggle handler for user status
  const handleToggleStatus = useCallback(
    async (userId, currentActive) => {
      if (toggleLoading[userId]) return;
      setToggleLoading((prev) => ({ ...prev, [userId]: true }));

      if (currentActive) {
        openDeactivateModal(userId);
      } else {
        const success = await toggleUserStatus(
          baseUrl,
          token,
          userId,
          !currentActive,
          setData,
          setError,
        );
        setToggleLoading((prev) => ({ ...prev, [userId]: false }));
        return success;
      }
      setToggleLoading((prev) => ({ ...prev, [userId]: false }));
    },
    [baseUrl, token, setData, setError, toggleLoading, openDeactivateModal],
  );

  // Handle deactivation submission
  const handleDeactivateSubmit = useCallback(async () => {
    if (!deactivateReason) {
      toast.error('Reason for deactivation is required', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    setToggleLoading((prev) => ({ ...prev, [selectedUserId]: true }));
    const success = await toggleUserStatus(
      baseUrl,
      token,
      selectedUserId,
      false,
      setData,
      setError,
      deactivateReason,
      disputeId,
    );
    setToggleLoading((prev) => ({ ...prev, [selectedUserId]: false }));

    if (success) {
      closeDeactivateModal();
    }
  }, [
    baseUrl,
    token,
    selectedUserId,
    deactivateReason,
    disputeId,
    setData,
    setError,
    closeDeactivateModal,
  ]);

  // Handle rejection reason submission
  const handleRejectionSubmit = useCallback(async () => {
    if (!rejectionReason) {
      toast.error('Reason for rejection is required', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    setToggleLoading((prev) => ({ ...prev, [selectedUserId]: true }));
    const success = await toggleUserVerified(
      baseUrl,
      token,
      selectedUserId,
      'rejected',
      setData,
      setError,
      rejectionReason,
    );
    setToggleLoading((prev) => ({ ...prev, [selectedUserId]: false }));

    if (success) {
      closeRejectionModal();
    }
  }, [
    baseUrl,
    token,
    selectedUserId,
    rejectionReason,
    setData,
    setError,
    closeRejectionModal,
  ]);

  // Handle category update submission
  const handleCategorySubmit = useCallback(async () => {
    if (!selectedCategory) {
      toast.error('Please select a category', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    if (subcategories.length > 0 && selectedSubcategories.length === 0) {
      toast.error('Please select at least one subcategory', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    setToggleLoading((prev) => ({ ...prev, [selectedUserId]: true }));
    const result = await updateUserCategory(
      baseUrl,
      token,
      selectedUserId,
      selectedCategory,
      selectedSubcategories,
      setData,
      setError,
    );

    if (result) {
      setData((prevData) =>
        prevData.map((user) =>
          user.id === selectedUserId
            ? {
                ...user,
                categoryName:
                  categories.find((cat) => cat._id === selectedCategory)?.name ||
                  'N/A',
                subcategoryNames:
                  subcategories
                    .filter((sub) => selectedSubcategories.includes(sub._id))
                    .map((sub) => sub.name || 'N/A') || [],
                userDetails: {
                  ...user.userDetails,
                  category_id: { _id: selectedCategory },
                  subcategory_ids: selectedSubcategories.map((id) => ({
                    _id: id,
                    name:
                      subcategories.find((sub) => sub._id === id)?.name ||
                      'N/A',
                  })),
                },
              }
            : user,
        ),
      );
      closeCategoryModal();
    }
    setToggleLoading((prev) => ({ ...prev, [selectedUserId]: false }));
  }, [
    baseUrl,
    token,
    selectedUserId,
    selectedCategory,
    selectedSubcategories,
    categories,
    subcategories,
    setData,
    setError,
    closeCategoryModal,
  ]);

  const handleToggleVerified = useCallback(
    async (userId, status) => {
      if (toggleLoading[userId]) return;
      if (status === 'rejected') {
        openRejectionModal(userId);
        return;
      }

      setToggleLoading((prev) => ({ ...prev, [userId]: true }));
      const success = await toggleUserVerified(
        baseUrl,
        token,
        userId,
        status,
        setData,
        setError,
      );
      setToggleLoading((prev) => ({ ...prev, [userId]: false }));
      return success;
    },
    [baseUrl, token, setData, setError, toggleLoading, openRejectionModal],
  );

  const handleViewDetails = useCallback(
    (user) => {
      setSelectedUser(user);
      onOpen();
    },
    [onOpen],
  );

  // Pagination logic
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = useMemo(
    () => filteredData.slice(startIndex, endIndex),
    [filteredData, startIndex, endIndex],
  );

  const goToPage = useCallback(
    (page) => {
      const newPage = Math.min(Math.max(1, page), totalPages);
      if (newPage !== currentPage) {
        setCurrentPage(newPage);
      }
    },
    [currentPage, totalPages],
  );

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('sno', {
        id: 'sno',
        header: () => (
          <Text
            justifyContent="space-between"
            align="center"
            fontSize={{ sm: '10px', lg: '12px' }}
            color="gray.400"
          >
            S.No
          </Text>
        ),
        cell: (info) => (
          <Text color={textColor} fontSize="sm" fontWeight="700" whiteSpace="nowrap">
            {startIndex + info.row.index + 1}
          </Text>
        ),
      }),
      columnHelper.accessor('uniqueId', {
        id: 'uniqueId',
        header: () => (
          <Text
            justifyContent="center"
            align="center"
            fontSize={{ sm: '12px', lg: '14px' }}
            fontWeight="bold"
            color="gray.500"
            textTransform="uppercase"
          >
            Unique ID
          </Text>
        ),
        cell: (info) => (
          <Text
            color={textColor}
            fontSize="sm"
            fontWeight="600"
            textAlign="center"
            whiteSpace="nowrap"
          >
            {info.getValue()}
          </Text>
        ),
      }),
      columnHelper.accessor('profile_pic', {
        id: 'profile_pic',
        header: () => (
          <Text
            justifyContent="space-between"
            align="center"
            fontSize={{ sm: '10px', lg: '12px' }}
            color="gray.400"
          >
            PROFILE PIC
          </Text>
        ),
        cell: (info) => (
          <Flex align="center" justify="center">
            {info.getValue() !== 'N/A' ? (
              <img
                src={info.getValue()}
                alt="Profile"
                loading="lazy"
                style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                onError={(e) => (e.target.src = defaultProfilePic)}
              />
            ) : (
              <Text color={textColor} fontSize="sm" fontWeight="700">
                N/A
              </Text>
            )}
          </Flex>
        ),
      }),
      columnHelper.accessor('full_name', {
        id: 'full_name',
        header: () => (
          <Text
            justifyContent="space-between"
            align="center"
            fontSize={{ sm: '10px', lg: '12px' }}
            color="gray.400"
          >
            FULL NAME
          </Text>
        ),
        cell: (info) => (
          <Text color={textColor} fontSize="sm" fontWeight="700" whiteSpace="nowrap">
            {info.getValue()}
          </Text>
        ),
      }),
      columnHelper.accessor('createdBy', {
        id: 'createdBy',
        header: () => (
          <Text
            justifyContent="space-between"
            align="center"
            fontSize={{ sm: '10px', lg: '12px' }}
            color="gray.400"
          >
            CreatedBy
          </Text>
        ),
        cell: (info) => (
          <Text color={textColor} fontSize="sm" fontWeight="700" whiteSpace="nowrap">
            {info.getValue()}
          </Text>
        ),
      }),
      columnHelper.accessor('categoryName', {
        id: 'category',
        header: () => (
          <Text
            justifyContent="space-between"
            align="center"
            fontSize={{ sm: '10px', lg: '12px' }}
            color="gray.400"
          >
            CATEGORY
          </Text>
        ),
        cell: (info) => {
          const categoryName = info.getValue();
          const userId = info.row.original.id;
          const subcategoryNames = info.row.original.subcategoryNames || [];
          const isExpanded = expandedCategories[userId];

          return (
            <Flex
              align="center"
              alignItems="center"
              whiteSpace="normal"
              maxWidth="200px"
              direction="column"
            >
              <Flex align="center" w="100%">
                <Text
                  color={textColor}
                  fontSize="sm"
                  fontWeight="700"
                  mr={2}
                  noOfLines={1}
                >
                  {categoryName}
                </Text>
                {subcategoryNames.length > 0 && (
                  <Button
                    size="xs"
                    variant="link"
                    colorScheme="teal"
                    ml={2}
                    alignSelf="center"
                    onClick={() => handleToggleCategory(userId)}
                  >
                    {isExpanded ? 'Hide Subcategories' : 'Show Subcategories'}
                  </Button>
                )}
              </Flex>
              {isExpanded && (
                <Box mt={2} w="100%">
                  {subcategoryNames.length > 0 ? (
                    <List spacing={1}>
                      {subcategoryNames.map((subcategory, index) => (
                        <ListItem key={index} fontSize="sm" color={textColor}>
                          - {subcategory}
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Text fontSize="sm" color={textColor}>
                      No subcategories available
                    </Text>
                  )}
                </Box>
              )}
              <Button
                size="xs"
                colorScheme="teal"
                variant="outline"
                mt={2}
                onClick={() =>
                  openCategoryModal(
                    userId,
                    info.row.original.userDetails.category_id?._id,
                    info.row.original.userDetails.subcategory_ids?.map(
                      (sub) => sub._id,
                    ) || [],
                  )
                }
                isDisabled={toggleLoading[userId]}
                aria-label={`Update category for ${info.row.original.full_name}`}
              >
                Update Category
              </Button>
            </Flex>
          );
        },
      }),
      columnHelper.accessor('location', {
        id: 'location',
        header: () => (
          <Text
            justifyContent="space-between"
            align="center"
            fontSize={{ sm: '10px', lg: '12px' }}
            color="gray.400"
          >
            Saved Address
          </Text>
        ),
        cell: (info) => {
          const location = info.getValue();
          const userId = info.row.original.id;
          const isExpanded = expandedLocations[userId];
          const isLongText = location.length > 30;
          const shortText = isLongText
            ? `${location.slice(0, 30)}...`
            : location;

          return (
            <Flex
              align="center"
              alignItems="center"
              whiteSpace="normal"
              maxWidth="200px"
            >
              <Text
                color={textColor}
                fontSize="sm"
                fontWeight="700"
                mr={2}
                noOfLines={isExpanded ? undefined : 1}
              >
                {isExpanded || !isLongText ? location : shortText}
              </Text>
              {isLongText && (
                <Button
                  size="xs"
                  variant="link"
                  colorScheme="teal"
                  ml={2}
                  alignSelf="center"
                  onClick={() => handleToggleLocation(userId)}
                >
                  {isExpanded ? 'Read Less' : 'Read More'}
                </Button>
              )}
            </Flex>
          );
        },
      }),
      columnHelper.accessor('mobile', {
        id: 'mobile',
        header: () => (
          <Text
            justifyContent="space-between"
            align="center"
            fontSize={{ sm: '10px', lg: '12px' }}
            color="gray.400"
          >
            MOBILE
          </Text>
        ),
        cell: (info) => (
          <Text color={textColor} fontSize="sm" fontWeight="700" whiteSpace="nowrap">
            {info.getValue()}
          </Text>
        ),
      }),
      columnHelper.accessor('referral_code', {
        id: 'referral_code',
        header: () => (
          <Text
            justifyContent="space-between"
            align="center"
            fontSize={{ sm: '10px', lg: '12px' }}
            color="gray.400"
          >
            REFERRAL CODE
          </Text>
        ),
        cell: (info) => (
          <Text color={textColor} fontSize="sm" fontWeight="700" whiteSpace="nowrap">
            {info.getValue()}
          </Text>
        ),
      }),
      columnHelper.accessor('createdAt', {
        id: 'createdAt',
        header: () => (
          <Text
            justifyContent="space-between"
            align="center"
            fontSize={{ sm: '10px', lg: '12px' }}
            color="gray.400"
          >
            CREATED AT
          </Text>
        ),
        cell: (info) => (
          <Text color={textColor} fontSize="sm" fontWeight="700" whiteSpace="nowrap">
            {info.getValue()}
          </Text>
        ),
      }),
      columnHelper.accessor('active', {
        id: 'active',
        header: () => (
          <Text
            justifyContent="space-between"
            align="center"
            fontSize={{ sm: '10px', lg: '12px' }}
            color="gray.400"
          >
            ACTIVE
          </Text>
        ),
        cell: (info) => (
          <Flex justify="center" align="center" gap={2} whiteSpace="nowrap">
            <Switch
              isChecked={info.getValue()}
              onChange={() =>
                handleToggleStatus(info.row.original.id, info.getValue())
              }
              colorScheme="teal"
              isDisabled={toggleLoading[info.row.original.id]}
              aria-label={`Toggle active status for ${info.row.original.full_name}`}
            />
            {!info.getValue() && info.row.original.inactivationInfo && (
              <Button
                size="xs"
                colorScheme="red"
                variant="outline"
                onClick={() =>
                  openInactivationModal(
                    info.row.original.id,
                    info.row.original.inactivationInfo,
                  )
                }
                _hover={{ bg: 'red.600', color: 'white' }}
              >
                View
              </Button>
            )}
          </Flex>
        ),
      }),
      columnHelper.accessor('verified', {
        id: 'verified',
        header: () => (
          <Text
            justifyContent="space-between"
            align="center"
            fontSize={{ sm: '10px', lg: '12px' }}
            color="gray.400"
          >
            VERIFIED
          </Text>
        ),
        cell: (info) => (
          <Select
            value={info.getValue()}
            onChange={(e) =>
              handleToggleVerified(
                info.row.original.id,
                e.target.value,
              )
            }
            size="sm"
            colorScheme="teal"
            isDisabled={toggleLoading[info.row.original.id]}
            aria-label={`Set verification status for ${info.row.original.full_name}`}
            bg={useColorModeValue('gray.100', 'gray.700')}
            borderRadius="8px"
            width="120px"
          >
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </Select>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: () => (
          <Text
            justifyContent="space-between"
            align="center"
            fontSize={{ sm: '10px', lg: '12px' }}
            color="gray.400"
          >
            ACTIONS
          </Text>
        ),
        cell: (info) => (
  <HStack spacing={3}>
    {/* View Details Button */}
    <Button
      size="sm"
      colorScheme="teal"
      onClick={() => navigate(`/admin/details/${info.row.original.id}`)}
      whiteSpace="nowrap"
      aria-label={`View details for ${info.row.original.full_name}`}
    >
      View Details
    </Button>

    {/* Edit Button */}
    <Button
      size="sm"
      colorScheme="teal"
      variant="outline"
      onClick={() =>
        openUserModal(
          info.row.original.id,
          info.row.original.full_name,
          info.row.original.full_address,
          info.row.original.mobile,
          info.row.original.profile_pic
        )
      }
      _hover={{ bg: "teal.600", color: "white" }}
    >
      Edit
    </Button>
  </HStack>
)

      }),
    ],
    [
      textColor,
      handleToggleStatus,
      handleToggleVerified,
      toggleLoading,
      handleViewDetails,
      expandedLocations,
      handleToggleLocation,
      expandedCategories,
      handleToggleCategory,
      openInactivationModal,
      openCategoryModal,
      startIndex,
    ],
  );

  const table = useReactTable({
    data: paginatedData,
    columns,
    state: {
      sorting,
      pagination: { pageIndex: currentPage - 1, pageSize: itemsPerPage },
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="lg" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error" mb={4}>
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  return (
    <Card
      flexDirection="column"
      w="100%"
      px="0px"
      overflowX="auto"
    >
      <Flex
        px="25px"
        mb="8px"
        justifyContent="space-between"
        align="center"
        direction={{ base: 'column', md: 'row' }}
      >
        <Text
          color={textColor}
          fontSize={{ base: 'xl', md: '22px' }}
          fontWeight="700"
          lineHeight="100%"
        >
          Unverified Service Provider List
        </Text>
        <InputGroup
          maxW={{ base: '100%', md: '300px' }}
          mr={{ md: '10px' }}
          mb={{ base: '10px', md: '0' }}
        >
          <InputLeftElement pointerEvents="none">
            <Icon as={SearchIcon} color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search by name, location, mobile, referral, creator, unique ID, or category"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            borderRadius="12px"
            bg={useColorModeValue('gray.100', 'gray.700')}
            _focus={{
              borderColor: 'blue.500',
              boxShadow: '0 0 0 1px blue.500',
            }}
          />
        </InputGroup>
        <Flex
          direction={{ base: 'column', md: 'row' }}
          align="center"
          mt={{ base: '10px', md: '0' }}
          w={{ base: '100%', md: 'auto' }}
        >
          <Button
            colorScheme="teal"
            onClick={() => navigate('/admin/createServiceProvider')}
          >
            Create Service Provider
          </Button>
        </Flex>
      </Flex>
      <Box overflowX="auto">
        <Table variant="simple" color="gray.500" mb="24px" mt="12px" minWidth="1200px">
          <Thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <Th
                    key={header.id}
                    colSpan={header.colSpan}
                    pe="10px"
                    borderColor={borderColor}
                    cursor="pointer"
                    onClick={header.column.getToggleSortingHandler()}
                    aria-sort={
                      header.column.getIsSorted()
                        ? header.column.getIsSorted() === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
                  >
                    <Flex
                      justifyContent="space-between"
                      align="center"
                      fontSize={{ sm: '10px', lg: '12px' }}
                      color="gray.400"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {header.column.getIsSorted() ? (
                        header.column.getIsSorted() === 'asc' ? (
                          <ArrowUpIcon ml={1} />
                        ) : (
                          <ArrowDownIcon ml={1} />
                        )
                      ) : null}
                    </Flex>
                  </Th>
                ))}
              </Tr>
            ))}
          </Thead>
          <Tbody>
            {table.getRowModel().rows.map((row) => (
              <Tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <Td
                    key={cell.id}
                    fontSize={{ sm: '14px' }}
                    minW={{ sm: '100px', md: '150px', lg: '150px' }}
                    borderColor="transparent"
                    py="8px"
                    px="10px"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
      <Flex
        justifyContent="space-between"
        alignItems="center"
        px="25px"
        py="10px"
      >
        <Text fontSize="sm" color={textColor}>
          Showing {totalItems === 0 ? 0 : startIndex + 1} to{' '}
          {Math.min(endIndex, totalItems)} of {totalItems} service providers
        </Text>
        <HStack>
          <Button
            size="sm"
            colorScheme="teal"
            onClick={() => goToPage(currentPage - 1)}
            isDisabled={currentPage === 1}
            leftIcon={<ChevronLeftIcon />}
          >
            Previous
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              size="sm"
              colorScheme="teal"
              onClick={() => goToPage(page)}
              variant={currentPage === page ? 'solid' : 'outline'}
            >
              {page}
            </Button>
          ))}
          <Button
            size="sm"
            colorScheme="teal"
            onClick={() => goToPage(currentPage + 1)}
            isDisabled={currentPage === totalPages}
            rightIcon={<ChevronRightIcon />}
          >
            Next
          </Button>
        </HStack>
      </Flex>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Service Provider Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedUser && (
              <VStack align="start" spacing={4}>
                <Text>
                  <strong>Full Name:</strong> {selectedUser.full_name || 'N/A'}
                </Text>
                <Text>
                  <strong>Phone:</strong> {selectedUser.phone || 'N/A'}
                </Text>
                <Text>
                  <strong>Location:</strong> {selectedUser.location || 'N/A'}
                </Text>
                <Text>
                  <strong>Current Location:</strong>{' '}
                  {selectedUser.current_location || 'N/A'}
                </Text>
                <Text>
                  <strong>Address:</strong> {selectedUser.full_address || 'N/A'}
                </Text>
                <Text>
                  <strong>Landmark:</strong> {selectedUser.landmark || 'N/A'}
                </Text>
                <Text>
                  <strong>Colony Name:</strong>{' '}
                  {selectedUser.colony_name || 'N/A'}
                </Text>
                <Text>
                  <strong>Gali Number:</strong>{' '}
                  {selectedUser.gali_number || 'N/A'}
                </Text>
                <Text>
                  <strong>Referral Code:</strong>{' '}
                  {selectedUser.referral_code || 'N/A'}
                </Text>
                <Text>
                  <strong>Skill:</strong> {selectedUser.skill || 'N/A'}
                </Text>
                <Text>
                  <strong>Rating:</strong> {selectedUser.rating || 'N/A'}
                </Text>
                <Text>
                  <strong>Total Reviews:</strong>{' '}
                  {selectedUser.totalReview || 0}
                </Text>
                <Text>
                  <strong>Verified:</strong>{' '}
                  {selectedUser.verified ? 'Yes' : 'No'}
                </Text>
                <Text>
                  <strong>Active:</strong> {selectedUser.active ? 'Yes' : 'No'}
                </Text>
                <Text>
                  <strong>Created At:</strong>{' '}
                  {new Date(selectedUser.createdAt).toLocaleDateString('en-IN')}
                </Text>
                <Text>
                  <strong>Updated At:</strong>{' '}
                  {new Date(selectedUser.updatedAt).toLocaleDateString('en-IN')}
                </Text>
                {selectedUser.hiswork && selectedUser.hiswork.length > 0 && (
                  <>
                    <Text fontWeight="bold">Work Samples:</Text>
                    <HStack spacing={4} wrap="wrap">
                      {selectedUser.hiswork.map((work, index) => (
                        <Image
                          key={index}
                          src={`${baseUrl}${work}`}
                          alt={`Work sample ${index + 1}`}
                          boxSize="100px"
                          objectFit="cover"
                          onError={(e) => (e.target.src = defaultProfilePic)}
                        />
                      ))}
                    </HStack>
                  </>
                )}
                {selectedUser.rateAndReviews &&
                  selectedUser.rateAndReviews.length > 0 && (
                    <>
                      <Text fontWeight="bold">Reviews:</Text>
                      {selectedUser.rateAndReviews.map((review, index) => (
                        <Box
                          key={index}
                          borderWidth="1px"
                          borderRadius="md"
                          p={3}
                          w="100%"
                        >
                          <Text>
                            <strong>Rating:</strong> {review.rating}
                          </Text>
                          <Text>
                            <strong>Review:</strong> {review.review}
                          </Text>
                          {review.images && review.images.length > 0 && (
                            <HStack spacing={2} mt={2}>
                              {review.images.map((img, imgIndex) => (
                                <Image
                                  key={imgIndex}
                                  src={`${baseUrl}${img}`}
                                  alt={`Review image ${imgIndex + 1}`}
                                  boxSize="80px"
                                  objectFit="cover"
                                  onError={(e) => (e.target.src = defaultProfilePic)}
                                />
                              ))}
                            </HStack>
                          )}
                        </Box>
                      ))}
                    </>
                  )}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
      {/* Modal for deactivation reason */}
      <Modal
        isOpen={isDeactivateModalOpen}
        onClose={closeDeactivateModal}
        isCentered
      >
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent
          maxW={{ base: '90%', md: '500px' }}
          borderRadius="16px"
          bg={useColorModeValue('white', 'gray.800')}
          boxShadow="0px 4px 20px rgba(0, 0, 0, 0.2)"
        >
          <ModalHeader
            fontSize="lg"
            fontWeight="700"
            color={textColor}
            borderBottom="1px"
            borderColor={borderColor}
          >
            Deactivate Service Provider
          </ModalHeader>
          <ModalCloseButton color={textColor} />
          <ModalBody py="20px">
            {disputesLoading ? (
              <Flex justify="center" align="center" py={4}>
                <Spinner size="md" color="teal.500" />
              </Flex>
            ) : disputesError ? (
              <Alert status="error" borderRadius="8px">
                <AlertIcon />
                <Text color={textColor}>{disputesError}</Text>
              </Alert>
            ) : (
              <>
                <FormControl isRequired mb={4}>
                  <FormLabel color={textColor}>
                    Reason for Deactivation
                  </FormLabel>
                  <Textarea
                    value={deactivateReason}
                    onChange={(e) => setDeactivateReason(e.target.value)}
                    placeholder="Enter reason for deactivation"
                    bg={useColorModeValue('gray.100', 'gray.700')}
                    borderRadius="8px"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel color={textColor}>Dispute ID (Optional)</FormLabel>
                  <Select
                    value={disputeId}
                    onChange={(e) => setDisputeId(e.target.value)}
                    placeholder={
                      disputes.length === 0
                        ? 'No disputes available'
                        : 'Select dispute ID (optional)'
                    }
                    bg={useColorModeValue('gray.100', 'gray.700')}
                    borderRadius="8px"
                    isDisabled={disputes.length === 0}
                  >
                    {disputes.map((dispute) => (
                      <option key={dispute._id} value={dispute._id}>
                        {dispute.unique_id}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}
          </ModalBody>
          <ModalFooter borderTop="1px" borderColor={borderColor}>
            <Button
              colorScheme="gray"
              mr={3}
              onClick={closeDeactivateModal}
              borderRadius="12px"
              size="sm"
            >
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={handleDeactivateSubmit}
              borderRadius="12px"
              size="sm"
              isLoading={toggleLoading[selectedUserId]}
              isDisabled={disputesLoading || disputesError}
              _hover={{ bg: 'red.600' }}
            >
              Deactivate
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* Modal for rejection reason */}
      <Modal
        isOpen={isRejectionModalOpen}
        onClose={closeRejectionModal}
        isCentered
      >
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent
          maxW={{ base: '90%', md: '500px' }}
          borderRadius="16px"
          bg={useColorModeValue('white', 'gray.800')}
          boxShadow="0px 4px 20px rgba(0, 0, 0, 0.2)"
        >
          <ModalHeader
            fontSize="lg"
            fontWeight="700"
            color={textColor}
            borderBottom="1px"
            borderColor={borderColor}
          >
            Rejection Reason
          </ModalHeader>
          <ModalCloseButton color={textColor} />
          <ModalBody py="20px">
            <FormControl isRequired mb={4}>
              <FormLabel color={textColor}>
                Reason for Rejection
              </FormLabel>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection"
                bg={useColorModeValue('gray.100', 'gray.700')}
                borderRadius="8px"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter borderTop="1px" borderColor={borderColor}>
            <Button
              colorScheme="gray"
              mr={3}
              onClick={closeRejectionModal}
              borderRadius="12px"
              size="sm"
            >
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={handleRejectionSubmit}
              borderRadius="12px"
              size="sm"
              isLoading={toggleLoading[selectedUserId]}
              _hover={{ bg: 'red.600' }}
            >
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* Modal for category/subcategory update */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={closeCategoryModal}
        isCentered
      >
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent
          maxW={{ base: '90%', md: '500px' }}
          borderRadius="16px"
          bg={useColorModeValue('white', 'gray.800')}
          boxShadow="0px 4px 20px rgba(0, 0, 0, 0.2)"
        >
          <ModalHeader
            fontSize="lg"
            fontWeight="700"
            color={textColor}
            borderBottom="1px"
            borderColor={borderColor}
          >
            Update Category/Subcategory
          </ModalHeader>
          <ModalCloseButton color={textColor} />
          <ModalBody py="20px">
            {categoriesLoading.categories ? (
              <Flex justify="center" align="center" py={4}>
                <Spinner size="md" color="teal.500" />
              </Flex>
            ) : categoriesError ? (
              <Alert status="error" borderRadius="8px">
                <AlertIcon />
                <Text color={textColor}>{categoriesError}</Text>
              </Alert>
            ) : (
              <>
                <FormControl isRequired mb={4}>
                  <FormLabel color={textColor}>Category</FormLabel>
                  <Select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setSelectedSubcategories([]); // Reset subcategories on category change
                    }}
                    placeholder={
                      categories?.length === 0
                        ? 'No categories available'
                        : 'Select category'
                    }
                    bg={useColorModeValue('gray.100', 'gray.700')}
                    borderRadius="8px"
                    isDisabled={categories?.length === 0}
                    aria-label="Select category"
                  >
                    {categories?.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel color={textColor}>Subcategories</FormLabel>
                  {categoriesLoading.subcategories ? (
                    <Flex justify="center" align="center" py={4}>
                      <Spinner size="md" color="teal.500" />
                    </Flex>
                  ) : subcategories?.length === 0 && selectedCategory ? (
                    <Text color={textColor} fontSize="sm">
                      No subcategories available for this category
                    </Text>
                  ) : (
                    <VStack align="start" spacing={2}>
                      {subcategories?.map((subcategory) => (
                        <Checkbox
                          key={subcategory._id}
                          isChecked={selectedSubcategories.includes(
                            subcategory._id,
                          )}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSubcategories((prev) => [
                                ...prev,
                                subcategory._id,
                              ]);
                            } else {
                              setSelectedSubcategories((prev) =>
                                prev.filter((id) => id !== subcategory._id),
                              );
                            }
                          }}
                          colorScheme="teal"
                        >
                          {subcategory.name}
                        </Checkbox>
                      ))}
                    </VStack>
                  )}
                </FormControl>
              </>
            )}
          </ModalBody>
          <ModalFooter borderTop="1px" borderColor={borderColor}>
            <Button
              colorScheme="gray"
              mr={3}
              onClick={closeCategoryModal}
              borderRadius="12px"
              size="sm"
            >
              Cancel
            </Button>
            <Button
              colorScheme="teal"
              onClick={handleCategorySubmit}
              borderRadius="12px"
              size="sm"
              isLoading={toggleLoading[selectedUserId]}
              isDisabled={
                categoriesLoading.categories ||
                categoriesLoading.subcategories ||
                categoriesError ||
                !selectedCategory
              }
              _hover={{ bg: 'teal.600' }}
            >
              Update
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* Modal for inactivation details */}
      <Modal
        isOpen={isInactivationModalOpen}
        onClose={closeInactivationModal}
        isCentered
      >
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent
          maxW={{ base: '90%', md: '600px' }}
          borderRadius="16px"
          bg={useColorModeValue('white', 'gray.800')}
          boxShadow="0px 4px 20px rgba(0, 0, 0, 0.2)"
        >
          <ModalHeader
            fontSize="lg"
            fontWeight="700"
            color={textColor}
            borderBottom="1px"
            borderColor={borderColor}
          >
            Inactivation Details
          </ModalHeader>
          <ModalCloseButton color={textColor} />
          <ModalBody py="20px">
            {selectedInactivationInfo && (
              <Box
                p={4}
                border="1px"
                borderColor={borderColor}
                borderRadius="8px"
              >
                <Text fontSize="md" fontWeight="600" color={textColor} mb={2}>
                  Inactivation Details
                </Text>
                <Text fontSize="sm" color={textColor}>
                  <strong>Inactivated By:</strong>{' '}
                  {selectedInactivationInfo.inactivatedBy?.full_name || 'N/A'} (
                  {selectedInactivationInfo.inactivatedBy?.email || 'N/A'})
                </Text>
                <Text fontSize="sm" color={textColor} mt={1}>
                  <strong>Reason:</strong>{' '}
                  {selectedInactivationInfo.reason || 'N/A'}
                </Text>
                <Text fontSize="sm" color={textColor} mt={1}>
                  <strong>Dispute ID:</strong>{' '}
                  {selectedInactivationInfo.disputeId?.unique_id || 'N/A'} (
                  {selectedInactivationInfo.disputeId?.status || 'N/A'})
                </Text>
                <Text fontSize="sm" color={textColor} mt={1}>
                  <strong>Dispute Created At:</strong>{' '}
                  {selectedInactivationInfo.disputeId?.createdAt
                    ? new Date(
                        selectedInactivationInfo.disputeId.createdAt,
                      ).toLocaleDateString('en-IN')
                    : 'N/A'}
                </Text>
                <Text fontSize="sm" color={textColor} mt={1}>
                  <strong>Inactivated At:</strong>{' '}
                  {selectedInactivationInfo.inactivatedAt
                    ? new Date(
                        selectedInactivationInfo.inactivatedAt,
                      ).toLocaleDateString('en-IN')
                    : 'N/A'}
                </Text>
              </Box>
            )}
          </ModalBody>
          <ModalFooter borderTop="1px" borderColor={borderColor}>
            <Button
              colorScheme="teal"
              onClick={closeInactivationModal}
              borderRadius="12px"
              size="sm"
              _hover={{ bg: 'teal.600' }}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={isUserModalOpen} onClose={closeUserModal} isCentered>
        <ModalOverlay bg="blackAlpha.600" />
      
        <ModalContent
          maxW={{ base: "90%", md: "650px" }}
          borderRadius="16px"
          bg={useColorModeValue("white", "gray.800")}
          boxShadow="0px 4px 20px rgba(0, 0, 0, 0.2)" >
      
          <ModalHeader
            fontSize="lg"
            fontWeight="700"
            color={textColor}
            borderBottom="1px"
            borderColor={borderColor}
          >
            Edit User Details
          </ModalHeader>
      
          <ModalCloseButton color={textColor} />
      
          <ModalBody py="20px">
            {selectedUser && (
              <Box mb={6}>
      
                {/* ---------------- USER INFO ---------------- */}
                <Box
                  mb={6}
                  p={4}
                  border="1px"
                  borderColor={borderColor}
                  borderRadius="8px"
                >
                  <Text fontSize="md" fontWeight="600" color={textColor} mb={4}>
                    User Information
                  </Text>
               
                  {/* NAME */}
                  <FormControl mb={3}>
                    <FormLabel fontSize="sm">Name</FormLabel>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Enter full name"
                      borderRadius="10px"
                    />
                  </FormControl>
      
                  {/* MOBILE */}
                  <FormControl mb={3} isInvalid={mobileError}>
                    <FormLabel fontSize="sm">Mobile</FormLabel>
                    <Input
                      value={editMobile}
                      onChange={(e) => {
                        const value = e.target.value;
                        setEditMobile(value);
                        if (!/^[0-9]{0,10}$/.test(value)) return;
                        setMobileError(value.length !== 10);
                      }}
                      placeholder="Enter 10-digit mobile number"
                      maxLength={10}
                      borderRadius="10px"
                    />
                    {mobileError && (
                      <FormErrorMessage>Mobile number must be 10 digits</FormErrorMessage>
                    )}
                  </FormControl>
      
                  {/* IMAGE */}
                  <FormControl mb={3}>
                    <FormLabel fontSize="sm">Profile Picture</FormLabel>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setNewImage(file);
                          setNewImagePreview(URL.createObjectURL(file));
                        }
                      }}
                    />
      
                    <Box mt={3}>
                      <img
                        src={newImagePreview || selectedUser.profile_pic}
                        alt="Profile"
                        style={{
                          width: "100px",
                          height: "100px",
                          borderRadius: "10px",
                          objectFit: "cover",
                        }}
                      />
                    </Box>
                  </FormControl>
                </Box>
      
                {/* ---------------- ADDRESS SECTION ---------------- */}
                <Box
                  p={4}
                  border="1px"
                  borderColor={borderColor}
                  borderRadius="8px"
                >
                  <Text fontSize="md" fontWeight="600" mb={4}>
                    Saved Addresses
                  </Text>
      
                  {/* ADDRESS LIST */}
                  {userAddresses.map((addr, index) => (
                    <Box
                      key={index}
                      p={3}
                      mb={3}
                      border="1px solid"
                      borderColor={borderColor}
                      borderRadius="10px"
                      position="relative"
                    >
                      <Text fontWeight="600">{addr.title}</Text>
                      <Text fontSize="sm">{addr.address}</Text>
      
                      <IconButton
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        position="absolute"
                        right="10px"
                        top="10px"
                        onClick={() => deleteAddress(index)}
                      />
                    </Box>
                  ))}
      
                  {/* MAP */}
                  <Text fontWeight="600" mt={4} mb={1}>
                    Select Location
                  </Text>
      
                  {isLoaded && (
                    <GoogleMap
                      mapContainerStyle={mapStyle}
                      zoom={14}
                      center={mapCenter}
                      onClick={(e) => handleMapClick(e)}
                    >
                      <Marker position={mapCenter} />
                    </GoogleMap>
                  )}
      
                  {/* ADD LOCATION BUTTON */}
                  <Button
                    mt={4}
                    width="full"
                    colorScheme="blue"
                    onClick={addSelectedLocation}
                  >
                    Add This Location
                  </Button>
                </Box>
              </Box>
            )}
          </ModalBody>
      
          <ModalFooter borderTop="1px" borderColor={borderColor}>
            <Button
              colorScheme="teal"
              onClick={handleSaveUser}
              borderRadius="12px"
              size="sm"
              _hover={{ bg: "teal.600" }}
              mr={3}
            >
              Save
            </Button>
      
            <Button onClick={closeUserModal} borderRadius="12px" size="sm">
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Enter Address Details</ModalHeader>
          <ModalCloseButton />
      
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>Title</FormLabel>
              <Input value={tempAddress.title}
                onChange={(e) => setTempAddress({ ...tempAddress, title: e.target.value })}
              />
            </FormControl>
      
            <FormControl mb={3}>
              <FormLabel>House No</FormLabel>
              <Input value={tempAddress.houseNo}
                onChange={(e) => setTempAddress({ ...tempAddress, houseNo: e.target.value })}
              />
            </FormControl>
      
            <FormControl mb={3}>
              <FormLabel>Street</FormLabel>
              <Input value={tempAddress.street}
                onChange={(e) => setTempAddress({ ...tempAddress, street: e.target.value })}
              />
            </FormControl>
      
            <FormControl mb={3}>
              <FormLabel>Area</FormLabel>
              <Input value={tempAddress.area}
                onChange={(e) => setTempAddress({ ...tempAddress, area: e.target.value })}
              />
            </FormControl>
      
            <FormControl mb={3}>
              <FormLabel>Landmark</FormLabel>
              <Input value={tempAddress.landmark}
                onChange={(e) => setTempAddress({ ...tempAddress, landmark: e.target.value })}
              />
            </FormControl>
      
            <FormControl mb={3}>
              <FormLabel>Pincode</FormLabel>
              <Input value={tempAddress.pincode}
                onChange={(e) => setTempAddress({ ...tempAddress, pincode: e.target.value })}
              />
            </FormControl>
          </ModalBody>
      
          <ModalFooter>
            <Button colorScheme="blue" onClick={saveAddress}>
              Save Address
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme={useColorModeValue('light', 'dark')}
      />
    </Card>
  );
}
