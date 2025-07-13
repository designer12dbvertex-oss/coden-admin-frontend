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
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Link,
} from '@chakra-ui/react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import axios from 'axios';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon } from '@chakra-ui/icons';

// Custom components
import Card from 'components/card/Card';

const columnHelper = createColumnHelper();

export default function ContactInquiriesTable() {
  const [data, setData] = React.useState([]);
  const [filteredData, setFilteredData] = React.useState([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedMessage, setSelectedMessage] = React.useState('');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const bgHover = useColorModeValue('gray.50', 'gray.700');
  const navigate = useNavigate();
  const toast = useToast();

  const baseUrl = process.env.REACT_APP_BASE_URL;
  const token = localStorage.getItem('token');

  // Fetch contact inquiries
  const fetchContactInquiries = async () => {
    try {
      if (!baseUrl || !token) {
        throw new Error('Missing base URL or authentication token');
      }
      setLoading(true);
      const response = await axios.get(`${baseUrl}api/CompanyDetails/contact/mobile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('API Response (Contact Inquiries):', response.data);

      if (!response.data || !Array.isArray(response.data.data)) {
        throw new Error('Invalid response format: Expected an array of contact inquiries');
      }

      const formattedData = response.data.data.map((item) => ({
        id: item._id,
        subject: item.subject || 'N/A',
        mobile_number: item.mobile_number || 'N/A',
        message: item.message || 'N/A',
        timestamp: new Date(item.timestamp).toLocaleString() || 'N/A',
      }));

      setData(formattedData);
      setFilteredData(formattedData);
      setLoading(false);
    } catch (err) {
      console.error('Fetch Contact Inquiries Error:', err);
      if (
        err.response?.data?.message === 'Not authorized, token failed' ||
        err.response?.data?.message === 'Session expired or logged in on another device' ||
        err.response?.data?.message === 'Un-Authorized, You are not authorized to access this route.' ||
        err.response?.data?.message === 'Not authorized, token failed'
      ) {
        localStorage.removeItem('token');
        navigate('/');
      } else {
        setError(err.message || 'Failed to fetch contact inquiries');
        setLoading(false);
      }
    }
  };

  // Handle search filtering
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query) {
      setFilteredData(data);
      return;
    }
    const lowerQuery = query.toLowerCase();
    const filtered = data.filter(
      (item) =>
        item.subject.toLowerCase().includes(lowerQuery) ||
        item.mobile_number.toLowerCase().includes(lowerQuery) ||
        item.message.toLowerCase().includes(lowerQuery)
    );
    setFilteredData(filtered);
  };

  // Handle modal open/close
  const openModal = (message) => {
    setSelectedMessage(message);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMessage('');
  };

  React.useEffect(() => {
    fetchContactInquiries();
  }, [navigate]);

  const columns = React.useMemo(
    () => [
      columnHelper.accessor('subject', {
        id: 'subject',
        header: () => (
          <Text
            fontSize={{ sm: '12px', lg: '14px' }}
            fontWeight="bold"
            color="gray.500"
            textTransform="uppercase"
          >
            Subject
          </Text>
        ),
        cell: (info) => (
          <Text color={textColor} fontSize="sm" fontWeight="500">
            {info.getValue()}
          </Text>
        ),
      }),
      columnHelper.accessor('mobile_number', {
        id: 'mobile_number',
        header: () => (
          <Text
            fontSize={{ sm: '12px', lg: '14px' }}
            fontWeight="bold"
            color="gray.500"
            textTransform="uppercase"
          >
            Mobile Number
          </Text>
        ),
        cell: (info) => (
          <Text color={textColor} fontSize="sm" fontWeight="500">
            {info.getValue()}
          </Text>
        ),
      }),
      columnHelper.accessor('message', {
        id: 'message',
        header: () => (
          <Text
            fontSize={{ sm: '12px', lg: '14px' }}
            fontWeight="bold"
            color="gray.500"
            textTransform="uppercase"
          >
            Message
          </Text>
        ),
        cell: (info) => {
          const message = info.getValue();
          const previewLength = 30; // Show first 30 characters
          const isLongMessage = message.length > previewLength;
          const preview = isLongMessage ? `${message.slice(0, previewLength)}...` : message;
          return (
            <Flex align="center">
              <Text color={textColor} fontSize="sm" fontWeight="500">
                {preview}
              </Text>
              {isLongMessage && (
                <Link
                  color="blue.500"
                  fontSize="sm"
                  fontWeight="500"
                  ml="5px"
                  onClick={() => openModal(message)}
                  _hover={{ textDecoration: 'underline' }}
                >
                  Read More
                </Link>
              )}
            </Flex>
          );
        },
      }),
      columnHelper.accessor('timestamp', {
        id: 'timestamp',
        header: () => (
          <Text
            fontSize={{ sm: '12px', lg: '14px' }}
            fontWeight="bold"
            color="gray.500"
            textTransform="uppercase"
          >
            Timestamp
          </Text>
        ),
        cell: (info) => (
          <Text color={textColor} fontSize="sm" fontWeight="500">
            {info.getValue()}
          </Text>
        ),
      }),
    ],
    [textColor]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
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
        style={{ marginTop: '80px' }}
      >
        <Text color={textColor} fontSize="xl" fontWeight="700" p="15px">
          Loading...
        </Text>
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
        style={{ marginTop: '80px' }}
      >
        <Text color={textColor} fontSize="xl" fontWeight="700" p="15px">
          Error: {error}
        </Text>
      </Card>
    );
  }

  return (
    <>
      <Card
        w="100%"
        px={['15px', null, '25px']}
        py="25px"
        borderRadius="16px"
        boxShadow="0px 4px 20px rgba(0, 0, 0, 0.1)"
        bg={useColorModeValue('white', 'gray.800')}
        style={{ marginTop: '80px' }}
      >
        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align="center"
          mb="20px"
          px="10px"
        >
          <Text
            color={textColor}
            fontSize={{ base: 'xl', md: '2xl' }}
            fontWeight="700"
            lineHeight="100%"
          >
            Contact Inquiries
          </Text>
          <InputGroup maxW={{ base: '100%', md: '300px' }} mt={{ base: '10px', md: '0' }}>
            <InputLeftElement pointerEvents="none">
              <Icon as={SearchIcon} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search by subject, mobile, or message"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              borderRadius="12px"
              bg={useColorModeValue('gray.100', 'gray.700')}
              _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
            />
          </InputGroup>
        </Flex>
        <Box overflowX="auto">
          <Table
            variant="simple"
            color="gray.500"
            mb="24px"
            mt="12px"
            borderRadius="12px"
            overflow="hidden"
          >
            <Thead bg={useColorModeValue('gray.100', 'gray.700')}>
              {table.getHeaderGroups().map((headerGroup) => (
                <Tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <Th
                      key={header.id}
                      pe="10px"
                      py="12px"
                      borderColor={borderColor}
                      fontSize={{ sm: '12px', lg: '14px' }}
                      textTransform="uppercase"
                      color="gray.500"
                      fontWeight="bold"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
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
                    bg: bgHover,
                    transition: 'background-color 0.2s ease',
                    cursor: 'pointer',
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <Td
                      key={cell.id}
                      fontSize={{ sm: '14px' }}
                      minW={{ sm: '150px', md: '200px', lg: 'auto' }}
                      borderColor={borderColor}
                      py="12px"
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
      </Card>

      {/* Modal for full message */}
      <Modal isOpen={isModalOpen} onClose={closeModal} isCentered>
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
            Full Message
          </ModalHeader>
          <ModalCloseButton color={textColor} />
          <ModalBody py="20px">
            <Text color={textColor} fontSize="sm" whiteSpace="pre-wrap">
              {selectedMessage}
            </Text>
          </ModalBody>
          <ModalFooter borderTop="1px" borderColor={borderColor}>
            <Button
              colorScheme="blue"
              onClick={closeModal}
              borderRadius="12px"
              size="sm"
              bg="blue.600"
              _hover={{ bg: 'blue.700' }}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
