

// /* eslint-disable */
// import {
//   Box,
//   Flex,
//   Table,
//   Tbody,
//   Td,
//   Text,
//   Th,
//   Thead,
//   Tr,
//   useColorModeValue,
//   Spinner,
//   Alert,
//   AlertIcon,
//   Button,
//   HStack,
//   Switch,
//   Input,
//   FormErrorMessage,
//   InputGroup,
//   InputLeftElement,
//   Icon,
//   Modal,
//   ModalOverlay,
//   ModalContent,
//   ModalHeader,
//   ModalBody,
//   ModalFooter,
//   ModalCloseButton,
//   FormControl,
//   FormLabel,
//   IconButton,
//   Textarea,
//   Select,
// } from '@chakra-ui/react';
// import {
//   createColumnHelper,
//   flexRender,
//   getCoreRowModel,
//   getSortedRowModel,
//   useReactTable,
// } from '@tanstack/react-table';
// import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
// import Card from 'components/card/Card';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import React, { useEffect, useState, useMemo, useCallback } from 'react';
// import {
//   ArrowUpIcon,
//   ArrowDownIcon,
//   ChevronLeftIcon,
//   ChevronRightIcon,
//   SearchIcon,
  
//   DeleteIcon,
// } from '@chakra-ui/icons';
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import defaultProfilePic from 'assets/img/profile/profile.webp';
// // CSVLink इम्पोर्ट करें
// import { CSVLink } from 'react-csv'; 

// const mapStyle = { width: "100%", height: "250px" };
// const columnHelper = createColumnHelper();

// // Custom hook for fetching users
// const useFetchUsers = (baseUrl, token, navigate) => {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         if (!baseUrl || !token) {
//           throw new Error('Missing API URL or authentication token');
//         }
//         const response = await axios.get(`${baseUrl}api/admin/getAllUsers`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         if (!response.data?.users) {
//           throw new Error('Invalid API response: No users found');
//         }
//         setData(
//           response.data.users.map((user) => ({
//             id: user._id,
//             profile_pic: user.profile_pic
//               ? `${baseUrl}${user.profile_pic}`
//               : defaultProfilePic,
//             full_name: user.full_name
//               ? user.full_name
//                   .toLowerCase()
//                   .split(' ')
//                   .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//                   .join(' ')
//               : 'N/A',
//             location: user.location?.address || 'N/A',
//             uniqueId: user.unique_id || 'N/A',
//             mobile: user.phone || 'N/A',
//             current_token:user.current_token || 'N/A',
//             full_address: Array.isArray(user.full_address) ? user.full_address : [],
//             createdAt: user.createdAt
//               ? new Date(user.createdAt).toISOString().split('T')[0]
//               : 'N/A',
//             referral_code: user.referral_code || 'N/A',
//             active: user.active ?? true,
//             inactivationInfo: user.inactivationInfo || null,
//           })),
//         );
//       } catch (error) {
//         console.error('Error fetching data:', error);
//         const errorMessage =
//           error.response?.data?.message ||
//           error.message ||
//           'Failed to load data';
//         if (
//           errorMessage.includes('Session expired') ||
//           errorMessage.includes('Un-Authorized')
//         ) {
//           localStorage.removeItem('token');
//           navigate('/');
//         } else {
//           setError(errorMessage);
//         }
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, [baseUrl, token, navigate]);

//   return { data, loading, error, setData, setError };
// };


// // Custom hook for fetching disputes
// const useFetchDisputes = (baseUrl, token, userId) => {
//   const [disputes, setDisputes] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (!userId) return;
//     const fetchDisputes = async () => {
//       setLoading(true);
//       try {
//         const response = await axios.get(
//           `${baseUrl}api/admin/getAllDisputes/${userId}`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           },
//         );
//         setDisputes(response.data.disputes || []);
//       } catch (error) {
//         console.error('Error fetching disputes:', error);
//         setError(error.response?.data?.message || 'Failed to load disputes');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchDisputes();
//   }, [baseUrl, token, userId]);

//   return { disputes, loading, error };
// };

// // Function to toggle user status
// const toggleUserStatus = async (
//   baseUrl,
//   token,
//   userId,
//   active,
//   setData,
//   setError,
//   reason = '',
//   disputeId = '',
// ) => {
//   try {
//     const response = await axios.patch(
//       `${baseUrl}api/admin/updateUserStatus`,
//       { userId, active, reason, disputeId },
//       { headers: { Authorization: `Bearer ${token}` } },
//     );
//     if (response.data.success) {
//       setData((prevData) =>
//         prevData.map((user) =>
//           user.id === userId ? { ...user, active } : user,
//         ),
//       );
//       toast.success(`User ${active ? 'enabled' : 'disabled'} successfully!`, {
//         position: 'top-right',
//         autoClose: 3000,
//         hideProgressBar: false,
//         closeOnClick: true,
//         pauseOnHover: true,
//         draggable: true,
//       });
//       return true;
//     } else {
//       throw new Error('Failed to update user status');
//     }
//   } catch (error) {
//     console.error('Error toggling user status:', error);
//     setError(error.response?.data?.message || 'Failed to update user status');
//     toast.error(
//       error.response?.data?.message || 'Failed to update user status',
//       {
//         position: 'top-right',
//         autoClose: 3000,
//         hideProgressBar: false,
//         closeOnClick: true,
//         pauseOnHover: true,
//         draggable: true,
//       },
//     );
//     return false;
//   }
// };

// export default function ComplexTable() {
//   const [sorting, setSorting] = useState([]);
//   const [isUserModalOpen, setIsUserModalOpen] = useState(false);
// const [selectedUser, setSelectedUser] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [editName, setEditName] = useState("");
// const [editMobile, setEditMobile] = useState("");
// const [mobileError, setMobileError] = useState(false);


// const [newImage, setNewImage] = useState(null);
// const [newImagePreview, setNewImagePreview] = useState(null);

//   const [filteredData, setFilteredData] = useState([]);
//   const [toggleLoading, setToggleLoading] = useState({});
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
//   const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
//   const [userId, setUserId] = useState(null);
//   const [setIsUseridModalOpen, setIsUserid] = useState(false);
//   const [selectedAddresses, setSelectedAddresses] = useState([]);
//   const [selectedUserId, setSelectedUserId] = useState(null);
//   const [selectedInactivationInfo, setSelectedInactivationInfo] = useState(null);
//   const [deactivateReason, setDeactivateReason] = useState('');
//   const [disputeId, setDisputeId] = useState('');
//   const itemsPerPage = 10; // 10 items per page
//   const maxVisiblePages = 5; // Show only 5 page numbers
//   const textColor = useColorModeValue('secondaryGray.900', 'white');
//   const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
//   const headerBg = useColorModeValue('gray.100', 'gray.700');
//   const hoverBg = useColorModeValue('gray.50', 'gray.600');
//   const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
// const [tempAddress, setTempAddress] = useState({
//   latitude: "",
//   longitude: "",
//   title: "",
//   houseNo: "",
//   street: "",
//   area: "",
//   landmark: "",
//   pincode: "",
//   address: ""
// });

//   const baseUrl = useMemo(() => process.env.REACT_APP_BASE_URL, []);
//   const token = localStorage.getItem('token');
//   const navigate = useNavigate();
//   const { isLoaded } = useLoadScript({
//   googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
// });

//   const [userAddresses, setUserAddresses] = useState([]);
// const [mapCenter, setMapCenter] = useState({ lat: 22.7196, lng: 75.8577 });

// useEffect(() => {
//   if (selectedUser?.full_address) {
//     setUserAddresses(selectedUser.full_address);
//     setMapCenter({
//       lat: selectedUser.full_address[0].latitude,
//       lng: selectedUser.full_address[0].longitude,
//     });
//   }
// }, [selectedUser]);

// const deleteAddress = (index) => {
//   setUserAddresses((prev) => prev.filter((_, i) => i !== index));
// };

