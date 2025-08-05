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
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Select,
  useToast,
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

// Custom components
import Card from 'components/card/Card';

const columnHelper = createColumnHelper();

export default function OrdersTable() {
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [updateForm, setUpdateForm] = React.useState({ type: '', fee: '' });
  const [formErrors, setFormErrors] = React.useState({ type: '', fee: '' }); // New state for field-specific errors
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const navigate = useNavigate();
  const toast = useToast();

  const baseUrl = process.env.REACT_APP_BASE_URL;
  const token = localStorage.getItem('token');

  // Fetch platform fees
  const fetchPlatformFees = async () => {
    try {
      if (!baseUrl || !token) {
        throw new Error('Missing base URL or authentication token');
      }
      setLoading(true);
      const response = await axios.get(`${baseUrl}api/getAllPlatformFees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('API Response (Platform Fees):', response.data);

      if (!response.data || !Array.isArray(response.data.data)) {
        throw new Error('Invalid response format: Expected an array of platform fees');
      }

      const formattedData = response.data.data.map((item) => ({
        hiring_type: item.type? item.type
                  .toLowerCase()
                  .split(' ')
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')
              : 'UNKNOWN',
        fee: item.fee || 0,
      }));

      setData(formattedData);
      setLoading(false);
    } catch (err) {
      console.error('Fetch Platform Fees Error:', err);
      if (
        err.response?.data?.message === 'Not authorized, token failed' ||
        err.response?.data?.message === 'Session expired or logged in on another device' ||
        err.response?.data?.message === 'Un-Authorized, You are not authorized to access this route.' ||
        err.response?.data?.message === 'Not authorized, token failed'
      ) {
        localStorage.removeItem('token');
        navigate('/');
      } else {
        setError(err.message || 'Failed to fetch platform fees');
        setLoading(false);
      }
    }
  };

  // Update platform fee
  const updatePlatformFee = async () => {
    // Reset errors
    setFormErrors({ type: '', fee: '' });

    // Validate inputs
    let hasError = false;
    const newErrors = { type: '', fee: '' };

    if (!updateForm.type) {
      newErrors.type = 'Hiring type is required';
      hasError = true;
    }
    if (!updateForm.fee) {
      newErrors.fee = 'Fee is required';
      hasError = true;
    } else if (!/^\d{1,4}$/.test(updateForm.fee)) {
      newErrors.fee = 'Fee must be a number up to 4 digits';
      hasError = true;
    }

    if (hasError) {
      setFormErrors(newErrors);
      return;
    }

    try {
      if (!baseUrl || !token) {
        throw new Error('Missing base URL or authentication token');
      }

      const response = await axios.post(
        `${baseUrl}api/platform-fee`,
        {
          type: updateForm.type,
          fee: parseFloat(updateForm.fee),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log('Update Platform Fee Response:', response.data);
      toast({
        title: 'Success',
        description: 'Platform fee updated successfully!',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      await fetchPlatformFees();
      setUpdateForm({ type: '', fee: '' });
    } catch (err) {
      console.error('Update Platform Fee Error:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to update platform fee',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      setError(err.message || 'Failed to update platform fee');
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'fee') {
      // Allow only numbers and limit to 4 digits
      if (value === '' || (/^\d{0,4}$/.test(value) && parseInt(value, 10) <= 9999)) {
        setUpdateForm((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setUpdateForm((prev) => ({ ...prev, [name]: value }));
    }
    // Clear error for the field when user starts typing
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  React.useEffect(() => {
    fetchPlatformFees();
  }, [navigate]);

  const columns = React.useMemo(
    () => [
      columnHelper.accessor('hiring_type', {
        id: 'hiring_type',
        header: () => (
          <Text
            justifyContent="space-between"
            align="center"
            fontSize={{ sm: '10px', lg: '12px' }}
            color="gray.400"
            textTransform="uppercase"
          >
            Platform Type
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
      columnHelper.accessor('fee', {
        id: 'fee',
        header: () => (
          <Text
            justifyContent="space-between"
            align="center"
            fontSize={{ sm: '10px', lg: '12px' }}
            color="gray.400"
            textTransform="uppercase"
          >
            Platform Fee
          </Text>
        ),
        cell: (info) => (
          <Flex align="center">
            <Text color={textColor} fontSize="sm" fontWeight="400">
              ₹{info.getValue()}
            </Text>
          </Flex>
        ),
      }),
    ],
    [textColor]
  );

  const table = useReactTable({
    data,
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
      <Flex px="0px" mb="20px" justifyContent="space-between" align="center">
        <Text
          color={textColor}
          fontSize="22px"
          fontWeight="700"
          lineHeight="100%"
        >
          Platform Fees
        </Text>
      </Flex>
      <Box mb="30px">
        <Flex direction="column" gap="4">
          <FormControl isInvalid={!!formErrors.type}>
            <FormLabel fontSize="sm" fontWeight="500" color={textColor}>
              Hiring Type
            </FormLabel>
            <Select
              name="type"
              value={updateForm.type}
              onChange={handleInputChange}
              placeholder="Select hiring type"
              borderRadius="8px"
              borderColor="gray.300"
              _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
            >
              <option value="emergency">Emergency</option>
              <option value="bidding">Bidding</option>
              <option value="direct">Direct</option>
            </Select>
            {formErrors.type && <FormErrorMessage>{formErrors.type}</FormErrorMessage>}
          </FormControl>
          <FormControl isInvalid={!!formErrors.fee}>
            <FormLabel fontSize="sm" fontWeight="500" color={textColor}>
              Fee (₹)
            </FormLabel>
            <Input
              name="fee"
              type="text" // Changed to text to handle input restriction better
              value={updateForm.fee}
              onChange={handleInputChange}
              placeholder="e.g., 250"
              borderRadius="8px"
              borderColor="gray.300"
              _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
              maxLength={4} // Restrict input length
            />
            {formErrors.fee && <FormErrorMessage>{formErrors.fee}</FormErrorMessage>}
          </FormControl>
          <Button
            colorScheme="teal"
            onClick={updatePlatformFee}
            borderRadius="12px"
            fontSize="sm"
            fontWeight="600"
            textTransform="uppercase"
            bg="teal.600"
            _hover={{ bg: 'teal.700' }}
            _active={{ bg: 'teal.800' }}
          >
            Update Platform Fee
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
                        header.getContext()
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
    </Card>
  );
}
