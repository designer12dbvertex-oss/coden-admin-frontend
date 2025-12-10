// /* eslint-disable */
// 'use client';

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
//   Select,
//   Button,
//   FormControl,
//   FormLabel,
//   FormErrorMessage,
//   useToast,
//   HStack,
//   Link,
//   Input,
//   InputGroup,
//   InputLeftElement,
//   Icon,
//   Textarea,
//   Badge,
//   Modal,
//   ModalOverlay,
//   ModalContent,
//   ModalHeader,
//   ModalBody,
//   ModalFooter,
//   ModalCloseButton,
//   useDisclosure,
//   VStack,
//   Divider,
// } from '@chakra-ui/react';
// import {
//   createColumnHelper,
//   flexRender,
//   getCoreRowModel,
//   useReactTable,
// } from '@tanstack/react-table';
// import axios from 'axios';
// import * as React from 'react';
// import { useNavigate, Link as RouterLink } from 'react-router-dom';
// import {
//   ChevronLeftIcon,
//   ChevronRightIcon,
//   SearchIcon,
//   EditIcon,
// } from '@chakra-ui/icons';

// // Custom components
// import Card from 'components/card/Card';
// import { uniq, uniqueId } from 'lodash';

// const columnHelper = createColumnHelper();

// export default function DisputesTable() {
//   const [data, setData] = React.useState([]);
//   const [filteredData, setFilteredData] = React.useState([]);
//   const [searchQuery, setSearchQuery] = React.useState('');
//   const [status, setStatusnow] = React.useState({
//   pending: 0,
//   resolve: 0,
//   rejected: 0
// });
// const [isModalOpen, setIsModalOpen] = React.useState(false);
// const [modalImages, setModalImages] = React.useState([]);


//   const [loading, setLoading] = React.useState(true);
//   const [error, setError] = React.useState(null);
//   const [currentPage, setCurrentPage] = React.useState(1);
//   const [activeFilter, setActiveFilter] = React.useState('all'); // 'all', 'direct', 'bidding', 'emergency'
//   const [currentStatus, setCurrentStatus] = React.useState(''); // Track current status in status modal
//   const [reason, setReason] = React.useState(''); // Track reason in status modal
//   const [isStatusModalOpen, setIsStatusModalOpen] = React.useState(false); // Status modal state
//   const [selectedDispute, setSelectedDispute] = React.useState(null); // Track selected dispute for status modal
//   const [isDescriptionModalOpen, setIsDescriptionModalOpen] = React.useState(false); // Description modal state
//   const [selectedDescription, setSelectedDescription] = React.useState(null); // Track selected description for modal
//   const itemsPerPage = 10;
//   const textColor = useColorModeValue('secondaryGray.900', 'white');
//   const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
//   const navigate = useNavigate();
//   const toast = useToast();

//   const baseUrl = process.env.REACT_APP_BASE_URL;
//   const token = localStorage.getItem('token');

//   // Fetch disputes
//   const fetchDisputes = async () => {
//     try {
//       if (!baseUrl || !token) {
//         throw new Error('Missing base URL or authentication token');
//       }
//       setLoading(true);
//       const response = await axios.get(
//         `${baseUrl}api/dispute/getAllAdminDisputes`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         },
//       );
//      console.log('API Response (Disputes):', response.data.pendingCount);

// setStatusnow({
//   pending: response.data.pendingCount,
//   resolve: response.data.resolvedCount,
//   rejected: response.data.rejectedCount
// });


//       if (!response.data || !Array.isArray(response.data.disputes)) {
//         throw new Error(
//           'Invalid response format: Expected an array of disputes',
//         );
//       }
       
//       const formattedData = response.data.disputes.map((item) => ({
//         id: item._id || 'N/A',
//         order_id: item.order_id || 'N/A',
//         project_id: item.order_details?.project_id || 'N/A',
//         flow_type: item.flow_type
//           ? item.flow_type
//               .toLowerCase()
//               .split(' ')
//               .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//               .join(' ')
//           : 'N/A',
//         uniqueId: item.unique_id || uniqueId('dispute_'),
//         flow_type_raw: item.flow_type || 'N/A',
//         raised_by: item.raised_by?.full_name || 'N/A',
//         raised_by_id: item.raised_by?._id || 'N/A',
//         against: item.against?.full_name || 'N/A',
//         against_id: item.against?._id || 'N/A',
//         view:item.images ||[],
//         amount: item.amount ? `₹${item.amount.toLocaleString()}` : 'N/A',
//         description: item.description || 'N/A',
//         requirement: item.requirement || 'N/A',
//         title: item.order_details?.title || 'N/A',
//         status: item.status
//           ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
//           : 'N/A',
//         createdAt: item.createdAt
//           ? `${String(new Date(item.createdAt).getDate()).padStart(
//               2,
//               '0',
//             )}/${String(new Date(item.createdAt).getMonth() + 1).padStart(
//               2,
//               '0',
//             )}/${new Date(item.createdAt).getFullYear()}`
//           : 'N/A',
//       }));
       
//       setData(formattedData);
//       setFilteredData(formattedData);
//       setLoading(false);
//     } catch (err) {
//       console.error('Fetch Disputes Error:', err);
//       if (
//         err.response?.data?.message === 'Not authorized, token failed' ||
//         err.response?.data?.message ===
//           'Session expired or logged in on another device' ||
//         err.response?.data?.message ===
//           'Un-Authorized, You are not authorized to access this route.' ||
//         err.response?.data?.message === 'Not authorized, token failed'
//       ) {
//         localStorage.removeItem('token');
//         navigate('/');
//       } else {
//         setError(err.message || 'Failed to fetch disputes');
//         setLoading(false);
//       }
//     }
//   };
// const viewPhoto = (photo) => {
//   const images = Array.isArray(photo[0]) ? photo[0] : photo;
//      console.log(images);
//   setModalImages(images);
//   setIsModalOpen(true);
// };








//   // Handle search filtering
//   const handleSearch = React.useCallback(
//     (query) => {
//       setSearchQuery(query);
//       setCurrentPage(1);
//       let filtered = data;

//       if (activeFilter !== 'all') {
//         filtered = data.filter(
//           (item) => item.flow_type_raw.toLowerCase() === activeFilter,
//         );
//       }

//       if (query) {
//         const lowerQuery = query.toLowerCase();
//         filtered = filtered.filter(
//           (item) =>
//             item.project_id.toLowerCase().includes(lowerQuery) ||
//             item.title.toLowerCase().includes(lowerQuery) ||
//             item.flow_type.toLowerCase().includes(lowerQuery) ||
//             item.raised_by.toLowerCase().includes(lowerQuery) ||
//             item.against.toLowerCase().includes(lowerQuery) ||
//             item.amount.toLowerCase().includes(lowerQuery) ||
//             item.description.toLowerCase().includes(lowerQuery) ||
//             item.requirement.toLowerCase().includes(lowerQuery) ||
//             item.status.toLowerCase().includes(lowerQuery) ||
//             item.createdAt.toLowerCase().includes(lowerQuery),
//         );
//       }

//       setFilteredData(filtered);
//     },
//     [data, activeFilter],
//   );
//  console.log(filteredData);
//   // Update dispute status with reason
//   const updateDisputeStatus = async (disputeId, status, reason) => {
//     console.log("Updating dispute:", { disputeId, status, reason });
    
//     if (!disputeId || !status) {
//       toast({
//         title: 'Error',
//         description: 'Dispute ID and status are required',
//         status: 'error',
//         duration: 3000,
//         isClosable: true,
//         position: 'top-right',
//       });
//       return;
//     }

//     // Make reason required for resolved and rejected statuses
//     if ((status === 'resolved' || status === 'rejected') && !reason?.trim()) {
//       toast({
//         title: 'Error',
//         description: 'Reason is required for Resolved or Rejected status',
//         status: 'error',
//         duration: 3000,
//         isClosable: true,
//         position: 'top-right',
//       });
//       return;
//     }

