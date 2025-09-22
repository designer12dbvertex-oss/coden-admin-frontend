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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  Select,
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
            location: user.location?.address || 'N/A',
            uniqueId: user.unique_id || 'N/A',
            mobile: user.phone || 'N/A',
            full_address: Array.isArray(user.full_address) ? user.full_address : [],
            createdAt: user.createdAt
              ? new Date(user.createdAt).toISOString().split('T')[0]
              : 'N/A',
            referral_code: user.referral_code || 'N/A',
            active: user.active ?? true,
            inactivationInfo: user.inactivationInfo || null,
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

// Custom hook for fetching disputes
const useFetchDisputes = (baseUrl, token, userId) => {
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
        setError(error.response?.data?.message || 'Failed to load disputes');
      } finally {
        setLoading(false);
      }
    };
    fetchDisputes();
  }, [baseUrl, token, userId]);

  return { disputes, loading, error };
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [selectedAddresses, setSelectedAddresses] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedInactivationInfo, setSelectedInactivationInfo] = useState(null);
  const [deactivateReason, setDeactivateReason] = useState('');
  const [disputeId, setDisputeId] = useState('');
  const itemsPerPage = 10; // 10 items per page
  const maxVisiblePages = 5; // Show only 5 page numbers
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
  const {
    disputes,
    loading: disputesLoading,
    error: disputesError,
  } = useFetchDisputes(baseUrl, token, selectedUserId);

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
          item.referral_code.toLowerCase().includes(lowerQuery) ||
          // Search in full addresses
          item.full_address.some((addr) =>
            (addr.address?.toLowerCase().includes(lowerQuery) ?? false) ||
            (addr.title?.toLowerCase().includes(lowerQuery) ?? false) ||
            (addr.landmark?.toLowerCase().includes(lowerQuery) ?? false)
          )
      );
      setFilteredData(filtered);
    },
    [data],
  );

  // Initialize filteredData with all data
  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  // Modal handlers for addresses
  const openModal = useCallback((addresses) => {
    setSelectedAddresses(addresses);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedAddresses([]);
  }, []);

  // Modal handlers for deactivation
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

  // Modal handlers for orders
  const openOrdersModal = useCallback((userId, inactivationInfo) => {
    setSelectedUserId(userId);
    setSelectedInactivationInfo(inactivationInfo);
    setIsOrdersModalOpen(true);
  }, []);

  const closeOrdersModal = useCallback(() => {
    setIsOrdersModalOpen(false);
    setSelectedUserId(null);
    setSelectedInactivationInfo(null);
  }, []);

  // Toggle handler for user status
  const handleToggle = useCallback(
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
      toast.error('Reason is required', {
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

  // Pagination logic
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = useMemo(
    () => filteredData.slice(startIndex, endIndex),
    [filteredData, startIndex, endIndex],
  );

  // Calculate visible page numbers (show only 5 pages)
  const getVisiblePageNumbers = useCallback(() => {
    const pages = [];
    const halfWindow = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, currentPage - halfWindow);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust startPage if endPage is at the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // Add ellipsis for start
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('...');
      }
    }
    
    // Add visible page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Add ellipsis for end
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    
    return pages;
  }, [currentPage, totalPages]);

  const goToPage = useCallback(
    (page) => {
      if (page === '...' || page === undefined) return;
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
      // Current Address Column with Read More functionality for full addresses
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
            Current Address
          </Text>
        ),
        cell: (info) => {
          const row = info.row.original;
          const addresses = row.full_address || [];
          const hasMultipleAddresses = addresses.length > 0;
          const currentAddress = info.getValue() || 'N/A';

          return (
            <Flex justify="center" align="center" wrap="nowrap" gap={1}>
              <Text
                color={textColor}
                fontSize="sm"
                fontWeight="600"
                textAlign="center"
                whiteSpace="nowrap"
                maxW="200px"
                isTruncated
                title={currentAddress}
              >
                {currentAddress}
              </Text>
              {hasMultipleAddresses && (
                <Button
                  size="xs"
                  variant="link"
                  colorScheme="teal"
                  onClick={(e) => {
                    e.stopPropagation();
                    openModal(addresses);
                  }}
                  fontSize="xs"
                  _hover={{ textDecoration: 'underline' }}
                  ml={1}
                >
                  Read More
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
          <Flex justify="center" align="center" gap={2}>
            <Switch
              isChecked={info.getValue()}
              onChange={() =>
                handleToggle(info.row.original.id, info.getValue())
              }
              colorScheme="teal"
              isDisabled={toggleLoading[info.row.original.id]}
            />
            {!info.getValue() && info.row.original.inactivationInfo && (
              <Button
                size="xs"
                colorScheme="red"
                variant="outline"
                onClick={() =>
                  openOrdersModal(
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
          <Flex justify="center" align="center">
            <Button
              size="sm"
              colorScheme="teal"
              variant="outline"
              onClick={() =>
                openOrdersModal(
                  info.row.original.id,
                  info.row.original.inactivationInfo,
                )
              }
              _hover={{ bg: 'teal.600', color: 'white' }}
            >
              View More
            </Button>
          </Flex>
        ),
      }),
    ],
    [textColor, handleToggle, toggleLoading, openModal, openOrdersModal, startIndex],
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
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
          <HStack spacing={1}>
            <Button
              size="sm"
              colorScheme="teal"
              onClick={() => goToPage(currentPage - 1)}
              isDisabled={currentPage === 1}
              leftIcon={<ChevronLeftIcon />}
              _hover={{ bg: 'teal.600', color: 'white' }}
            >
              Previous
            </Button>
            
            {/* Render visible page numbers with ellipsis */}
            {getVisiblePageNumbers().map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <Text
                    fontSize="sm"
                    color="gray.500"
                    minW="40px"
                    textAlign="center"
                  >
                    ...
                  </Text>
                ) : (
                  <Button
                    size="sm"
                    colorScheme="teal"
                    variant={currentPage === page ? 'solid' : 'outline'}
                    onClick={() => goToPage(page)}
                    minW="40px"
                    _hover={{ bg: 'teal.600', color: 'white' }}
                  >
                    {page}
                  </Button>
                )}
              </React.Fragment>
            ))}
            
            <Button
              size="sm"
              colorScheme="teal"
              onClick={() => goToPage(currentPage + 1)}
              isDisabled={currentPage === totalPages}
              rightIcon={<ChevronRightIcon />}
              _hover={{ bg: 'teal.600', color: 'white' }}
            >
              Next
            </Button>
          </HStack>
        </Flex>
      </Card>

      {/* Modal for full addresses */}
      <Modal isOpen={isModalOpen} onClose={closeModal} isCentered size="lg">
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent
          maxW={{ base: '90%', md: '800px' }}
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
            All User Addresses
          </ModalHeader>
          <ModalCloseButton color={textColor} />
          <ModalBody py="20px" maxH="500px" overflowY="auto">
            {selectedAddresses.length === 0 ? (
              <Alert status="info" borderRadius="8px">
                <AlertIcon />
                <Text color={textColor} fontSize="sm">
                  No addresses available for this user.
                </Text>
              </Alert>
            ) : (
              <Box>
                <Text fontSize="sm" color="gray.500" mb={4}>
                  Total Addresses: {selectedAddresses.length}
                </Text>
                {selectedAddresses.map((address, index) => (
                  <Box
                    key={address._id || index}
                    mb={4}
                    p={4}
                    border="1px"
                    borderColor={borderColor}
                    borderRadius="12px"
                    bg={useColorModeValue('gray.50', 'gray.700')}
                    _hover={{
                      borderColor: 'teal.300',
                      boxShadow: '0px 2px 8px rgba(0, 128, 128, 0.15)',
                    }}
                    transition="all 0.2s ease"
                  >
                    <Flex justify="space-between" align="center" mb={2}>
                      <Text 
                        fontSize="md" 
                        fontWeight="600" 
                        color={textColor}
                      >
                        {index + 1}. {address.title || `Address ${index + 1}`}
                      </Text>
                      {address.latitude && address.longitude && (
                        <Text 
                          fontSize="xs" 
                          color="gray.500"
                          bg={useColorModeValue('gray.200', 'gray.600')}
                          px={2} 
                          py={1} 
                          borderRadius="4px"
                        >
                          📍 {address.latitude.toFixed(4)}, {address.longitude.toFixed(4)}
                        </Text>
                      )}
                    </Flex>
                    
                    <Box mt={2} pl={4} borderLeft="3px solid" borderLeftColor="teal.300">
                      <Text fontSize="sm" color={textColor} mb={1}>
                        <strong>📍 Address:</strong> {address.address || 'N/A'}
                      </Text>
                      <Text fontSize="sm" color={textColor} mb={1}>
                        <strong>🏷️ Title:</strong> {address.title || 'N/A'}
                      </Text>
                      <Text fontSize="sm" color={textColor} mb={1}>
                        <strong>📌 Landmark:</strong> {address.landmark || 'N/A'}
                      </Text>
                      {address._id && (
                        <Text fontSize="xs" color="gray.500">
                          <strong>ID:</strong> {address._id}
                        </Text>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </ModalBody>
          <ModalFooter borderTop="1px" borderColor={borderColor}>
            <Button
              colorScheme="teal"
              onClick={closeModal}
              borderRadius="12px"
              size="sm"
              _hover={{ bg: 'teal.600' }}
            >
              Close
            </Button>
          </ModalFooter>
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
            Deactivate User
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
                <FormControl isRequired>
                  <FormLabel color={textColor}>Dispute ID</FormLabel>
                  <Select
                    value={disputeId}
                    onChange={(e) => setDisputeId(e.target.value)}
                    placeholder={
                      disputes.length === 0
                        ? 'No disputes available'
                        : 'Select dispute ID'
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
              isDisabled={
                disputesLoading || disputesError 
              }
              _hover={{ bg: 'red.600' }}
            >
              Deactivate
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal for order buttons and inactivation info */}
      <Modal
        isOpen={isOrdersModalOpen}
        onClose={closeOrdersModal}
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
            User Details
          </ModalHeader>
          <ModalCloseButton color={textColor} />
          <ModalBody py="20px">
            {selectedInactivationInfo && (
              <Box
                mb={6}
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
            <Text fontSize="md" fontWeight="600" color={textColor} mb={2}>
              Order Actions
            </Text>
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
                onClick={() =>
                  navigate(`/admin/directOrder/${selectedUserId}`)
                }
                _hover={{ bg: 'teal.600', color: 'white' }}
                w={{ base: '100%', md: 'auto' }}
              >
                Direct Orders
              </Button>
              <Button
                size="sm"
                colorScheme="teal"
                variant="outline"
                onClick={() =>
                  navigate(`/admin/bidding_Order/${selectedUserId}`)
                }
                _hover={{ bg: 'teal.600', color: 'white' }}
                w={{ base: '100%', md: 'auto' }}
              >
                Bidding Orders
              </Button>
              <Button
                size="sm"
                colorScheme="teal"
                variant="outline"
                onClick={() =>
                  navigate(`/admin/emergency_Order/${selectedUserId}`)
                }
                _hover={{ bg: 'teal.600', color: 'white' }}
                w={{ base: '100%', md: 'auto' }}
              >
                Emergency Orders
              </Button>
            </Flex>
          </ModalBody>
          <ModalFooter borderTop="1px" borderColor={borderColor}>
            <Button
              colorScheme="teal"
              onClick={closeOrdersModal}
              borderRadius="12px"
              size="sm"
              _hover={{ bg: 'teal.600' }}
            >
              Close
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
    </>
  );
}