// const handleMapClick = (event) => {
//   setMapCenter({
//     lat: event.latLng.lat(),
//     lng: event.latLng.lng(),
//   });
// };
// const saveAddress = () => {
//   const finalAddress = {
//     latitude: tempAddress.latitude,
//     longitude: tempAddress.longitude,
//     title: tempAddress.title,
//     houseNo: tempAddress.houseNo,
//     street: tempAddress.street,
//     area: tempAddress.area,
//     landmark: tempAddress.landmark,
//     pincode: tempAddress.pincode,
//     address: tempAddress.address,  // Full Google formatted address
//   };

//   setUserAddresses([...userAddresses, finalAddress]);

//   setIsAddressModalOpen(false);
// };

// const addSelectedLocation = () => {
//   const latlng = { lat: mapCenter.lat, lng: mapCenter.lng };

//   const geocoder = new window.google.maps.Geocoder();

//   geocoder.geocode({ location: latlng }, (results, status) => {
//     if (status === "OK" && results[0]) {

//       setTempAddress({
//         latitude: mapCenter.lat,
//         longitude: mapCenter.lng,
//         title: "",
//         houseNo: "",
//         street: "",
//         area: "",
//         landmark: "",
//         pincode: "",
//         address: results[0].formatted_address
//       });

//       setIsAddressModalOpen(true);  // <-- OPEN FORM MODAL
//     }
//   });
// };


// const openUserModal = (id, name, full_address, mobile, profile_pic) => {
  
//     setUserId(id);
//   setSelectedUser({ id, name, full_address, mobile, profile_pic });
// console.log(full_address);
//   setEditName(name);
//   setEditMobile(mobile);
//   setNewImagePreview(null);

//   setIsUserModalOpen(true);
  
// };
// const handleSaveUser = async () => {
//   try {
//     const form = new FormData();
// console.log(userId);
//     form.append("full_name", editName || "");
//     form.append("mobile", editMobile || "");

//     // IMAGE ADD KARO — SAME NAME AS BACKEND (profilePic)
//     if (newImage) {
//       form.append("profilePic", newImage);
//     }

//     // FULL ADDRESS ARRAY
//     form.append("full_address", JSON.stringify(userAddresses));

//     console.log("FORM DATA:");
//     for (let x of form.entries()) console.log(x[0], x[1]);

//     const res = await fetch(`${baseUrl}api/user/updateUserData`, {
//       method: "PUT",
//       headers: {
//         userID: userId, // 👉 Ye hi backend me read hota hai
//       },
//       body: form, // ❗IMPORTANT — JSON nahi, FormData hi
//     });

//     const data = await res.json();
//     console.log("UPDATE RESPONSE:", data);

//     if (data.status) {
//        toast.success('Profile Updated Success!', {
//         position: 'top-right',
//         autoClose: 3000,
//         hideProgressBar: false,
//         closeOnClick: true,
//         pauseOnHover: true,
//         draggable: true,
//       });
//       closeUserModal();
//       fetchUsers();
//     } else {
//       alert(data.message || "Something went wrong");
//     }
//   } catch (err) {
//     console.log("SAVE ERROR:", err);
//   }
// };






// const closeUserModal = () => {
//   setIsUserModalOpen(false);
// };
//   const { data, loading, error, setData, setError } = useFetchUsers(
//     baseUrl,
//     token,
//     navigate,
//   );
//   const {
//     disputes,
//     loading: disputesLoading,
//     error: disputesError,
//   } = useFetchDisputes(baseUrl, token, selectedUserId);

//   // Handle search filtering
//   const handleSearch = useCallback(
//     (query) => {
//       setSearchQuery(query);
//       setCurrentPage(1);
//       if (!query) {
//         setFilteredData(data);
//         return;
//       }
//       const lowerQuery = query.toLowerCase();
//       const filtered = data.filter(
//         (item) =>
//           item.full_name.toLowerCase().includes(lowerQuery) ||
//           item.location.toLowerCase().includes(lowerQuery) ||
//           item.mobile.toLowerCase().includes(lowerQuery) ||
//           item.referral_code.toLowerCase().includes(lowerQuery) ||
//           // Search in full addresses
//           item.full_address.some((addr) =>
//             (addr.address?.toLowerCase().includes(lowerQuery) ?? false) ||
//             (addr.title?.toLowerCase().includes(lowerQuery) ?? false) ||
//             (addr.landmark?.toLowerCase().includes(lowerQuery) ?? false)
//           )
//       );
//       setFilteredData(filtered);
//     },
//     [data],
//   );

//   // Initialize filteredData with all data
//   useEffect(() => {
//     setFilteredData(data);
//   }, [data]);

//   // Modal handlers for addresses
//   const openModal = useCallback((addresses) => {
//     setSelectedAddresses(addresses);
//     setIsModalOpen(true);
//   }, []);

//   const closeModal = useCallback(() => {
//     setIsModalOpen(false);
//     setSelectedAddresses([]);
//   }, []);

//   // Modal handlers for deactivation
//   const openDeactivateModal = useCallback((userId) => {
//     setSelectedUserId(userId);
//     setDeactivateReason('');
//     setDisputeId('');
//     setIsDeactivateModalOpen(true);
//   }, []);

//   const closeDeactivateModal = useCallback(() => {
//     setIsDeactivateModalOpen(false);
//     setSelectedUserId(null);
//     setDeactivateReason('');
//     setDisputeId('');
//   }, []);

//   // Modal handlers for orders
//   const openOrdersModal = useCallback((userId, inactivationInfo) => {
//     setSelectedUserId(userId);
//     setSelectedInactivationInfo(inactivationInfo);
//     setIsOrdersModalOpen(true);
//   }, []);
// //   const editUserModal = (
// //   id,
// //   current_token,
// //   profile_pic,
// //   full_name,
// //   location,
// //   mobile,
// //   full_address
// // ) => {
// //   alert(
// //     `ID: ${id}\n` +
// //     `Token: ${current_token}\n` +
// //     `Profile Pic: ${profile_pic}\n` +
// //     `Name: ${full_name}\n` +
// //     `Location: ${location}\n` +
// //     `Mobile: ${mobile}\n` +
// //     `Address: ${full_address}`
// //   );
// // };

  
 

//   const closeOrdersModal = useCallback(() => {
//     setIsOrdersModalOpen(false);
    
//     setSelectedUserId(null);
//     setSelectedInactivationInfo(null);
//   }, []);

//   // Toggle handler for user status
//   const handleToggle = useCallback(
//     async (userId, currentActive) => {
//       if (toggleLoading[userId]) return;
//       setToggleLoading((prev) => ({ ...prev, [userId]: true }));

//       if (currentActive) {
//         openDeactivateModal(userId);
//       } else {
//         const success = await toggleUserStatus(
//           baseUrl,
//           token,
//           userId,
//           !currentActive,
//           setData,
//           setError,
//         );
//         setToggleLoading((prev) => ({ ...prev, [userId]: false }));
//         return success;
//       }
//       setToggleLoading((prev) => ({ ...prev, [userId]: false }));
//     },
//     [baseUrl, token, setData, setError, toggleLoading, openDeactivateModal],
//   );

//   // Handle deactivation submission
//   const handleDeactivateSubmit = useCallback(async () => {
//     if (!deactivateReason) {
//       toast.error('Reason is required', {
//         position: 'top-right',
//         autoClose: 3000,
//         hideProgressBar: false,
//         closeOnClick: true,
//         pauseOnHover: true,
//         draggable: true,
//       });
//       return;
//     }

//     setToggleLoading((prev) => ({ ...prev, [selectedUserId]: true }));
//     const success = await toggleUserStatus(
//       baseUrl,
//       token,
//       selectedUserId,
//       false,
//       setData,
//       setError,
//       deactivateReason,
//       disputeId,
//     );
//     setToggleLoading((prev) => ({ ...prev, [selectedUserId]: false }));

//     if (success) {
//       closeDeactivateModal();
//     }
//   }, [
//     baseUrl,
//     token,
//     selectedUserId,
//     deactivateReason,
//     disputeId,
//     setData,
//     setError,
//     closeDeactivateModal,
//   ]);

