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
// import { useNavigate } from 'react-router-dom';
// import React, { useState, useMemo, useCallback } from 'react';
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
// import { CSVLink } from 'react-csv';

// const mapStyle = { width: "100%", height: "250px" };
// const columnHelper = createColumnHelper();

// export default function ComplexTable() {
//   const [sorting, setSorting] = useState([]);
//   const [isUserModalOpen, setIsUserModalOpen] = useState(false);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [editName, setEditName] = useState("");
//   const [editMobile, setEditMobile] = useState("");
//   const [mobileError, setMobileError] = useState(false);
//   const [newImage, setNewImage] = useState(null);
//   const [newImagePreview, setNewImagePreview] = useState(null);
//   const [filteredData] = useState([]); // ← No data by default
//   const [toggleLoading, setToggleLoading] = useState({});
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
//   const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
//   const [userId, setUserId] = useState(null);
//   const [selectedAddresses, setSelectedAddresses] = useState([]);
//   const [selectedUserId, setSelectedUserId] = useState(null);
//   const [selectedInactivationInfo, setSelectedInactivationInfo] = useState(null);
//   const [deactivateReason, setDeactivateReason] = useState('');
//   const [disputeId, setDisputeId] = useState('');
//   const itemsPerPage = 10;
//   const maxVisiblePages = 5;
//   const textColor = useColorModeValue('secondaryGray.900', 'white');
//   const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
//   const headerBg = useColorModeValue('gray.100', 'gray.700');
//   const hoverBg = useColorModeValue('gray.50', 'gray.600');
//   const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
//   const [tempAddress, setTempAddress] = useState({
//     latitude: "",
//     longitude: "",
//     title: "",
//     houseNo: "",
//     street: "",
//     area: "",
//     landmark: "",
//     pincode: "",
//     address: ""
//   });

//   const navigate = useNavigate();
//   const { isLoaded } = useLoadScript({
//     googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
//   });

//   const [userAddresses, setUserAddresses] = useState([]);
//   const [mapCenter, setMapCenter] = useState({ lat: 22.7196, lng: 75.8577 });

//   // ──────────────────────────────────────────────────────────────
//   //                   ALL API & DATA FETCHING REMOVED
//   // ──────────────────────────────────────────────────────────────

//   const deleteAddress = (index) => {
//     setUserAddresses((prev) => prev.filter((_, i) => i !== index));
//   };

//   const handleMapClick = (event) => {
//     setMapCenter({
//       lat: event.latLng.lat(),
//       lng: event.latLng.lng(),
//     });
//   };

//   const saveAddress = () => {
//     const finalAddress = { ...tempAddress };
//     setUserAddresses([...userAddresses, finalAddress]);
//     setIsAddressModalOpen(false);
//   };

//   const addSelectedLocation = () => {
//     if (!isLoaded) return;
//     const geocoder = new window.google.maps.Geocoder();
//     geocoder.geocode({ location: mapCenter }, (results, status) => {
//       if (status === "OK" && results[0]) {
//         setTempAddress({
//           latitude: mapCenter.lat,
//           longitude: mapCenter.lng,
//           title: "",
//           houseNo: "",
//           street: "",
//           area: "",
//           landmark: "",
//           pincode: "",
//           address: results[0].formatted_address
//         });
//         setIsAddressModalOpen(true);
//       }
//     });
//   };

//   const openUserModal = (id, name, full_address, mobile, profile_pic) => {
//     setUserId(id);
//     setSelectedUser({ id, name, full_address, mobile, profile_pic });
//     setEditName(name || "");
//     setEditMobile(mobile || "");
//     setNewImagePreview(null);
//     setUserAddresses(full_address || []);
//     setIsUserModalOpen(true);
//   };

//   const handleSaveUser = () => {
//     // Just demo success message — no real save
//     toast.success("Profile Updated (UI Demo Mode)", {
//       position: 'top-right',
//       autoClose: 3000,
//     });
//     closeUserModal();
//   };

//   const closeUserModal = () => setIsUserModalOpen(false);

//   const handleSearch = (query) => {
//     setSearchQuery(query);
//     setCurrentPage(1);
//     // No real filtering — table remains empty
//   };

//   const openModal = (addresses) => {
//     setSelectedAddresses(addresses || []);
//     setIsModalOpen(true);
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setSelectedAddresses([]);
//   };

