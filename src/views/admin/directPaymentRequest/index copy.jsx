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
  FormControl,
  Select,
  FormLabel,
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
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Custom components
import Card from 'components/card/Card';

const columnHelper = createColumnHelper();

export default function OrdersTable() {
  const [sorting, setSorting] = React.useState([]);
  const [allData, setAllData] = React.useState([]);
  const [data, setData] = React.useState([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [selectedOrder, setSelectedOrder] = React.useState(null);
  const [releaseStatus, setReleaseStatus] = React.useState('');
  const [selectedPaymentIndex, setSelectedPaymentIndex] = React.useState(null);
  const [adminInputs, setAdminInputs] = React.useState({});

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
        setLoading(true);
        const response = await axios.get(
          `${baseUrl}api/admin/getReleaseRequestedDirectOrders`,
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
          serviceProvider: item.service_provider_id?.full_name || 'N/A',
          serviceProviderId: item.service_provider_id?._id || 'N/A',
          totalAmount: item.service_payment?.total_expected || 0,
          paidAmount: item.payment_history?.amount || 0,
          remainingAmount: item.payment_history?.amount || 0,
          totalTax: item.payment_history?.tax || 0,
          paymentStatus: item.payment_status
            ? item.payment_status
                .split('_')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')
            : 'Unknown',
          createdAt: item.createdAt
            ? new Date(item.createdAt).toLocaleDateString()
            : 'N/A',
          address: item.address || 'N/A',
          title: item.title || 'N/A',
          description: item.description || 'N/A',
          deadline: item.deadline
            ? new Date(item.deadline).toLocaleDateString()
            : 'N/A',
          paymentHistory: item.payment_history ? [item.payment_history] : [],
          customerBankDetails: item.user_id?.bankdetails || {},
          serviceProviderBankDetails:
            item.service_provider_id?.bankdetails || {},
          platformFee: item.platform_fee || 0,
          platformFeePaid: item.platform_fee_paid ? 'Paid' : 'Not Paid',
        }));

        setAllData(formattedData);
        setData(formattedData);
        setLoading(false);
      } catch (err) {
        console.error('Fetch Orders Error:', err);
        if (
          err.response?.data?.message === 'Not authorized, token failed' ||
          err.response?.data?.message ===
            'Session expired or logged in another device' ||
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

  // Handle search input change
  React.useEffect(() => {
    const filteredData = allData.filter(
      (order) =>
        order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setData(filteredData);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [searchQuery, allData]);

  // Handle view details click
  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setReleaseStatus(
      order.paymentHistory.length > 0
        ? order.paymentHistory[0].release_status
        : 'pending',
    );
    setSelectedPaymentIndex(null);
    onDetailsOpen();
  };

  // Handle release status change for a specific payment
  const handleReleaseStatusChange = async (
    orderId,
    paymentId,
    index,
    adminPaymentId,
    adminTransactionId,
  ) => {
    
    if (!adminPaymentId || adminPaymentId.trim() === '') {
      return toast.error('Admin Payment ID is required');
    }

    if (!adminTransactionId || adminTransactionId.trim() === '') {
      return toast.error('Admin Transaction ID is required');
    }
  
    try {
      await axios.post(
        `${baseUrl}api/direct-order/admin/approve-release/${orderId}/${paymentId}`,
        { release_status: releaseStatus, adminPaymentId, adminTransactionId },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success('Release status updated successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });
      window.location.reload();

      // Refresh data for the specific payment
      const updatedData = allData.map((order) => {
        if (order.id === orderId) {
          const updatedPaymentHistory = order.paymentHistory.map((payment, i) =>
            i === index
              ? { ...payment, release_status: releaseStatus }
              : payment,
          );
          return { ...order, paymentHistory: updatedPaymentHistory };
        }
        return order;
      });
      setAllData(updatedData);
      setData(
        updatedData.filter(
          (order) =>
            order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customerName
              .toLowerCase()
              .includes(searchQuery.toLowerCase()),
        ),
      );
      setSelectedPaymentIndex(null);
    } catch (err) {
      console.error('Update Release Status Error:', err);
      toast.error('Failed to update release status', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
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
    } else if (type === 'paymentStatus' || type === 'releaseStatus') {
      switch (status.toLowerCase()) {
        case 'success':
        case 'released':
          return { bg: 'green.100', color: 'green.800' };
        case 'pending':
        case 'release_requested':
          return { bg: 'yellow.100', color: 'yellow.800' };
        case 'failed':
        case 'refunded':
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
    columnHelper.accessor('title', {
      id: 'title',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          TITLE
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
          <Text color={textColor} fontSize="sm" fontWeight="700">
            {info.getValue()}
          </Text>
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
          <Text color={textColor} fontSize="sm" fontWeight="700">
            {info.getValue()}
          </Text>
        </Flex>
      ),
    }),
    columnHelper.accessor('remainingAmount', {
      id: 'remainingAmount',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          AMOUNT TO BE PAID
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
    columnHelper.accessor('paymentStatus', {
      id: 'paymentStatus',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          PAYMENT STATUS
        </Text>
      ),
      cell: (info) => {
        const { bg, color } = getStatusStyles(info.getValue(), 'paymentStatus');
        return (
          <Flex align="center" bg={bg} px={2} py={1} borderRadius="md">
            <Text fontSize="sm" color={color}>
              {info.getValue()}
            </Text>
          </Flex>
        );
      },
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
            onClick={() => handleViewDetails(row.original)}
          >
            View Details
          </Button>
          <Button
            colorScheme="blue"
            size="sm"
            onClick={() => navigate(`/admin/viewOrder/${row.original.id}`)}
          >
            View Order
          </Button>
        </Flex>
      ),
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: process.env.NODE_ENV === 'development',
  });

  const releaseStatusOptions = [
    // { label: 'Paid to Provider', value: 'release_requested' },
    { label: 'Paid', value: 'released' },
    { label: 'Rejected', value: 'rejected' },
  ];

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
        <Flex px="25px" mb="20px" justify="space-between" align="center">
          <Text
            color={textColor}
            fontSize="22px"
            fontWeight="700"
            lineHeight="100%"
          >
            Orders Table
          </Text>
          <FormControl w="200px">
            <Input
              placeholder="Search by Project ID or Customer"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </FormControl>
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
                          asc: ' 🔼',
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
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount() || 1}
          </Text>
        </Flex>
      </Card>

      {/* Details Modal */}
      {selectedOrder && (
        <Modal isOpen={isDetailsOpen} onClose={onDetailsClose} size="2xl">
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
              Payment Details
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
                  <Text fontWeight="bold" fontSize="lg" color={textColor}>
                    Payment Information
                  </Text>

                  <Grid templateColumns="1fr 1fr" gap={6}>
                    <GridItem>
                      <Text fontWeight="bold" fontSize="lg" color={textColor}>
                        Customer Bank Details
                      </Text>
                      {selectedOrder.customerBankDetails &&
                      Object.keys(selectedOrder.customerBankDetails).length >
                        0 ? (
                        <VStack spacing={2} align="stretch">
                          <Text color={textColor}>
                            <strong>Account Holder:</strong>{' '}
                            {
                              selectedOrder.customerBankDetails
                                .accountHolderName
                            }
                          </Text>
                          <Text color={textColor}>
                            <strong>Account Number:</strong>{' '}
                            {selectedOrder.customerBankDetails.accountNumber}
                          </Text>
                          <Text color={textColor}>
                            <strong>Bank Name:</strong>{' '}
                            {selectedOrder.customerBankDetails.bankName}
                          </Text>
                          <Text color={textColor}>
                            <strong>IFSC Code:</strong>{' '}
                            {selectedOrder.customerBankDetails.ifscCode}
                          </Text>
                          <Text color={textColor}>
                            <strong>UPI ID:</strong>{' '}
                            {selectedOrder.customerBankDetails.upiId}
                          </Text>
                        </VStack>
                      ) : (
                        <Text color={textColor}>
                          No customer bank details available
                        </Text>
                      )}
                    </GridItem>
                    <GridItem>
                      <Text fontWeight="bold" fontSize="lg" color={textColor}>
                        Service Provider Bank Details
                      </Text>
                      {selectedOrder.serviceProviderBankDetails &&
                      Object.keys(selectedOrder.serviceProviderBankDetails)
                        .length > 0 ? (
                        <VStack spacing={2} align="stretch">
                          <Text color={textColor}>
                            <strong>Account Holder:</strong>{' '}
                            {
                              selectedOrder.serviceProviderBankDetails
                                .accountHolderName
                            }
                          </Text>
                          <Text color={textColor}>
                            <strong>Account Number:</strong>{' '}
                            {
                              selectedOrder.serviceProviderBankDetails
                                .accountNumber
                            }
                          </Text>
                          <Text color={textColor}>
                            <strong>Bank Name:</strong>{' '}
                            {selectedOrder.serviceProviderBankDetails.bankName}
                          </Text>
                          <Text color={textColor}>
                            <strong>IFSC Code:</strong>{' '}
                            {selectedOrder.serviceProviderBankDetails.ifscCode}
                          </Text>
                          <Text color={textColor}>
                            <strong>UPI ID:</strong>{' '}
                            {selectedOrder.serviceProviderBankDetails.upiId}
                          </Text>
                        </VStack>
                      ) : (
                        <Text color={textColor}>
                          No service provider bank details available
                        </Text>
                      )}
                    </GridItem>
                  </Grid>

                  <Divider />

                  <Text fontWeight="bold" fontSize="lg" color={textColor}>
                    Payment History
                  </Text>
                  {selectedOrder.paymentHistory.length > 0 ? (
                    <Flex wrap="wrap" gap={4} justifyContent="space-between">
                      {selectedOrder.paymentHistory.map((payment, index) => (
                        <ChakraCard
                          key={index}
                          p={3}
                          boxShadow="sm"
                          borderRadius="md"
                          bg={useColorModeValue('white', 'gray.600')}
                          width="48%"
                        >
                          <VStack align="stretch" spacing={1}>
                            <Text color={textColor}>
                              <strong>Payment {index + 1}:</strong> ₹
                              {payment.amount.toLocaleString()}
                            </Text>
                            <Text color={textColor}>
                              <strong>Tax:</strong> ₹
                              {payment.tax.toLocaleString()}
                            </Text>
                            <Text color={textColor}>
                              <strong>Payment ID:</strong> {payment.payment_id}
                            </Text>
                            <Text color={textColor}>
                              <strong>Description:</strong>{' '}
                              {payment.description}
                            </Text>
                            <Text color={textColor}>
                              <strong>Method:</strong>{' '}
                              {payment.method.toUpperCase()}
                            </Text>
                            <Text color={textColor}>
                              <strong>Status:</strong> {payment.status}
                            </Text>
                            <Text color={textColor}>
                              <strong>Release Status:</strong>{' '}
                              {payment.release_status}
                            </Text>
                            {/*<Text color={textColor}>
                              <strong>Collected By:</strong>{' '}
                              {payment.collected_by}
                            </Text>
                            <Text color={textColor}>
                              <strong>Collected At:</strong>{' '}
                              {new Date(payment.collected_at).toLocaleString()}
                            </Text>*/}
                            {/* ---- NEW FIELDS FOR ADMIN ---- */}
                            <FormControl mt={3}>
                              <FormLabel>Admin Payment ID</FormLabel>
                              <Input
                                placeholder="Enter admin payment id"
                                value={
                                  adminInputs[payment._id]?.paymentId || ''
                                }
                                onChange={(e) =>
                                  setAdminInputs((prev) => ({
                                    ...prev,
                                    [payment._id]: {
                                      ...prev[payment._id],
                                      paymentId: e.target.value,
                                    },
                                  }))
                                }
                              />
                            </FormControl>

                            <FormControl mt={2}>
                              <FormLabel>Admin Transaction ID</FormLabel>
                              <Input
                                placeholder="Enter admin transaction id"
                                value={
                                  adminInputs[payment._id]?.transactionId || ''
                                }
                                onChange={(e) =>
                                  setAdminInputs((prev) => ({
                                    ...prev,
                                    [payment._id]: {
                                      ...prev[payment._id],
                                      transactionId: e.target.value,
                                    },
                                  }))
                                }
                              />
                            </FormControl>
                            <FormControl mt={2}>
                              <Select
                                value={
                                  index === selectedPaymentIndex
                                    ? releaseStatus
                                    : payment.release_status
                                }
                                onChange={(e) => {
                                  setReleaseStatus(e.target.value); // backend value stored
                                  setSelectedPaymentIndex(index);
                                }}
                                placeholder="Select release status"
                              >
                                {releaseStatusOptions.map((item) => (
                                  <option key={item.value} value={item.value}>
                                    {item.label}
                                  </option>
                                ))}
                              </Select>

                              <Button
                                mt={2}
                                colorScheme="blue"
                                size="sm"
                                onClick={() =>
                                  handleReleaseStatusChange(
                                    selectedOrder.id,
                                    payment._id,
                                    index,
                                    adminInputs[payment._id]?.paymentId || null,
                                    adminInputs[payment._id]?.transactionId ||
                                      null,
                                  )
                                }
                                isDisabled={
                                  !releaseStatus ||
                                  releaseStatus === payment.release_status ||
                                  !adminInputs[payment._id]?.paymentId ||
                                  !adminInputs[payment._id]?.transactionId
                                }
                              >
                                Update Release Status
                              </Button>
                            </FormControl>
                          </VStack>
                        </ChakraCard>
                      ))}
                    </Flex>
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
