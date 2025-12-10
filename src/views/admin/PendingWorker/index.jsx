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
//   Image,
//   Link,
//   Select,
//   useToast,
//   Button,
// } from '@chakra-ui/react';
// import {
//   createColumnHelper,
//   flexRender,
//   getCoreRowModel,
//   getPaginationRowModel,
// 	useReactTable,
// } from '@tanstack/react-table';
// import axios from 'axios';
// import * as React from 'react';
// import { useNavigate, Link as RouterLink } from 'react-router-dom';

// // Custom components
// import Card from 'components/card/Card';
// import defaultProfilePic from 'assets/img/profile/profile.webp';
// const columnHelper = createColumnHelper();

// export default function WorkersTable() {
//   const [data, setData] = React.useState([]);
//   const [loading, setLoading] = React.useState(true);
//   const [error, setError] = React.useState(null);
//   const [pageSize, setPageSize] = React.useState(10);
//   const textColor = useColorModeValue('secondaryGray.900', 'white');
//   const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
//   const navigate = useNavigate();
//   const toast = useToast();

//   const baseUrl = process.env.REACT_APP_BASE_URL;
//   const token = localStorage.getItem('token');

//   // Fetch workers
//   const fetchWorkers = async () => {
//     try {
//       if (!baseUrl || !token) {
//         throw new Error('Missing base URL or authentication token');
//       }
//       setLoading(true);
//       const response = await axios.get(`${baseUrl}api/worker/getPendingWorkers`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       console.log('API Response (Workers):', response.data);

//       if (!response.data || !Array.isArray(response.data.workers)) {
//         throw new Error('Invalid response format: Expected an array of workers');
//       }

//       const formattedData = response.data.workers.map((item, index) => ({
//         _id: item._id,
//         serialNo: index + 1,
//         name: item.name || 'UNKNOWN',
//         phone: item.phone || 'N/A',
//         aadharNumber: item.aadharNumber || 'N/A',
//         dob: item.dob
//           ? new Date(item.dob).toLocaleDateString('en-GB', {
//               day: '2-digit',
//               month: 'short',
//               year: 'numeric',
//             })
//           : 'N/A',
//         address: item.address || 'N/A',
//         image: item.image || null,
//         adharImage: item.aadharImage || null,
//         service_provider: {
//           id: item.service_provider_id?._id || 'N/A',
//           name: item.service_provider_id?.full_name || 'UNKNOWN',
//         },
//         verifyStatus: item.verifyStatus
//           ? item.verifyStatus.charAt(0).toUpperCase() + item.verifyStatus.slice(1)
//           : 'UNKNOWN',
//         assignOrders: item.assignOrders?.length || 0,
//       }));

//       setData(formattedData);
//       setLoading(false);
//     } catch (err) {
//       console.error('Fetch Workers Error:', err);
//       if (
//         err.response?.data?.message === 'Not authorized, token failed' ||
//         err.response?.data?.message === 'Session expired or logged in on another device' ||
//         err.response?.data?.message === 'Un-Authorized, You are not authorized to access this route.' ||
//         err.response?.data?.message === 'Not authorized, token failed'
//       ) {
//         localStorage.removeItem('token');
//         navigate('/');
//       } else {
//         setError(err.message || 'Failed to fetch workers');
//         setLoading(false);
//       }
//     }
//   };

//   // Update verification status
//   const updateVerificationStatus = async (workerId, newStatus) => {
//     try {
//       if (!baseUrl || !token) {
//         throw new Error('Missing base URL or authentication token');
//       }

//       const response = await axios.put(
//         `${baseUrl}api/worker/verify/${workerId}`,
//         { verifyStatus: newStatus.toLowerCase() },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       console.log('Update Verification Status Response:', response.data);
//       toast({
//         title: 'Success',
//         description: 'Verification status updated successfully!',
//         status: 'success',
//         duration: 3000,
//         isClosable: true,
//         position: 'top-right',
//       });
//      window.location.reload();
//       // Update the local data to reflect the new status
//       setData((prevData) =>
//         prevData.map((worker) =>
//           worker._id === workerId
//             ? {
//                 ...worker,
//                 verifyStatus: newStatus.charAt(0).toUpperCase() + newStatus.slice(1),
//               }
//             : worker
//         )
//       );
//     } catch (err) {
//       console.error('Update Verification Status Error:', err);
//       toast({
//         title: 'Error',
//         description: err.message || 'Failed to update verification status',
//         status: 'error',
//         duration: 3000,
//         isClosable: true,
//         position: 'top-right',
//       });
//     }
//   };

