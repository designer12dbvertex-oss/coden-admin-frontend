/* eslint-disable */
'use client';

import {
  Box,
  Button,
  Flex,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  VStack,
  Divider,
  Grid,
  GridItem,
  Card as ChakraCard,
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
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import axios from 'axios';
import * as React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SearchIcon } from '@chakra-ui/icons';

// Custom components
import Card from 'components/card/Card';

const columnHelper = createColumnHelper();

export default function OrdersTable() {
  const [sorting, setSorting] = React.useState([]);
  const [data, setData] = React.useState([]);
  const [filteredData, setFilteredData] = React.useState([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [selectedOrder, setSelectedOrder] = React.useState(null);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const {
    isOpen: isDetailsOpen,
    onOpen: onDetailsOpen,
    onClose: onDetailsClose,
  } = useDisclosure();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const navigate = useNavigate();

  // Fetch orders from API
  const baseUrl = process.env.REACT_APP_BASE_URL;
  const token = localStorage.getItem('token');

  React.useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!baseUrl || !token) {
          throw new Error('Missing base URL or authentication token');
        }
        const response = await axios.get(
          `${baseUrl}api/bidding-order/getAllBiddingOrders`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (!response.data || !Array.isArray(response.data.data)) {
          throw new Error(
            'Invalid response format: Expected an array of orders',
          );
        }

        const formattedData = response.data.data.map((item) => ({
          id: item._id || '',
          orderId: item.project_id || '',
          customerName: item.user_id?.full_name || 'Unknown',
          customerId: item.user_id?._id || '',
          serviceProvider: item.service_provider_id?.full_name || 'N/A',
          serviceProviderId: item.service_provider_id?._id || '',
          totalAmount: item.service_payment?.total_expected || 0,
          paidAmount: item.service_payment?.amount || 0,
          remainingAmount: item.remaining_amount?.amount || 0,
          paymentStatus: item.payment_status || 'Unknown',
          hireStatus: item.hire_status || 'Unknown',
          createdAt: item.createdAt
            ? new Date(item.createdAt).toLocaleDateString()
            : '',
          address: item.address || 'N/A',
          title: item.title || 'N/A',
          description: item.description || 'N/A',
          deadline: item.deadline
            ? new Date(item.deadline).toLocaleDateString()
            : 'N/A',
          paymentHistory: item.service_payment?.payment_history || [],
        }));

        setData(formattedData);
        setFilteredData(formattedData);
        setLoading(false);
      } catch (err) {
        console.error('Fetch Orders Error:', err);
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
          setError(err.message || 'Failed to fetch orders');
          setLoading(false);
        }
      }
    };

    fetchOrders();
  }, [baseUrl, token, navigate]);

  // Handle search filtering
  const handleSearch = React.useCallback(
    (query) => {
      setSearchQuery(query);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
      if (!query) {
        setFilteredData(data);
        return;
      }
      const lowerQuery = query.toLowerCase();
      const filtered = data.filter(
        (item) =>
          item.orderId.toLowerCase().includes(lowerQuery) ||
          item.customerName.toLowerCase().includes(lowerQuery) ||
          item.serviceProvider.toLowerCase().includes(lowerQuery) ||
          item.paymentStatus.toLowerCase().includes(lowerQuery) ||
          item.hireStatus.toLowerCase().includes(lowerQuery) ||
          item.createdAt.toLowerCase().includes(lowerQuery),
      );
      setFilteredData(filtered);
    },
    [data],
  );

  // Handle view details click
  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    onDetailsOpen();
  };

  // Status color mapping
  const getStatusStyles = (status, type) => {
    if (type === 'hireStatus') {
      switch (status.toLowerCase()) {
        case 'accepted':
          return { bg: 'green.100', color: 'green.800' };
        case 'pending':
          return { bg: 'yellow.100', color: 'yellow.800' };
        case 'rejected':
          return { bg: 'red.100', color: 'red.800' };
        case 'completed':
          return { bg: 'green.100', color: 'green.800' };
        case 'cancelled':
          return { bg: 'red.100', color: 'red.800' };
        case 'cancelledDispute':
          return { bg: 'red.100', color: 'red.800' };
        default:
          return { bg: 'gray.100', color: 'gray.800' };
      }
    } else if (type === 'paymentStatus') {
      switch (status.toLowerCase()) {
        case 'success':
          return { bg: 'green.100', color: 'green.800' };
        case 'pending':
          return { bg: 'yellow.100', color: 'yellow.800' };
        case 'failed':
          return { bg: 'red.100', color: 'red.800' };
        default:
          return { bg: 'gray.100', color: 'gray.800' };
      }
    }
    return { bg: 'gray.100', color: 'gray.800' };
  };

  const columns = [
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
    columnHelper.accessor('orderId', {
      id: 'orderId',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          PROJECT ID
        </Text>
      ),
      cell: (info) => (
        <Flex align="center">
          <Text color={textColor} fontSize="sm" fontWeight="700">
            {info.getValue()}
          </Text>
        </Flex>
      ),
    }),
    columnHelper.accessor('customerName', {
      id: 'customerName',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          CUSTOMER
        </Text>
      ),
      cell: (info) => (
        <Flex align="center">
          {info.row.original.customerId ? (
            <Link to={`/admin/Dispute/UserDetails/${info.row.original.customerId}`}>
              <Text
                color="blue.500"
                fontSize="sm"
                fontWeight="700"
                _hover={{ textDecoration: 'underline' }}
              >
                {info.getValue()}
              </Text>
            </Link>
          ) : (
            <Text color={textColor} fontSize="sm" fontWeight="700">
              {info.getValue()}
            </Text>
          )}
        </Flex>
      ),
    }),
    columnHelper.accessor('serviceProvider', {
      id: 'serviceProvider',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          SERVICE PROVIDER
        </Text>
      ),
      cell: (info) => (
        <Flex align="center">
          {info.row.original.serviceProviderId ? (
            <Link to={`/admin/Dispute/UserDetails/${info.row.original.serviceProviderId}`}>
              <Text
                color="blue.500"
                fontSize="sm"
                fontWeight="700"
                _hover={{ textDecoration: 'underline' }}
              >
                {info.getValue()}
              </Text>
            </Link>
          ) : (
            <Text color={textColor} fontSize="sm" fontWeight="700">
              {info.getValue()}
            </Text>
          )}
        </Flex>
      ),
    }),
    columnHelper.accessor('paidAmount', {
      id: 'paidAmount',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          PAID AMOUNT
        </Text>
      ),
      cell: (info) => (
        <Flex align="center">
          <Text color={textColor} fontSize="sm" fontWeight="700">
            ₹{info.getValue().toLocaleString()}
          </Text>
        </Flex>
      ),
    }),
    columnHelper.accessor('hireStatus', {
      id: 'hireStatus',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          HIRE STATUS
        </Text>
      ),
      cell: (info) => {
        const { bg, color } = getStatusStyles(info.getValue(), 'hireStatus');
        return (
          <Flex align="center" bg={bg} px={2} py={1} borderRadius="md">
            <Text fontSize="sm" color={color}>
              {info.getValue()}
            </Text>
          </Flex>
        );
      },
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
        <Flex align="center">
          <Text color={textColor} fontSize="sm" fontWeight="700">
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
        >
          ACTIONS
        </Text>
      ),
      cell: ({ row }) => (
        <Flex align="center" gap="2">
          <Button
            colorScheme="teal"
            size="sm"
            onClick={() => navigate(`/admin/biddingOrder/${row.original.id}`)}
          >
            View Details
          </Button>
        </Flex>
      ),
    }),
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: process.env.NODE_ENV === 'development',
  });

  if (loading) {
    return (
      <Card
        flexDirection="column"
        w="100%"
        px="0px"
        style={{ marginTop: '100px' }}
        overflowX={{ sm: 'scroll', lg: 'hidden' }}
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
        px="0px"
        style={{ marginTop: '100px' }}
        overflowX={{ sm: 'scroll', lg: 'hidden' }}
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
        px="0px"
        style={{ marginTop: '100px' }}
        overflowX={{ sm: 'scroll', lg: 'hidden' }}
      >
        <Flex
          px="25px"
          mb="20px"
          justify="space-between"
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
            Bidding Orders
          </Text>
          <InputGroup maxW={{ base: '100%', md: '300px' }}>
            <InputLeftElement pointerEvents="none">
              <Icon as={SearchIcon} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search by ID, customer, provider, status, or date"
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
          <Table variant="simple" color="gray.500" mb="24px">
            <Thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <Tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <Th
                      key={header.id}
                      colSpan={header.colSpan}
                      pe="10px"
                      borderColor={borderColor}
                      cursor={
                        header.column.getCanSort() ? 'pointer' : 'default'
                      }
                      onClick={header.column.getToggleSortingHandler()}
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
                        {{
                          asc22px: ' 🔼',
                          desc: ' 🔽',
                        }[header.column.getIsSorted()] ?? null}
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
                      borderColor={borderColor}
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
        {/* Pagination Controls */}
        <Flex
          justify="space-between"
          align="center"
          px="25px"
          py="10px"
          borderTopWidth="1px"
          borderColor={borderColor}
        >
          <Flex align="center" gap="2">
            <Button
              size="sm"
              colorScheme="teal"
              onClick={() => table.previousPage()}
              isDisabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              size="sm"
              colorScheme="teal"
              onClick={() => table.nextPage()}
              isDisabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </Flex>
          <Text fontSize="sm" color={textColor}>
            Showing{' '}
            {table.getState().pagination.pageIndex *
              table.getState().pagination.pageSize +
              1}{' '}
            to{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) *
                table.getState().pagination.pageSize,
              filteredData.length,
            )}{' '}
            of {filteredData.length} orders
          </Text>
        </Flex>
      </Card>

      {/* Details Modal */}
      {selectedOrder && (
        <Modal isOpen={isDetailsOpen} onClose={onDetailsClose} size="lg">
          <ModalOverlay />
          <ModalContent
            borderRadius="xl"
            boxShadow="2xl"
            p={4}
            bg={useColorModeValue('white', 'gray.800')}
          >
            <ModalHeader
              fontSize="2xl"
              fontWeight="bold"
              color={textColor}
              textAlign="center"
            >
              Bidding Order Details
            </ModalHeader>
            <ModalCloseButton
              size="lg"
              _hover={{ bg: 'gray.100', transform: 'scale(1.1)' }}
              transition="all 0.2s ease-in-out"
            />
            <ModalBody>
              <ChakraCard
                p={4}
                boxShadow="md"
                borderRadius="lg"
                bg={useColorModeValue('gray.50', 'gray.700')}
              >
                <VStack spacing={4} align="stretch">
                  <Grid
                    templateColumns={{ base: '1fr', md: '150px 1fr' }}
                    gap={4}
                  >
                    <GridItem>
                      <Text fontWeight="semibold" color={textColor}>
                        Order ID:
                      </Text>
                    </GridItem>
                    <GridItem>
                      <Text color={textColor}>{selectedOrder.orderId}</Text>
                    </GridItem>

                    <GridItem>
                      <Text fontWeight="semibold" color={textColor}>
                        Customer:
                      </Text>
                    </GridItem>
                    <GridItem>
                      {selectedOrder.customerId ? (
                        <Link to={`/admin/Dispute/UserDetails/${selectedOrder.customerId}`}>
                          <Text
                            color="blue.500"
                            _hover={{ textDecoration: 'underline' }}
                          >
                            {selectedOrder.customerName}
                          </Text>
                        </Link>
                      ) : (
                        <Text color={textColor}>{selectedOrder.customerName}</Text>
                      )}
                    </GridItem>

                    <GridItem>
                      <Text fontWeight="semibold" color={textColor}>
                        Service Provider:
                      </Text>
                    </GridItem>
                    <GridItem>
                      {selectedOrder.serviceProviderId ? (
                        <Link to={`/admin/Dispute/UserDetails/${selectedOrder.serviceProviderId}`}>
                          <Text
                            color="blue.500"
                            _hover={{ textDecoration: 'underline' }}
                          >
                            {selectedOrder.serviceProvider}
                          </Text>
                        </Link>
                      ) : (
                        <Text color={textColor}>{selectedOrder.serviceProvider}</Text>
                      )}
                    </GridItem>

                    <GridItem>
                      <Text fontWeight="semibold" color={textColor}>
                        Title:
                      </Text>
                    </GridItem>
                    <GridItem>
                      <Text color={textColor}>{selectedOrder.title}</Text>
                    </GridItem>

                    <GridItem>
                      <Text fontWeight="semibold" color={textColor}>
                        Description:
                      </Text>
                    </GridItem>
                    <GridItem>
                      <Text color={textColor}>{selectedOrder.description}</Text>
                    </GridItem>

                    <GridItem>
                      <Text fontWeight="semibold" color={textColor}>
                        Address:
                      </Text>
                    </GridItem>
                    <GridItem>
                      <Text color={textColor}>{selectedOrder.address}</Text>
                    </GridItem>

                    <GridItem>
                      <Text fontWeight="semibold" color={textColor}>
                        Total Amount:
                      </Text>
                    </GridItem>
                    <GridItem>
                      <Text color={textColor}>
                        ₹{selectedOrder.totalAmount.toLocaleString()}
                      </Text>
                    </GridItem>

                    <GridItem>
                      <Text fontWeight="semibold" color={textColor}>
                        Paid Amount:
                      </Text>
                    </GridItem>
                    <GridItem>
                      <Text color={textColor}>
                        ₹{selectedOrder.paidAmount.toLocaleString()}
                      </Text>
                    </GridItem>

                    <GridItem>
                      <Text fontWeight="semibold" color={textColor}>
                        Payment Status:
                      </Text>
                    </GridItem>
                    <GridItem>
                      <Flex
                        align="center"
                        bg={
                          getStatusStyles(
                            selectedOrder.paymentStatus,
                            'paymentStatus',
                          ).bg
                        }
                        px={2}
                        py={1}
                        borderRadius="md"
                      >
                        <Text
                          fontSize="sm"
                          color={
                            getStatusStyles(
                              selectedOrder.paymentStatus,
                              'paymentStatus',
                            ).color
                          }
                        >
                          {selectedOrder.paymentStatus}
                        </Text>
                      </Flex>
                    </GridItem>

                    <GridItem>
                      <Text fontWeight="semibold" color={textColor}>
                        Hire Status:
                      </Text>
                    </GridItem>
                    <GridItem>
                      <Flex
                        align="center"
                        bg={
                          getStatusStyles(
                            selectedOrder.hireStatus,
                            'hireStatus',
                          ).bg
                        }
                        px={2}
                        py={1}
                        borderRadius="md"
                      >
                        <Text
                          fontSize="sm"
                          color={
                            getStatusStyles(
                              selectedOrder.hireStatus,
                              'hireStatus',
                            ).color
                          }
                        >
                          {selectedOrder.hireStatus}
                        </Text>
                      </Flex>
                    </GridItem>

                    <GridItem>
                      <Text fontWeight="semibold" color={textColor}>
                        Created At:
                      </Text>
                    </GridItem>
                    <GridItem>
                      <Text color={textColor}>{selectedOrder.createdAt}</Text>
                    </GridItem>

                    <GridItem>
                      <Text fontWeight="semibold" color={textColor}>
                        Deadline:
                      </Text>
                    </GridItem>
                    <GridItem>
                      <Text color={textColor}>{selectedOrder.deadline}</Text>
                    </GridItem>
                  </Grid>

                  <Divider />

                  <Text fontWeight="bold" fontSize="lg" color={textColor}>
                    Payment History
                  </Text>
                  {selectedOrder.paymentHistory.length > 0 ? (
                    <VStack spacing={3} align="stretch">
                      {selectedOrder.paymentHistory.map((payment, index) => (
                        <ChakraCard
                          key={index}
                          p={3}
                          boxShadow="sm"
                          borderRadius="md"
                          bg={useColorModeValue('white', 'gray.600')}
                        >
                          <Text color={textColor}>
                            <strong>Payment {index + 1}:</strong> ₹
                            {payment.amount.toLocaleString()} -{' '}
                            {payment.description} ({payment.status}) on{' '}
                            {new Date(payment.date).toLocaleDateString()}
                          </Text>
                        </ChakraCard>
                      ))}
                    </VStack>
                  ) : (
                    <Text color={textColor}>No payment history available</Text>
                  )}
                </VStack>
              </ChakraCard>
            </ModalBody>
            <ModalFooter>
              <Button
                colorScheme="teal"
                mr={3}
                onClick={onDetailsClose}
                _hover={{ bg: 'teal.600', transform: 'scale(1.05)' }}
                transition="all 0.2s ease-in-out"
              >
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
      <ToastContainer />
    </>
  );
}