//   // Pagination logic
//   const totalItems = filteredData.length;
//   const totalPages = Math.ceil(totalItems / itemsPerPage);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const endIndex = startIndex + itemsPerPage;
//   const paginatedData = useMemo(
//     () => filteredData.slice(startIndex, endIndex),
//     [filteredData, startIndex, endIndex],
//   );

//   // Calculate visible page numbers (show only 5 pages)
//   const getVisiblePageNumbers = useCallback(() => {
//     const pages = [];
//     const halfWindow = Math.floor(maxVisiblePages / 2);
    
//     let startPage = Math.max(1, currentPage - halfWindow);
//     let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
//     // Adjust startPage if endPage is at the end
//     if (endPage - startPage + 1 < maxVisiblePages) {
//       startPage = Math.max(1, endPage - maxVisiblePages + 1);
//     }
    
//     // Add ellipsis for start
//     if (startPage > 1) {
//       pages.push(1);
//       if (startPage > 2) {
//         pages.push('...');
//       }
//     }
    
//     // Add visible page numbers
//     for (let i = startPage; i <= endPage; i++) {
//       pages.push(i);
//     }
    
//     // Add ellipsis for end
//     if (endPage < totalPages) {
//       if (endPage < totalPages - 1) {
//         pages.push('...');
//       }
//       pages.push(totalPages);
//     }
    
//     return pages;
//   }, [currentPage, totalPages]);

//   const goToPage = useCallback(
//     (page) => {
//       if (page === '...' || page === undefined) return;
//       const newPage = Math.min(Math.max(1, page), totalPages);
//       if (newPage !== currentPage) {
//         setCurrentPage(newPage);
//       }
//     },
//     [currentPage, totalPages],
//   );

//   useEffect(() => {
//     if (totalPages > 0 && currentPage > totalPages) {
//       setCurrentPage(1);
//     }
//   }, [totalPages, currentPage]);

//   // CSV एक्सपोर्ट के लिए डेटा तैयार करना
//   const getCsvData = useCallback(() => {
//     return filteredData.map((user, index) => ({
//       'S.No': startIndex + index + 1,
//       'Unique ID': user.uniqueId,
//       'Full Name': user.full_name,
//       'Saved Address': user.location,
//       'Mobile': user.mobile,
//       'Referral Code': user.referral_code,
//       'Created At': user.createdAt,
//       'Active': user.active ? 'Yes' : 'No',
//       'Full Addresses': user.full_address.map(addr => 
//         `${addr.title}: ${addr.address} (Lat: ${addr.latitude}, Lng: ${addr.longitude})`
//       ).join('; '),
//       'Inactivation Reason': user.inactivationInfo?.reason || 'N/A',
//       'Inactivated By': user.inactivationInfo?.inactivatedBy?.full_name || 'N/A',
//       'Inactivation Dispute ID': user.inactivationInfo?.disputeId?.unique_id || 'N/A',
//     }));
//   }, [filteredData, startIndex]);


//   // Memoized columns
//   const columns = useMemo(
//     () => [
//       columnHelper.display({
//         id: 'sno',
//         header: () => (
//           <Text
//             justifyContent="center"
//             align="center"
//             fontSize={{ sm: '12px', lg: '14px' }}
//             fontWeight="bold"
//             color="gray.500"
//             textTransform="uppercase"
//           >
//             S.No
//           </Text>
//         ),
//         cell: ({ row }) => (
//           <Text
//             color={textColor}
//             fontSize="sm"
//             fontWeight="600"
//             textAlign="center"
//           >
//             {startIndex + row.index + 1}
//           </Text>
//         ),
//       }),
//       columnHelper.accessor('uniqueId', {
//         id: 'uniqueId',
//         header: () => (
//           <Text
//             justifyContent="center"
//             align="center"
//             fontSize={{ sm: '12px', lg: '14px' }}
//             fontWeight="bold"
//             color="gray.500"
//             textTransform="uppercase"
//           >
//             Unique ID
//           </Text>
//         ),
//         cell: (info) => (
//           <Text
//             color={textColor}
//             fontSize="sm"
//             fontWeight="600"
//             textAlign="center"
//             whiteSpace="nowrap"
//           >
//             {info.getValue()}
//           </Text>
//         ),
//       }),
//       columnHelper.accessor('Email_Id', {
//         id: 'profile_pic',
//         header: () => (
//           <Text
//             justifyContent="center"
//             align="center"
//             fontSize={{ sm: '12px', lg: '14px' }}
//             fontWeight="bold"
//             color="gray.500"
//             textTransform="uppercase"
//           >
//             Email Id
//           </Text>
//         ),
//         cell: (info) => (
//           <Flex justify="center" align="center">
//             {info.getValue() !== 'N/A' ? (
//               <img
//                 src={info.getValue()}
//                 alt="Profile"
//                 loading="lazy"
//                 style={{ width: '40px', height: '40px', borderRadius: '50%' }}
//                 onError={(e) => (e.target.src = defaultProfilePic)}
//               />
//             ) : (
//               <Text color={textColor} fontSize="sm" fontWeight="600">
//                 N/A
//               </Text>
//             )}
//           </Flex>
//         ),
//       }),
//       columnHelper.accessor('full_name', {
//         id: 'full_name',
//         header: () => (
//           <Text
//             justifyContent="center"
//             align="center"
//             fontSize={{ sm: '12px', lg: '14px' }}
//             fontWeight="bold"
//             color="gray.500"
//             textTransform="uppercase"
//           >
//             Full Name
//           </Text>
//         ),
//         cell: (info) => (
//           <Text
//             color={textColor}
//             fontSize="sm"
//             fontWeight="600"
//             textAlign="center"
//             whiteSpace="nowrap"
//           >
//             {info.getValue()}
//           </Text>
//         ),
//       }),
//        columnHelper.accessor('mobile', {
//         id: 'mobile',
//         header: () => (
//           <Text
//             justifyContent="center"
//             align="center"
//             fontSize={{ sm: '12px', lg: '14px' }}
//             fontWeight="bold"
//             color="gray.500"
//             textTransform="uppercase"
//           >
//             Mobile
//           </Text>
//         ),
//         cell: (info) => (
//           <Text
//             color={textColor}
//             fontSize="sm"
//             fontWeight="600"
//             textAlign="center"
//             whiteSpace="nowrap"
//           >
//             {info.getValue()}
//           </Text>
//         ),
//       }),
//       // Current Address Column with Read More functionality for full addresses
//       columnHelper.accessor('Countery', {
//         id: 'location',
//         header: () => (
//           <Text
//             justifyContent="center"
//             align="center"
//             fontSize={{ sm: '12px', lg: '14px' }}
//             fontWeight="bold"
//             color="gray.500"
//             textTransform="uppercase"
//           >
//            Countery
//           </Text>
//         ),
//         cell: (info) => {
//           const row = info.row.original;
//           const addresses = row.full_address || [];
//           const hasMultipleAddresses = addresses.length > 0;
//           const currentAddress = info.getValue() || 'N/A';

