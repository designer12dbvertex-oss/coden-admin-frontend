/* eslint-disable */
'use client';

import {
  Box, Flex, Text, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td,
  Badge, Spinner, Input, InputGroup, InputLeftElement, SimpleGrid,
  Icon, Avatar, Tag, TagLabel, VStack // <--- VStack yahan add kiya hai
} from '@chakra-ui/react';
import { SearchIcon, CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
import { MdAttachMoney, MdPeople } from 'react-icons/md';
import axios from 'axios';
import * as React from 'react';
import Card from 'components/card/Card'; 

export default function SubscriptionHistory() {
  const [transactions, setTransactions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const bgItem = useColorModeValue('gray.50', 'navy.700');
  
  // Is URL ko check karein ki aapka backend isi port par hai?
  const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:4000/';
  const token = localStorage.getItem('token');

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      console.log("Fetching from:", `${baseUrl}api/admin/list/payments-list`); // Debugging ke liye
      
      const response = await axios.get(`${baseUrl}api/admin/list/payments-list`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("API Response:", response.data); // Console mein check karein data aa raha hai ya nahi

      if (response.data && response.data.success) {
        setTransactions(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching transactions", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { fetchTransactions(); }, []);

  const filteredData = transactions.filter((t) => 
    t.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = transactions.reduce((acc, curr) => 
    acc + (curr.status === 'success' ? Number(curr.amount) : 0), 0
  );

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap="20px" mb="20px">
        <StatsCard icon={MdAttachMoney} title="Total Revenue" stat={`₹${totalRevenue}`} />
        <StatsCard icon={MdPeople} title="Total Payments" stat={transactions.length} />
      </SimpleGrid>

      <Card flexDirection="column" w="100%" px="25px" py="25px" boxShadow="lg" borderRadius="20px">
        <Flex mb="30px" justifyContent="space-between" align="center" direction={{ base: 'column', md: 'row' }}>
          <Box mb={{ base: "20px", md: "0px" }}>
            <Text color={textColor} fontSize="22px" fontWeight="700">User Subscriptions</Text>
            <Text color="secondaryGray.600" fontSize="sm">Track all user payments and plan validity</Text>
          </Box>
          
          <InputGroup maxW="400px">
            <InputLeftElement children={<SearchIcon color="gray.400" />} />
            <Input 
              variant="filled"
              placeholder="Search by Name, Email or ID..." 
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
                  <Th>Transaction ID</Th>
                  <Th>User Info</Th>
                  <Th>Plan Details</Th>
                  <Th>Amount</Th>
                  <Th>Status</Th>
                  <Th>Expiry Date</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredData.map((row, index) => (
                  <Tr key={index} _hover={{ bg: bgItem }}>
                    <Td fontSize="xs" fontWeight="700" color={textColor}>{row.transactionId || "N/A"}</Td>
                    <Td>
                      <Flex align="center">
                        <Avatar size="sm" name={row.userName} mr="10px" />
                        <Box>
                          <Text color={textColor} fontSize="sm" fontWeight="600">{row.userName}</Text>
                          <Text fontSize="xs">{row.userEmail}</Text>
                        </Box>
                      </Flex>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={0}>
                        <Tag size="sm" colorScheme="purple">{row.planName}</Tag>
                        <Text fontSize="10px" mt="1">{row.duration}</Text>
                      </VStack>
                    </Td>
                    <Td fontWeight="700" color={textColor}>₹{row.amount}</Td>
                    <Td>
                      <Badge 
                        colorScheme={row.status === 'success' || row.status === 'captured' ? 'green' : 'red'} 
                        borderRadius="full" 
                        px="2"
                      >
                        {row.status}
                      </Badge>
                    </Td>
                    <Td>
                      <Box>
                        <Text fontSize="sm" fontWeight="700" color={textColor}>{row.expiryDate}</Text>
                        <Text fontSize="10px" color="gray.400">Bought: {row.buyDate}</Text>
                      </Box>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            {filteredData.length === 0 && (
              <Text textAlign="center" py="5" color="gray.500">No transactions found.</Text>
            )}
          </Box>
        )}
      </Card>
    </Box>
  );
}

function StatsCard({ icon, title, stat }) {
  const bgCard = useColorModeValue('white', 'navy.800');
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  return (
    <Card py="15px" bg={bgCard}>
      <Flex align="center" px="15px">
        <Icon as={icon} w="40px" h="40px" color="brand.500" mr="15px" />
        <Box>
          <Text color="secondaryGray.600" fontSize="sm">{title}</Text>
          <Text color={textColor} fontSize="22px" fontWeight="700">{stat}</Text>
        </Box>
      </Flex>
    </Card>
  );
}