//     try {
//       if (!baseUrl || !token) {
//         throw new Error('Missing base URL or authentication token');
//       }

//       const payload = {
//         status: status,
//       };

//       // Only include reason if it's not empty
//       if (reason?.trim()) {
//         payload.reason = reason.trim();
//       }

//       const response = await axios.patch(
//         `${baseUrl}api/dispute/updateDisputeStatus/${disputeId}`,
//         payload,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         },
//       );

//       console.log('Update Dispute Status Response:', response.data);
      
//       // Update the local data
//       const updateStatus = status.charAt(0).toUpperCase() + status.slice(1);
//       setData(prevData => 
//         prevData.map(item => 
//           item.id === disputeId 
//             ? { ...item, status: updateStatus }
//             : item
//         )
//       );
//       setFilteredData(prevData => 
//         prevData.map(item => 
//           item.id === disputeId 
//             ? { ...item, status: updateStatus }
//             : item
//         )
//       );

//       toast({
//         title: 'Success',
//         description: 'Dispute status updated successfully!',
//         status: 'success',
//         duration: 3000,
//         isClosable: true,
//         position: 'top-right',
//       });

//       // Close status modal and reset states
//       setIsStatusModalOpen(false);
//       setSelectedDispute(null);
//       setCurrentStatus('');
//       setReason('');
//     } catch (err) {
//       console.error('Update Dispute Status Error:', err);
//       toast({
//         title: 'Error',
//         description:
//           err.response?.data?.message || 'Failed to update dispute status',
//         status: 'error',
//         duration: 3000,
//         isClosable: true,
//         position: 'top-right',
//       });
//       setError(
//         err.response?.data?.message || 'Failed to update dispute status',
//       );
//     }
//   };

//   // Handle status change - opens status modal directly
//   const handleEditStatus = (dispute) => {
//     setSelectedDispute(dispute);
//     setCurrentStatus(dispute.status?.toLowerCase() || 'pending');
//     setReason('');
//     setIsStatusModalOpen(true);
//   };

//   // Handle status modal close
//   const handleStatusModalClose = () => {
//     setIsStatusModalOpen(false);
//     setSelectedDispute(null);
//     setCurrentStatus('');
//     setReason('');
//   };

//   // Handle description modal open
//   const handleReadMore = (description, dispute) => {
//     setSelectedDescription({
//       description,
//       disputeId: dispute.uniqueId,
//       projectId: dispute.project_id,
//       raisedBy: dispute.raised_by,
//       against: dispute.against,
//       status: dispute.status
//     });
//     setIsDescriptionModalOpen(true);
//   };

//   // Handle description modal close
//   const handleDescriptionModalClose = () => {
//     setIsDescriptionModalOpen(false);
//     setSelectedDescription(null);
//   };

//   // Truncate text
//   const truncateText = (text, maxLength = 50) => {
//     if (text && text.length > maxLength) {
//       return text.substring(0, maxLength) + '...';
//     }
//     return text;
//   };

//   // Handle filter button click
//   const handleFilterClick = (filter) => {
//     setActiveFilter(filter);
//     setCurrentPage(1);
//     setSearchQuery('');
//     if (filter === 'all') {
//       setFilteredData(data);
//     } else {
//       setFilteredData(
//         data.filter((item) => item.flow_type_raw.toLowerCase() === filter),
//       );
//     }
//   };

//   // Pagination logic
//   const totalItems = filteredData.length;
//   const totalPages = Math.ceil(totalItems / itemsPerPage);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const endIndex = startIndex + itemsPerPage;
//   const paginatedData = React.useMemo(
//     () => filteredData.slice(startIndex, endIndex),
//     [filteredData, startIndex, endIndex],
//   );

//   // Handle page navigation
//   const goToPage = (page) => {
//     const newPage = Math.min(Math.max(1, page), totalPages);
//     if (newPage !== currentPage) {
//       setCurrentPage(newPage);
//     }
//   };

//   // Reset page to 1 when total pages change
//   React.useEffect(() => {
//     if (totalPages > 0 && currentPage > totalPages) {
//       setCurrentPage(1);
//     }
//   }, [totalPages, currentPage]);

//   React.useEffect(() => {
//     fetchDisputes();
//   }, [navigate]);

//   // Status badge component
//   const getStatusBadge = (status) => {
//     switch (status?.toLowerCase()) {
//       case 'pending':
//         return <Badge colorScheme="yellow" variant="solid">Pending</Badge>;
//       case 'resolved':
//         return <Badge colorScheme="green" variant="solid">Resolved</Badge>;
//       case 'rejected':
//         return <Badge colorScheme="red" variant="solid">Rejected</Badge>;
//       default:
//         return <Badge colorScheme="gray" variant="solid">{status}</Badge>;
//     }
//   };

//   const columns = React.useMemo(
//     () => [
//       columnHelper.display({
//         id: 'sno',
//         header: () => (
//           <Text
//             justifyContent="space-between"
//             align="center"
//             fontSize={{ sm: '10px', lg: '12px' }}
//             color="gray.400"
//           >
//             S.No
//           </Text>
//         ),
//         cell: ({ row }) => {
//           const serialNumber = row.index + 1;
//           return (
//             <Flex align="center">
//               <Text color={textColor} fontSize="sm" fontWeight="700">
//                 {isNaN(serialNumber) ? 'N/A' : serialNumber}
//               </Text>
//             </Flex>
//           );
//         },
//       }),
//       columnHelper.accessor('uniqueId', {
//         id: 'uniqueId',
//         header: () => (
//           <Text
//             justifyContent="space-between"
//             align="center"
//             fontSize={{ sm: '10px', lg: '12px' }}
//             color="gray.400"
//             textTransform="uppercase"
//           >
//             UNIQUE ID
//           </Text>
//         ),
//         cell: (info) => (
//           <Flex align="center">
//             <Text color={textColor} fontSize="sm" fontWeight="400">
//               {info.getValue()}
//             </Text>
//           </Flex>
//         ),
//       }),
//       columnHelper.accessor('project_id', {
//         id: 'project_id',
//         header: () => (
//           <Text
//             justifyContent="space-between"
//             align="center"
//             fontSize={{ sm: '10px', lg: '12px' }}
//             color="gray.400"
//             textTransform="uppercase"
//           >
//             Project ID
//           </Text>
//         ),
//         cell: (info) => {
//           const flowType = info.row.original.flow_type_raw.toLowerCase();
//           const orderId = info.row.original.order_id;
//           let linkTo = '';
//           if (orderId !== 'N/A') {
//             if (flowType === 'direct') {
//               linkTo = `/admin/viewOrder/${orderId}`;
//             } else if (flowType === 'bidding') {
//               linkTo = `/admin/biddingOrder/${orderId}`;
//             } else if (flowType === 'emergency') {
//               linkTo = `/admin/emergencyOrder/${orderId}`;
//             }
//           }
//           return (
//             <Flex align="center">
//               {linkTo ? (
//                 <Link
//                   as={RouterLink}
//                   to={linkTo}
//                   color="blue.500"
//                   fontSize="sm"
//                   fontWeight="700"
//                   _hover={{ textDecoration: 'underline' }}
//                 >
//                   {info.getValue()}
//                 </Link>
//               ) : (
//                 <Text color={textColor} fontSize="sm" fontWeight="400">
//                   {info.getValue()}
//                 </Text>
//               )}
//             </Flex>
//           );
//         },
//       }),
//       columnHelper.accessor('title', {
//         id: 'title',
//         header: () => (
//           <Text
//             justifyContent="space-between"
//             align="center"
//             fontSize={{ sm: '10px', lg: '12px' }}
//             color="gray.400"
//             textTransform="uppercase"
//           >
//             Title
//           </Text>
//         ),
//         cell: (info) => (
//           <Flex align="center">
//             <Text color={textColor} fontSize="sm" fontWeight="400">
//               {info.getValue()}
//             </Text>
//           </Flex>
//         ),
//       }),
//      columnHelper.accessor('view', {
//   id: 'view',
//   header: () => (
//     <Text
//       justifyContent="space-between"
//       align="center"
//       fontSize={{ sm: '10px', lg: '12px' }}
//       color="gray.400"
//       textTransform="uppercase"
//     >
//       images
//     </Text>
//   ),
//   cell: (info) => (
//     <Flex align="center">
//       <Button
//         size="sm"
//         colorScheme="teal"
//         variant="outline"
//         onClick={() => viewPhoto([info.getValue()])}
//       >
//         View images
//       </Button>
//     </Flex>
//   ),
// }),