//           return (
//             <Flex justify="center" align="center" wrap="nowrap" gap={1}>
//               <Text
//                 color={textColor}
//                 fontSize="sm"
//                 fontWeight="600"
//                 textAlign="center"
//                 whiteSpace="nowrap"
//                 maxW="200px"
//                 isTruncated
//                 title={currentAddress}
//               >
//                 {currentAddress}
//               </Text>
//               {hasMultipleAddresses && (
//                 <Button
//                   size="xs"
//                   variant="link"
//                   colorScheme="teal"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     openModal(addresses);
//                   }}
//                   fontSize="xs"
//                   _hover={{ textDecoration: 'underline' }}
//                   ml={1}
//                 >
//                   Read More
//                 </Button>
//               )}
//             </Flex>
//           );
//         },
//       }),
//       columnHelper.accessor('State', {
//         id: 'mobile',
//         header: () => (
//           <Text
//             justifyContent="center"
//             align="center"
//             fontSize={{ sm: '12px', lg: '14px' }}
//             fontWeight="bold"
//             color="gray.500"
//             textTransform="uppercase"
//           >
//             State
//           </Text>
//         ),
//         cell: (info) => (
//           <Text
//             color={textColor}
//             fontSize="sm"
//             fontWeight="600"
//             textAlign="center"
//             whiteSpace="nowrap"
//           >
//             {info.getValue()}
//           </Text>
//         ),
//       }),
//       columnHelper.accessor('city', {
//         id: 'referral_code',
//         header: () => (
//           <Text
//             justifyContent="center"
//             align="center"
//             fontSize={{ sm: '12px', lg: '14px' }}
//             fontWeight="bold"
//             color="gray.500"
//             textTransform="uppercase"
//           >
//             City
//           </Text>
//         ),
//         cell: (info) => (
//           <Text
//             color={textColor}
//             fontSize="sm"
//             fontWeight="600"
//             textAlign="center"
//             whiteSpace="nowrap"
//           >
//             {info.getValue()}
//           </Text>
//         ),
//       }),
//         columnHelper.accessor('college', {
//         id: 'referral_code',
//         header: () => (
//           <Text
//             justifyContent="center"
//             align="center"
//             fontSize={{ sm: '12px', lg: '14px' }}
//             fontWeight="bold"
//             color="gray.500"
//             textTransform="uppercase"
//           >
//             College
//           </Text>
//         ),
//         cell: (info) => (
//           <Text
//             color={textColor}
//             fontSize="sm"
//             fontWeight="600"
//             textAlign="center"
//             whiteSpace="nowrap"
//           >
//             {info.getValue()}
//           </Text>
//         ),
//       }),
//         columnHelper.accessor('year', {
//         id: 'referral_code',
//         header: () => (
//           <Text
//             justifyContent="center"
//             align="center"
//             fontSize={{ sm: '12px', lg: '14px' }}
//             fontWeight="bold"
//             color="gray.500"
//             textTransform="uppercase"
//           >
//             Passed Out Year
//           </Text>
//         ),
//         cell: (info) => (
//           <Text
//             color={textColor}
//             fontSize="sm"
//             fontWeight="600"
//             textAlign="center"
//             whiteSpace="nowrap"
//           >
//             {info.getValue()}
//           </Text>
//         ),
//       }),
//       columnHelper.accessor('createdAt', {
//         id: 'createdAt',
//         header: () => (
//           <Text
//             justifyContent="center"
//             align="center"
//             fontSize={{ sm: '12px', lg: '14px' }}
//             fontWeight="bold"
//             color="gray.500"
//             textTransform="uppercase"
//           >
//             Created At
//           </Text>
//         ),
//         cell: (info) => (
//           <Text
//             color={textColor}
//             fontSize="sm"
//             fontWeight="600"
//             textAlign="center"
//             whiteSpace="nowrap"
//           >
//             {info.getValue()}
//           </Text>
//         ),
//       }),
//       columnHelper.accessor('active', {
//         id: 'active',
//         header: () => (
//           <Text
//             justifyContent="center"
//             align="center"
//             fontSize={{ sm: '12px', lg: '14px' }}
//             fontWeight="bold"
//             color="gray.500"
//             textTransform="uppercase"
//           >
//             Active
//           </Text>
//         ),
//         cell: (info) => (
//           <Flex justify="center" align="center" gap={2}>
//             <Switch
//               isChecked={info.getValue()}
//               onChange={() =>
//                 handleToggle(info.row.original.id, info.getValue())
//               }
//               colorScheme="teal"
//               isDisabled={toggleLoading[info.row.original.id]}
//             />
//             {!info.getValue() && info.row.original.inactivationInfo && (
//               <Button
//                 size="xs"
//                 colorScheme="red"
//                 variant="outline"
//                 onClick={() =>
//                   openOrdersModal(
//                     info.row.original.id,
//                     info.row.original.inactivationInfo,
//                   )
//                 }
//                 _hover={{ bg: 'red.600', color: 'white' }}
//               >
//                 View
//               </Button>
//             )}
//           </Flex>
//         ),
//       }),
//       columnHelper.display({
//         id: 'actions',
//         header: () => (
//           <Text
//             justifyContent="center"
//             align="center"
//             fontSize={{ sm: '12px', lg: '14px' }}
//             fontWeight="bold"
//             color="gray.500"
//             textTransform="uppercase"
//           >
//             Actions
//           </Text>
//         ),
//         cell: (info) => (
//           <Flex justify="center" align="center">
//             <Button
//               size="sm"
//               colorScheme="teal"
//               variant="outline"
//               onClick={() =>
//                 openOrdersModal(
//                   info.row.original.id,
//                   info.row.original.inactivationInfo,
//                 )
//               }
//               _hover={{ bg: 'teal.600', color: 'white' }}
//             >
//               View More
//             </Button>
//             &nbsp;
//             <Button
//               size="sm"
//               colorScheme="teal"
//               variant="outline"
//                onClick={() =>
//     openUserModal(
//       info.row.original.id,
//       info.row.original.full_name,
//       info.row.original.full_address,
//       info.row.original.mobile,
//       info.row.original.profile_pic
//     )
//   }
//               _hover={{ bg: 'teal.600', color: 'white' }}
//             >
//               Edit
//             </Button>
//             &nbsp;
//             {/* <Button
//   size="sm"
//   colorScheme="teal"
//   variant="outline"
//   onClick={() =>
//     editUserModal(
//       info.row.original.id,
//       info.row.original.current_token,
//       info.row.original.profile_pic,
//       info.row.original.full_name,
//       info.row.original.location,
//       info.row.original.mobile,
//       info.row.original.full_address
//     )
//   }
//   _hover={{ bg: 'teal.600', color: 'white' }}
// >
//   Edit
// </Button> */}

//           </Flex>
//         ),
//       }),
      
//     ],
//     [textColor, handleToggle, toggleLoading, openModal, openOrdersModal, startIndex],
//   );

//   const table = useReactTable({
//     data: paginatedData,
//     columns,
//     state: {
//       sorting,
//       pagination: { pageIndex: currentPage - 1, pageSize: itemsPerPage },
//     },
//     onSortingChange: setSorting,
//     getCoreRowModel: getCoreRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     manualPagination: true,
//     pageCount: totalPages,
//   });

//   if (loading) {
//     return (
//       <Card
//         w="100%"
//         px={{ base: '15px', md: '25px' }}
//         py="25px"
//         borderRadius="16px"
//         boxShadow="0px 4px 20px rgba(0, 0, 0, 0.1)"
//         bg={useColorModeValue('white', 'gray.800')}
//       >
//         <Box textAlign="center" py={10}>
//           <Spinner size="lg" color="teal.500" />
//           <Text color={textColor} mt={4}>
//             Loading users...
//           </Text>
//         </Box>
//       </Card>
//     );
//   }

//   if (error) {
//     return (
//       <Card
//         w="100%"
//         px={{ base: '15px', md: '25px' }}
//         py="25px"
//         borderRadius="16px"
//         boxShadow="0px 4px 20px rgba(0, 0, 0, 0.1)"
//         bg={useColorModeValue('white', 'gray.800')}
//       >
//         <Alert status="error" borderRadius="12px">
//           <AlertIcon />
//           <Text color={textColor}>{error}</Text>
//         </Alert>
//       </Card>
//     );
//   }

