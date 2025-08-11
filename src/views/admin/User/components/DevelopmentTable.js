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
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
} from '@chakra-ui/react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import Card from 'components/card/Card';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
} from '@chakra-ui/icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import defaultProfilePic from 'assets/img/profile/profile.webp';

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
        const response = await axios.get(`${baseUrl}api/admin/getAllUsers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Fetched users:', response.data.users);
        if (!response.data?.users) {
          throw new Error('Invalid API response: No users found');
        }
        setData(
          response.data.users.map((user) => ({
            id: user._id,
            profile_pic: user.profile_pic
              ? `${baseUrl}${user.profile_pic}`
              : defaultProfilePic,
            full_name: user.full_name
              ? user.full_name
                  .toLowerCase()
                  .split(' ')
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')
              : 'N/A',
            location: user.location.address || 'N/A',
            mobile: user.phone || 'N/A',
            full_address: user.full_address || 'N/A',
            createdAt: user.createdAt
              ? new Date(user.createdAt).toISOString().split('T')[0]
              : 'N/A',
            referral_code: user.referral_code || 'N/A',
            active: user.active ?? true,
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
          localStorage.removeItem('token');
          navigate('/');
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

// Function to toggle user status
const toggleUserStatus = async (
  baseUrl,
  token,
  userId,
  active,
  setData,
  setError,
) => {
  try {
    const response = await axios.patch(
      `${baseUrl}api/admin/updateUserStatus`,
      { userId, active: !active },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    console.log('Toggle response:', response.data);
    if (response.data.success) {
      setData((prevData) =>
        prevData.map((user) =>
          user.id === userId ? { ...user, active: !active } : user,
        ),
      );
      toast.success('User status updated successfully!', {
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
    setError(error.response?.data?.message || 'Failed to update user status');
    toast.error(
      error.response?.data?.message || 'Failed to update user status',
      {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      },
    );
    return false;
  }
};

export default function ComplexTable() {
  const [sorting, setSorting] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [toggleLoading, setToggleLoading] = useState({});
  const [expandedLocations, setExpandedLocations] = useState({});
  const itemsPerPage = 10;
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const headerBg = useColorModeValue('gray.100', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.600');
  const baseUrl = useMemo(() => process.env.REACT_APP_BASE_URL, []);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const { data, loading, error, setData, setError } = useFetchUsers(
    baseUrl,
    token,
    navigate,
  );

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
          item.full_name.toLowerCase().includes(lowerQuery) ||
          item.location.toLowerCase().includes(lowerQuery) ||
          item.mobile.toLowerCase().includes(lowerQuery) ||
          item.referral_code.toLowerCase().includes(lowerQuery),
      );
      setFilteredData(filtered);
    },
    [data],
  );

  // Initialize filteredData with all data
  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  // Toggle handler for read more/less
  const handleToggleLocation = useCallback((userId) => {
    setExpandedLocations((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  }, []);

  const handleToggle = useCallback(
    async (userId, currentActive) => {
      if (toggleLoading[userId]) return;
      setToggleLoading((prev) => ({ ...prev, [userId]: true }));
      const success = await toggleUserStatus(
        baseUrl,
        token,
        userId,
        currentActive,
        setData,
        setError,
      );
      setToggleLoading((prev) => ({ ...prev, [userId]: false }));
      return success;
    },
    [baseUrl, token, setData, setError, toggleLoading],
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
        console.log(`Navigating to page ${newPage}`);
        setCurrentPage(newPage);
      }
    },
    [currentPage, totalPages],
  );

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      console.log(`Resetting page to 1 due to totalPages: ${totalPages}`);
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // Memoized columns
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'sno',
        header: () => (
          <Text
            justifyContent="center"
            align="center"
            fontSize={{ sm: '12px', lg: '14px' }}
            fontWeight="bold"
            color="gray.500"
            textTransform="uppercase"
          >
            S.No
          </Text>
        ),
        cell: ({ row }) => (
          <Text
            color={textColor}
            fontSize="sm"
            fontWeight="600"
            textAlign="center"
          >
            {startIndex + row.index + 1}
          </Text>
        ),
      }),
      columnHelper.accessor('profile_pic', {
        id: 'profile_pic',
        header: () => (
          <Text
            justifyContent="center"
            align="center"
            fontSize={{ sm: '12px', lg: '14px' }}
            fontWeight="bold"
            color="gray.500"
            textTransform="uppercase"
          >
            Profile Pic
          </Text>
        ),
        cell: (info) => (
          <Flex justify="center" align="center">
            {info.getValue() !== 'N/A' ? (
              <img
                src={info.getValue()}
                alt="Profile"
                loading="lazy"
                style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                onError={(e) => (e.target.src = defaultProfilePic)}
              />
            ) : (
              <Text color={textColor} fontSize="sm" fontWeight="600">
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
            justifyContent="center"
            align="center"
            fontSize={{ sm: '12px', lg: '14px' }}
            fontWeight="bold"
            color="gray.500"
            textTransform="uppercase"
          >
            Full Name
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
      columnHelper.accessor('location', {
        id: 'location',
        header: () => (
          <Text
            justifyContent="center"
            align="center"
            fontSize={{ sm: '12px', lg: '14px' }}
            fontWeight="bold"
            color="gray.500"
            textTransform="uppercase"
          >
            Location
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
            <Flex justify="center" align="center" wrap="nowrap">
              <Text
                color={textColor}
                fontSize="sm"
                fontWeight="600"
                textAlign="center"
                whiteSpace={isLongText && !isExpanded ? 'nowrap' : 'normal'}
              >
                {isExpanded || !isLongText ? location : shortText}
              </Text>
              {isLongText && (
                <Button
                  size="xs"
                  variant="link"
                  colorScheme="teal"
                  ml={2}
                  onClick={() => handleToggleLocation(userId)}
                >
                  {isExpanded ? 'Less' : 'More'}
                </Button>
              )}
            </Flex>
          );
        },
      }),
      columnHelper.accessor('full_address', {
        id: 'full_address',
        header: () => (
          <Text
            justifyContent="center"
            align="center"
            fontSize={{ sm: '12px', lg: '14px' }}
            fontWeight="bold"
            color="gray.500"
            textTransform="uppercase"
          >
            Permanent Address
          </Text>
        ),
        cell: (info) => {
          const full_address = info.getValue();
          const userId = info.row.original.id;
          const isExpanded = expandedLocations[userId];
          const isLongText = full_address.length > 30;
          const shortText = isLongText
            ? `${full_address.slice(0, 30)}...`
            : full_address;

          return (
            <Flex justify="center" align="center" wrap="nowrap">
              <Text
                color={textColor}
                fontSize="sm"
                fontWeight="600"
                textAlign="center"
                whiteSpace={isLongText && !isExpanded ? 'nowrap' : 'normal'}
              >
                {isExpanded || !isLongText ? full_address : shortText}
              </Text>
              {isLongText && (
                <Button
                  size="xs"
                  variant="link"
                  colorScheme="teal"
                  ml={2}
                  onClick={() => handleToggleLocation(userId)}
                >
                  {isExpanded ? 'Less' : 'More'}
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
            justifyContent="center"
            align="center"
            fontSize={{ sm: '12px', lg: '14px' }}
            fontWeight="bold"
            color="gray.500"
            textTransform="uppercase"
          >
            Mobile
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
      columnHelper.accessor('referral_code', {
        id: 'referral_code',
        header: () => (
          <Text
            justifyContent="center"
            align="center"
            fontSize={{ sm: '12px', lg: '14px' }}
            fontWeight="bold"
            color="gray.500"
            textTransform="uppercase"
          >
            Referral Code
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
      columnHelper.accessor('createdAt', {
        id: 'createdAt',
        header: () => (
          <Text
            justifyContent="center"
            align="center"
            fontSize={{ sm: '12px', lg: '14px' }}
            fontWeight="bold"
            color="gray.500"
            textTransform="uppercase"
          >
            Created At
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
      columnHelper.accessor('active', {
        id: 'active',
        header: () => (
          <Text
            justifyContent="center"
            align="center"
            fontSize={{ sm: '12px', lg: '14px' }}
            fontWeight="bold"
            color="gray.500"
            textTransform="uppercase"
          >
            Active
          </Text>
        ),
        cell: (info) => (
          <Flex justify="center" align="center">
            <Switch
              isChecked={info.getValue()}
              onChange={() => handleToggle(info.row.original.id, info.getValue())}
              colorScheme="teal"
              isDisabled={toggleLoading[info.row.original.id]}
            />
          </Flex>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: () => (
          <Text
            justifyContent="center"
            align="center"
            fontSize={{ sm: '12px', lg: '14px' }}
            fontWeight="bold"
            color="gray.500"
            textTransform="uppercase"
          >
            Actions
          </Text>
        ),
        cell: (info) => (
          <Flex
            direction={{ base: 'column', md: 'row' }}
            justify="center"
            align="center"
            gap={{ base: 2, md: 3 }}
          >
            <Button
              size="sm"
              colorScheme="teal"
              variant="outline"
              onClick={() => navigate(`/admin/directOrder/${info.row.original.id}`)}
              _hover={{ bg: 'teal.600', color: 'white' }}
            >
              Direct Orders
            </Button>
            <Button
              size="sm"
              colorScheme="teal"
              variant="outline"
              onClick={() => navigate(`/admin/bidding_Order/${info.row.original.id}`)}
              _hover={{ bg: 'teal.600', color: 'white' }}
            >
              Bidding Orders
            </Button>
            <Button
              size="sm"
              colorScheme="teal"
              variant="outline"
              onClick={() => navigate(`/admin/emergency_Order/${info.row.original.id}`)}
              _hover={{ bg: 'teal.600', color: 'white' }}
            >
              Emergency Orders
            </Button>
          </Flex>
        ),
      }),
    ],
    [
      textColor,
      handleToggle,
      toggleLoading,
      expandedLocations,
      handleToggleLocation,
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
      <Card
        w="100%"
        px={{ base: '15px', md: '25px' }}
        py="25px"
        borderRadius="16px"
        boxShadow="0px 4px 20px rgba(0, 0, 0, 0.1)"
        bg={useColorModeValue('white', 'gray.800')}
      >
        <Box textAlign="center" py={10}>
          <Spinner size="lg" color="teal.500" />
          <Text color={textColor} mt={4}>
            Loading users...
          </Text>
        </Box>
      </Card>
    );
  }

  if (error) {
    return (
      <Card
        w="100%"
        px={{ base: '15px', md: '25px' }}
        py="25px"
        borderRadius="16px"
        boxShadow="0px 4px 20px rgba(0, 0, 0, 0.1)"
        bg={useColorModeValue('white', 'gray.800')}
      >
        <Alert status="error" borderRadius="12px">
          <AlertIcon />
          <Text color={textColor}>{error}</Text>
        </Alert>
      </Card>
    );
  }

  return (
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
          lineHeight="100%"
        >
          Users List
        </Text>
        <InputGroup maxW={{ base: '100%', md: '300px' }}>
          <InputLeftElement pointerEvents="none">
            <Icon as={SearchIcon} color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search by name, location, mobile, or referral code"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            borderRadius="12px"
            bg={useColorModeValue('gray.100', 'gray.700')}
            _focus={{
              borderColor: 'teal.500',
              boxShadow: '0 0 0 1px teal.500',
            }}
          />
        </InputGroup>
      </Flex>
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
                    colSpan={header.colSpan}
                    px={{ base: '8px', md: '16px' }}
                    py="12px"
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
                      justifyContent="center"
                      align="center"
                      fontSize={{ sm: '12px', lg: '14px' }}
                      fontWeight="bold"
                      color="gray.500"
                      textTransform="uppercase"
                    >
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
            {table.getRowModel().rows.map((row) => (
              <Tr
                key={row.id}
                _hover={{
                  bg: hoverBg,
                  transition: 'background-color 0.2s ease',
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <Td
                    key={cell.id}
                    fontSize={{ sm: '14px' }}
                    px={{ base: '8px', md: '16px' }}
                    py="12px"
                    borderColor={borderColor}
                    whiteSpace="nowrap"
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
        px={{ base: '10px', md: '25px' }}
        py="10px"
        borderTopWidth="1px"
        borderColor={borderColor}
      >
        <Text fontSize="sm" color={textColor}>
          Showing {totalItems === 0 ? 0 : startIndex + 1} to{' '}
          {Math.min(endIndex, totalItems)} of {totalItems} users
        </Text>
        <HStack spacing={2}>
          <Button
            size="sm"
            colorScheme="teal"
            variant="outline"
            onClick={() => goToPage(currentPage - 1)}
            isDisabled={currentPage === 1}
            leftIcon={<ChevronLeftIcon />}
            _hover={{ bg: 'teal.600', color: 'white' }}
          >
            Previous
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              size="sm"
              colorScheme="teal"
              variant={currentPage === page ? 'solid' : 'outline'}
              onClick={() => goToPage(page)}
              _hover={{ bg: 'teal.600', color: 'white' }}
            >
              {page}
            </Button>
          ))}
          <Button
            size="sm"
            colorScheme="teal"
            variant="outline"
            onClick={() => goToPage(currentPage + 1)}
            isDisabled={currentPage === totalPages}
            rightIcon={<ChevronRightIcon />}
            _hover={{ bg: 'teal.600', color: 'white' }}
          >
            Next
          </Button>
        </HStack>
      </Flex>
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