//       columnHelper.accessor('flow_type', {
//         id: 'flow_type',
//         header: () => (
//           <Text
//             justifyContent="space-between"
//             align="center"
//             fontSize={{ sm: '10px', lg: '12px' }}
//             color="gray.400"
//             textTransform="uppercase"
//           >
//             Order Type
//           </Text>
//         ),
//         cell: (info) => (
//           <Flex align="center">
//             <Text color={textColor} fontSize="sm" fontWeight="400">
//               {info.getValue()}
//             </Text>
//           </Flex>
//         ),
//       }),
//       columnHelper.accessor('raised_by', {
//         id: 'raised_by',
//         header: () => (
//           <Text
//             justifyContent="space-between"
//             align="center"
//             fontSize={{ sm: '10px', lg: '12px' }}
//             color="gray.400"
//             textTransform="uppercase"
//           >
//             Raised By
//           </Text>
//         ),
//         cell: (info) => (
//           <Flex align="center">
//             {info.row.original.raised_by_id !== 'N/A' ? (
//               <Link
//                 as={RouterLink}
//                 to={`/admin/Dispute/UserDetails/${info.row.original.raised_by_id}`}
//                 color="blue.500"
//                 fontSize="sm"
//                 fontWeight="700"
//                 _hover={{ textDecoration: 'underline' }}
//               >
//                 {info.getValue()}
//               </Link>
//             ) : (
//               <Text color={textColor} fontSize="sm" fontWeight="400">
//                 {info.getValue()}
//               </Text>
//             )}
//           </Flex>
//         ),
//       }),
//       columnHelper.accessor('against', {
//         id: 'against',
//         header: () => (
//           <Text
//             justifyContent="space-between"
//             align="center"
//             fontSize={{ sm: '10px', lg: '12px' }}
//             color="gray.400"
//             textTransform="uppercase"
//           >
//             Against
//           </Text>
//         ),
//         cell: (info) => (
//           <Flex align="center">
//             {info.row.original.against_id !== 'N/A' ? (
//               <Link
//                 as={RouterLink}
//                 to={`/admin/Dispute/UserDetails/${info.row.original.against_id}`}
//                 color="blue.500"
//                 fontSize="sm"
//                 fontWeight="700"
//                 _hover={{ textDecoration: 'underline' }}
//               >
//                 {info.getValue()}
//               </Link>
//             ) : (
//               <Text color={textColor} fontSize="sm" fontWeight="400">
//                 {info.getValue()}
//               </Text>
//             )}
//           </Flex>
//         ),
//       }),
//       columnHelper.accessor('amount', {
//         id: 'amount',
//         header: () => (
//           <Text
//             justifyContent="space-between"
//             align="center"
//             fontSize={{ sm: '10px', lg: '12px' }}
//             color="gray.400"
//             textTransform="uppercase"
//           >
//             Amount
//           </Text>
//         ),
//         cell: (info) => (
//           <Flex align="center">
//             <Text color={textColor} fontSize="sm" fontWeight="400">
//               {info.getValue()}
//             </Text>
//           </Flex>
//         ),
//       }),
//       columnHelper.accessor('description', {
//         id: 'description',
//         header: () => (
//           <Text
//             justifyContent="space-between"
//             align="center"
//             fontSize={{ sm: '10px', lg: '12px' }}
//             color="gray.400"
//             textTransform="uppercase"
//           >
//             Description
//           </Text>
//         ),
//         cell: (info) => {
//           const description = info.getValue();
//           const dispute = info.row.original;
          
//           return (
//             <Flex align="center" direction="column" gap="1">
//               <Text 
//                 color={textColor} 
//                 fontSize="sm" 
//                 fontWeight="400"
//                 textAlign="left"
//                 noOfLines={2}
//                 maxW="200px"
//               >
//                 {truncateText(description, 50)}
//               </Text>
//               {description && description.length > 50 && (
//                 <Button
//                   size="xs"
//                   variant="link"
//                   color="blue.500"
//                   fontSize="xs"
//                   fontWeight="500"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     handleReadMore(description, dispute);
//                   }}
//                   _hover={{ textDecoration: 'underline' }}
//                 >
//                   Read More
//                 </Button>
//               )}
//             </Flex>
//           );
//         },
//       }),
//       columnHelper.accessor('requirement', {
//         id: 'requirement',
//         header: () => (
//           <Text
//             justifyContent="space-between"
//             align="center"
//             fontSize={{ sm: '10px', lg: '12px' }}
//             color="gray.400"
//             textTransform="uppercase"
//           >
//             Requirement
//           </Text>
//         ),
//         cell: (info) => (
//           <Flex align="center">
//             <Text color={textColor} fontSize="sm" fontWeight="400">
//               {info.getValue()}
//             </Text>
//           </Flex>
//         ),
//       }),
//       columnHelper.accessor('status', {
//         id: 'status',
//         header: () => (
//           <Text
//             justifyContent="space-between"
//             align="center"
//             fontSize={{ sm: '10px', lg: '12px' }}
//             color="gray.400"
//             textTransform="uppercase"
//           >
//             Status
//           </Text>
//         ),
//         cell: (info) => (
//           <Flex align="center">
//             {getStatusBadge(info.getValue())}
//           </Flex>
//         ),
//       }),
//       columnHelper.accessor('createdAt', {
//         id: 'createdAt',
//         header: () => (
//           <Text
//             justifyContent="space-between"
//             align="center"
//             fontSize={{ sm: '10px', lg: '12px' }}
//             color="gray.400"
//             textTransform="uppercase"
//           >
//             Created At
//           </Text>
//         ),
//         cell: (info) => (
//           <Flex align="center">
//             <Text color={textColor} fontSize="sm" fontWeight="400">
//               {info.getValue()}
//             </Text>
//           </Flex>
//         ),
//       }),
//       columnHelper.display({
//         id: 'actions',
//         header: () => (
//           <Text
//             justifyContent="space-between"
//             align="center"
//             fontSize={{ sm: '10px', lg: '12px' }}
//             color="gray.400"
//             textTransform="uppercase"
//           >
//             Actions
//           </Text>
//         ),
//         cell: (info) => {
//           const row = info.row.original;
//           return (
//             <Flex align="center" gap="2">
//               <Button
//                 size="sm"
//                 colorScheme="teal"
//                 leftIcon={<EditIcon />}
//                 onClick={() => handleEditStatus(row)}
//               >
//                 Edit Status
//               </Button>
//             </Flex>
//           );
//         },
//       }),
//     ],
//     [textColor],
//   );

//   const table = useReactTable({
//     data: paginatedData,
//     columns,
//     getCoreRowModel: getCoreRowModel(),
//   });

//   if (loading) {
//     return (
//       <Card
//         flexDirection="column"
//         w="100%"
//         px="25px"
//         py="25px"
//         overflowX={{ sm: 'scroll', lg: 'hidden' }}
//         borderRadius="20px"
//         boxShadow="lg"
//       >
//         <Text color={textColor} fontSize="22px" fontWeight="700" p="25px">
//           Loading...
//         </Text>
//       </Card>
//     );
//   }

//   if (error) {
//     return (
//       <Card
//         flexDirection="column"
//         w="100%"
//         px="25px"
//         py="25px"
//         overflowX={{ sm: 'scroll', lg: 'hidden' }}
//         borderRadius="20px"
//         boxShadow="lg"
//         style={{ marginTop: '80px' }}
//       >
//         <Text color={textColor} fontSize="22px" fontWeight="700" p="25px">
//           Error: {error}
//         </Text>
//       </Card>
//     );
//   }