//   React.useEffect(() => {
//     fetchWorkers();
//   }, [navigate]);

//   const columns = React.useMemo(
//     () => [
//       columnHelper.accessor('serialNo', {
//         id: 'serialNo',
//         header: () => (
//           <Text
//             justifyContent="space-between"
//             align="center"
//             fontSize={{ sm: '10px', lg: '12px' }}
//             color="gray.400"
//             textTransform="uppercase"
//             className="font-semibold"
//           >
//             S.No
//           </Text>
//         ),
//         cell: (info) => (
//           <Flex align="center">
//             <Text color={textColor} fontSize="sm" fontWeight="500" className="text-gray-700 dark:text-gray-200">
//               {info.getValue()}
//             </Text>
//           </Flex>
//         ),
//       }),
//       columnHelper.accessor('name', {
//         id: 'name',
//         header: () => (
//           <Text
//             justifyContent="space-between"
//             align="center"
//             fontSize={{ sm: '10px', lg: '12px' }}
//             color="gray.400"
//             textTransform="uppercase"
//             className="font-semibold"
//           >
//             Name
//           </Text>
//         ),
//         cell: (info) => (
//           <Flex align="center">
//             <Text color={textColor} fontSize="sm" fontWeight="500" className="text-gray-700 dark:text-gray-200">
//               {info.getValue()}
//             </Text>
//           </Flex>
//         ),
//       }),
//       columnHelper.accessor('phone', {
//         id: 'phone',
//         header: () => (
//           <Text
//             justifyContent="space-between"
//             align="center"
//             fontSize={{ sm: '10px', lg: '12px' }}
//             color="gray.400"
//             textTransform="uppercase"
//             className="font-semibold"
//           >
//             Phone
//           </Text>
//         ),
//         cell: (info) => (
//           <Flex align="center">
//             <Text color={textColor} fontSize="sm" fontWeight="500" className="text-gray-700 dark:text-gray-200">
//               {info.getValue()}
//             </Text>
//           </Flex>
//         ),
//       }),
//       columnHelper.accessor('aadharNumber', {
//         id: 'aadharNumber',
//         header: () => (
//           <Text
//             justifyContent="space-between"
//             align="center"
//             fontSize={{ sm: '10px', lg: '12px' }}
//             color="gray.400"
//             textTransform="uppercase"
//             className="font-semibold"
//           >
//             Aadhar Number
//           </Text>
//         ),
//         cell: (info) => (
//           <Flex align="center">
//             <Text color={textColor} fontSize="sm" fontWeight="500" className="text-gray-700 dark:text-gray-200">
//               {info.getValue()}
//             </Text>
//           </Flex>
//         ),
//       }),
//       columnHelper.accessor('dob', {
//         id: 'dob',
//         header: () => (
//           <Text
//             justifyContent="space-between"
//             align="center"
//             fontSize={{ sm: '10px', lg: '12px' }}
//             color="gray.400"
//             textTransform="uppercase"
//             className="font-semibold"
//           >
//             DOB
//           </Text>
//         ),
//         cell: (info) => (
//           <Flex align="center">
//             <Text color={textColor} fontSize="sm" fontWeight="500" className="text-gray-700 dark:text-gray-200">
//               {info.getValue()}
//             </Text>
//           </Flex>
//         ),
//       }),
//       columnHelper.accessor('address', {
//         id: 'address',
//         header: () => (
//           <Text
//             justifyContent="space-between"
//             align="center"
//             fontSize={{ sm: '10px', lg: '12px' }}
//             color="gray.400"
//             textTransform="uppercase"
//             className="font-semibold"
//           >
//             Address
//           </Text>
//         ),
//         cell: (info) => (
//           <Flex align="center">
//             <Text color={textColor} fontSize="sm" fontWeight="500" className="text-gray-700 dark:text-gray-200">
//               {info.getValue()}
//             </Text>
//           </Flex>
//         ),
//       }),
//       columnHelper.accessor('image', {
//         id: 'image',
//         header: () => (
//           <Text
//             justifyContent="space-between"
//             align="center"
//             fontSize={{ sm: '10px', lg: '12px' }}
//             color="gray.400"
//             textTransform="uppercase"
//             className="font-semibold"
//           >
//             Image
//           </Text>
//         ),
//         cell: (info) => (
//           <Flex align="center">
//             {info.getValue() ? (
//               <Image
//                 src={info.getValue()}
//                 alt="Worker Image"
//                 boxSize="50px"
//                 objectFit="cover"
//                 borderRadius="12px"
//                 className="shadow-md hover:shadow-lg transition-shadow duration-200"
//                 fallbackSrc={defaultProfilePic}
//               />
//             ) : (
//               <Text color={textColor} fontSize="sm" fontWeight="500" className="text-gray-700 dark:text-gray-200">
//                 No Image
//               </Text>
//             )}
//           </Flex>
//         ),
//       }),
//       columnHelper.accessor('adharImage', {
//         id: 'adharImage',
//         header: () => (
//           <Text
//             justifyContent="space-between"
//             align="center"
//             fontSize={{ sm: '10px', lg: '12px' }}
//             color="gray.400"
//             textTransform="uppercase"
//             className="font-semibold"
//           >
//             Aadhar Image
//           </Text>
//         ),
//         cell: (info) => (
//           <Flex align="center">
//             {info.getValue() ? (
//               <Image
//                 src={info.getValue()}
//                 alt="Worker Aadhar Image"
//                 boxSize="50px"
//                 objectFit="cover"
//                 borderRadius="12px"
//                 className="shadow-md hover:shadow-lg transition-shadow duration-200"
//                 fallbackSrc={defaultProfilePic}
//               />
//             ) : (
//               <Text color={textColor} fontSize="sm" fontWeight="500" className="text-gray-700 dark:text-gray-200">
//                 No Aadhar Image
//               </Text>
//             )}
//           </Flex>
//         ),
//       }),
//       columnHelper.accessor('service_provider', {
//         id: 'service_provider',
//         header: () => (
//           <Text
//             justifyContent="space-between"
//             align="center"
//             fontSize={{ sm: '10px', lg: '12px' }}
//             color="gray.400"
//             textTransform="uppercase"
//             className="font-semibold"
//           >
//             Service Provider
//           </Text>
//         ),
//         cell: (info) => (
//           <Flex align="center">
//             <Link
//               as={RouterLink}
//               to={`/admin/details/${info.getValue().id}`}
//               color="blue.500"
//               fontSize="sm"
//               fontWeight="500"
//               className="hover:text-blue-600 transition-colors duration-200"
//             >
//               {info.getValue().name}
//             </Link>
//           </Flex>
//         ),
//       }),
//       columnHelper.accessor('verifyStatus', {
//         id: 'verifyStatus',
//         header: () => (
//           <Text
//             justifyContent="space-between"
//             align="center"
//             fontSize={{ sm: '10px', lg: '12px' }}
//             color="gray.400"
//             textTransform="uppercase"
//             className="font-semibold"
//           >
//             Verification Status
//           </Text>
//         ),
//         cell: (info) => (
//           <Flex align="center">
//             <Select
//               value={info.getValue()}
//               onChange={(e) =>
//                 updateVerificationStatus(info.row.original._id, e.target.value)
//               }
//               size="sm"
//               borderRadius="8px"
//               borderColor="gray.300"
//               className="hover:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
//             >
//               {['Pending', 'Approved', 'Rejected'].map((status) => (
//                 <option key={status} value={status}>
//                   {status}
//                 </option>
//               ))}
//             </Select>
//           </Flex>
//         ),
//       }),
//     ],
//     [textColor]
//   );

