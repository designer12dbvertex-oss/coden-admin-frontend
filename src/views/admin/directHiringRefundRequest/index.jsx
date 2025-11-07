/* eslint-disable */
'use client';

import React from 'react';
import {
  Box,
  Button,
  Flex,
  Table,
  Tbody,
  Td,
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
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
  Select,
  Textarea,
  Spinner,
  Center,
  Text,
  Divider,
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
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SearchIcon } from '@chakra-ui/icons';
import Card from 'components/card/Card';

const columnHelper = createColumnHelper();

export default function RefundRequestsTable() {
  /* ---------------------- STATE ---------------------- */
  const [sorting, setSorting] = React.useState([]);
  const [data, setData] = React.useState([]);
  const [filteredData, setFilteredData] = React.useState([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });

  // Modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selected, setSelected] = React.useState(null);
  const [newStatus, setNewStatus] = React.useState('processed');
  const [remark, setRemark] = React.useState('');

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const navigate = useNavigate();

  const baseUrl = process.env.REACT_APP_BASE_URL;
  const token = localStorage.getItem('token');

  /* ---------------------- FETCH LIST ---------------------- */
  React.useEffect(() => {
    const fetch = async () => {
      try {
        if (!baseUrl || !token) throw new Error('Missing config');

        const res = await axios.get(
          `${baseUrl}api/direct-order/admin/pending-refund-requests`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.data?.refundRequests || !Array.isArray(res.data.refundRequests))
          throw new Error('Invalid response');

        const formatted = res.data.refundRequests.map((i) => {
          const bank = i.user_id?.bankdetails || {};
          return {
            _id: i._id,
            project_id: i.project_id || '',
            user_id: {
              full_name: i.user_id?.full_name || 'Unknown',
              _id: i.user_id?._id || '',
              bankdetails: {
                accountNumber: bank.accountNumber || 'N/A',
                accountHolderName: bank.accountHolderName || 'N/A',
                bankName: bank.bankName || 'N/A',
                ifscCode: bank.ifscCode || 'N/A',
                upiId: bank.upiId || 'N/A',
              },
            },
            title: i.title || 'N/A',
            platform_fee: i.platform_fee || 0,
            refund_reason: i.refundReason || '',
            refund_status: i.refundStatus || 'pending',
            createdAt: i.createdAt ? new Date(i.createdAt).toLocaleDateString() : '',
          };
        });

        setData(formatted);
        setFilteredData(formatted);
        setLoading(false);
      } catch (err) {
        console.error(err);
        if (
          err.response?.data?.message?.includes('authorized') ||
          err.response?.data?.message?.includes('Session')
        ) {
          localStorage.removeItem('token');
          navigate('/');
        } else {
          setError(err.message || 'Failed to load');
          setLoading(false);
        }
      }
    };
    fetch();
  }, [baseUrl, token, navigate]);

  /* ---------------------- SEARCH ---------------------- */
  const handleSearch = React.useCallback(
    (q) => {
      setSearchQuery(q);
      setPagination((p) => ({ ...p, pageIndex: 0 }));
      if (!q) return setFilteredData(data);
      const low = q.toLowerCase();
      const filtered = data.filter(
        (i) =>
          i.project_id.toLowerCase().includes(low) ||
          i.title.toLowerCase().includes(low) ||
          i.user_id.full_name.toLowerCase().includes(low) ||
          i.refund_reason.toLowerCase().includes(low) ||
          i.createdAt.toLowerCase().includes(low)
      );
      setFilteredData(filtered);
    },
    [data]
  );

  /* ---------------------- OPEN DETAIL ---------------------- */
  const openDetail = (row) => {
    const item = row.original;
    setSelected(item);
    setNewStatus(item.refund_status === 'pending' ? 'processed' : 'rejected');
    setRemark('');
    onOpen();
  };

  /* ---------------------- UPDATE STATUS ---------------------- */
  const updateStatus = async () => {
    if (!selected) return;
    if (!remark.trim()) {
      toast.error('Remark is required');
      return;
    }
    console.log('Updating to', newStatus, 'with remark:', remark);
    try {
      await axios.put(
        `${baseUrl}api/direct-order/admin/update-refund-status`,
        { status: newStatus, refundReasonDetails: remark, orderId: selected._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Refund ${newStatus} successfully`);

      // Refresh list
      const res = await axios.get(
        `${baseUrl}api/direct-order/admin/pending-refund-requests`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const formatted = res.data.refundRequests.map((i) => {
        const bank = i.user_id?.bankdetails || {};
        return {
          _id: i._id,
          project_id: i.project_id || '',
          user_id: {
            full_name: i.user_id?.full_name || 'Unknown',
            _id: i.user_id?._id || '',
            bankdetails: {
              accountNumber: bank.accountNumber || 'N/A',
              accountHolderName: bank.accountHolderName || 'N/A',
              bankName: bank.bankName || 'N/A',
              ifscCode: bank.ifscCode || 'N/A',
              upiId: bank.upiId || 'N/A',
            },
          },
          title: i.title || 'N/A',
          platform_fee: i.platform_fee || 0,
          refund_reason: i.refundReason || '',
          refund_status: i.refundStatus || 'pending',
          createdAt: i.createdAt ? new Date(i.createdAt).toLocaleDateString() : '',
        };
      });

      setData(formatted);
      setFilteredData(formatted);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  /* ---------------------- COLUMNS ---------------------- */
  const columns = [
    columnHelper.display({
      id: 'sno',
      header: () => <Text fontSize="xs" color="gray.400">S.No</Text>,
      cell: ({ row }) => <Text fontWeight="700">{row.index + 1}</Text>,
    }),
    columnHelper.accessor('project_id', {
      header: () => <Text fontSize="xs" color="gray.400">PROJECT ID</Text>,
      cell: (info) => <Text fontWeight="700">{info.getValue()}</Text>,
    }),
    columnHelper.accessor('title', {
      header: () => <Text fontSize="xs" color="gray.400">TITLE</Text>,
      cell: (info) => <Text fontWeight="700">{info.getValue()}</Text>,
    }),
    columnHelper.accessor('user_id.full_name', {
      header: () => <Text fontSize="xs" color="gray.400">CUSTOMER</Text>,
      cell: (info) => (
        <Link to={`/admin/Dispute/UserDetails/${info.row.original.user_id._id}`}>
          <Text color="blue.500" _hover={{ textDecoration: 'underline' }}>
            {info.getValue()}
          </Text>
        </Link>
      ),
    }),
    columnHelper.accessor('platform_fee', {
      header: () => <Text fontSize="xs" color="gray.400">REFUND AMOUNT</Text>,
      cell: (info) => <Text fontWeight="700">₹{info.getValue().toLocaleString()}</Text>,
    }),
    columnHelper.accessor('refund_reason', {
      header: () => <Text fontSize="xs" color="gray.400">REASON</Text>,
      cell: (info) => <Text noOfLines={1}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor('createdAt', {
      header: () => <Text fontSize="xs" color="gray.400">CREATED AT</Text>,
      cell: (info) => <Text fontWeight="700">{info.getValue()}</Text>,
    }),
    columnHelper.display({
      id: 'actions',
      header: () => <Text fontSize="xs" color="gray.400">ACTIONS</Text>,
      cell: ({ row }) => (
        <Button size="sm" colorScheme="teal" onClick={() => openDetail(row)}>
          View & Update
        </Button>
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
  });

  /* ---------------------- RENDER ---------------------- */
  if (loading) {
    return (
      <Card mt="100px" p="25px">
        <Center>
          <Spinner size="lg" />
        </Center>
      </Card>
    );
  }

  if (error) {
    return (
      <Card mt="100px" p="25px">
        <Text color="red.500">Error: {error}</Text>
      </Card>
    );
  }

  return (
    <>
      <Card mt="100px" overflowX="auto">
        <Flex
          px="25px"
          mb="20px"
          justify="space-between"
          align="center"
          direction={{ base: 'column', md: 'row' }}
          gap="10px"
        >
          <Text fontSize={{ base: 'xl', md: '22px' }} fontWeight="700">
            Refund Requests
          </Text>
          <InputGroup maxW={{ base: '100%', md: '300px' }}>
            <InputLeftElement>
              <Icon as={SearchIcon} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              borderRadius="12px"
            />
          </InputGroup>
        </Flex>

        {/* Scrollable Table */}
        <Box overflowX="auto">
          <Table variant="simple" color="gray.500" minW="1000px">
            <Thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <Tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <Th
                      key={header.id}
                      cursor={header.column.getCanSort() ? 'pointer' : 'default'}
                      onClick={header.column.getToggleSortingHandler()}
                      borderColor={borderColor}
                    >
                      <Flex align="center" fontSize="xs" color="gray.400">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc'
                          ? ' up'
                          : header.column.getIsSorted() === 'desc'
                          ? ' down'
                          : null}
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
                    <Td key={cell.id} borderColor={borderColor}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </Td>
                  ))}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        {/* Pagination */}
        <Flex
          justify="space-between"
          align="center"
          px="25px"
          py="10px"
          borderTopWidth="1px"
          borderColor={borderColor}
        >
          <Flex gap="2">
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
          <Text fontSize="sm">
            Showing{' '}
            {filteredData.length === 0
              ? 0
              : table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}{' '}
            to{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              filteredData.length
            )}{' '}
            of {filteredData.length}
          </Text>
        </Flex>
      </Card>

      {/* ---------------------- DETAIL / UPDATE MODAL ---------------------- */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Refund Request - {selected?.project_id}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selected ? (
              <Box>
                <Box mb={3}>
                  <Text fontWeight="bold">Title:</Text>
                  <Text>{selected.title}</Text>
                </Box>

                <Box mb={3}>
                  <Text fontWeight="bold">Customer:</Text>
                  <Text>{selected.user_id.full_name}</Text>
                </Box>

                <Box mb={3}>
                  <Text fontWeight="bold">Refund Amount:</Text>
                  <Text>₹{selected.platform_fee?.toLocaleString() || 'N/A'}</Text>
                </Box>

                <Box mb={3}>
                  <Text fontWeight="bold">Reason:</Text>
                  <Text whiteSpace="pre-wrap">{selected.refund_reason || 'N/A'}</Text>
                </Box>

                <Box mb={3}>
                  <Text fontWeight="bold">Current Status:</Text>
                  <Text>{selected.refund_status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'Pending'}</Text>
                </Box>

                <Divider my={4} />

                {/* Bank Details */}
                <Box mb={4} p={3} bg="gray.50" borderRadius="md">
                  <Text fontWeight="bold" mb={2}>Bank Details (Refund To)</Text>
                  <Text><strong>Holder:</strong> {selected.user_id.bankdetails.accountHolderName}</Text>
                  <Text><strong>Bank:</strong> {selected.user_id.bankdetails.bankName}</Text>
                  <Text><strong>A/C No:</strong> {selected.user_id.bankdetails.accountNumber}</Text>
                  <Text><strong>IFSC:</strong> {selected.user_id.bankdetails.ifscCode}</Text>
                  <Text><strong>UPI ID:</strong> {selected.user_id.bankdetails.upiId}</Text>
                </Box>

                <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} mb={3}>
                  <option value="processed">Processed</option>
                  <option value="rejected">Rejected</option>
                </Select>

                <Textarea
                  placeholder="Enter remark (required)"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                />
              </Box>
            ) : null}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="teal"
              onClick={updateStatus}
              isDisabled={!remark.trim()}
            >
              Update Status
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <ToastContainer />
    </>
  );
}