//   return (
//     <>
//       <Card
//         flexDirection="column"
//         w="100%"
//         px="25px"
//         py="25px"
//         overflowX={{ sm: 'scroll', lg: 'hidden' }}
//         borderRadius="20px"
//         boxShadow="lg"
//         style={{ marginTop: '80px' }}
//       >
//         <Flex
//   px="0px"
//   mb="20px"
//   justifyContent="space-between"
//   align="center"
//   direction={{ base: 'column', md: 'row' }}
//   gap={{ base: '10px', md: '0' }}
// >
//   <Flex direction="column" gap="5px">
//     <Text
//       color={textColor}
//       fontSize={{ base: 'xl', md: '22px' }}
//       fontWeight="700"
//       lineHeight="100%"
//     >
//       Disputes
//     </Text>

//     {/* ⭐ STATUS COUNTS BOX */}
//     <Flex gap="10px">
//   <Flex
//     bg="yellow.100"
//     px="10px"
//     py="4px"
//     borderRadius="8px"
//     fontSize="14px"
//     fontWeight="600"
//     color="yellow.700"
//   >
//     Pending: {status.pending}
//   </Flex>

//   <Flex
//     bg="green.100"
//     px="10px"
//     py="4px"
//     borderRadius="8px"
//     fontSize="14px"
//     fontWeight="600"
//     color="green.700"
//   >
//     Resolved: {status.resolve}
//   </Flex>

//   <Flex
//     bg="red.100"
//     px="10px"
//     py="4px"
//     borderRadius="8px"
//     fontSize="14px"
//     fontWeight="600"
//     color="red.700"
//   >
//     Rejected: {status.rejected}
//   </Flex>
// </Flex>

//   </Flex>

//   {/* RIGHT SIDE — SEARCH + FILTER */}
//   <Flex
//     align="center"
//     gap={{ base: '10px', md: '20px' }}
//     direction={{ base: 'column', md: 'row' }}
//   >
//     <InputGroup maxW={{ base: '100%', md: '300px' }}>
//       <InputLeftElement pointerEvents="none">
//         <Icon as={SearchIcon} color="gray.400" />
//       </InputLeftElement>
//       <Input
//         placeholder="Search by ID, title, type, names, or status"
//         value={searchQuery}
//         onChange={(e) => handleSearch(e.target.value)}
//         borderRadius="12px"
//         bg={useColorModeValue('gray.100', 'gray.700')}
//         _focus={{
//           borderColor: 'blue.500',
//           boxShadow: '0 0 0 1px blue.500',
//         }}
//       />
//     </InputGroup>

//     <HStack spacing="2">
//       <Button
//         size="sm"
//         colorScheme={activeFilter === 'all' ? 'teal' : 'gray'}
//         onClick={() => handleFilterClick('all')}
//       >
//         All
//       </Button>
//       <Button
//         size="sm"
//         colorScheme={activeFilter === 'direct' ? 'teal' : 'gray'}
//         onClick={() => handleFilterClick('direct')}
//       >
//         Direct
//       </Button>
//       <Button
//         size="sm"
//         colorScheme={activeFilter === 'bidding' ? 'teal' : 'gray'}
//         onClick={() => handleFilterClick('bidding')}
//       >
//         Bidding
//       </Button>
//       <Button
//         size="sm"
//         colorScheme={activeFilter === 'emergency' ? 'teal' : 'gray'}
//         onClick={() => handleFilterClick('emergency')}
//       >
//         Emergency
//       </Button>
//     </HStack>
//   </Flex>
// </Flex>


//         <Box overflowX="auto">
//           <Table variant="simple" color="gray.500" mb="24px" mt="12px">
//             <Thead>
//               {table.getHeaderGroups().map((headerGroup) => (
//                 <Tr key={headerGroup.id}>
//                   {headerGroup.headers.map((header) => (
//                     <Th
//                       key={header.id}
//                       colSpan={header.colSpan}
//                       pe="10px"
//                       borderColor={borderColor}
//                       py="12px"
//                     >
//                       <Flex
//                         justifyContent="space-between"
//                         align="center"
//                         fontSize={{ sm: '10px', lg: '12px' }}
//                         color="gray.400"
//                       >
//                         {flexRender(
//                           header.column.columnDef.header,
//                           header.getContext(),
//                         )}
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
//                   _hover={{ bg: 'gray.25' }}
//                 >
//                   {row.getVisibleCells().map((cell) => (
//                     <Td
//                       key={cell.id}
//                       fontSize={{ sm: '14px' }}
//                       minW={{ sm: '150px', md: '200px', lg: 'auto' }}
//                       borderColor="transparent"
//                       py="12px"
//                     >
//                       {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
//           px="25px"
//           py="10px"
//         >
//           <Text fontSize="sm" color={textColor}>
//             Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of{' '}
//             {totalItems} disputes
//           </Text>
//           <HStack>
//             <Button
//               size="sm"
//               onClick={() => goToPage(currentPage - 1)}
//               colorScheme="teal"
//               isDisabled={currentPage === 1}
//               leftIcon={<ChevronLeftIcon />}
//             >
//               Previous
//             </Button>
//             {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
//               <Button
//                 key={page}
//                 size="sm"
//                 colorScheme="teal"
//                 onClick={() => goToPage(page)}
//                 variant={currentPage === page ? 'solid' : 'outline'}
//               >
//                 {page}
//               </Button>
//             ))}
//             <Button
//               size="sm"
//               onClick={() => goToPage(currentPage + 1)}
//               colorScheme="teal"
//               isDisabled={currentPage === totalPages}
//               rightIcon={<ChevronRightIcon />}
//             >
//               Next
//             </Button>
//           </HStack>
//         </Flex>
//       </Card>

//       {/* Status Update Modal */}
//       <Modal isOpen={isStatusModalOpen} onClose={handleStatusModalClose} size="lg">
//         <ModalOverlay />
//         <ModalContent>
//           <ModalHeader>Update Dispute Status</ModalHeader>
//           <ModalCloseButton />
//           <ModalBody>
//             {selectedDispute && (
//               <VStack spacing={4} align="stretch">
//                 <Box>
//                   <Text fontSize="sm" mb="1" fontWeight="semibold">
//                     Dispute ID: {selectedDispute.uniqueId}
//                   </Text>
//                   <Text fontSize="sm" mb="1">
//                     <strong>Project:</strong> {selectedDispute.project_id}
//                   </Text>
//                   <Text fontSize="sm" mb="1">
//                     <strong>Current Status:</strong>{' '}
//                     {getStatusBadge(selectedDispute.status)}
//                   </Text>
//                 </Box>
                
//                 <Divider />
                
//                 <FormControl>
//                   <FormLabel fontSize="sm">New Status</FormLabel>
//                   <Select
//                     value={currentStatus}
//                     onChange={(e) => setCurrentStatus(e.target.value)}
//                     placeholder="Select new status"
//                   >
//                     <option value="pending">Pending</option>
//                     <option value="resolved">Resolved</option>
//                     <option value="rejected">Rejected</option>
//                   </Select>
//                 </FormControl>

//                 {(currentStatus === 'resolved' || currentStatus === 'rejected') && (
//                   <>
//                     <Divider />
//                     <FormControl 
//                       isRequired
//                       isInvalid={!reason.trim()}
//                     >
//                       <FormLabel fontSize="sm">
//                         Reason <span style={{ color: 'red' }}>*</span>
//                       </FormLabel>
//                       <Textarea
//                         placeholder="Enter detailed reason for status change (required)..."
//                         rows={4}
//                         borderRadius="md"
//                         value={reason}
//                         onChange={(e) => setReason(e.target.value)}
//                       />
//                       {!reason.trim() && (
//                         <FormErrorMessage fontSize="xs">
//                           Reason is required for Resolved or Rejected status
//                         </FormErrorMessage>
//                       )}
//                     </FormControl>
//                   </>
//                 )}

