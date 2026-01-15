/* eslint-disable */
'use client';

import {
  Box, Flex, Text, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td,
  Badge, Spinner, Input, InputGroup, InputLeftElement, Stack, SimpleGrid,
  Icon, Avatar, Tag, TagLabel
} from '@chakra-ui/react';
import { SearchIcon, CheckCircleIcon, TimeIcon, WarningIcon } from '@chakra-ui/icons';
import { MdAttachMoney, MdPeople } from 'react-icons/md';
import axios from 'axios';
import * as React from 'react';
import Card from 'components/card/Card'; // Aapka custom card component
import { format } from 'date-fns';

export default function SubscriptionHistory() {
  const [transactions, setTransactions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');

  // Styling Colors
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const iconColor = useColorModeValue('brand.500', 'white');
  const bgItem = useColorModeValue('gray.50', 'navy.700');
  
  const baseUrl = process.env.REACT_APP_BASE_URL;
  const token = localStorage.getItem('token');

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseUrl}api/plans/admin/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.status) {
        setTransactions(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching transactions", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { fetchTransactions(); }, []);

  // Filter Search Logic
  const filteredData = transactions.filter((t) => 
    t.user_id?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.user_id?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats Calculation
  const totalRevenue = transactions.reduce((acc, curr) => acc + (curr.paymentStatus === 'success' ? curr.amount : 0), 0);
  const activeSubs = transactions.filter(t => new Date(t.endDate) > new Date() && t.paymentStatus === 'success').length;

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* 🟢 Stats Cards Section */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="20px" mb="20px">
        <StatsCard icon={MdAttachMoney} title="Total Revenue" stat={`₹${totalRevenue}`} />
        <StatsCard icon={MdPeople} title="Active Subscriptions" stat={activeSubs} />
      </SimpleGrid>

      {/* 🟢 Main Table Card */}
      <Card flexDirection="column" w="100%" px="25px" py="25px" boxShadow="lg" borderRadius="20px">
        <Flex mb="30px" justifyContent="space-between" align="center" direction={{ base: 'column', md: 'row' }} gap={4}>
          <Box>
            <Text color={textColor} fontSize="22px" fontWeight="700">User Subscriptions</Text>
            <Text color="secondaryGray.600" fontSize="sm">Monitor payments and plan validity</Text>
          </Box>
          
          <InputGroup maxW="400px">
            <InputLeftElement children={<SearchIcon color="gray.400" />} />
            <Input 
              variant="filled"
              placeholder="Search by User, Email or Txn ID..." 
              onChange={(e) => setSearchTerm(e.target.value)}
              borderRadius="12px"
            />
          </InputGroup>
        </Flex>

        {loading ? (
          <Flex justify="center" align="center" minH="300px"><Spinner size="xl" color="brand.500" /></Flex>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple" color="gray.500" mb="24px">
              <Thead bg={bgItem}>
                <Tr>
                  <Th color="gray.400">Transaction ID</Th>
                  <Th color="gray.400">User & Contact</Th>
                  <Th color="gray.400">Plan</Th>
                  <Th color="gray.400">Amount</Th>
                  <Th color="gray.400">Status</Th>
                  <Th color="gray.400">Expiry Date</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredData.map((row) => {
                  const isExpired = new Date(row.endDate) < new Date();
                  return (
                    <Tr key={row._id} _hover={{ bg: bgItem }} transition="0.2s">
                      <Td fontSize="xs" fontWeight="700" color={textColor}>{row.transaction_id || row.transactionId}</Td>
                      <Td>
                        <Flex align="center">
                          <Avatar size="sm" name={row.user_id?.name} mr="10px" />
                          <Box>
                            <Text color={textColor} fontSize="sm" fontWeight="600">{row.user_id?.name || 'N/A'}</Text>
                            <Text fontSize="xs" color="secondaryGray.600">{row.user_id?.email}</Text>
                          </Box>
                        </Flex>
                      </Td>
                      <Td>
                        <Tag size="sm" colorScheme="purple" variant="subtle" borderRadius="full">
                          <TagLabel fontWeight="bold">{row.plan_id?.name || 'Standard'}</TagLabel>
                        </Tag>
                      </Td>
                      <Td fontWeight="700" color={textColor}>₹{row.amount}</Td>
                      <Td>
                        <Flex align="center">
                          <Icon
                            as={row.paymentStatus === 'success' ? CheckCircleIcon : row.paymentStatus === 'failed' ? WarningIcon : TimeIcon}
                            color={row.paymentStatus === 'success' ? 'green.500' : row.paymentStatus === 'failed' ? 'red.500' : 'orange.500'}
                            mr="5px"
                          />
                          <Text fontSize="sm" fontWeight="600">
                            {row.paymentStatus.charAt(0).toUpperCase() + row.paymentStatus.slice(1)}
                          </Text>
                        </Flex>
                      </Td>
                      <Td>
                        <Box>
                          <Text fontSize="sm" fontWeight="700" color={isExpired ? 'red.400' : textColor}>
                            {format(new Date(row.endDate), 'MMM dd, yyyy')}
                          </Text>
                          {isExpired ? (
                            <Badge colorScheme="red" variant="subtle" fontSize="10px">Expired</Badge>
                          ) : (
                            <Text fontSize="10px" color="green.500">Active</Text>
                          )}
                        </Box>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
            {filteredData.length === 0 && (
              <Flex direction="column" align="center" py={10}>
                <Text color="gray.400">No transactions match your search.</Text>
              </Flex>
            )}
          </Box>
        )}
      </Card>
    </Box>
  );
}

// 🟢 Helper Component for Stats
function StatsCard({ icon, title, stat }) {
  const bgCard = useColorModeValue('white', 'navy.800');
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  return (
    <Card py="15px" bg={bgCard}>
      <Flex align="center">
        <Icon as={icon} w="30px" h="30px" color="brand.500" mr="15px" />
        <Box>
          <Text color="secondaryGray.600" fontSize="sm" fontWeight="500">{title}</Text>
          <Text color={textColor} fontSize="xl" fontWeight="700">{stat}</Text>
        </Box>
      </Flex>
    </Card>
  );
}