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
  const [adminInputs, setAdminInputs] = React.useState({});

  // Reason Modal States
  const [isReasonModalOpen, setIsReasonModalOpen] = React.useState(false);
  const [reasonText, setReasonText] = React.useState('');
  const [tempReleaseStatus, setTempReleaseStatus] = React.useState('');
  const [pendingUpdateData, setPendingUpdateData] = React.useState(null);

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

  const baseUrl = process.env.REACT_APP_BASE_URL;
  const token = localStorage.getItem('token');

  // Fetch Orders
  React.useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!baseUrl || !token) throw new Error('Missing config');
        setLoading(true);

        const response = await axios.get(
          `http://localhost:5001/api/admin/getReleaseRequestedBiddingOrders`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        const formattedData = response.data.data.map((item) => ({
          id: item._id || '',
          orderId: item.project_id || '',
          customerName: item.user_id?.full_name || 'Unknown',
          serviceProvider: item.service_provider_id?.full_name || 'N/A',
          remainingAmount: item.payment_history?.amount || 0,
          paymentStatus: item.payment_status
            ? item.payment_status
                .split('_')
                .map((w) => w[0].toUpperCase() + w.slice(1))
                .join(' ')
            : 'Unknown',
          paymentHistory: item.payment_history ? [item.payment_history] : [],
          customerBankDetails: item.user_id?.bankdetails || {},
          serviceProviderBankDetails:
            item.service_provider_id?.bankdetails || {},
          title: item.title || 'N/A',
        }));

        setAllData(formattedData);
        setData(formattedData);
        setLoading(false);
      } catch (err) {
        console.error(err);
        if (err.response?.data?.message?.includes('authorized')) {
          localStorage.removeItem('token');
          navigate('/');
        } else {
          setError(err.message || 'Failed to load orders');
          setLoading(false);
        }
      }
    };
    fetchOrders();
  }, [baseUrl, token, navigate]);

  // Search Filter
  React.useEffect(() => {
    const filtered = allData.filter(
      (order) =>
        order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setData(filtered);
  }, [searchQuery, allData]);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setAdminInputs({}); // Reset inputs
    onDetailsOpen();
  };

  // Direct Release (Paid to Provider)
  const handleDirectRelease = async (
    orderId,
    paymentId,
    adminPaymentId,
    adminTransactionId,
  ) => {
    try {
      await axios.post(
        `${baseUrl}api/bidding-order/admin/approve-release/${orderId}/${paymentId}`,
        {
          release_status: 'released',
          adminPaymentId,
          adminTransactionId,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success('Payment released to provider successfully!');
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to release payment');
    }
  };

  // Confirm Rejected or Refunded with releaseRemark
  const handleConfirmWithReason = async () => {
    if (!reasonText.trim()) {
      toast.error('Please provide a reason');
      return;
    }

    try {
      await axios.post(
        `${baseUrl}api/bidding-order/admin/approve-release/${pendingUpdateData.orderId}/${pendingUpdateData.paymentId}`,
        {
          release_status: tempReleaseStatus,
          adminPaymentId: pendingUpdateData.adminPaymentId,
          adminTransactionId: pendingUpdateData.adminTransactionId,
          releaseRemark: reasonText.trim(), // Correct key!
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast.success(
        tempReleaseStatus === 'rejected'
          ? 'Release request rejected'
          : 'Payment refunded successfully',
      );
      setIsReasonModalOpen(false);
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const releaseStatusOptions = [
    { label: 'Paid', value: 'released' },
    { label: 'Rejected', value: 'rejected' },
    // { label: 'Refunded', value: 'refunded' },
  ];

  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case 'released':
      case 'success':
        return { bg: 'green.100', color: 'green.800' };
      case 'rejected':
      case 'refunded':
      case 'failed':
        return { bg: 'red.100', color: 'red.800' };
      case 'pending':
      case 'release_requested':
        return { bg: 'yellow.100', color: 'yellow.800' };
      default:
        return { bg: 'gray.100', color: 'gray.800' };
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'release_requested':
        return 'Paid To Provider';
      case 'released':
        return 'Released';
      case 'rejected':
        return 'Rejected';
      case 'refunded':
        return 'Refunded';
      default:
        return status;
    }
  };
  const columns = [
    columnHelper.display({
      id: 'sno',
      header: () => (
        <Text fontSize="12px" color="gray.400">
          S.No
        </Text>
      ),
      cell: ({ row }) => <Text fontWeight="700">{row.index + 1}</Text>,
    }),
    columnHelper.accessor('orderId', {
      header: () => (
        <Text fontSize="12px" color="gray.400">
          PROJECT ID
        </Text>
      ),
    }),
    columnHelper.accessor('title', {
      header: () => (
        <Text fontSize="12px" color="gray.400">
          TITLE
        </Text>
      ),
    }),
    columnHelper.accessor('customerName', {
      header: () => (
        <Text fontSize="12px" color="gray.400">
          CUSTOMER
        </Text>
      ),
    }),
    columnHelper.accessor('serviceProvider', {
      header: () => (
        <Text fontSize="12px" color="gray.400">
          SERVICE PROVIDER
        </Text>
      ),
    }),
    columnHelper.accessor('remainingAmount', {
      header: () => (
        <Text fontSize="12px" color="gray.400">
          AMOUNT TO RELEASE
        </Text>
      ),
      cell: (info) => (
        <Text fontWeight="700">₹{info.getValue().toLocaleString()}</Text>
      ),
    }),
    columnHelper.accessor('paymentStatus', {
      header: () => (
        <Text fontSize="12px" color="gray.400">
          PAYMENT STATUS
        </Text>
      ),
      cell: (info) => {
        const { bg, color } = getStatusStyles(info.getValue());
        return (
          <Flex
            bg={bg}
            color={color}
            px={3}
            py={1}
            borderRadius="full"
            fontSize="sm"
            fontWeight="600"
          >
            {info.getValue()}
          </Flex>
        );
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: () => (
        <Text fontSize="12px" color="gray.400">
          ACTIONS
        </Text>
      ),
      cell: ({ row }) => (
        <Flex gap={2}>
          <Button
            size="sm"
            colorScheme="teal"
            onClick={() => handleViewDetails(row.original)}
          >
            View Details
          </Button>
          <Button
            size="sm"
            colorScheme="blue"
            onClick={() => navigate(`/admin/bidding-order/${row.original.id}`)}
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
  });

  if (loading)
    return (
      <Card mt="100px">
        <Text p={8} textAlign="center">
          Loading orders...
        </Text>
      </Card>
    );
  if (error)
    return (
      <Card mt="100px">
        <Text p={8} color="red.500">
          Error: {error}
        </Text>
      </Card>
    );

  return (
    <>
      <Card mt="100px" overflowX={{ sm: 'scroll', lg: 'hidden' }}>
        <Flex px="25px" mb="20px" justify="space-between" align="center">
          <Text fontSize="22px" fontWeight="700">
            Release Requested Orders
          </Text>
          <Input
            placeholder="Search by Project ID or Customer"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            w="300px"
          />
        </Flex>

        <Table variant="simple">
          <Thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <Th
                    key={header.id}
                    cursor={header.column.getCanSort() ? 'pointer' : 'default'}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <Flex
                      align="center"
                      justify="space-between"
                      fontSize="12px"
                      color="gray.400"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {{ asc: 'Up', desc: 'Down' }[
                        header.column.getIsSorted()
                      ] ?? null}
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
                  <Td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>

        <Flex justify="space-between" p="20px">
          <Flex gap={2}>
            <Button
              colorScheme="teal"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              colorScheme="teal"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </Flex>
          <Text>
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </Text>
        </Flex>
      </Card>

      {/* Details + Action Modal */}
      <Modal isOpen={isDetailsOpen} onClose={onDetailsClose} size="3xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Payment Release Action</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedOrder && (
              <VStack spacing={6} align="stretch">
                {/* Bank Details */}
                <Grid templateColumns="1fr 1fr" gap={8}>
                  <Box>
                    <Text fontWeight="bold" mb={2}>
                      Customer Bank
                    </Text>
                    <VStack align="start" fontSize="sm">
                      <Text>
                        <strong>Name:</strong>{' '}
                        {selectedOrder.customerBankDetails?.accountHolderName ||
                          'N/A'}
                      </Text>
                      <Text>
                        <strong>A/c:</strong>{' '}
                        {selectedOrder.customerBankDetails?.accountNumber}
                      </Text>
                      <Text>
                        <strong>Bank:</strong>{' '}
                        {selectedOrder.customerBankDetails?.bankName}
                      </Text>
                      <Text>
                        <strong>IFSC:</strong>{' '}
                        {selectedOrder.customerBankDetails?.ifscCode}
                      </Text>
                    </VStack>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" mb={2}>
                      Provider Bank
                    </Text>
                    <VStack align="start" fontSize="sm">
                      <Text>
                        <strong>Name:</strong>{' '}
                        {selectedOrder.serviceProviderBankDetails
                          ?.accountHolderName || 'N/A'}
                      </Text>
                      <Text>
                        <strong>A/c:</strong>{' '}
                        {
                          selectedOrder.serviceProviderBankDetails
                            ?.accountNumber
                        }
                      </Text>
                      <Text>
                        <strong>Bank:</strong>{' '}
                        {selectedOrder.serviceProviderBankDetails?.bankName}
                      </Text>
                      <Text>
                        <strong>IFSC:</strong>{' '}
                        {selectedOrder.serviceProviderBankDetails?.ifscCode}
                      </Text>
                    </VStack>
                  </Box>
                </Grid>

                <Divider />

                {/* Payment Cards */}
                {selectedOrder.paymentHistory.map((payment, index) => (
                  <ChakraCard key={index} p={5} borderWidth="1px">
                    <VStack align="stretch" spacing={4}>
                      <Flex justify="space-between">
                        <Text fontWeight="bold">
                          Amount: ₹{payment.amount.toLocaleString()}
                        </Text>
                        <Flex
                          bg={getStatusStyles(payment.release_status).bg}
                          color={getStatusStyles(payment.release_status).color}
                          px={3}
                          py={1}
                          borderRadius="full"
                          fontSize="sm"
                        >
                          {getStatusLabel(payment.release_status)}
                        </Flex>
                      </Flex>

                      <Grid templateColumns="1fr 1fr" gap={4}>
                        <FormControl>
                          <FormLabel>Admin Payment ID</FormLabel>
                          <Input
                            placeholder="e.g. pay_abc123"
                            value={adminInputs[payment._id]?.paymentId || ''}
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
                        <FormControl>
                          <FormLabel>Admin Transaction ID</FormLabel>
                          <Input
                            placeholder="e.g. txn_123456"
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
                      </Grid>

                      <Select
                        placeholder="Select Action"
                        onChange={(e) => {
                          const status = e.target.value;
                          const payId =
                            adminInputs[payment._id]?.paymentId || '';
                          const txnId =
                            adminInputs[payment._id]?.transactionId || '';

                          if (!payId || !txnId) {
                            toast.error(
                              'Please enter both Admin Payment ID and Transaction ID first',
                            );
                            return;
                          }

                          if (status === 'released') {
                            handleDirectRelease(
                              selectedOrder.id,
                              payment._id,
                              payId,
                              txnId,
                            );
                          } else if (
                            status === 'rejected' ||
                            status === 'refunded'
                          ) {
                            setTempReleaseStatus(status);
                            setReasonText('');
                            setPendingUpdateData({
                              orderId: selectedOrder.id,
                              paymentId: payment._id,
                              adminPaymentId: payId,
                              adminTransactionId: txnId,
                            });
                            setIsReasonModalOpen(true);
                          }
                        }}
                      >
                        {releaseStatusOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </Select>
                    </VStack>
                  </ChakraCard>
                ))}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" onClick={onDetailsClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Reason Modal for Rejected / Refunded */}
      <Modal
        isOpen={isReasonModalOpen}
        onClose={() => setIsReasonModalOpen(false)}
        isCentered
      >
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent>
          <ModalHeader
            color={tempReleaseStatus === 'refunded' ? 'orange.600' : 'red.600'}
          >
            {tempReleaseStatus === 'refunded'
              ? 'Refund Payment'
              : 'Reject Release Request'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isRequired>
              <FormLabel>
                Reason for{' '}
                {tempReleaseStatus === 'refunded' ? 'refund' : 'rejection'}
              </FormLabel>
              <Input
                placeholder="Please explain the reason..."
                value={reasonText}
                onChange={(e) => setReasonText(e.target.value)}
                autoFocus
                size="lg"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="ghost" onClick={() => setIsReasonModalOpen(false)}>
              Cancel
            </Button>
            <Button
              colorScheme={tempReleaseStatus === 'refunded' ? 'orange' : 'red'}
              onClick={handleConfirmWithReason}
            >
              Confirm {tempReleaseStatus === 'refunded' ? 'Refund' : 'Reject'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}