//   return (
//     <>
//       <Card
//         flexDirection="column"
//         w="100%"
//         px={{ base: '15px', md: '25px' }}
//         py="25px"
//         borderRadius="16px"
//         boxShadow="0px 4px 20px rgba(0, 0, 0, 0.1)"
//         bg={useColorModeValue('white', 'gray.800')}
//         overflowX="auto"
//       >
//         <Flex
//           px={{ base: '10px', md: '0' }}
//           mb="20px"
//           justifyContent="space-between"
//           align="center"
//           direction={{ base: 'column', md: 'row' }}
//           gap={{ base: '10px', md: '0' }}
//         >
//           <Text
//             color={textColor}
//             fontSize={{ base: 'xl', md: '2xl' }}
//             fontWeight="700"
//             lineHeight="100%"
//           >
//             Users List
//           </Text>
//           <HStack spacing={4}> {/* Add HStack for alignment */}
//             <InputGroup maxW={{ base: '100%', md: '300px' }}>
//               <InputLeftElement pointerEvents="none">
//                 <Icon as={SearchIcon} color="gray.400" />
//               </InputLeftElement>
//               <Input
//                 placeholder="Search by name, location, mobile, or referral code"
//                 value={searchQuery}
//                 onChange={(e) => handleSearch(e.target.value)}
//                 borderRadius="12px"
//                 bg={useColorModeValue('gray.100', 'gray.700')}
//                 _focus={{
//                   borderColor: 'teal.500',
//                   boxShadow: '0 0 0 1px teal.500',
//                 }}
//               />
//             </InputGroup>
//             {/* Export to CSV Button */}
//             <CSVLink
//               data={getCsvData()}
//               filename={"users_data.csv"}
//               target="_blank"
//               style={{ textDecoration: 'none' }}
//             >
//               <Button
//                 colorScheme="teal"
//                 variant="outline"
//                 leftIcon={<Icon as={ArrowDownIcon} />}
//                 _hover={{ bg: 'teal.600', color: 'white' }}
//                 borderRadius="12px"
//               >
//                 Export 
//               </Button>
//             </CSVLink>
//           </HStack>
//         </Flex>
//         <Box overflowX="auto">
//           <Table
//             variant="simple"
//             color="gray.500"
//             mb="24px"
//             mt="12px"
//             minW="1200px"
//           >
//             <Thead bg={headerBg}>
//               {table.getHeaderGroups().map((headerGroup) => (
//                 <Tr key={headerGroup.id}>
//                   {headerGroup.headers.map((header) => (
//                     <Th
//                       key={header.id}
//                       colSpan={header.colSpan}
//                       px={{ base: '8px', md: '16px' }}
//                       py="12px"
//                       borderColor={borderColor}
//                       cursor="pointer"
//                       onClick={header.column.getToggleSortingHandler()}
//                       aria-sort={
//                         header.column.getIsSorted()
//                           ? header.column.getIsSorted() === 'asc'
//                             ? 'ascending'
//                             : 'descending'
//                           : 'none'
//                       }
//                     >
//                       <Flex
//                         justifyContent="center"
//                         align="center"
//                         fontSize={{ sm: '12px', lg: '14px' }}
//                         fontWeight="bold"
//                         color="gray.500"
//                         textTransform="uppercase"
//                       >
//                         {flexRender(
//                           header.column.columnDef.header,
//                           header.getContext(),
//                         )}
//                         {header.column.getIsSorted() ? (
//                           header.column.getIsSorted() === 'asc' ? (
//                             <ArrowUpIcon ml={2} />
//                           ) : (
//                             <ArrowDownIcon ml={2} />
//                           )
//                         ) : null}
//                       </Flex>
//                     </Th>
//                   ))}
//                 </Tr>
//               ))}
//             </Thead>
//             <Tbody>
//               {table.getRowModel().rows.map((row) => (
//                 <Tr
//                   key={row.id}
//                   _hover={{
//                     bg: hoverBg,
//                     transition: 'background-color 0.2s ease',
//                   }}
//                 >
//                   {row.getVisibleCells().map((cell) => (
//                     <Td
//                       key={cell.id}
//                       fontSize={{ sm: '14px' }}
//                       px={{ base: '8px', md: '16px' }}
//                       py="12px"
//                       borderColor={borderColor}
//                       whiteSpace="nowrap"
//                     >
//                       {flexRender(
//                         cell.column.columnDef.cell,
//                         cell.getContext(),
//                       )}
//                     </Td>
//                   ))}
//                 </Tr>
//               ))}
//             </Tbody>
//           </Table>
//         </Box>
//         <Flex
//           justifyContent="space-between"
//           alignItems="center"
//           px={{ base: '10px', md: '25px' }}
//           py="10px"
//           borderTopWidth="1px"
//           borderColor={borderColor}
//         >
//           <Text fontSize="sm" color={textColor}>
//             Showing {totalItems === 0 ? 0 : startIndex + 1} to{' '}
//             {Math.min(endIndex, totalItems)} of {totalItems} users
//           </Text>
//           <HStack spacing={1}>
//             <Button
//               size="sm"
//               colorScheme="teal"
//               onClick={() => goToPage(currentPage - 1)}
//               isDisabled={currentPage === 1}
//               leftIcon={<ChevronLeftIcon />}
//               _hover={{ bg: 'teal.600', color: 'white' }}
//             >
//               Previous
//             </Button>
            
//             {/* Render visible page numbers with ellipsis */}
//             {getVisiblePageNumbers().map((page, index) => (
//               <React.Fragment key={index}>
//                 {page === '...' ? (
//                   <Text
//                     fontSize="sm"
//                     color="gray.500"
//                     minW="40px"
//                     textAlign="center"
//                   >
//                     ...
//                   </Text>
//                 ) : (
//                   <Button
//                     size="sm"
//                     colorScheme="teal"
//                     variant={currentPage === page ? 'solid' : 'outline'}
//                     onClick={() => goToPage(page)}
//                     minW="40px"
//                     _hover={{ bg: 'teal.600', color: 'white' }}
//                   >
//                     {page}
//                   </Button>
//                 )}
//               </React.Fragment>
//             ))}
            
//             <Button
//               size="sm"
//               colorScheme="teal"
//               onClick={() => goToPage(currentPage + 1)}
//               isDisabled={currentPage === totalPages}
//               rightIcon={<ChevronRightIcon />}
//               _hover={{ bg: 'teal.600', color: 'white' }}
//             >
//               Next
//             </Button>
//           </HStack>
//         </Flex>
//       </Card>

//       {/* Modal for full addresses */}
//       <Modal isOpen={isModalOpen} onClose={closeModal} isCentered size="lg">
//         <ModalOverlay bg="blackAlpha.600" />
//         <ModalContent
//           maxW={{ base: '90%', md: '800px' }}
//           borderRadius="16px"
//           bg={useColorModeValue('white', 'gray.800')}
//           boxShadow="0px 4px 20px rgba(0, 0, 0, 0.2)"
//         >
//           <ModalHeader
//             fontSize="lg"
//             fontWeight="700"
//             color={textColor}
//             borderBottom="1px"
//             borderColor={borderColor}
//           >
//             All User Addresses
//           </ModalHeader>
//           <ModalCloseButton color={textColor} />
//           <ModalBody py="20px" maxH="500px" overflowY="auto">
//             {selectedAddresses.length === 0 ? (
//               <Alert status="info" borderRadius="8px">
//                 <AlertIcon />
//                 <Text color={textColor} fontSize="sm">
//                   No addresses available for this user.
//                 </Text>
//               </Alert>
//             ) : (
//               <Box>
//                 <Text fontSize="sm" color="gray.500" mb={4}>
//                   Total Addresses: {selectedAddresses.length}
//                 </Text>
//                 {selectedAddresses.map((address, index) => (
//                   <Box
//                     key={address._id || index}
//                     mb={4}
//                     p={4}
//                     border="1px"
//                     borderColor={borderColor}
//                     borderRadius="12px"
//                     bg={useColorModeValue('gray.50', 'gray.700')}
//                     _hover={{
//                       borderColor: 'teal.300',
//                       boxShadow: '0px 2px 8px rgba(0, 128, 128, 0.15)',
//                     }}
//                     transition="all 0.2s ease"
//                   >
//                     <Flex justify="space-between" align="center" mb={2}>
//                       <Text 
//                         fontSize="md" 
//                         fontWeight="600" 
//                         color={textColor}
//                       >
//                         {index + 1}. {address.title || `Address ${index + 1}`}
//                       </Text>
//                       {address.latitude && address.longitude && (
//                         <Text 
//                           fontSize="xs" 
//                           color="gray.500"
//                           bg={useColorModeValue('gray.200', 'gray.600')}
//                           px={2} 
//                           py={1} 
//                           borderRadius="4px"
//                         >
//                           📍 {address.latitude.toFixed(4)}, {address.longitude.toFixed(4)}
//                         </Text>
//                       )}
//                     </Flex>
                    