//                 {currentStatus === 'pending' && (
//                   <Text fontSize="sm" color="gray.500" textAlign="center">
//                     No reason required for Pending status
//                   </Text>
//                 )}
//               </VStack>
//             )}
//           </ModalBody>
//           <ModalFooter>
//             <Button
//               variant="ghost"
//               mr={3}
//               onClick={handleStatusModalClose}
//             >
//               Cancel
//             </Button>
//             <Button
//               colorScheme="teal"
//               onClick={() => {
//                 if (selectedDispute && currentStatus) {
//                   updateDisputeStatus(selectedDispute.id, currentStatus, reason);
//                 }
//               }}
//               isDisabled={!currentStatus || 
//                 ((currentStatus === 'resolved' || currentStatus === 'rejected') && 
//                  !reason.trim())
//               }
//             >
//               Update Status
//             </Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>

//       {/* Description Modal */}
//       <Modal isOpen={isDescriptionModalOpen} onClose={handleDescriptionModalClose} size="xl">
//         <ModalOverlay />
//         <ModalContent>
//           <ModalHeader>Dispute Description</ModalHeader>
//           <ModalCloseButton />
//           <ModalBody>
//             {selectedDescription && (
//               <VStack spacing={4} align="stretch">
//                 <Box p={4} bg="gray.50" borderRadius="md">
//                   <Text fontSize="sm" mb="1" fontWeight="semibold">
//                     Dispute ID: {selectedDescription.disputeId}
//                   </Text>
//                   <Text fontSize="sm" mb="1">
//                     <strong>Project:</strong> {selectedDescription.projectId}
//                   </Text>
//                   <Text fontSize="sm" mb="1">
//                     <strong>Raised By:</strong> {selectedDescription.raisedBy}
//                   </Text>
//                   <Text fontSize="sm" mb="1">
//                     <strong>Against:</strong> {selectedDescription.against}
//                   </Text>
//                   <Text fontSize="sm" mb="1">
//                     <strong>Status:</strong>{' '}
//                     {getStatusBadge(selectedDescription.status)}
//                   </Text>
//                 </Box>
                
//                 <Divider />
                
//                 <Box>
//                   <Text fontSize="md" fontWeight="semibold" mb="2">
//                     Full Description
//                   </Text>
//                   <Box
//                     p={4}
//                     bg="gray.50"
//                     borderRadius="md"
//                     border="1px"
//                     borderColor="gray.200"
//                     maxH="400px"
//                     overflowY="auto"
//                   >
//                     <Text 
//                       fontSize="sm" 
//                       lineHeight="tall"
//                       whiteSpace="pre-wrap"
//                       color={textColor}
//                     >
//                       {selectedDescription.description}
//                     </Text>
//                   </Box>
//                 </Box>
//               </VStack>
//             )}
//           </ModalBody>
//           <ModalFooter>
//             <Button
//               colorScheme="teal"
//               onClick={handleDescriptionModalClose}
//             >
//               Close
//             </Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>
   
// <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="xl">
//   <ModalOverlay />
//   <ModalContent>
//     <ModalHeader>View Photos</ModalHeader>
//     <ModalCloseButton />

//     <ModalBody>
//       <VStack spacing={4} align="stretch">
//        {modalImages.map((img, index) => (
//   <img
//     key={index}
//     src={baseUrl + img}
//     width="100%"
//     borderRadius="md"
//   />
// ))}

//       </VStack>
//     </ModalBody>

//     <ModalFooter>
//       <Button colorScheme="teal" onClick={() => setIsModalOpen(false)}>
//         Close
//       </Button>
//     </ModalFooter>
//   </ModalContent>
// </Modal>



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
  Select,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useToast,
  HStack,
  Link,
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
  Textarea,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  VStack,
  Divider,
} from '@chakra-ui/react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import axios from 'axios';
import * as React from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
  EditIcon,
  DownloadIcon, // <-- Added DownloadIcon here
} from '@chakra-ui/icons';

// Custom components
import Card from 'components/card/Card';
import { uniq, uniqueId } from 'lodash';

const columnHelper = createColumnHelper();