//   const openDeactivateModal = (userId) => {
//     setSelectedUserId(userId);
//     setDeactivateReason('');
//     setDisputeId('');
//     setIsDeactivateModalOpen(true);
//   };

//   const closeDeactivateModal = () => {
//     setIsDeactivateModalOpen(false);
//     setSelectedUserId(null);
//   };

//   const openOrdersModal = (userId, inactivationInfo) => {
//     setSelectedUserId(userId);
//     setSelectedInactivationInfo(inactivationInfo);
//     setIsOrdersModalOpen(true);
//   };

//   const closeOrdersModal = () => {
//     setIsOrdersModalOpen(false);
//     setSelectedUserId(null);
//     setSelectedInactivationInfo(null);
//   };

//   const handleToggle = (userId, currentActive) => {
//     if (toggleLoading[userId]) return;
//     setToggleLoading((prev) => ({ ...prev, [userId]: true }));

//     setTimeout(() => {
//       toast.info(`Toggle action (Demo mode) - ${currentActive ? 'Deactivate' : 'Activate'}`, {
//         position: "top-right",
//         autoClose: 2000,
//       });
//       setToggleLoading((prev) => ({ ...prev, [userId]: false }));
//     }, 600);

//     if (currentActive) {
//       openDeactivateModal(userId);
//     }
//   };

//   const handleDeactivateSubmit = () => {
//     if (!deactivateReason) {
//       toast.error('Reason is required');
//       return;
//     }
//     toast.success("Deactivation submitted (Demo)");
//     closeDeactivateModal();
//   };

//   // ─── Pagination (works with empty array) ──────────────────────
//   const totalItems = filteredData.length;
//   const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const endIndex = startIndex + itemsPerPage;
//   const paginatedData = filteredData.slice(startIndex, endIndex);

//   const getVisiblePageNumbers = () => {
//     const pages = [];
//     const half = Math.floor(maxVisiblePages / 2);
//     let start = Math.max(1, currentPage - half);
//     let end = Math.min(totalPages, start + maxVisiblePages - 1);

//     if (end - start + 1 < maxVisiblePages) {
//       start = Math.max(1, end - maxVisiblePages + 1);
//     }

//     if (start > 1) {
//       pages.push(1);
//       if (start > 2) pages.push('...');
//     }

//     for (let i = start; i <= end; i++) pages.push(i);

//     if (end < totalPages) {
//       if (end < totalPages - 1) pages.push('...');
//       pages.push(totalPages);
//     }

//     return pages;
//   };

//   const goToPage = (page) => {
//     if (page === '...' || !page) return;
//     setCurrentPage(Math.min(Math.max(1, page), totalPages));
//   };

//   // CSV — will be empty
//   const csvData = [];

//   // ─── Table Columns (structure same, just no real data) ────────
//   const columns = useMemo(
//     () => [
//       columnHelper.display({
//         id: 'sno',
//         header: () => <Text textAlign="center">S.No</Text>,
//         cell: ({ row }) => <Text textAlign="center">{row.index + 1}</Text>,
//       }),
//       columnHelper.accessor('uniqueId', {
//         header: () => <Text textAlign="center">Unique ID</Text>,
//         cell: () => <Text textAlign="center">—</Text>,
//       }),
//       columnHelper.accessor('profile_pic', {
//         header: () => <Text textAlign="center">Profile</Text>,
//         cell: () => (
//           <Flex justify="center">
//             <img
//               src={defaultProfilePic}
//               alt="Profile"
//               style={{ width: '40px', height: '40px', borderRadius: '50%' }}
//             />
//           </Flex>
//         ),
//       }),
//       columnHelper.accessor('full_name', {
//         header: () => <Text textAlign="center">Full Name</Text>,
//         cell: () => <Text textAlign="center">—</Text>,
//       }),
//       columnHelper.accessor('mobile', {
//         header: () => <Text textAlign="center">Mobile</Text>,
//         cell: () => <Text textAlign="center">—</Text>,
//       }),
//       columnHelper.accessor('location', {
//         id: 'location',
//         header: () => <Text textAlign="center">Country</Text>,
//         cell: () => (
//           <Flex justify="center" align="center" gap={2}>
//             <Text textAlign="center">—</Text>
//           </Flex>
//         ),
//       }),
//       // ... Add other columns you need with placeholder "—" cells
//       columnHelper.accessor('active', {
//         header: () => <Text textAlign="center">Active</Text>,
//         cell: ({ row }) => (
//           <Flex justify="center" gap={2}>
//             <Switch
//               isChecked={false}
//               onChange={() => handleToggle(row.id, false)}
//               isDisabled={toggleLoading[row.id]}
//             />
//           </Flex>
//         ),
//       }),
//       columnHelper.display({
//         id: 'actions',
//         header: () => <Text textAlign="center">Actions</Text>,
//         cell: () => (
//           <Flex justify="center" gap={2}>
//             <Button size="sm" colorScheme="teal" variant="outline">
//               View More
//             </Button>
//             <Button size="sm" colorScheme="teal" variant="outline">
//               Edit
//             </Button>
//           </Flex>
//         ),
//       }),
//     ],
//     [toggleLoading]
//   );

