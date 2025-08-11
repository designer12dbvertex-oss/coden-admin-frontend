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
  useDisclosure,
  Image,
  VStack,
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
            mobile: user.phone || 'N/A',
            createdAt: user.createdAt
              ? new Date(user.createdAt).toISOString().split('T')[0]
              : 'N/A',
            referral_code: user.referral_code || 'N/A',
            createdBy: user.createdBy?.full_name || 'Self-Registered',
            verified: user.verified ?? false,
            active: user.active ?? true,
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

  // Handle search filtering
  const handleSearch = useCallback(
    (query) => {
      setSearchQuery(query);
      setCurrentPage(1); // Reset to first page on search
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
          item.createdBy.toLowerCase().includes(lowerQuery),
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

  const handleToggleStatus = useCallback(
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
          <Text color={textColor} fontSize="sm" fontWeight="700">
            {startIndex + info.row.index + 1}
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
          <Flex align="center">
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
          <Text color={textColor} fontSize="sm" fontWeight="700">
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
          <Text color={textColor} fontSize="sm" fontWeight="700">
            {info.getValue()}
          </Text>
        ),
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
          <Text color={textColor} fontSize="sm" fontWeight="700">
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
          <Text color={textColor} fontSize="sm" fontWeight="700">
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
          <Text color={textColor} fontSize="sm" fontWeight="700">
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
          <Switch
            isChecked={info.getValue()}
            onChange={() =>
              handleToggleStatus(info.row.original.id, info.getValue())
            }
            colorScheme="teal"
            isDisabled={toggleLoading[info.row.original.id]}
          />
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
      overflowX={{ sm: 'scroll', lg: 'hidden' }}
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
          All Service Provider List
        </Text>
        <InputGroup
          maxW={{ base: '100%', md: '300px' }}
          mt={{ base: '10px', md: '0' }}
        >
          <InputLeftElement pointerEvents="none">
            <Icon as={SearchIcon} color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search by name, location, mobile, referral, or creator"
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
      <Box>
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
                    minW={{ sm: '150px', md: '200px', lg: 'auto' }}
                    borderColor="transparent"
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
          {totalItems} entries
        </Text>
        <HStack>
          <Button
            size="sm"
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
              onClick={() => goToPage(page)}
              variant={currentPage === page ? 'solid' : 'outline'}
            >
              {page}
            </Button>
          ))}
          <Button
            size="sm"
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
                  {new Date(selectedUser.createdAt).toLocaleString()}
                </Text>
                <Text>
                  <strong>Updated At:</strong>{' '}
                  {new Date(selectedUser.updatedAt).toLocaleString()}
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