//                     <Box mt={2} pl={4} borderLeft="3px solid" borderLeftColor="teal.300">
//                       <Text fontSize="sm" color={textColor} mb={1}>
//                         <strong>📍 Address:</strong> {address.address || 'N/A'}
//                       </Text>
//                       <Text fontSize="sm" color={textColor} mb={1}>
//                         <strong>🏷️ Title:</strong> {address.title || 'N/A'}
//                       </Text>
//                       <Text fontSize="sm" color={textColor} mb={1}>
//                         <strong>📌 Landmark:</strong> {address.landmark || 'N/A'}
//                       </Text>
//                       {address._id && (
//                         <Text fontSize="xs" color="gray.500">
//                           <strong>ID:</strong> {address._id}
//                         </Text>
//                       )}
//                     </Box>
//                   </Box>
//                 ))}
//               </Box>
//             )}
//           </ModalBody>
//           <ModalFooter borderTop="1px" borderColor={borderColor}>
//             <Button
//               colorScheme="teal"
//               onClick={closeModal}
//               borderRadius="12px"
//               size="sm"
//               _hover={{ bg: 'teal.600' }}
//             >
//               Close
//             </Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>
//       <Modal isOpen={setIsUseridModalOpen} onClose={closeModal} isCentered size="lg">
//         <ModalOverlay bg="blackAlpha.600" />
//         <ModalContent
//           maxW={{ base: '90%', md: '800px' }}
//           borderRadius="16px"
//           bg={useColorModeValue('white', 'gray.800')}
//           boxShadow="0px 4px 20px rgba(0, 0, 0, 0.2)"
//         >
//           <ModalHeader
//             fontSize="lg"
//             fontWeight="700"
//             color={textColor}
//             borderBottom="1px"
//             borderColor={borderColor}
//           >
//             All User Addresses
//           </ModalHeader>
//           <ModalCloseButton color={textColor} />
//           <ModalBody py="20px" maxH="500px" overflowY="auto">
//             {selectedAddresses.length === 0 ? (
//               <Alert status="info" borderRadius="8px">
//                 <AlertIcon />
//                 <Text color={textColor} fontSize="sm">
//                   No addresses available for this user.
//                 </Text>
//               </Alert>
//             ) : (
//               <Box>
//                 <Text fontSize="sm" color="gray.500" mb={4}>
//                   Total Addresses: {selectedAddresses.length}
//                 </Text>
//                 {selectedAddresses.map((address, index) => (
//                   <Box
//                     key={address._id || index}
//                     mb={4}
//                     p={4}
//                     border="1px"
//                     borderColor={borderColor}
//                     borderRadius="12px"
//                     bg={useColorModeValue('gray.50', 'gray.700')}
//                     _hover={{
//                       borderColor: 'teal.300',
//                       boxShadow: '0px 2px 8px rgba(0, 128, 128, 0.15)',
//                     }}
//                     transition="all 0.2s ease"
//                   >
//                     <Flex justify="space-between" align="center" mb={2}>
//                       <Text 
//                         fontSize="md" 
//                         fontWeight="600" 
//                         color={textColor}
//                       >
//                         {index + 1}. {address.title || `Address ${index + 1}`}
//                       </Text>
//                       {address.latitude && address.longitude && (
//                         <Text 
//                           fontSize="xs" 
//                           color="gray.500"
//                           bg={useColorModeValue('gray.200', 'gray.600')}
//                           px={2} 
//                           py={1} 
//                           borderRadius="4px"
//                         >
//                           📍 {address.latitude.toFixed(4)}, {address.longitude.toFixed(4)}
//                         </Text>
//                       )}
//                     </Flex>
                    
//                     <Box mt={2} pl={4} borderLeft="3px solid" borderLeftColor="teal.300">
//                       <Text fontSize="sm" color={textColor} mb={1}>
//                         <strong>📍 Address:</strong> {address.address || 'N/A'}
//                       </Text>
//                       <Text fontSize="sm" color={textColor} mb={1}>
//                         <strong>🏷️ Title:</strong> {address.title || 'N/A'}
//                       </Text>
//                       <Text fontSize="sm" color={textColor} mb={1}>
//                         <strong>📌 Landmark:</strong> {address.landmark || 'N/A'}
//                       </Text>
//                       {address._id && (
//                         <Text fontSize="xs" color="gray.500">
//                           <strong>ID:</strong> {address._id}
//                         </Text>
//                       )}
//                     </Box>
//                   </Box>
//                 ))}
//               </Box>
//             )}
//           </ModalBody>
//           <ModalFooter borderTop="1px" borderColor={borderColor}>
//             <Button
//               colorScheme="teal"
//               onClick={closeModal}
//               borderRadius="12px"
//               size="sm"
//               _hover={{ bg: 'teal.600' }}
//             >
//               Close
//             </Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>

//       {/* Modal for deactivation reason */}
//       <Modal
//         isOpen={isDeactivateModalOpen}
//         onClose={closeDeactivateModal}
//         isCentered
//       >
//         <ModalOverlay bg="blackAlpha.600" />
//         <ModalContent
//           maxW={{ base: '90%', md: '500px' }}
//           borderRadius="16px"
//           bg={useColorModeValue('white', 'gray.800')}
//           boxShadow="0px 4px 20px rgba(0, 0, 0, 0.2)"
//         >
//           <ModalHeader
//             fontSize="lg"
//             fontWeight="700"
//             color={textColor}
//             borderBottom="1px"
//             borderColor={borderColor}
//           >
//             Deactivate User
//           </ModalHeader>
//           <ModalCloseButton color={textColor} />
//           <ModalBody py="20px">
//             {disputesLoading ? (
//               <Flex justify="center" align="center" py={4}>
//                 <Spinner size="md" color="teal.500" />
//               </Flex>
//             ) : disputesError ? (
//               <Alert status="error" borderRadius="8px">
//                 <AlertIcon />
//                 <Text color={textColor}>{disputesError}</Text>
//               </Alert>
//             ) : (
//               <>
//                 <FormControl isRequired mb={4}>
//                   <FormLabel color={textColor}>
//                     Reason for Deactivation
//                   </FormLabel>
//                   <Textarea
//                     value={deactivateReason}
//                     onChange={(e) => setDeactivateReason(e.target.value)}
//                     placeholder="Enter reason for deactivation"
//                     bg={useColorModeValue('gray.100', 'gray.700')}
//                     borderRadius="8px"
//                   />
//                 </FormControl>
//                 <FormControl isRequired>
//                   <FormLabel color={textColor}>Dispute ID</FormLabel>
//                   <Select
//                     value={disputeId}
//                     onChange={(e) => setDisputeId(e.target.value)}
//                     placeholder={
//                       disputes.length === 0
//                         ? 'No disputes available'
//                         : 'Select dispute ID'
//                     }
//                     bg={useColorModeValue('gray.100', 'gray.700')}
//                     borderRadius="8px"
//                     isDisabled={disputes.length === 0}
//                   >
//                     {disputes.map((dispute) => (
//                       <option key={dispute._id} value={dispute._id}>
//                         {dispute.unique_id}
//                       </option>
//                     ))}
//                   </Select>
//                 </FormControl>
//               </>
//             )}
//           </ModalBody>
//           <ModalFooter borderTop="1px" borderColor={borderColor}>
//             <Button
//               colorScheme="gray"
//               mr={3}
//               onClick={closeDeactivateModal}
//               borderRadius="12px"
//               size="sm"
//             >
//               Cancel
//             </Button>
//             <Button
//               colorScheme="red"
//               onClick={handleDeactivateSubmit}
//               borderRadius="12px"
//               size="sm"
//               isLoading={toggleLoading[selectedUserId]}
//               isDisabled={
//                 disputesLoading || disputesError 
//               }
//               _hover={{ bg: 'red.600' }}
//             >
//               Deactivate
//             </Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>