//   const table = useReactTable({
//     data: paginatedData,
//     columns,
//     state: { sorting },
//     onSortingChange: setSorting,
//     getCoreRowModel: getCoreRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     manualPagination: true,
//     pageCount: totalPages,
//   });

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
//           >
//             Users List
//           </Text>
//           <HStack spacing={4}>
//             <InputGroup maxW={{ base: '100%', md: '300px' }}>
//               <InputLeftElement pointerEvents="none">
//                 <Icon as={SearchIcon} color="gray.400" />
//               </InputLeftElement>
//               <Input
//                 placeholder="Search..."
//                 value={searchQuery}
//                 onChange={(e) => handleSearch(e.target.value)}
//                 borderRadius="12px"
//               />
//             </InputGroup>
//             <CSVLink
//               data={csvData}
//               filename="users_data.csv"
//               style={{ textDecoration: 'none' }}
//             >
//               <Button colorScheme="teal" variant="outline">
//                 Export
//               </Button>
//             </CSVLink>
//           </HStack>
//         </Flex>

//         <Box overflowX="auto">
//           <Table variant="simple" color="gray.500" mb="24px" mt="12px" minW="1200px">
//             <Thead bg={headerBg}>
//               {table.getHeaderGroups().map((headerGroup) => (
//                 <Tr key={headerGroup.id}>
//                   {headerGroup.headers.map((header) => (
//                     <Th
//                       key={header.id}
//                       px={{ base: '8px', md: '16px' }}
//                       py="12px"
//                       borderColor={borderColor}
//                       cursor="pointer"
//                       onClick={header.column.getToggleSortingHandler()}
//                     >
//                       <Flex justify="center" align="center">
//                         {flexRender(header.column.columnDef.header, header.getContext())}
//                         {header.column.getIsSorted() ? (
//                           header.column.getIsSorted() === 'asc' ? <ArrowUpIcon ml={2} /> : <ArrowDownIcon ml={2} />
//                         ) : null}
//                       </Flex>
//                     </Th>
//                   ))}
//                 </Tr>
//               ))}
//             </Thead>
//             <Tbody>
//               {paginatedData.length === 0 ? (
//                 <Tr>
//                   <Td colSpan={columns.length} textAlign="center" py="50px">
//                     <Text color="gray.500" fontSize="lg">No users found</Text>
//                   </Td>
//                 </Tr>
//               ) : (
//                 table.getRowModel().rows.map((row) => (
//                   <Tr key={row.id} _hover={{ bg: hoverBg }}>
//                     {row.getVisibleCells().map((cell) => (
//                       <Td
//                         key={cell.id}
//                         px={{ base: '8px', md: '16px' }}
//                         py="12px"
//                         borderColor={borderColor}
//                       >
//                         {flexRender(cell.column.columnDef.cell, cell.getContext())}
//                       </Td>
//                     ))}
//                   </Tr>
//                 ))
//               )}
//             </Tbody>
//           </Table>
//         </Box>

//         {/* Pagination - still visible even when empty */}
//         <Flex justify="space-between" align="center" px={{ base: '10px', md: '25px' }} py="10px">
//           <Text fontSize="sm" color={textColor}>
//             Showing 0 to 0 of 0 users
//           </Text>
//           <HStack spacing={1}>
//             <Button size="sm" isDisabled>Previous</Button>
//             <Button size="sm" variant="solid" colorScheme="teal">1</Button>
//             <Button size="sm" isDisabled>Next</Button>
//           </HStack>
//         </Flex>
//       </Card>

//       {/* ────────────────────────────────────────────────────────────── */}
//       {/*                  ALL MODALS & MAP REMAIN SAME                     */}
//       {/* ────────────────────────────────────────────────────────────── */}

