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
  FormControl,
  FormLabel,
  Textarea,
  Select,
  List,
  ListItem,
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
        const response = await axios.get(
          `${baseUrl}api/admin/getAllBothServiceprovider`,
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
            location: user.location.address || 'N/A',
            uniqueId: user.unique_id || 'N/A',
            mobile: user.phone || 'N/A',
            createdAt: user.createdAt
              ? new Date(user.createdAt).toISOString().split('T')[0]
              : 'N/A',
            referral_code: user.referral_code || 'N/A',
            createdBy: user.createdBy?.full_name || 'Self-Registered',
            verified: user.verified ?? false,
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

// Function to toggle user verification
const toggleUserVerified = async (
  baseUrl,
  token,
  userId,
  verified,
  setData,
  setError,
) => {
  try {
    const response = await axios.patch(
      `${baseUrl}api/admin/updateUserverified`,
      { userId, verified: !verified },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (response.data.success) {
      setData((prevData) =>
        prevData.map((user) =>
          user.id === userId ? { ...user, verified: !verified } : user,
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
    setError(
      error.response?.data?.message ||
        'Failed to update user verification status',
    );
    toast.error(
      error.response?.data?.message ||
        'Failed to update user verification status',
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
  const [selectedUser, setSelectedUser] = useState(null);
  const [expandedLocations, setExpandedLocations] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isInactivationModalOpen, setIsInactivationModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedInactivationInfo, setSelectedInactivationInfo] = useState(null);
  const [deactivateReason, setDeactivateReason] = useState('');
  const [disputeId, setDisputeId] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const itemsPerPage = 10;
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
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
          item.createdBy.toLowerCase().includes(lowerQuery) ||
          item.uniqueId.toLowerCase().includes(lowerQuery) ||
          item.categoryName.toLowerCase().includes(lowerQuery),
      );
      setFilteredData(filtered);
    },
    [data],
  );

  // Initialize filteredData with all data
  useEffect(() => {
    setFilteredData(data);
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

  const handleToggleVerified = useCallback(
    async (userId, currentVerified) => {
      if (toggleLoading[userId]) return;
      setToggleLoading((prev) => ({ ...prev, [userId]: true }));
      const success = await toggleUserVerified(
        baseUrl,
        token,
        userId,
        currentVerified,
        setData,
        setError,
      );
      setToggleLoading((prev) => ({ ...prev, [userId]: false }));
      return success;
    },
    [baseUrl, token, setData, setError, toggleLoading],
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
          const subcategoryNames = info.row.original.subcategoryNames;
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
            LOCATION
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
          <Switch
            isChecked={info.getValue()}
            onChange={() =>
              handleToggleVerified(info.row.original.id, info.getValue())
            }
            colorScheme="teal"
            isDisabled={toggleLoading[info.row.original.id]}
          />
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
          <Button
            size="sm"
            colorScheme="teal"
            onClick={() => navigate(`/admin/details/${info.row.original.id}`)}
            whiteSpace="nowrap"
          >
            View Details
          </Button>
        ),
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
          All Service Providers
        </Text>
        <InputGroup
          maxW={{ base: '100%', md: '300px' }}
          mt={{ base: '10px', md: '0' }}
        >
          <InputLeftElement pointerEvents="none">
            <Icon as={SearchIcon} color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search by name, location, mobile, referral, creator, or category"
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
                          onError={(e) =>
                            (e.target.src = '/assets/img/profile/Project3.png')
                          }
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
                                  onError={(e) =>
                                    (e.target.src =
                                      '/assets/img/profile/Project3.png')
                                  }
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