//   const table = useReactTable({
//     data,
//     columns,
//     getCoreRowModel: getCoreRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//     initialState: {
//       pagination: {
//         pageSize: pageSize,
//       },
//     },
//   });

//   const handlePageSizeChange = (e) => {
//     const newSize = Number(e.target.value);
//     setPageSize(newSize);
//     table.setPageSize(newSize);
//   };

//   // Generate array of page numbers to display (e.g., 1, 2, 3)
//   const getPageNumbers = () => {
//     const totalPages = table.getPageCount();
//     const currentPage = table.getState().pagination.pageIndex + 1;
//     const pageNumbers = [];

//     // Simple logic to show up to 3 page numbers around the current page
//     const startPage = Math.max(1, currentPage - 1);
//     const endPage = Math.min(totalPages, currentPage + 1);

//     for (let i = startPage; i <= endPage; i++) {
//       pageNumbers.push(i);
//     }

//     return pageNumbers;
//   };

//   if (loading) {
//     return (
//       <Card
//         flexDirection="column"
//         w="100%"
//         px="25px"
//         py="25px"
//         overflowX={{ sm: 'scroll', lg: 'hidden' }}
//         borderRadius="20px"
//         boxShadow="xl"
//         className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900"
//       >
//         <Text color={textColor} fontSize="22px" fontWeight="700" p="25px" className="text-gray-800 dark:text-gray-100">
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
//         boxShadow="xl"
//         className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-gray-800 dark:to-gray-900"
//         style={{ marginTop: '80px' }}
//       >
//         <Text color={textColor} fontSize="22px" fontWeight="700" p="25px" className="text-red-600 dark:text-red-400">
//           Error: {error}
//         </Text>
//       </Card>
//     );
//   }