//       {/* Address List Modal */}
//       <Modal isOpen={isModalOpen} onClose={closeModal} isCentered size="lg">
//         {/* ... same as your original ... */}
//       </Modal>

//       {/* Edit User Modal */}
//       <Modal isOpen={isUserModalOpen} onClose={closeUserModal} isCentered>
//         {/* ... same as your original edit modal with map, address add/delete ... */}
//       </Modal>

//       {/* Address Add Details Modal */}
//       <Modal isOpen={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)} isCentered>
//         {/* ... same form ... */}
//       </Modal>

//       {/* Deactivate Reason Modal */}
//       <Modal isOpen={isDeactivateModalOpen} onClose={closeDeactivateModal} isCentered>
//         {/* ... same ... */}
//       </Modal>

//       {/* Orders Modal */}
//       <Modal isOpen={isOrdersModalOpen} onClose={closeOrdersModal} isCentered>
//         {/* ... same ... */}
//       </Modal>

//       <ToastContainer
//         position="top-right"
//         autoClose={3000}
//         hideProgressBar={false}
//         closeOnClick
//         pauseOnHover
//         draggable
//       />
//     </>
//   );
// }

/* eslint-disable */
'use client';

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
  Button,
  HStack,
  Switch,
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
  Spinner,
} from '@chakra-ui/react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import Card from 'components/card/Card';
import React, { useState, useMemo, useEffect } from 'react';
import { ArrowUpIcon, ArrowDownIcon, SearchIcon } from '@chakra-ui/icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import defaultProfilePic from 'assets/img/profile/profile.webp';
import { CSVLink } from 'react-csv';
import axios from 'axios';

const columnHelper = createColumnHelper();

