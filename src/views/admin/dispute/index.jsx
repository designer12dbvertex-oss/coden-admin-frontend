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
} from '@chakra-ui/icons';

// Custom components
import Card from 'components/card/Card';

const columnHelper = createColumnHelper();

export default function DisputesTable() {
  const [data, setData] = React.useState([]);
  const [filteredData, setFilteredData] = React.useState([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [updateForm, setUpdateForm] = React.useState({
    disputeId: '',
    status: '',
  });
  const [formErrors, setFormErrors] = React.useState({ status: '' });
  const [currentPage, setCurrentPage] = React.useState(1);
  const [activeFilter, setActiveFilter] = React.useState('all'); // 'all', 'direct', 'bidding', 'emergency'
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
      console.log('API Response (Disputes):', response.data);

      if (!response.data || !Array.isArray(response.data.disputes)) {
        throw new Error(
          'Invalid response format: Expected an array of disputes',
        );
      }

      const formattedData = response.data.disputes.map((item) => ({
        id: item._id,
        order_id: item.order_id || 'N/A',
        project_id: item.order_details?.project_id || 'N/A',
        flow_type: item.flow_type
          ? item.flow_type
              .toLowerCase()
              .split(' ')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')
          : 'N/A',
        flow_type_raw: item.flow_type || 'N/A', // Store raw flow_type for filtering
        raised_by: item.raised_by?.full_name || 'N/A',
        raised_by_id: item.raised_by?._id || 'N/A', // Add user ID for raised_by
        against: item.against?.full_name || 'N/A',
        against_id: item.against?._id || 'N/A', // Add user ID for against
        amount: item.amount ? `₹${item.amount}` : 'N/A',
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
      setFilteredData(formattedData); // Initially show all disputes
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

  // Handle search filtering
  const handleSearch = React.useCallback(
    (query) => {
      setSearchQuery(query);
      setCurrentPage(1); // Reset to first page on search
      let filtered = data;

      // Apply flow type filter first
      if (activeFilter !== 'all') {
        filtered = data.filter(
          (item) => item.flow_type_raw.toLowerCase() === activeFilter,
        );
      }

      // Apply search filter
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

  // Update dispute status
  const updateDisputeStatus = async () => {
    setFormErrors({ status: '' });

    if (!updateForm.disputeId || !updateForm.status) {
      setFormErrors({ status: 'Please select a dispute and status' });
      return;
    }

    try {
      if (!baseUrl || !token) {
        throw new Error('Missing base URL or authentication token');
      }

      const response = await axios.patch(
        `${baseUrl}api/dispute/updateDisputeStatus/${updateForm.disputeId}`,
        { status: updateForm.status },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      console.log('Update Dispute Status Response:', response.data);
      toast({
        title: 'Success',
        description: 'Dispute status updated successfully!',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      await fetchDisputes();
      setUpdateForm({ disputeId: '', status: '' });
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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateForm((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // Handle dispute selection for status update
  const handleDisputeSelect = (disputeId) => {
    setUpdateForm((prev) => ({ ...prev, disputeId }));
    setFormErrors((prev) => ({ ...prev, status: '' }));
  };

  // Handle filter button click
  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1); // Reset to first page on filter change
    setSearchQuery(''); // Clear search query on filter change
    if (filter === 'all') {
      setFilteredData(data);
    } else {
      setFilteredData(
        data.filter((item) => item.flow_type_raw.toLowerCase() === filter),
      );
    }
  };

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
        cell: (info) => (
          <Flex align="center">
            <Text color={textColor} fontSize="sm" fontWeight="400">
              {info.getValue()}
            </Text>
          </Flex>
        ),
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
                textDecoration="underline"
                fontSize="sm"
                fontWeight="400"
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
                textDecoration="underline"
                fontSize="sm"
                fontWeight="400"
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
        cell: (info) => (
          <Flex align="center">
            <Text color={textColor} fontSize="sm" fontWeight="400">
              {info.getValue()}
            </Text>
          </Flex>
        ),
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
            <Text color={textColor} fontSize="sm" fontWeight="400">
              {info.getValue()}
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
        cell: (info) => (
          <Button
            size="sm"
            colorScheme="teal"
            onClick={() => handleDisputeSelect(info.row.original.id)}
          >
            Update Status
          </Button>
        ),
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
        <Text
          color={textColor}
          fontSize={{ base: 'xl', md: '22px' }}
          fontWeight="700"
          lineHeight="100%"
        >
          Disputes
        </Text>
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
          </HStack>
        </Flex>
      </Flex>
      <Box mb="30px">
        <Flex direction="column" gap="4">
          <FormControl isInvalid={!!formErrors.status}>
            <FormLabel fontSize="sm" fontWeight="500" color={textColor}>
              Update Dispute Status
            </FormLabel>
            <Select
              name="status"
              value={updateForm.status}
              onChange={handleInputChange}
              placeholder="Select status"
              borderRadius="8px"
              borderColor="gray.300"
              _focus={{
                borderColor: 'blue.500',
                boxShadow: '0 0 0 1px blue.500',
              }}
              isDisabled={!updateForm.disputeId}
            >
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </Select>
            {formErrors.status && (
              <FormErrorMessage>{formErrors.status}</FormErrorMessage>
            )}
          </FormControl>
          <Button
            colorScheme="teal"
            onClick={updateDisputeStatus}
            borderRadius="12px"
            fontSize="sm"
            fontWeight="600"
            textTransform="uppercase"
            bg="teal.600"
            _hover={{ bg: 'teal.700' }}
            _active={{ bg: 'teal.800' }}
            isDisabled={!updateForm.disputeId}
          >
            Update Status
          </Button>
        </Flex>
      </Box>
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
              <Tr key={row.id}>
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
    </Card>
  );
}