//   return (
//     <Card
//       flexDirection="column"
//       w="100%"
//       px="25px"
//       py="25px"
//       overflowX={{ sm: 'scroll', lg: 'hidden' }}
//       borderRadius="20px"
//       boxShadow="xl"
//       className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900"
//       style={{ marginTop: '80px' }}
//     >
//       <Flex px="0px" mb="20px" justifyContent="space-between" align="center">
//         <Text
//           color={textColor}
//           fontSize="22px"
//           fontWeight="700"
//           lineHeight="100%"
//           className="text-gray-800 dark:text-gray-100"
//         >
//           Workers
//         </Text>
//       </Flex>
//       <Box className="overflow-x-auto">
//         <Table variant="simple" color="gray.500" mb="24px" mt="12px" className="min-w-full border-separate border-spacing-0">
//           <Thead className="bg-gray-100 dark:bg-gray-700">
//             {table.getHeaderGroups().map((headerGroup) => (
//               <Tr key={headerGroup.id}>
//                 {headerGroup.headers.map((header) => (
//                   <Th
//                     key={header.id}
//                     colSpan={header.colSpan}
//                     pe="10px"
//                     borderColor={borderColor}
//                     py="12px"
//                     className="text-left border-b border-gray-200 dark:border-gray-600 text-gray-400 uppercase font-semibold text-xs lg:text-sm"
//                   >
//                     <Flex
//                       justifyContent="space-between"
//                       align="center"
//                     >
//                       {flexRender(
//                         header.column.columnDef.header,
//                         header.getContext()
//                       )}
//                     </Flex>
//                   </Th>
//                 ))}
//               </Tr>
//             ))}
//           </Thead>
//           <Tbody>
//             {table.getRowModel().rows.map((row, index) => (
//               <Tr
//                 key={row.id}
//                 className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ${
//                   index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'
//                 }`}
//               >
//                 {row.getVisibleCells().map((cell) => (
//                   <Td
//                     key={cell.id}
//                     fontSize={{ sm: '14px' }}
//                     minW={{ sm: '150px', md: '200px', lg: 'auto' }}
//                     borderColor="transparent"
//                     py="12px"
//                     className="border-b border-gray-200 dark:border-gray-600"
//                   >
//                     {flexRender(cell.column.columnDef.cell, cell.getContext())}
//                   </Td>
//                 ))}
//               </Tr>
//             ))}
//           </Tbody>
//         </Table>
//       </Box>
//       <Flex
//         justifyContent="space-between"
//         alignItems="center"
//         mt="20px"
//         px="10px"
//         flexWrap="wrap"
//         gap="10px"
//       >
//         {/*<Flex alignItems="center" gap="10px">
//           <Text color={textColor} fontSize="sm" fontWeight="500" className="text-gray-600 dark:text-gray-300">
//             Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
//           </Text>
//           <Select
//             value={pageSize}
//             onChange={handlePageSizeChange}
//             size="sm"
//             borderRadius="8px"
//             className="w-32 border-gray-300 hover:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
//           >
//             {[5, 10, 20, 50].map((size) => (
//               <option key={size} value={size}>
//                 Show {size}
//               </option>
//             ))}
//           </Select>
//         </Flex> */}
//         <Flex gap="5px" alignItems="center">
//           <Button
//             onClick={() => table.previousPage()}
//             isDisabled={!table.getCanPreviousPage()}
//             size="sm"
//             colorScheme="teal"
//             className="bg-blue-500 text-white font-semibold rounded-lg transition-colors duration-200"
//           >
//             Prev
//           </Button>
//           {getPageNumbers().map((pageNum) => (
//             <Button
//               key={pageNum}
//               onClick={() => table.setPageIndex(pageNum - 1)}
//               size="sm"
//               colorScheme={table.getState().pagination.pageIndex + 1 === pageNum ? 'teal' : 'gray'}
//               className={`${
//                 table.getState().pagination.pageIndex + 1 === pageNum
//                   ? 'bg-blue-500 text-white'
//                   : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500'
//               } font-semibold rounded-lg transition-colors duration-200`}
//             >
//               {pageNum}
//             </Button>
//           ))}
//           <Button
//             onClick={() => table.nextPage()}
//             isDisabled={!table.getCanNextPage()}
//             size="sm"
//             colorScheme="teal"
//             className="bg-blue-500  text-white font-semibold rounded-lg transition-colors duration-200"
//           >
//             Next
//           </Button>
//         </Flex>
//       </Flex>
//     </Card>
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
  Image,
  Link,
  Select,
  useToast,
  Button, // Make sure Button is imported
} from '@chakra-ui/react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
	useReactTable,
} from '@tanstack/react-table';
import axios from 'axios';
import * as React from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