export default function ComplexTable() {
  const [sorting, setSorting] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const itemsPerPage = 10;
  const maxVisiblePages = 5;

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const headerBg = useColorModeValue('gray.100', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.600');

  const baseUrl = process.env.REACT_APP_BASE_URL.replace(/\/$/, '');
  const token = localStorage.getItem('token');

  // ─────────────────────────────────────────────
  // FETCH USERS FROM BACKEND
  // ─────────────────────────────────────────────
  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${baseUrl}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setUsers(response.data.data);
        setFilteredData(response.data.data);
      }
    } catch (err) {
      console.error('Fetch users error:', err?.response?.data || err.message);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ─────────────────────────────────────────────
  // SEARCH
  // ─────────────────────────────────────────────
  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);

    const filtered = users.filter(
      (u) =>
        u.name?.toLowerCase().includes(query.toLowerCase()) ||
        u.email?.toLowerCase().includes(query.toLowerCase()) ||
        u.mobile?.toLowerCase().includes(query.toLowerCase()),
    );

    setFilteredData(filtered);
  };

  // ─────────────────────────────────────────────
  // PAGINATION
  // ─────────────────────────────────────────────
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const getVisiblePageNumbers = () => {
    const pages = [];
    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('...');
    }

    for (let i = start; i <= end; i++) pages.push(i);

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  const goToPage = (page) => {
    if (page === '...' || !page) return;
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  // ─────────────────────────────────────────────
  // CSV EXPORT
  // ─────────────────────────────────────────────
  const csvData = filteredData.map((u) => ({
    ID: u._id,
    Name: u.name,
    Email: u.email,
    Mobile: u.mobile,
    Status: u.status,
  }));

  // ─────────────────────────────────────────────
  // TABLE COLUMNS
  // ─────────────────────────────────────────────
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'sno',
        header: () => <Text textAlign="center">S.No</Text>,
        cell: ({ row }) => <Text textAlign="center">{row.index + 1}</Text>,
      }),

      // columnHelper.accessor('_id', {
      //   header: () => <Text textAlign="center">User ID</Text>,
      //   cell: (info) => (
      //     <Text textAlign="center" fontSize="xs">
      //       {info.getValue()}
      //     </Text>
      //   ),
      // }),

      columnHelper.accessor('profileImage', {
        header: () => <Text textAlign="center">Profile</Text>,
        cell: (info) => (
          <Flex justify="center">
            <img
              src={
                info.getValue()
                  ? `${baseUrl}${info.getValue()}`
                  : defaultProfilePic
              }
              alt="Profile"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
              }}
            />
          </Flex>
        ),
      }),

      columnHelper.accessor('name', {
        header: () => <Text textAlign="center">Name</Text>,
        cell: (info) => <Text textAlign="center">{info.getValue()}</Text>,
      }),

      columnHelper.accessor('email', {
        header: () => <Text textAlign="center">Email</Text>,
        cell: (info) => <Text textAlign="center">{info.getValue()}</Text>,
      }),

      columnHelper.accessor('mobile', {
        header: () => <Text textAlign="center">Mobile</Text>,
        cell: (info) => (
          <Text textAlign="center">{info.getValue() || '—'}</Text>
        ),
      }),

      columnHelper.accessor('address', {
        header: () => <Text textAlign="center">Address</Text>,
        cell: (info) => (
          <Text textAlign="center">{info.getValue() || '—'}</Text>
        ),
      }),

      // columnHelper.accessor('countryId', {
      //   header: () => <Text textAlign="center">Country ID</Text>,
      //   cell: (info) => (
      //     <Text textAlign="center" fontSize="xs">
      //       {info.getValue()}
      //     </Text>
      //   ),
      // }),

      // columnHelper.accessor('stateId', {
      //   header: () => <Text textAlign="center">State ID</Text>,
      //   cell: (info) => (
      //     <Text textAlign="center" fontSize="xs">
      //       {info.getValue()}
      //     </Text>
      //   ),
      // }),

      // columnHelper.accessor('cityId', {
      //   header: () => <Text textAlign="center">City ID</Text>,
      //   cell: (info) => (
      //     <Text textAlign="center" fontSize="xs">
      //       {info.getValue()}
      //     </Text>
      //   ),
      // }),

      // columnHelper.accessor('collegeId', {
      //   header: () => <Text textAlign="center">College ID</Text>,
      //   cell: (info) => (
      //     <Text textAlign="center" fontSize="xs">
      //       {info.getValue()}
      //     </Text>
      //   ),
      // }),

      // columnHelper.accessor('classId', {
      //   header: () => <Text textAlign="center">Class ID</Text>,
      //   cell: (info) => (
      //     <Text textAlign="center" fontSize="xs">
      //       {info.getValue()}
      //     </Text>
      //   ),
      // }),

      columnHelper.accessor('passingYear', {
        header: () => <Text textAlign="center">Passing Year</Text>,
        cell: (info) => <Text textAlign="center">{info.getValue()}</Text>,
      }),

      columnHelper.accessor('admissionYear', {
        header: () => <Text textAlign="center">Admission Year</Text>,
        cell: (info) => <Text textAlign="center">{info.getValue()}</Text>,
      }),

      columnHelper.accessor('status', {
        header: () => <Text textAlign="center">Status</Text>,
        cell: (info) => (
          <Text
            textAlign="center"
            color={info.getValue() === 'active' ? 'green.500' : 'red.500'}
            fontWeight="600"
          >
            {info.getValue()}
          </Text>
        ),
      }),

      columnHelper.accessor('role', {
        header: () => <Text textAlign="center">Role</Text>,
        cell: (info) => <Text textAlign="center">{info.getValue()}</Text>,
      }),

      columnHelper.accessor('signUpBy', {
        header: () => <Text textAlign="center">Signup By</Text>,
        cell: (info) => <Text textAlign="center">{info.getValue()}</Text>,
      }),

      columnHelper.accessor('isEmailVerified', {
        header: () => <Text textAlign="center">Email Verified</Text>,
        cell: (info) => (
          <Text
            textAlign="center"
            color={info.getValue() ? 'green.500' : 'red.500'}
            fontWeight="600"
          >
            {info.getValue() ? 'Yes' : 'No'}
          </Text>
        ),
      }),

      columnHelper.accessor('createdAt', {
        header: () => <Text textAlign="center">Created At</Text>,
        cell: (info) => (
          <Text textAlign="center" fontSize="sm">
            {new Date(info.getValue()).toLocaleDateString()}
          </Text>
        ),
      }),

      columnHelper.accessor('subscriptionStatus', {
        header: () => <Text textAlign="center">Subscription Status</Text>,
        cell: (info) => (
          <Text
            textAlign="center"
            fontWeight="600"
            color={info.getValue() ? 'purple.500' : 'gray.500'}
          >
            {info.getValue() || 'N/A'}
          </Text>
        ),
      }),

      columnHelper.accessor('subscription', {
        header: () => <Text textAlign="center">Subscription</Text>,
        cell: (info) => {
          const sub = info.getValue();
          if (!sub) return <Text textAlign="center">—</Text>;

          return (
            <Box textAlign="center">
              <Text fontSize="sm">Plan ID: {sub.plan_id}</Text>
              <Text fontSize="sm">
                {new Date(sub.startDate).toLocaleDateString()} →{' '}
                {new Date(sub.endDate).toLocaleDateString()}
              </Text>
              <Text fontSize="sm">Months: {sub.selectedMonths}</Text>
              <Text
                fontSize="sm"
                color={sub.isActive ? 'green.500' : 'red.500'}
              >
                {sub.isActive ? 'Active' : 'Inactive'}
              </Text>
            </Box>
          );
        },
      }),
    ],
    [baseUrl],
  );

  const table = useReactTable({
    data: paginatedData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  return (
    <>
      <Card
        flexDirection="column"
        w="100%"
        px={{ base: '15px', md: '25px' }}
        py="25px"
        borderRadius="16px"
        boxShadow="0px 4px 20px rgba(0, 0, 0, 0.1)"
        bg={useColorModeValue('white', 'gray.800')}
        overflowX="auto"
      >
        <Flex
          px={{ base: '10px', md: '0' }}
          mb="20px"
          justifyContent="space-between"
          align="center"
          direction={{ base: 'column', md: 'row' }}
          gap={{ base: '10px', md: '0' }}
        >
          <Text
            color={textColor}
            fontSize={{ base: 'xl', md: '2xl' }}
            fontWeight="700"
          >
            Users List
          </Text>

          <HStack spacing={4}>
            <InputGroup maxW={{ base: '100%', md: '300px' }}>
              <InputLeftElement pointerEvents="none">
                <Icon as={SearchIcon} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                borderRadius="12px"
              />
            </InputGroup>

            <CSVLink
              data={csvData}
              filename="users_data.csv"
              style={{ textDecoration: 'none' }}
            >
              <Button colorScheme="teal" variant="outline">
                Export
              </Button>
            </CSVLink>
          </HStack>
        </Flex>

        {loading ? (
          <Flex justify="center" align="center" minH="300px">
            <Spinner size="xl" color="brand.500" />
          </Flex>
        ) : (
          <Box overflowX="auto">
            <Table
              variant="simple"
              color="gray.500"
              mb="24px"
              mt="12px"
              minW="1200px"
            >
              <Thead bg={headerBg}>
                {table.getHeaderGroups().map((headerGroup) => (
                  <Tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <Th
                        key={header.id}
                        px={{ base: '8px', md: '16px' }}
                        py="12px"
                        borderColor={borderColor}
                        cursor="pointer"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <Flex justify="center" align="center">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {header.column.getIsSorted() ? (
                            header.column.getIsSorted() === 'asc' ? (
                              <ArrowUpIcon ml={2} />
                            ) : (
                              <ArrowDownIcon ml={2} />
                            )
                          ) : null}
                        </Flex>
                      </Th>
                    ))}
                  </Tr>
                ))}
              </Thead>

              <Tbody>
                {paginatedData.length === 0 ? (
                  <Tr>
                    <Td colSpan={columns.length} textAlign="center" py="50px">
                      <Text color="gray.500" fontSize="lg">
                        No users found
                      </Text>
                    </Td>
                  </Tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <Tr key={row.id} _hover={{ bg: hoverBg }}>
                      {row.getVisibleCells().map((cell) => (
                        <Td
                          key={cell.id}
                          px={{ base: '8px', md: '16px' }}
                          py="12px"
                          borderColor={borderColor}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </Td>
                      ))}
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Box>
        )}

        {/* PAGINATION */}
        <Flex
          justify="space-between"
          align="center"
          px={{ base: '10px', md: '25px' }}
          py="10px"
        >
          <Text fontSize="sm" color={textColor}>
            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of{' '}
            {totalItems} users
          </Text>

          <HStack spacing={1}>
            <Button
              size="sm"
              isDisabled={currentPage === 1}
              onClick={() => goToPage(currentPage - 1)}
            >
              Previous
            </Button>

            {getVisiblePageNumbers().map((page, i) => (
              <Button
                key={i}
                size="sm"
                variant={page === currentPage ? 'solid' : 'outline'}
                colorScheme="teal"
                onClick={() => goToPage(page)}
                isDisabled={page === '...'}
              >
                {page}
              </Button>
            ))}

            <Button
              size="sm"
              isDisabled={currentPage === totalPages}
              onClick={() => goToPage(currentPage + 1)}
            >
              Next
            </Button>
          </HStack>
        </Flex>
      </Card>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />
    </>
  );
}