//       {/* Modal for order buttons and inactivation info */}
//       <Modal
//         isOpen={isOrdersModalOpen}
//         onClose={closeOrdersModal}
//         isCentered
//       >
//         <ModalOverlay bg="blackAlpha.600" />
//         <ModalContent
//           maxW={{ base: '90%', md: '600px' }}
//           borderRadius="16px"
//           bg={useColorModeValue('white', 'gray.800')}
//           boxShadow="0px 4px 20px rgba(0, 0, 0, 0.2)"
//         >
//           <ModalHeader
//             fontSize="lg"
//             fontWeight="700"
//             color={textColor}
//             borderBottom="1px"
//             borderColor={borderColor}
//           >
//             User Details
//           </ModalHeader>
//           <ModalCloseButton color={textColor} />
//           <ModalBody py="20px">
//             {selectedInactivationInfo && (
//               <Box
//                 mb={6}
//                 p={4}
//                 border="1px"
//                 borderColor={borderColor}
//                 borderRadius="8px"
//               >
//                 <Text fontSize="md" fontWeight="600" color={textColor} mb={2}>
//                   Inactivation Details
//                 </Text>
//                 <Text fontSize="sm" color={textColor}>
//                   <strong>Inactivated By:</strong>{' '}
//                   {selectedInactivationInfo.inactivatedBy?.full_name || 'N/A'} (
//                   {selectedInactivationInfo.inactivatedBy?.email || 'N/A'})
//                 </Text>
//                 <Text fontSize="sm" color={textColor} mt={1}>
//                   <strong>Reason:</strong>{' '}
//                   {selectedInactivationInfo.reason || 'N/A'}
//                 </Text>
//                 <Text fontSize="sm" color={textColor} mt={1}>
//                   <strong>Dispute ID:</strong>{' '}
//                   {selectedInactivationInfo.disputeId?.unique_id || 'N/A'} (
//                   {selectedInactivationInfo.disputeId?.status || 'N/A'})
//                 </Text>
//                 <Text fontSize="sm" color={textColor} mt={1}>
//                   <strong>Dispute Created At:</strong>{' '}
//                   {selectedInactivationInfo.disputeId?.createdAt
//                     ? new Date(
//                         selectedInactivationInfo.disputeId.createdAt,
//                       ).toLocaleDateString('en-IN')
//                     : 'N/A'}
//                 </Text>
//                 <Text fontSize="sm" color={textColor} mt={1}>
//                   <strong>Inactivated At:</strong>{' '}
//                   {selectedInactivationInfo.inactivatedAt
//                     ? new Date(
//                         selectedInactivationInfo.inactivatedAt,
//                       ).toLocaleDateString('en-IN')
//                     : 'N/A'}
//                 </Text>
//               </Box>
//             )}
//             <Text fontSize="md" fontWeight="600" color={textColor} mb={2}>
//               Order Actions
//             </Text>
//             <Flex
//               direction={{ base: 'column', md: 'row' }}
//               justify="center"
//               align="center"
//               gap={{ base: 2, md: 3 }}
//             >
//               <Button
//                 size="sm"
//                 colorScheme="teal"
//                 variant="outline"
//                 onClick={() =>
//                   navigate(`/admin/directOrder/${selectedUserId}`)
//                 }
//                 _hover={{ bg: 'teal.600', color: 'white' }}
//                 w={{ base: '100%', md: 'auto' }}
//               >
//                 Direct Orders
//               </Button>
//               <Button
//                 size="sm"
//                 colorScheme="teal"
//                 variant="outline"
//                 onClick={() =>
//                   navigate(`/admin/bidding_Order/${selectedUserId}`)
//                 }
//                 _hover={{ bg: 'teal.600', color: 'white' }}
//                 w={{ base: '100%', md: 'auto' }}
//               >
//                 Bidding Orders
//               </Button>
//               <Button
//                 size="sm"
//                 colorScheme="teal"
//                 variant="outline"
//                 onClick={() =>
//                   navigate(`/admin/emergency_Order/${selectedUserId}`)
//                 }
//                 _hover={{ bg: 'teal.600', color: 'white' }}
//                 w={{ base: '100%', md: 'auto' }}
//               >
//                 Emergency Orders
//               </Button>
//             </Flex>
//           </ModalBody>
//           <ModalFooter borderTop="1px" borderColor={borderColor}>
//             <Button
//               colorScheme="teal"
//               onClick={closeOrdersModal}
//               borderRadius="12px"
//               size="sm"
//               _hover={{ bg: 'teal.600' }}
//             >
//               Close
//             </Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>
//       <Modal isOpen={isUserModalOpen} onClose={closeUserModal} isCentered>
//   <ModalOverlay bg="blackAlpha.600" />

//   <ModalContent
//     maxW={{ base: "90%", md: "650px" }}
//     borderRadius="16px"
//     bg={useColorModeValue("white", "gray.800")}
//     boxShadow="0px 4px 20px rgba(0, 0, 0, 0.2)" >

//     <ModalHeader
//       fontSize="lg"
//       fontWeight="700"
//       color={textColor}
//       borderBottom="1px"
//       borderColor={borderColor}
//     >
//       Edit User Details
//     </ModalHeader>

//     <ModalCloseButton color={textColor} />

//     <ModalBody py="20px">
//       {selectedUser && (
//         <Box mb={6}>

//           {/* ---------------- USER INFO ---------------- */}
//           <Box
//             mb={6}
//             p={4}
//             border="1px"
//             borderColor={borderColor}
//             borderRadius="8px"
//           >
//             <Text fontSize="md" fontWeight="600" color={textColor} mb={4}>
//               User Information
//             </Text>
         
//             {/* NAME */}
//             <FormControl mb={3}>
//               <FormLabel fontSize="sm">Name</FormLabel>
//               <Input
//                 value={editName}
//                 onChange={(e) => setEditName(e.target.value)}
//                 placeholder="Enter full name"
//                 borderRadius="10px"
//               />
//             </FormControl>

//             {/* MOBILE */}
//             <FormControl mb={3} isInvalid={mobileError}>
//               <FormLabel fontSize="sm">Mobile</FormLabel>
//               <Input
//                 value={editMobile}
//                 onChange={(e) => {
//                   const value = e.target.value;
//                   setEditMobile(value);
//                   if (!/^[0-9]{0,10}$/.test(value)) return;
//                   setMobileError(value.length !== 10);
//                 }}
//                 placeholder="Enter 10-digit mobile number"
//                 maxLength={10}
//                 borderRadius="10px"
//               />
//               {mobileError && (
//                 <FormErrorMessage>Mobile number must be 10 digits</FormErrorMessage>
//               )}
//             </FormControl>

//             {/* IMAGE */}
//             <FormControl mb={3}>
//               <FormLabel fontSize="sm">Profile Picture</FormLabel>
//               <Input
//                 type="file"
//                 accept="image/*"
//                 onChange={(e) => {
//                   const file = e.target.files[0];
//                   if (file) {
//                     setNewImage(file);
//                     setNewImagePreview(URL.createObjectURL(file));
//                   }
//                 }}
//               />

//               <Box mt={3}>
//                 <img
//                   src={newImagePreview || selectedUser.profile_pic}
//                   alt="Profile"
//                   style={{
//                     width: "100px",
//                     height: "100px",
//                     borderRadius: "10px",
//                     objectFit: "cover",
//                   }}
//                 />
//               </Box>
//             </FormControl>
//           </Box>

//           {/* ---------------- ADDRESS SECTION ---------------- */}
//           <Box
//             p={4}
//             border="1px"
//             borderColor={borderColor}
//             borderRadius="8px"
//           >
//             <Text fontSize="md" fontWeight="600" mb={4}>
//               Saved Addresses
//             </Text>