export default function DisputesTable() {
  const [data, setData] = React.useState([]);
  const [filteredData, setFilteredData] = React.useState([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [status, setStatusnow] = React.useState({
    pending: 0,
    resolve: 0,
    rejected: 0
  });
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalImages, setModalImages] = React.useState([]);


  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [activeFilter, setActiveFilter] = React.useState('all'); // 'all', 'direct', 'bidding', 'emergency'
  const [currentStatus, setCurrentStatus] = React.useState(''); // Track current status in status modal
  const [reason, setReason] = React.useState(''); // Track reason in status modal
  const [isStatusModalOpen, setIsStatusModalOpen] = React.useState(false); // Status modal state
  const [selectedDispute, setSelectedDispute] = React.useState(null); // Track selected dispute for status modal
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = React.useState(false); // Description modal state
  const [selectedDescription, setSelectedDescription] = React.useState(null); // Track selected description for modal
  const itemsPerPage = 10;
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const navigate = useNavigate();
  const toast = useToast();

  const baseUrl = process.env.REACT_APP_BASE_URL;
  const token = localStorage.getItem('token');

  // Fetch disputes
  const fetchDisputes = async () => {
    try {
      if (!baseUrl || !token) {
        throw new Error('Missing base URL or authentication token');
      }
      setLoading(true);
      const response = await axios.get(
        `${baseUrl}api/dispute/getAllAdminDisputes`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      console.log('API Response (Disputes):', response.data.pendingCount);

      setStatusnow({
        pending: response.data.pendingCount,
        resolve: response.data.resolvedCount,
        rejected: response.data.rejectedCount
      });


      if (!response.data || !Array.isArray(response.data.disputes)) {
        throw new Error(
          'Invalid response format: Expected an array of disputes',
        );
      }

      const formattedData = response.data.disputes.map((item) => ({
        id: item._id || 'N/A',
        order_id: item.order_id || 'N/A',
        project_id: item.order_details?.project_id || 'N/A',
        flow_type: item.flow_type
          ? item.flow_type
            .toLowerCase()
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
          : 'N/A',
        uniqueId: item.unique_id || uniqueId('dispute_'),
        flow_type_raw: item.flow_type || 'N/A',
        raised_by: item.raised_by?.full_name || 'N/A',
        raised_by_id: item.raised_by?._id || 'N/A',
        against: item.against?.full_name || 'N/A',
        against_id: item.against?._id || 'N/A',
        view: item.images || [],
        amount: item.amount ? `₹${item.amount.toLocaleString()}` : 'N/A',
        description: item.description || 'N/A',
        requirement: item.requirement || 'N/A',
        title: item.order_details?.title || 'N/A',
        status: item.status
          ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
          : 'N/A',
        createdAt: item.createdAt
          ? `${String(new Date(item.createdAt).getDate()).padStart(
            2,
            '0',
          )}/${String(new Date(item.createdAt).getMonth() + 1).padStart(
            2,
            '0',
          )}/${new Date(item.createdAt).getFullYear()}`
          : 'N/A',
      }));

      setData(formattedData);
      setFilteredData(formattedData);
      setLoading(false);
    } catch (err) {
      console.error('Fetch Disputes Error:', err);
      if (
        err.response?.data?.message === 'Not authorized, token failed' ||
        err.response?.data?.message ===
        'Session expired or logged in on another device' ||
        err.response?.data?.message ===
        'Un-Authorized, You are not authorized to access this route.' ||
        err.response?.data?.message === 'Not authorized, token failed'
      ) {
        localStorage.removeItem('token');
        navigate('/');
      } else {
        setError(err.message || 'Failed to fetch disputes');
        setLoading(false);
      }
    }
  };
  const viewPhoto = (photo) => {
    const images = Array.isArray(photo[0]) ? photo[0] : photo;
    console.log(images);
    setModalImages(images);
    setIsModalOpen(true);
  };

  // Handle search filtering
  const handleSearch = React.useCallback(
    (query) => {
      setSearchQuery(query);
      setCurrentPage(1);
      let filtered = data;

      if (activeFilter !== 'all') {
        filtered = data.filter(
          (item) => item.flow_type_raw.toLowerCase() === activeFilter,
        );
      }

      if (query) {
        const lowerQuery = query.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.project_id.toLowerCase().includes(lowerQuery) ||
            item.title.toLowerCase().includes(lowerQuery) ||
            item.flow_type.toLowerCase().includes(lowerQuery) ||
            item.raised_by.toLowerCase().includes(lowerQuery) ||
            item.against.toLowerCase().includes(lowerQuery) ||
            item.amount.toLowerCase().includes(lowerQuery) ||
            item.description.toLowerCase().includes(lowerQuery) ||
            item.requirement.toLowerCase().includes(lowerQuery) ||
            item.status.toLowerCase().includes(lowerQuery) ||
            item.createdAt.toLowerCase().includes(lowerQuery),
        );
      }

      setFilteredData(filtered);
    },
    [data, activeFilter],
  );
  console.log(filteredData);
  // Update dispute status with reason
  const updateDisputeStatus = async (disputeId, status, reason) => {
    console.log("Updating dispute:", { disputeId, status, reason });

    if (!disputeId || !status) {
      toast({
        title: 'Error',
        description: 'Dispute ID and status are required',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }

    // Make reason required for resolved and rejected statuses
    if ((status === 'resolved' || status === 'rejected') && !reason?.trim()) {
      toast({
        title: 'Error',
        description: 'Reason is required for Resolved or Rejected status',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }

    try {
      if (!baseUrl || !token) {
        throw new Error('Missing base URL or authentication token');
      }

      const payload = {
        status: status,
      };

      // Only include reason if it's not empty
      if (reason?.trim()) {
        payload.reason = reason.trim();
      }

      const response = await axios.patch(
        `${baseUrl}api/dispute/updateDisputeStatus/${disputeId}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      console.log('Update Dispute Status Response:', response.data);

      // Update the local data
      const updateStatus = status.charAt(0).toUpperCase() + status.slice(1);
      setData(prevData =>
        prevData.map(item =>
          item.id === disputeId
            ? { ...item, status: updateStatus }
            : item
        )
      );
      setFilteredData(prevData =>
        prevData.map(item =>
          item.id === disputeId
            ? { ...item, status: updateStatus }
            : item
        )
      );

      toast({
        title: 'Success',
        description: 'Dispute status updated successfully!',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });

      // Close status modal and reset states
      setIsStatusModalOpen(false);
      setSelectedDispute(null);
      setCurrentStatus('');
      setReason('');
    } catch (err) {
      console.error('Update Dispute Status Error:', err);
      toast({
        title: 'Error',
        description:
          err.response?.data?.message || 'Failed to update dispute status',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      setError(
        err.response?.data?.message || 'Failed to update dispute status',
      );
    }
  };

  // Handle status change - opens status modal directly
  const handleEditStatus = (dispute) => {
    setSelectedDispute(dispute);
    setCurrentStatus(dispute.status?.toLowerCase() || 'pending');
    setReason('');
    setIsStatusModalOpen(true);
  };

  // Handle status modal close
  const handleStatusModalClose = () => {
    setIsStatusModalOpen(false);
    setSelectedDispute(null);
    setCurrentStatus('');
    setReason('');
  };

  // Handle description modal open
  const handleReadMore = (description, dispute) => {
    setSelectedDescription({
      description,
      disputeId: dispute.uniqueId,
      projectId: dispute.project_id,
      raisedBy: dispute.raised_by,
      against: dispute.against,
      status: dispute.status
    });
    setIsDescriptionModalOpen(true);
  };

  // Handle description modal close
  const handleDescriptionModalClose = () => {
    setIsDescriptionModalOpen(false);
    setSelectedDescription(null);
  };

  // Truncate text
  const truncateText = (text, maxLength = 50) => {
    if (text && text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };

  // Handle filter button click
  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1);
    setSearchQuery('');
    if (filter === 'all') {
      setFilteredData(data);
    } else {
      setFilteredData(
        data.filter((item) => item.flow_type_raw.toLowerCase() === filter),
      );
    }
  };

  // --- EXPORT CSV FUNCTIONALITY ---
  const handleExport = () => {
    if (!filteredData || filteredData.length === 0) {
      toast({
        title: 'No Data',
        description: 'There is no data to export.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }

    // 1. Define CSV Headers
    const headers = [
      "S.No",
      "Unique ID",
      "Project ID",
      "Title",
      "Order Type",
      "Raised By",
      "Against",
      "Amount",
      "Description",
      "Requirement",
      "Status",
      "Created At"
    ];

    // 2. Map Data to CSV Rows
    const csvRows = filteredData.map((item, index) => {
      // Helper function to escape double quotes and wrap field in quotes
      // This handles commas and newlines inside the data
      const escape = (text) => {
        if (!text) return '""';
        const stringText = String(text);
        // Replace " with "" and wrap in "
        return `"${stringText.replace(/"/g, '""')}"`;
      };

      return [
        index + 1,
        escape(item.uniqueId),
        escape(item.project_id),
        escape(item.title),
        escape(item.flow_type),
        escape(item.raised_by),
        escape(item.against),
        escape(item.amount),
        escape(item.description),
        escape(item.requirement),
        escape(item.status),
        escape(item.createdAt) // Date is already formatted in fetchDisputes
      ].join(",");
    });

    // 3. Combine Headers and Rows
    const csvString = [headers.join(","), ...csvRows].join("\n");

    // 4. Trigger Download
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `disputes_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  // ---------------------------------

  // Pagination logic
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = React.useMemo(
    () => filteredData.slice(startIndex, endIndex),
    [filteredData, startIndex, endIndex],
  );

  // Handle page navigation
  const goToPage = (page) => {
    const newPage = Math.min(Math.max(1, page), totalPages);
    if (newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  };

  // Reset page to 1 when total pages change
  React.useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  React.useEffect(() => {
    fetchDisputes();
  }, [navigate]);

  // Status badge component
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Badge colorScheme="yellow" variant="solid">Pending</Badge>;
      case 'resolved':
        return <Badge colorScheme="green" variant="solid">Resolved</Badge>;
      case 'rejected':
        return <Badge colorScheme="red" variant="solid">Rejected</Badge>;
      default:
        return <Badge colorScheme="gray" variant="solid">{status}</Badge>;
    }
  };

  const columns = React.useMemo(
    () => [
      columnHelper.display({
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
        cell: ({ row }) => {
          const serialNumber = row.index + 1;
          return (
            <Flex align="center">
              <Text color={textColor} fontSize="sm" fontWeight="700">
                {isNaN(serialNumber) ? 'N/A' : serialNumber}
              </Text>
            </Flex>
          );
        },
      }),
      columnHelper.accessor('uniqueId', {
        id: 'uniqueId',
        header: () => (
          <Text
            justifyContent="space-between"
            align="center"
            fontSize={{ sm: '10px', lg: '12px' }}
            color="gray.400"
            textTransform="uppercase"
          >
            UNIQUE ID
          </Text>
        ),
        cell: (info) => (
          <Flex align="center">
            <Text color={textColor} fontSize="sm" fontWeight="400">
              {info.getValue()}
            </Text>
          </Flex>
        ),
      }),
      columnHelper.accessor('project_id', {
        id: 'project_id',
        header: () => (
          <Text
            justifyContent="space-between"
            align="center"
            fontSize={{ sm: '10px', lg: '12px' }}
            color="gray.400"
            textTransform="uppercase"
          >
            Project ID
          </Text>
        ),
        cell: (info) => {
          const flowType = info.row.original.flow_type_raw.toLowerCase();
          const orderId = info.row.original.order_id;
          let linkTo = '';
          if (orderId !== 'N/A') {
            if (flowType === 'direct') {
              linkTo = `/admin/viewOrder/${orderId}`;
            } else if (flowType === 'bidding') {
              linkTo = `/admin/biddingOrder/${orderId}`;
            } else if (flowType === 'emergency') {
              linkTo = `/admin/emergencyOrder/${orderId}`;
            }
          }
          return (
            <Flex align="center">
              {linkTo ? (
                <Link
                  as={RouterLink}
                  to={linkTo}
                  color="blue.500"
                  fontSize="sm"
                  fontWeight="700"
                  _hover={{ textDecoration: 'underline' }}
                >
                  {info.getValue()}
                </Link>
              ) : (
                <Text color={textColor} fontSize="sm" fontWeight="400">
                  {info.getValue()}
                </Text>
              )}
            </Flex>
          );
        },
      }),
      columnHelper.accessor('title', {
        id: 'title',
        header: () => (
          <Text
            justifyContent="space-between"
            align="center"
            fontSize={{ sm: '10px', lg: '12px' }}
            color="gray.400"
            textTransform="uppercase"
          >
            Title
          </Text>
        ),
        cell: (info) => (
          <Flex align="center">
            <Text color={textColor} fontSize="sm" fontWeight="400">
              {info.getValue()}
            </Text>
          </Flex>
        ),
      }),
      columnHelper.accessor('view', {
        id: 'view',
        header: () => (
          <Text
            justifyContent="space-between"
            align="center"
            fontSize={{ sm: '10px', lg: '12px' }}
            color="gray.400"
            textTransform="uppercase"
          >
            images
          </Text>
        ),
        cell: (info) => (
          <Flex align="center">
            <Button
              size="sm"
              colorScheme="teal"
              variant="outline"
              onClick={() => viewPhoto([info.getValue()])}
            >
              View images
            </Button>
          </Flex>
        ),
      }),

      columnHelper.accessor('flow_type', {
        id: 'flow_type',
        header: () => (
          <Text
            justifyContent="space-between"
            align="center"
            fontSize={{ sm: '10px', lg: '12px' }}
            color="gray.400"
            textTransform="uppercase"
          >
            Order Type
          </Text>
        ),
        cell: (info) => (
          <Flex align="center">
            <Text color={textColor} fontSize="sm" fontWeight="400">
              {info.getValue()}
            </Text>
          </Flex>
        ),
      }),
      columnHelper.accessor('raised_by', {
        id: 'raised_by',
        header: () => (
          <Text
            justifyContent="space-between"
            align="center"
            fontSize={{ sm: '10px', lg: '12px' }}
            color="gray.400"
            textTransform="uppercase"
          >
            Raised By
          </Text>
        ),
        cell: (info) => (
          <Flex align="center">
            {info.row.original.raised_by_id !== 'N/A' ? (
              <Link
                as={RouterLink}
                to={`/admin/Dispute/UserDetails/${info.row.original.raised_by_id}`}
                color="blue.500"
                fontSize="sm"
                fontWeight="700"
                _hover={{ textDecoration: 'underline' }}
              >
                {info.getValue()}
              </Link>
            ) : (
              <Text color={textColor} fontSize="sm" fontWeight="400">
                {info.getValue()}
              </Text>
            )}
          </Flex>
        ),
      }),
      columnHelper.accessor('against', {
        id: 'against',
        header: () => (
          <Text
            justifyContent="space-between"
            align="center"
            fontSize={{ sm: '10px', lg: '12px' }}
            color="gray.400"
            textTransform="uppercase"
          >
            Against
          </Text>
        ),
        cell: (info) => (
          <Flex align="center">
            {info.row.original.against_id !== 'N/A' ? (
              <Link
                as={RouterLink}
                to={`/admin/Dispute/UserDetails/${info.row.original.against_id}`}
                color="blue.500"
                fontSize="sm"
                fontWeight="700"
                _hover={{ textDecoration: 'underline' }}
              >
                {info.getValue()}
              </Link>
            ) : (
              <Text color={textColor} fontSize="sm" fontWeight="400">
                {info.getValue()}
              </Text>
            )}
          </Flex>
        ),
      }),
      columnHelper.accessor('amount', {
        id: 'amount',
        header: () => (
          <Text
            justifyContent="space-between"
            align="center"
            fontSize={{ sm: '10px', lg: '12px' }}
            color="gray.400"
            textTransform="uppercase"
          >
            Amount
          </Text>
        ),
        cell: (info) => (
          <Flex align="center">
            <Text color={textColor} fontSize="sm" fontWeight="400">
              {info.getValue()}
            </Text>
          </Flex>
        ),
      }),
      columnHelper.accessor('description', {
        id: 'description',
        header: () => (
          <Text
            justifyContent="space-between"
            align="center"
            fontSize={{ sm: '10px', lg: '12px' }}
            color="gray.400"
            textTransform="uppercase"
          >
            Description
          </Text>
        ),
        cell: (info) => {
          const description = info.getValue();
          const dispute = info.row.original;

          return (
            <Flex align="center" direction="column" gap="1">
              <Text
                color={textColor}
                fontSize="sm"
                fontWeight="400"
                textAlign="left"
                noOfLines={2}
                maxW="200px"
              >
                {truncateText(description, 50)}
              </Text>
              {description && description.length > 50 && (
                <Button
                  size="xs"
                  variant="link"
                  color="blue.500"
                  fontSize="xs"
                  fontWeight="500"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReadMore(description, dispute);
                  }}
                  _hover={{ textDecoration: 'underline' }}
                >
                  Read More
                </Button>
              )}
            </Flex>
          );
        },
      }),
      columnHelper.accessor('requirement', {
        id: 'requirement',
        header: () => (
          <Text
            justifyContent="space-between"
            align="center"
            fontSize={{ sm: '10px', lg: '12px' }}
            color="gray.400"
            textTransform="uppercase"
          >
            Requirement
          </Text>
        ),
        cell: (info) => (
          <Flex align="center">
            <Text color={textColor} fontSize="sm" fontWeight="400">
              {info.getValue()}
            </Text>
          </Flex>
        ),
      }),
      columnHelper.accessor('status', {
        id: 'status',
        header: () => (
          <Text
            justifyContent="space-between"
            align="center"
            fontSize={{ sm: '10px', lg: '12px' }}
            color="gray.400"
            textTransform="uppercase"
          >
            Status
          </Text>
        ),
        cell: (info) => (
          <Flex align="center">
            {getStatusBadge(info.getValue())}
          </Flex>
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
            textTransform="uppercase"
          >
            Created At
          </Text>
        ),
        cell: (info) => (
          <Flex align="center">
            <Text color={textColor} fontSize="sm" fontWeight="400">
              {info.getValue()}
            </Text>
          </Flex>
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
            textTransform="uppercase"
          >
            Actions
          </Text>
        ),
        cell: (info) => {
          const row = info.row.original;
          return (
            <Flex align="center" gap="2">
              <Button
                size="sm"
                colorScheme="teal"
                leftIcon={<EditIcon />}
                onClick={() => handleEditStatus(row)}
              >
                Edit Status
              </Button>
            </Flex>
          );
        },
      }),
    ],
    [textColor],
  );

  const table = useReactTable({
    data: paginatedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return (
      <Card
        flexDirection="column"
        w="100%"
        px="25px"
        py="25px"
        overflowX={{ sm: 'scroll', lg: 'hidden' }}
        borderRadius="20px"
        boxShadow="lg"
      >
        <Text color={textColor} fontSize="22px" fontWeight="700" p="25px">
          Loading...
        </Text>
      </Card>
    );
  }

  if (error) {
    return (
      <Card
        flexDirection="column"
        w="100%"
        px="25px"
        py="25px"
        overflowX={{ sm: 'scroll', lg: 'hidden' }}
        borderRadius="20px"
        boxShadow="lg"
        style={{ marginTop: '80px' }}
      >
        <Text color={textColor} fontSize="22px" fontWeight="700" p="25px">
          Error: {error}
        </Text>
      </Card>
    );
  }

  return (
    <>
      <Card
        flexDirection="column"
        w="100%"
        px="25px"
        py="25px"
        overflowX={{ sm: 'scroll', lg: 'hidden' }}
        borderRadius="20px"
        boxShadow="lg"
        style={{ marginTop: '80px' }}
      >
        <Flex
          px="0px"
          mb="20px"
          justifyContent="space-between"
          align="center"
          direction={{ base: 'column', md: 'row' }}
          gap={{ base: '10px', md: '0' }}
        >
          <Flex direction="column" gap="5px">
            <Text
              color={textColor}
              fontSize={{ base: 'xl', md: '22px' }}
              fontWeight="700"
              lineHeight="100%"
            >
              Disputes
            </Text>

            {/* ⭐ STATUS COUNTS BOX */}
            <Flex gap="10px">
              <Flex
                bg="yellow.100"
                px="10px"
                py="4px"
                borderRadius="8px"
                fontSize="14px"
                fontWeight="600"
                color="yellow.700"
              >
                Pending: {status.pending}
              </Flex>

              <Flex
                bg="green.100"
                px="10px"
                py="4px"
                borderRadius="8px"
                fontSize="14px"
                fontWeight="600"
                color="green.700"
              >
                Resolved: {status.resolve}
              </Flex>

              <Flex
                bg="red.100"
                px="10px"
                py="4px"
                borderRadius="8px"
                fontSize="14px"
                fontWeight="600"
                color="red.700"
              >
                Rejected: {status.rejected}
              </Flex>
            </Flex>

          </Flex>

          {/* RIGHT SIDE — SEARCH + FILTER */}
          <Flex
            align="center"
            gap={{ base: '10px', md: '20px' }}
            direction={{ base: 'column', md: 'row' }}
          >
            <InputGroup maxW={{ base: '100%', md: '300px' }}>
              <InputLeftElement pointerEvents="none">
                <Icon as={SearchIcon} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search by ID, title, type, names, or status"
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

            <HStack spacing="2">
              <Button
                size="sm"
                colorScheme={activeFilter === 'all' ? 'teal' : 'gray'}
                onClick={() => handleFilterClick('all')}
              >
                All
              </Button>
              <Button
                size="sm"
                colorScheme={activeFilter === 'direct' ? 'teal' : 'gray'}
                onClick={() => handleFilterClick('direct')}
              >
                Direct
              </Button>
              <Button
                size="sm"
                colorScheme={activeFilter === 'bidding' ? 'teal' : 'gray'}
                onClick={() => handleFilterClick('bidding')}
              >
                Bidding
              </Button>
              <Button
                size="sm"
                colorScheme={activeFilter === 'emergency' ? 'teal' : 'gray'}
                onClick={() => handleFilterClick('emergency')}
              >
                Emergency
              </Button>

              {/* EXPORT BUTTON ADDED HERE */}
              <Button
                size="sm"
                colorScheme="green"
                leftIcon={<DownloadIcon />}
                onClick={handleExport}
              >
                Export
              </Button>
            </HStack>
          </Flex>
        </Flex>


        <Box overflowX="auto">
          <Table variant="simple" color="gray.500" mb="24px" mt="12px">
            <Thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <Tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <Th
                      key={header.id}
                      colSpan={header.colSpan}
                      pe="10px"
                      borderColor={borderColor}
                      py="12px"
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
                      </Flex>
                    </Th>
                  ))}
                </Tr>
              ))}
            </Thead>
            <Tbody>
              {table.getRowModel().rows.map((row) => (
                <Tr
                  key={row.id}
                  _hover={{ bg: 'gray.25' }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <Td
                      key={cell.id}
                      fontSize={{ sm: '14px' }}
                      minW={{ sm: '150px', md: '200px', lg: 'auto' }}
                      borderColor="transparent"
                      py="12px"
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
            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of{' '}
            {totalItems} disputes
          </Text>
          <HStack>
            <Button
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              colorScheme="teal"
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
              onClick={() => goToPage(currentPage + 1)}
              colorScheme="teal"
              isDisabled={currentPage === totalPages}
              rightIcon={<ChevronRightIcon />}
            >
              Next
            </Button>
          </HStack>
        </Flex>
      </Card>

      {/* Status Update Modal */}
      <Modal isOpen={isStatusModalOpen} onClose={handleStatusModalClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update Dispute Status</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedDispute && (
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontSize="sm" mb="1" fontWeight="semibold">
                    Dispute ID: {selectedDispute.uniqueId}
                  </Text>
                  <Text fontSize="sm" mb="1">
                    <strong>Project:</strong> {selectedDispute.project_id}
                  </Text>
                  <Text fontSize="sm" mb="1">
                    <strong>Current Status:</strong>{' '}
                    {getStatusBadge(selectedDispute.status)}
                  </Text>
                </Box>

                <Divider />

                <FormControl>
                  <FormLabel fontSize="sm">New Status</FormLabel>
                  <Select
                    value={currentStatus}
                    onChange={(e) => setCurrentStatus(e.target.value)}
                    placeholder="Select new status"
                  >
                    <option value="pending">Pending</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </Select>
                </FormControl>

                {(currentStatus === 'resolved' || currentStatus === 'rejected') && (
                  <>
                    <Divider />
                    <FormControl
                      isRequired
                      isInvalid={!reason.trim()}
                    >
                      <FormLabel fontSize="sm">
                        Reason <span style={{ color: 'red' }}>*</span>
                      </FormLabel>
                      <Textarea
                        placeholder="Enter detailed reason for status change (required)..."
                        rows={4}
                        borderRadius="md"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                      />
                      {!reason.trim() && (
                        <FormErrorMessage fontSize="xs">
                          Reason is required for Resolved or Rejected status
                        </FormErrorMessage>
                      )}
                    </FormControl>
                  </>
                )}

                {currentStatus === 'pending' && (
                  <Text fontSize="sm" color="gray.500" textAlign="center">
                    No reason required for Pending status
                  </Text>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={handleStatusModalClose}
            >
              Cancel
            </Button>
            <Button
              colorScheme="teal"
              onClick={() => {
                if (selectedDispute && currentStatus) {
                  updateDisputeStatus(selectedDispute.id, currentStatus, reason);
                }
              }}
              isDisabled={!currentStatus ||
                ((currentStatus === 'resolved' || currentStatus === 'rejected') &&
                  !reason.trim())
              }
            >
              Update Status
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Description Modal */}
      <Modal isOpen={isDescriptionModalOpen} onClose={handleDescriptionModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Dispute Description</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedDescription && (
              <VStack spacing={4} align="stretch">
                <Box p={4} bg="gray.50" borderRadius="md">
                  <Text fontSize="sm" mb="1" fontWeight="semibold">
                    Dispute ID: {selectedDescription.disputeId}
                  </Text>
                  <Text fontSize="sm" mb="1">
                    <strong>Project:</strong> {selectedDescription.projectId}
                  </Text>
                  <Text fontSize="sm" mb="1">
                    <strong>Raised By:</strong> {selectedDescription.raisedBy}
                  </Text>
                  <Text fontSize="sm" mb="1">
                    <strong>Against:</strong> {selectedDescription.against}
                  </Text>
                  <Text fontSize="sm" mb="1">
                    <strong>Status:</strong>{' '}
                    {getStatusBadge(selectedDescription.status)}
                  </Text>
                </Box>

                <Divider />

                <Box>
                  <Text fontSize="md" fontWeight="semibold" mb="2">
                    Full Description
                  </Text>
                  <Box
                    p={4}
                    bg="gray.50"
                    borderRadius="md"
                    border="1px"
                    borderColor="gray.200"
                    maxH="400px"
                    overflowY="auto"
                  >
                    <Text
                      fontSize="sm"
                      lineHeight="tall"
                      whiteSpace="pre-wrap"
                      color={textColor}
                    >
                      {selectedDescription.description}
                    </Text>
                  </Box>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="teal"
              onClick={handleDescriptionModalClose}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>View Photos</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <VStack spacing={4} align="stretch">
              {modalImages.map((img, index) => (
                <img
                  key={index}
                  src={baseUrl + img}
                  width="100%"
                  borderRadius="md"
                />
              ))}

            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="teal" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>



    </>
  );
}