// Custom components
import Card from 'components/card/Card';
import defaultProfilePic from 'assets/img/profile/profile.webp';

const columnHelper = createColumnHelper();

export default function WorkersTable() {
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [pageSize, setPageSize] = React.useState(10);
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const navigate = useNavigate();
  const toast = useToast();

  const baseUrl = process.env.REACT_APP_BASE_URL;
  const token = localStorage.getItem('token');

  // Fetch workers
  const fetchWorkers = async () => {
    try {
      if (!baseUrl || !token) {
        throw new Error('Missing base URL or authentication token');
      }
      setLoading(true);
      const response = await axios.get(`${baseUrl}api/worker/getPendingWorkers`, { // NOTE: This endpoint is for PENDING workers
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('API Response (Workers):', response.data);

      if (!response.data || !Array.isArray(response.data.workers)) {
        throw new Error('Invalid response format: Expected an array of workers');
      }

      const formattedData = response.data.workers.map((item, index) => ({
        _id: item._id,
        serialNo: index + 1,
        name: item.name || 'UNKNOWN',
        phone: item.phone || 'N/A',
        aadharNumber: item.aadharNumber || 'N/A',
        dob: item.dob
          ? new Date(item.dob).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          : 'N/A',
        address: item.address || 'N/A',
        image: item.image || null,
        adharImage: item.aadharImage || null,
        service_provider: {
          id: item.service_provider_id?._id || 'N/A',
          name: item.service_provider_id?.full_name || 'UNKNOWN',
        },
        verifyStatus: item.verifyStatus
          ? item.verifyStatus.charAt(0).toUpperCase() + item.verifyStatus.slice(1)
          : 'UNKNOWN',
        assignOrders: item.assignOrders?.length || 0,
      }));

      setData(formattedData);
      setLoading(false);
    } catch (err) {
      console.error('Fetch Workers Error:', err);
      if (
        err.response?.data?.message === 'Not authorized, token failed' ||
        err.response?.data?.message === 'Session expired or logged in on another device' ||
        err.response?.data?.message === 'Un-Authorized, You are not authorized to access this route.' ||
        err.response?.data?.message === 'Not authorized, token failed'
      ) {
        localStorage.removeItem('token');
        navigate('/');
      } else {
        setError(err.message || 'Failed to fetch workers');
        setLoading(false);
      }
    }
  };

  // Update verification status
  const updateVerificationStatus = async (workerId, newStatus) => {
    try {
      if (!baseUrl || !token) {
        throw new Error('Missing base URL or authentication token');
      }

      const response = await axios.put(
        `${baseUrl}api/worker/verify/${workerId}`,
        { verifyStatus: newStatus.toLowerCase() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Update Verification Status Response:', response.data);
      toast({
        title: 'Success',
        description: 'Verification status updated successfully!',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      window.location.reload(); // This reloads the page after status update

      // Update the local data to reflect the new status
      setData((prevData) =>
        prevData.map((worker) =>
          worker._id === workerId
            ? {
                ...worker,
                verifyStatus: newStatus.charAt(0).toUpperCase() + newStatus.slice(1),
              }
            : worker
        )
      );
    } catch (err) {
      console.error('Update Verification Status Error:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to update verification status',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    }
  };

  React.useEffect(() => {
    fetchWorkers();
  }, [navigate]);

  const columns = React.useMemo(
    () => [
      columnHelper.accessor('serialNo', {
        id: 'serialNo',
        header: () => (
          <Text
            justifyContent="space-between"
            align="center"
            fontSize={{ sm: '10px', lg: '12px' }}
            color="gray.400"
            textTransform="uppercase"
            className="font-semibold"
          >
            S.No
          </Text>
        ),
        cell: (info) => (
          <Flex align="center">
            <Text color={textColor} fontSize="sm" fontWeight="500" className="text-gray-700 dark:text-gray-200">
              {info.getValue()}
            </Text>
          </Flex>
        ),
      }),
      columnHelper.accessor('name', {
        id: 'name',
        header: () => (
          <Text
            justifyContent="space-between"
            align="center"
            fontSize={{ sm: '10px', lg: '12px' }}
            color="gray.400"
            textTransform="uppercase"
            className="font-semibold"
          >
            Name
          </Text>
        ),
        cell: (info) => (
          <Flex align="center">
            <Text color={textColor} fontSize="sm" fontWeight="500" className="text-gray-700 dark:text-gray-200">
              {info.getValue()}
            </Text>
          </Flex>
        ),
      }),
      columnHelper.accessor('phone', {
        id: 'phone',
        header: () => (
          <Text
            justifyContent="space-between"
            align="center"
            fontSize={{ sm: '10px', lg: '12px' }}
            color="gray.400"
            textTransform="uppercase"
            className="font-semibold"
          >
            Phone
          </Text>
        ),
        cell: (info) => (
          <Flex align="center">
            <Text color={textColor} fontSize="sm" fontWeight="500" className="text-gray-700 dark:text-gray-200">
              {info.getValue()}
            </Text>
          </Flex>
        ),
      }),
      columnHelper.accessor('aadharNumber', {
        id: 'aadharNumber',
        header: () => (
          <Text
            justifyContent="space-between"
            align="center"
            fontSize={{ sm: '10px', lg: '12px' }}
            color="gray.400"
            textTransform="uppercase"
            className="font-semibold"
          >
            Aadhar Number
          </Text>
        ),
        cell: (info) => (
          <Flex align="center">
            <Text color={textColor} fontSize="sm" fontWeight="500" className="text-gray-700 dark:text-gray-200">
              {info.getValue()}
            </Text>
          </Flex>
        ),
      }),
      columnHelper.accessor('dob', {
        id: 'dob',
        header: () => (
          <Text
            justifyContent="space-between"
            align="center"
            fontSize={{ sm: '10px', lg: '12px' }}
            color="gray.400"
            textTransform="uppercase"
            className="font-semibold"
          >
            DOB
          </Text>
        ),
        cell: (info) => (
          <Flex align="center">
            <Text color={textColor} fontSize="sm" fontWeight="500" className="text-gray-700 dark:text-gray-200">
              {info.getValue()}
            </Text>
          </Flex>
        ),
      }),
      columnHelper.accessor('address', {
        id: 'address',
        header: () => (
          <Text
            justifyContent="space-between"
            align="center"
            fontSize={{ sm: '10px', lg: '12px' }}
            color="gray.400"
            textTransform="uppercase"
            className="font-semibold"
          >
            Address
          </Text>
        ),
        cell: (info) => (
          <Flex align="center">
            <Text color={textColor} fontSize="sm" fontWeight="500" className="text-gray-700 dark:text-gray-200">
              {info.getValue()}
            </Text>
          </Flex>
        ),
      }),
      columnHelper.accessor('image', {
        id: 'image',
        header: () => (
          <Text
            justifyContent="space-between"
            align="center"
            fontSize={{ sm: '10px', lg: '12px' }}
            color="gray.400"
            textTransform="uppercase"
            className="font-semibold"
          >
            Image
          </Text>
        ),
        cell: (info) => (
          <Flex align="center">
            {info.getValue() ? (
              <Image
                src={info.getValue()}
                alt="Worker Image"
                boxSize="50px"
                objectFit="cover"
                borderRadius="12px"
                className="shadow-md hover:shadow-lg transition-shadow duration-200"
                fallbackSrc={defaultProfilePic}
              />
            ) : (
              <Text color={textColor} fontSize="sm" fontWeight="500" className="text-gray-700 dark:text-gray-200">
                No Image
              </Text>
            )}
          </Flex>
        ),
      }),
      columnHelper.accessor('adharImage', {
        id: 'adharImage',
        header: () => (
          <Text
            justifyContent="space-between"
            align="center"
            fontSize={{ sm: '10px', lg: '12px' }}
            color="gray.400"
            textTransform="uppercase"
            className="font-semibold"
          >
            Aadhar Image
          </Text>
        ),
        cell: (info) => (
          <Flex align="center">
            {info.getValue() ? (
              <Image
                src={info.getValue()}
                alt="Worker Aadhar Image"
                boxSize="50px"
                objectFit="cover"
                borderRadius="12px"
                className="shadow-md hover:shadow-lg transition-shadow duration-200"
                fallbackSrc={defaultProfilePic}
              />
            ) : (
              <Text color={textColor} fontSize="sm" fontWeight="500" className="text-gray-700 dark:text-gray-200">
                No Aadhar Image
              </Text>
            )}
          </Flex>
        ),
      }),
      columnHelper.accessor('service_provider', {
        id: 'service_provider',
        header: () => (
          <Text
            justifyContent="space-between"
            align="center"
            fontSize={{ sm: '10px', lg: '12px' }}
            color="gray.400"
            textTransform="uppercase"
            className="font-semibold"
          >
            Service Provider
          </Text>
        ),
        cell: (info) => (
          <Flex align="center">
            <Link
              as={RouterLink}
              to={`/admin/details/${info.getValue().id}`}
              color="blue.500"
              fontSize="sm"
              fontWeight="500"
              className="hover:text-blue-600 transition-colors duration-200"
            >
              {info.getValue().name}
            </Link>
          </Flex>
        ),
      }),
      columnHelper.accessor('verifyStatus', {
        id: 'verifyStatus',
        header: () => (
          <Text
            justifyContent="space-between"
            align="center"
            fontSize={{ sm: '10px', lg: '12px' }}
            color="gray.400"
            textTransform="uppercase"
            className="font-semibold"
          >
            Verification Status
          </Text>
        ),
        cell: (info) => (
          <Flex align="center">
            <Select
              value={info.getValue()}
              onChange={(e) =>
                updateVerificationStatus(info.row.original._id, e.target.value)
              }
              size="sm"
              borderRadius="8px"
              borderColor="gray.300"
              className="hover:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            >
              {['Pending', 'Approved', 'Rejected'].map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </Flex>
        ),
      }),
    ],
    [textColor]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: pageSize,
      },
    },
  });

  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value);
    setPageSize(newSize);
    table.setPageSize(newSize);
  };

  // Function to convert data to CSV format
  const convertToCsv = (data) => {
    if (data.length === 0) return '';

    // Define the headers explicitly to control order and display names
    const headers = [
      'S.No', 'Name', 'Phone', 'Aadhar Number', 'DOB', 'Address',
      'Service Provider Name', 'Verification Status'
    ];
    const headerRow = headers.join(',');

    const rows = data.map(item => {
      // Escape commas and wrap in double quotes for fields that might contain them
      const escapeCsv = (field) => {
        if (field === null || field === undefined) return '';
        const stringField = String(field);
        return `"${stringField.replace(/"/g, '""')}"`;
      };

      return [
        escapeCsv(item.serialNo),
        escapeCsv(item.name),
        escapeCsv(item.phone),
        escapeCsv(item.aadharNumber),
        escapeCsv(item.dob),
        escapeCsv(item.address),
        escapeCsv(item.service_provider.name), // Access the name property
        escapeCsv(item.verifyStatus),
        // Image URLs are typically not included in simple CSV exports unless specifically requested
        // You can add item.image and item.adharImage if needed, but they won't be clickable in a CSV
      ].join(',');
    });

    return [headerRow, ...rows].join('\n');
  };

  // Handler for the export button click
  const handleExportCsv = () => {
    const csvContent = convertToCsv(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'pending_workers_data.csv'); // Changed filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Export Successful',
      description: 'Pending worker data has been exported to CSV.',
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'top-right',
    });
  };

  // Generate array of page numbers to display (e.g., 1, 2, 3)
  const getPageNumbers = () => {
    const totalPages = table.getPageCount();
    const currentPage = table.getState().pagination.pageIndex + 1;
    const pageNumbers = [];

    // Simple logic to show up to 3 page numbers around the current page
    const startPage = Math.max(1, currentPage - 1);
    const endPage = Math.min(totalPages, currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  if (loading) {
    return (
      <Card
        flexDirection="column"
        w="100%"
        px="25px"
        py="25px"
        overflowX={{ sm: 'scroll', lg: 'hidden' }}
        borderRadius="20px"
        boxShadow="xl"
        className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900"
      >
        <Text color={textColor} fontSize="22px" fontWeight="700" p="25px" className="text-gray-800 dark:text-gray-100">
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
        boxShadow="xl"
        className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-gray-800 dark:to-gray-900"
        style={{ marginTop: '80px' }}
      >
        <Text color={textColor} fontSize="22px" fontWeight="700" p="25px" className="text-red-600 dark:text-red-400">
          Error: {error}
        </Text>
      </Card>
    );
  }

  return (
    <Card
      flexDirection="column"
      w="100%"
      px="25px"
      py="25px"
      overflowX={{ sm: 'scroll', lg: 'hidden' }}
      borderRadius="20px"
      boxShadow="xl"
      className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900"
      style={{ marginTop: '80px' }}
    >
      <Flex px="0px" mb="20px" justifyContent="space-between" align="center">
        <Text
          color={textColor}
          fontSize="22px"
          fontWeight="700"
          lineHeight="100%"
          className="text-gray-800 dark:text-gray-100"
        >
          Workers
        </Text>
        {/* Export Button */}
        <Button
          onClick={handleExportCsv}
          colorScheme="green"
          leftIcon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>}
          className="bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition-colors duration-200"
        >
          Export 
        </Button>
      </Flex>
      <Box className="overflow-x-auto">
        <Table variant="simple" color="gray.500" mb="24px" mt="12px" className="min-w-full border-separate border-spacing-0">
          <Thead className="bg-gray-100 dark:bg-gray-700">
            {table.getHeaderGroups().map((headerGroup) => (
              <Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <Th
                    key={header.id}
                    colSpan={header.colSpan}
                    pe="10px"
                    borderColor={borderColor}
                    py="12px"
                    className="text-left border-b border-gray-200 dark:border-gray-600 text-gray-400 uppercase font-semibold text-xs lg:text-sm"
                  >
                    <Flex
                      justifyContent="space-between"
                      align="center"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </Flex>
                  </Th>
                ))}
              </Tr>
            ))}
          </Thead>
          <Tbody>
            {table.getRowModel().rows.map((row, index) => (
              <Tr
                key={row.id}
                className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ${
                  index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'
                }`}
              >
                {row.getVisibleCells().map((cell) => (
                  <Td
                    key={cell.id}
                    fontSize={{ sm: '14px' }}
                    minW={{ sm: '150px', md: '200px', lg: 'auto' }}
                    borderColor="transparent"
                    py="12px"
                    className="border-b border-gray-200 dark:border-gray-600"
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
        mt="20px"
        px="10px"
        flexWrap="wrap"
        gap="10px"
      >
        {/*<Flex alignItems="center" gap="10px">
          <Text color={textColor} fontSize="sm" fontWeight="500" className="text-gray-600 dark:text-gray-300">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </Text>
          <Select
            value={pageSize}
            onChange={handlePageSizeChange}
            size="sm"
            borderRadius="8px"
            className="w-32 border-gray-300 hover:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
          </Select>
        </Flex> */}
        <Flex gap="5px" alignItems="center">
          <Button
            onClick={() => table.previousPage()}
            isDisabled={!table.getCanPreviousPage()}
            size="sm"
            colorScheme="teal"
            className="bg-blue-500 text-white font-semibold rounded-lg transition-colors duration-200"
          >
            Prev
          </Button>
          {getPageNumbers().map((pageNum) => (
            <Button
              key={pageNum}
              onClick={() => table.setPageIndex(pageNum - 1)}
              size="sm"
              colorScheme={table.getState().pagination.pageIndex + 1 === pageNum ? 'teal' : 'gray'}
              className={`${
                table.getState().pagination.pageIndex + 1 === pageNum
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500'
              } font-semibold rounded-lg transition-colors duration-200`}
            >
              {pageNum}
            </Button>
          ))}
          <Button
            onClick={() => table.nextPage()}
            isDisabled={!table.getCanNextPage()}
            size="sm"
            colorScheme="teal"
            className="bg-blue-500  text-white font-semibold rounded-lg transition-colors duration-200"
          >
            Next
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
}