//             {/* ADDRESS LIST */}
//             {userAddresses.map((addr, index) => (
//               <Box
//                 key={index}
//                 p={3}
//                 mb={3}
//                 border="1px solid"
//                 borderColor={borderColor}
//                 borderRadius="10px"
//                 position="relative"
//               >
//                 <Text fontWeight="600">{addr.title}</Text>
//                 <Text fontSize="sm">{addr.address}</Text>

//                 <IconButton
//                   icon={<DeleteIcon />}
//                   size="sm"
//                   colorScheme="red"
//                   position="absolute"
//                   right="10px"
//                   top="10px"
//                   onClick={() => deleteAddress(index)}
//                 />
//               </Box>
//             ))}

//             {/* MAP */}
//             <Text fontWeight="600" mt={4} mb={1}>
//               Select Location
//             </Text>

//             {isLoaded && (
//               <GoogleMap
//                 mapContainerStyle={mapStyle}
//                 zoom={14}
//                 center={mapCenter}
//                 onClick={(e) => handleMapClick(e)}
//               >
//                 <Marker position={mapCenter} />
//               </GoogleMap>
//             )}

//             {/* ADD LOCATION BUTTON */}
//             <Button
//               mt={4}
//               width="full"
//               colorScheme="blue"
//               onClick={addSelectedLocation}
//             >
//               Add This Location
//             </Button>
//           </Box>
//         </Box>
//       )}
//     </ModalBody>

//     <ModalFooter borderTop="1px" borderColor={borderColor}>
//       <Button
//         colorScheme="teal"
//         onClick={handleSaveUser}
//         borderRadius="12px"
//         size="sm"
//         _hover={{ bg: "teal.600" }}
//         mr={3}
//       >
//         Save
//       </Button>

//       <Button onClick={closeUserModal} borderRadius="12px" size="sm">
//         Close
//       </Button>
//     </ModalFooter>
//   </ModalContent>
// </Modal>
// <Modal isOpen={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)} isCentered>
//   <ModalOverlay />
//   <ModalContent>
//     <ModalHeader>Enter Address Details</ModalHeader>
//     <ModalCloseButton />

//     <ModalBody>
//       <FormControl mb={3}>
//         <FormLabel>Title</FormLabel>
//         <Input value={tempAddress.title}
//           onChange={(e) => setTempAddress({ ...tempAddress, title: e.target.value })}
//         />
//       </FormControl>

//       <FormControl mb={3}>
//         <FormLabel>House No</FormLabel>
//         <Input value={tempAddress.houseNo}
//           onChange={(e) => setTempAddress({ ...tempAddress, houseNo: e.target.value })}
//         />
//       </FormControl>

//       <FormControl mb={3}>
//         <FormLabel>Street</FormLabel>
//         <Input value={tempAddress.street}
//           onChange={(e) => setTempAddress({ ...tempAddress, street: e.target.value })}
//         />
//       </FormControl>

//       <FormControl mb={3}>
//         <FormLabel>Area</FormLabel>
//         <Input value={tempAddress.area}
//           onChange={(e) => setTempAddress({ ...tempAddress, area: e.target.value })}
//         />
//       </FormControl>

//       <FormControl mb={3}>
//         <FormLabel>Landmark</FormLabel>
//         <Input value={tempAddress.landmark}
//           onChange={(e) => setTempAddress({ ...tempAddress, landmark: e.target.value })}
//         />
//       </FormControl>

//       <FormControl mb={3}>
//         <FormLabel>Pincode</FormLabel>
//         <Input value={tempAddress.pincode}
//           onChange={(e) => setTempAddress({ ...tempAddress, pincode: e.target.value })}
//         />
//       </FormControl>
//     </ModalBody>

//     <ModalFooter>
//       <Button colorScheme="blue" onClick={saveAddress}>
//         Save Address
//       </Button>
//     </ModalFooter>
//   </ModalContent>
// </Modal>


//       <ToastContainer
//         position="top-right"
//         autoClose={3000}
//         hideProgressBar={false}
//         closeOnClick
//         pauseOnHover
//         draggable
//         theme={useColorModeValue('light', 'dark')}
//       />
//     </>
//   );
// }
// Chakra imports
import {
  Box,
  SimpleGrid,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
// Custom components
import MiniStatistics from 'components/card/MiniStatistics';
import IconBox from 'components/icons/IconBox';
import React from 'react';
import { MdPeople } from 'react-icons/md';
import { Link } from 'react-router-dom';
import {
  FaFileInvoiceDollar,
  FaMoneyBillWave,
  FaBook,
  FaVideo,
  FaLayerGroup
} from 'react-icons/fa';

export default function UserReports() {
  // Chakra Color Mode
  const brandColor = useColorModeValue('#045e14', 'white');
  const boxBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');

  // Static Data for UI Design
  const staticData = {
    users: "120",
    payments: "45",
    tags: "12",
    tests: "8",
    videos: "56",
    courses: "15",
    chapters: "85",
    subjects: "10",
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <SimpleGrid
        columns={{ base: 1, md: 2, lg: 3, '2xl': 4 }}
        gap="20px"
        mb="20px"
      >
        {/* User Card */}
        <Link to="/admin/users">
          <MiniStatistics
            startContent={
              <IconBox
                w="56px"
                h="56px"
                bg={boxBg}
                icon={<Icon as={MdPeople} w="32px" h="32px" color={brandColor} />}
              />
            }
            name="Total Users"
            value={staticData.users}
          />
        </Link>

        {/* Payment List Card */}
        <Link to="/admin/payments">
          <MiniStatistics
            startContent={
              <IconBox
                w="56px"
                h="56px"
                bg={boxBg}
                icon={<Icon as={FaMoneyBillWave} w="32px" h="32px" color={brandColor} />}
              />
            }
            name="Payment List"
            value={staticData.payments}
          />
        </Link>

        {/* Tags Card */}
        <Link to="/admin/tags">
          <MiniStatistics
            startContent={
              <IconBox
                w="56px"
                h="56px"
                bg={boxBg}
                icon={<Icon as={FaLayerGroup} w="32px" h="32px" color={brandColor} />}
              />
            }
            name="Tags"
            value={staticData.tags}
          />
        </Link>

        {/* Test Card */}
        <Link to="/admin/tests">
          <MiniStatistics
            startContent={
              <IconBox
                w="56px"
                h="56px"
                bg={boxBg}
                icon={<Icon as={FaFileInvoiceDollar} w="32px" h="32px" color={brandColor} />}
              />
            }
            name="Test Series"
            value={staticData.tests}
          />
        </Link>

        {/* Video Lecture Card */}
        <Link to="/admin/videos">
          <MiniStatistics
            startContent={
              <IconBox
                w="56px"
                h="56px"
                bg={boxBg}
                icon={<Icon as={FaVideo} w="32px" h="32px" color={brandColor} />}
              />
            }
            name="Video Lectures"
            value={staticData.videos}
          />
        </Link>
        
        {/* Courses Card */}
        <Link to="/admin/courses">
          <MiniStatistics
            startContent={
              <IconBox
                w="56px"
                h="56px"
                bg={boxBg}
                icon={<Icon as={FaBook} w="32px" h="32px" color={brandColor} />}
              />
            }
            name="Courses"
            value={staticData.courses}
          />
        </Link>

        {/* Chapter Card */}
        <Link to="/admin/chapters">
          <MiniStatistics
            startContent={
              <IconBox
                w="56px"
                h="56px"
                bg={boxBg}
                icon={<Icon as={FaLayerGroup} w="32px" h="32px" color={brandColor} />}
              />
            }
            name="Chapters"
            value={staticData.chapters}
          />
        </Link>

        {/* Subject Card */}
        <Link to="/admin/subjects">
          <MiniStatistics
            startContent={
              <IconBox
                w="56px"
                h="56px"
                bg={boxBg}
                icon={<Icon as={FaBook} w="32px" h="32px" color={brandColor} />}
              />
            }
            name="Subjects"
            value={staticData.subjects}
          />
        </Link>
      </SimpleGrid>
    </Box>
  );
}