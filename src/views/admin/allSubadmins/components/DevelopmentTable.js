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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
  Image,
  Switch,
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
  EditIcon,
  SearchIcon,
} from '@chakra-ui/icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import defaultProfilePic from 'assets/img/profile/profile.webp';

const columnHelper = createColumnHelper();

// Custom hook for fetching subadmins
const useFetchSubadmins = (baseUrl, token, navigate) => {
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
          `${baseUrl}api/admin/getAllSubadmins`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        console.log('Fetched subadmins:', response.data.data);
        if (!response.data?.data) {
          throw new Error('Invalid API response: No subadmins found');
        }
        setData(
          response.data.data.map((subadmin) => ({
            id: subadmin._id,
            profile_pic: subadmin.profile_pic || defaultProfilePic,
            full_name: subadmin.full_name
              ? subadmin.full_name
                  .toLowerCase()
                  .split(' ')
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')
              : 'N/A',
            email: subadmin.email || 'N/A',
            phone: subadmin.phone || 'N/A',
            role: subadmin.role || 'N/A',
            createdAt: subadmin.createdAt
              ? new Date(subadmin.createdAt).toISOString().split('T')[0]
              : 'N/A',
            active: subadmin.active !== undefined ? subadmin.active : false,
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

  return { data, loading, error, setData };
};

// Function to update subadmin
const updateSubadmin = async (
  baseUrl,
  token,
  subadminId,
  updatedData,
  profilePicFile,
  setData,
  setError,
) => {
  try {
    const formData = new FormData();
    formData.append('subadminId', subadminId);
    formData.append('full_name', updatedData.full_name);
    formData.append('email', updatedData.email);
    formData.append('phone', updatedData.phone);
    if (profilePicFile) {
      formData.append('profile_pic', profilePicFile);
    }

    const response = await axios.patch(
      `${baseUrl}api/admin/updateSubadmin`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    console.log('Update response:', response.data);
    if (response.data.status) {
      setData((prevData) =>
        prevData.map((subadmin) =>
          subadmin.id === subadminId
            ? {
                ...subadmin,
                ...updatedData,
                profile_pic:
                  response.data.data?.profile_pic || subadmin.profile_pic,
              }
            : subadmin,
        ),
      );
      return true;
    } else {
      throw new Error('Failed to update subadmin');
    }
  } catch (error) {
    console.error('Error updating subadmin:', error);
    setError(error.response?.data?.message || 'Failed to update subadmin');
    return false;
  }
};

// Function to toggle subadmin status
const toggleSubadminStatus = async (
  baseUrl,
  token,
  subadminId,
  setData,
  setError,
) => {
  try {
    const response = await axios.patch(
      `${baseUrl}api/admin/toggleSubadminStatus/${subadminId}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    console.log('Toggle response:', response.data);
    if (response.data.status) {
      setData((prevData) =>
        prevData.map((subadmin) =>
          subadmin.id === subadminId
            ? { ...subadmin, active: response.data.data.active }
            : subadmin,
        ),
      );
      toast.success(response.data.message, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return true;
    } else {
      throw new Error('Failed to toggle subadmin status');
    }
  } catch (error) {
    console.error('Error toggling subadmin status:', error);
    setError(
      error.response?.data?.message || 'Failed to toggle subadmin status',
    );
    toast.error(
      error.response?.data?.message || 'Failed to toggle subadmin status',
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

export default function SubadminTable() {
  const [sorting, setSorting] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [selectedSubadmin, setSelectedSubadmin] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
  });
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [formError, setFormError] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const itemsPerPage = 10;
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const baseUrl = useMemo(() => process.env.REACT_APP_BASE_URL, []);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const { data, loading, error, setData } = useFetchSubadmins(
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
          item.email.toLowerCase().includes(lowerQuery) ||
          item.phone.toLowerCase().includes(lowerQuery) ||
          item.createdAt.toLowerCase().includes(lowerQuery),
      );
      setFilteredData(filtered);
    },
    [data],
  );

  // Initialize filteredData with all data
  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  // Handle toggle switch change
  const handleToggleStatus = async (subadminId) => {
    await toggleSubadminStatus(
      baseUrl,
      token,
      subadminId,
      setData,
      setFormError,
    );
  };

  // Handle opening edit modal
  const handleEditClick = (subadmin) => {
    setSelectedSubadmin(subadmin);
    setFormData({
      full_name: subadmin.full_name,
      email: subadmin.email,
      phone: subadmin.phone,
    });
    setProfilePicFile(null);
    setProfilePicPreview(subadmin.profile_pic);
    setFormError(null);
    onOpen();
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      setProfilePicPreview(URL.createObjectURL(file));
    }
  };

  // Clean up preview URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (profilePicPreview && profilePicPreview.startsWith('blob:')) {
        URL.revokeObjectURL(profilePicPreview);
      }
    };
  }, [profilePicPreview]);

  // Handle form submission
  const handleSave = async () => {
    if (!formData.full_name || !formData.email || !formData.phone) {
      setFormError('Full name, email, and phone are required');
      toast.error('Full name, email, and phone are required', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }
    const success = await updateSubadmin(
      baseUrl,
      token,
      selectedSubadmin.id,
      formData,
      profilePicFile,
      setData,
      setFormError,
    );
    if (success) {
      toast.success('Subadmin updated successfully!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setProfilePicFile(null);
      setProfilePicPreview(null);
      onClose();
    } else {
      toast.error(formError || 'Failed to update subadmin', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  // Pagination logic
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = useMemo(
    () => filteredData.slice(startIndex, endIndex),
    [filteredData, startIndex, endIndex],
  );

  // Handle page navigation with validation
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

  // Reset page to 1 when data changes significantly
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      console.log(`Resetting page to 1 due to totalPages: ${totalPages}`);
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // Memoized columns
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
              <Image
                src={info.getValue()}
                alt="Profile"
                loading="lazy"
                boxSize="50px"
                borderRadius="50%"
                objectFit="cover"
                fallbackSrc={defaultProfilePic}
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
      columnHelper.accessor('email', {
        id: 'email',
        header: () => (
          <Text
            justifyContent="space-between"
            align="center"
            fontSize={{ sm: '10px', lg: '12px' }}
            color="gray.400"
          >
            EMAIL
          </Text>
        ),
        cell: (info) => (
          <Text color={textColor} fontSize="sm" fontWeight="700">
            {info.getValue()}
          </Text>
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
          >
            PHONE
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
            STATUS
          </Text>
        ),
        cell: (info) => (
          <Flex align="center">
            <Switch
              isChecked={info.getValue()}
              onChange={() => handleToggleStatus(info.row.original.id)}
              colorScheme="teal"
            />
            <Text color={textColor} fontSize="sm" fontWeight="700" ml={2}>
              {info.getValue() ? 'Active' : 'Inactive'}
            </Text>
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
            leftIcon={<EditIcon />}
            onClick={() => handleEditClick(info.row.original)}
          >
            Edit
          </Button>
        ),
      }),
    ],
    [textColor, handleToggleStatus, handleEditClick, startIndex],
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
        gap={{ base: '10px', md: '0' }}
      >
        <Text
          color={textColor}
          fontSize={{ base: 'xl', md: '22px' }}
          fontWeight="700"
          lineHeight="100%"
        >
          Subadmins List
        </Text>
        <InputGroup maxW={{ base: '100%', md: '300px' }}>
          <InputLeftElement pointerEvents="none">
            <Icon as={SearchIcon} color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search by name, email, phone, or created date"
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
        <Flex align="center" gap="10px" w={{ base: '100%', md: 'auto' }}>
          <Button
            colorScheme="teal"
            onClick={() => navigate('/admin/createSubadmin')}
            w={{ base: '100%', md: 'auto' }}
          >
            Create Subadmin
          </Button>
        </Flex>
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
                    cursor={header.column.getCanSort() ? 'pointer' : 'default'}
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
          {totalItems} subadmins
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
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Subadmin</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {formError && (
              <Alert status="error" mb={4}>
                <AlertIcon />
                {formError}
              </Alert>
            )}
            <FormControl mb={4}>
              <FormLabel>Profile Picture</FormLabel>
              {profilePicPreview && (
                <Image
                  src={profilePicPreview}
                  alt="Profile Preview"
                  boxSize="100px"
                  borderRadius="50%"
                  objectFit="cover"
                  mb={4}
                  fallbackSrc={defaultProfilePic}
                />
              )}
              <Input type="file" accept="image/*" onChange={handleFileChange} />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Full Name</FormLabel>
              <Input
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder="Enter full name"
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Email</FormLabel>
              <Input
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email"
                type="email"
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Phone</FormLabel>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter phone number"
                type="tel"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" mr={3} onClick={handleSave}>
              Save
            </Button>
            <Button variant="light" onClick={onClose}>
              Cancel
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
