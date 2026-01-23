// import React, { useState, useEffect } from 'react';
// import {
//   Box,
//   Button,
//   Table,
//   Thead,
//   Tbody,
//   Tr,
//   Th,
//   Td,
//   Badge,
//   HStack,
//   Select,
//   Input,
//   useToast,
//   Spinner,
//   VStack,
//   Text,
//   IconButton,
//   Modal,
//   ModalOverlay,
//   ModalContent,
//   ModalHeader,
//   ModalBody,
//   ModalCloseButton,
//   ModalFooter,
//   useDisclosure,
// } from '@chakra-ui/react';
// import { EditIcon, DeleteIcon, ViewIcon } from '@chakra-ui/icons';
// import axios from 'axios';

// const TestsList = () => {
//   const toast = useToast();
//   const [tests, setTests] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [selectedTest, setSelectedTest] = useState(null);
//   const { isOpen, onOpen, onClose } = useDisclosure();

//   // API Configuration
//   const baseUrl = process.env.REACT_APP_BASE_URL || '';
//   const token = localStorage.getItem('token');
//   const getHeaders = () => ({
//     headers: { Authorization: `Bearer ${token}` },
//   });

//   // Filter states
//   const [filters, setFilters] = useState({
//     category: '',
//     status: 'active',
//     testMode: '',
//     page: 1,
//     limit: 10,
//   });

//   const [pagination, setPagination] = useState({
//     total: 0,
//     pages: 0,
//   });

//   useEffect(() => {
//     fetchTests();
//   }, [filters]);

//   const fetchTests = async () => {
//     setLoading(true);
//     try {
//       const params = new URLSearchParams();
//       if (filters.category) params.append('category', filters.category);
//       if (filters.status) params.append('status', filters.status);
//       if (filters.testMode) params.append('testMode', filters.testMode);
//       params.append('page', filters.page);
//       params.append('limit', filters.limit);

//       const response = await axios.get(
//         `${baseUrl}api/admin/tests?${params}`,
//         getHeaders()
//       );
//       setTests(response.data.data || []);
//       setPagination(response.data.pagination || { total: 0, pages: 0 });
//     } catch (error) {
//       toast({
//         title: 'Error',
//         description: error.response?.data?.message || 'Failed to fetch tests',
//         status: 'error',
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeleteTest = async (testId) => {
//     if (!window.confirm('Are you sure you want to delete this test?')) return;

//     try {
//       await axios.delete(`${baseUrl}api/admin/tests/${testId}`, getHeaders());
//       toast({
//         title: 'Success',
//         description: 'Test deleted successfully',
//         status: 'success',
//       });
//       fetchTests();
//     } catch (error) {
//       toast({
//         title: 'Error',
//         description: error.response?.data?.message || 'Failed to delete test',
//         status: 'error',
//       });
//     }
//   };

//   const handleViewTest = async (testId) => {
//     try {
//       const response = await axios.get(
//         `${baseUrl}api/admin/tests/${testId}`,
//         getHeaders()
//       );
//       setSelectedTest(response.data.data);
//       onOpen();
//     } catch (error) {
//       toast({
//         title: 'Error',
//         description: error.response?.data?.message || 'Failed to fetch test details',
//         status: 'error',
//       });
//     }
//   };

//   return (
//     <Box>
//       <VStack spacing={6} align="stretch">
//         {/* FILTERS */}
//         <HStack spacing={4}>
//           <Select
//             placeholder="All Categories"
//             value={filters.category}
//             onChange={(e) =>
//               setFilters({ ...filters, category: e.target.value, page: 1 })
//             }
//             width="150px"
//           >
//             <option value="grand">Grand Test</option>
//             <option value="subject">Subject Test</option>
//           </Select>

//           <Select
//             value={filters.status}
//             onChange={(e) =>
//               setFilters({ ...filters, status: e.target.value, page: 1 })
//             }
//             width="150px"
//           >
//             <option value="">All Status</option>
//             <option value="active">Active</option>
//             <option value="inactive">Inactive</option>
//             <option value="draft">Draft</option>
//           </Select>

//           <Select
//             placeholder="All Modes"
//             value={filters.testMode}
//             onChange={(e) =>
//               setFilters({ ...filters, testMode: e.target.value, page: 1 })
//             }
//             width="150px"
//           >
//             <option value="regular">Regular</option>
//             <option value="exam">Exam</option>
//           </Select>
//         </HStack>

//         {/* TESTS TABLE */}
//         {loading ? (
//           <Spinner />
//         ) : (
//           <>
//             <Box overflowX="auto">
//               <Table variant="simple">
//                 <Thead>
//                   <Tr>
//                     <Th>Test Title</Th>
//                     <Th>Category</Th>
//                     <Th>Mode</Th>
//                     <Th>Questions</Th>
//                     <Th>Status</Th>
//                     <Th>Created</Th>
//                     <Th>Actions</Th>
//                   </Tr>
//                 </Thead>
//                 <Tbody>
//                   {tests.map((test) => (
//                     <Tr key={test._id}>
//                       <Td fontWeight="bold">{test.testTitle}</Td>
//                       <Td>
//                         <Badge colorScheme={test.category === 'grand' ? 'green' : 'blue'}>
//                           {test.category === 'grand' ? 'Grand' : 'Subject'}
//                         </Badge>
//                       </Td>
//                       <Td>
//                         <Badge colorScheme={test.testMode === 'exam' ? 'orange' : 'cyan'}>
//                           {test.testMode}
//                         </Badge>
//                       </Td>
//                       <Td>{test.totalQuestions}</Td>
//                       <Td>
//                         <Badge colorScheme={test.status === 'active' ? 'success' : 'gray'}>
//                           {test.status}
//                         </Badge>
//                       </Td>
//                       <Td>{new Date(test.createdAt).toLocaleDateString()}</Td>
//                       <Td>
//                         <HStack spacing={2}>
//                           <IconButton
//                             icon={<ViewIcon />}
//                             size="sm"
//                             onClick={() => handleViewTest(test._id)}
//                           />
//                           <IconButton
//                             icon={<EditIcon />}
//                             size="sm"
//                             colorScheme="blue"
//                             // onClick={() => handleEditTest(test._id)}
//                           />
//                           <IconButton
//                             icon={<DeleteIcon />}
//                             size="sm"
//                             colorScheme="red"
//                             onClick={() => handleDeleteTest(test._id)}
//                           />
//                         </HStack>
//                       </Td>
//                     </Tr>
//                   ))}
//                 </Tbody>
//               </Table>
//             </Box>

//             {/* PAGINATION */}
//             <HStack justify="center" spacing={4}>
//               <Button
//                 onClick={() =>
//                   setFilters({ ...filters, page: Math.max(1, filters.page - 1) })
//                 }
//                 disabled={filters.page === 1}
//               >
//                 Previous
//               </Button>
//               <Text>
//                 Page {filters.page} of {pagination.pages}
//               </Text>
//               <Button
//                 onClick={() =>
//                   setFilters({
//                     ...filters,
//                     page: Math.min(pagination.pages, filters.page + 1),
//                   })
//                 }
//                 disabled={filters.page === pagination.pages}
//               >
//                 Next
//               </Button>
//             </HStack>
//           </>
//         )}

//         {/* DETAIL MODAL */}
//         <Modal isOpen={isOpen} onClose={onClose} size="lg">
//           <ModalOverlay />
//           <ModalContent>
//             <ModalHeader>{selectedTest?.testTitle}</ModalHeader>
//             <ModalCloseButton />
//             <ModalBody>
//               {selectedTest && (
//                 <VStack align="start" spacing={4}>
//                   <Box>
//                     <Text fontWeight="bold">Month:</Text>
//                     <Text>{selectedTest.month}</Text>
//                   </Box>
//                   <Box>
//                     <Text fontWeight="bold">Academic Year:</Text>
//                     <Text>{selectedTest.academicYear}</Text>
//                   </Box>
//                   <Box>
//                     <Text fontWeight="bold">Total Questions:</Text>
//                     <Text>{selectedTest.totalQuestions}</Text>
//                   </Box>
//                   {selectedTest.timeLimit && (
//                     <Box>
//                       <Text fontWeight="bold">Time Limit:</Text>
//                       <Text>{selectedTest.timeLimit} minutes</Text>
//                     </Box>
//                   )}
//                   {selectedTest.description && (
//                     <Box>
//                       <Text fontWeight="bold">Description:</Text>
//                       <Text>{selectedTest.description}</Text>
//                     </Box>
//                   )}
//                 </VStack>
//               )}
//             </ModalBody>
//             <ModalFooter>
//               <Button onClick={onClose}>Close</Button>
//             </ModalFooter>
//           </ModalContent>
//         </Modal>
//       </VStack>
//     </Box>
//   );
// };

// export default TestsList;

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  HStack,
  Select,
  Input,
  useToast,
  Spinner,
  VStack,
  Text,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useDisclosure,
  Heading,
  Card,
  CardHeader,
  CardBody,
  Divider,
  Flex,
  SimpleGrid,
  Tag,
  TagLabel,
  TagLeftIcon,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, ViewIcon, SearchIcon } from '@chakra-ui/icons';
import axios from 'axios';

const TestsList = () => {
  const toast = useToast();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // API Configuration
  const baseUrl = process.env.REACT_APP_BASE_URL || '';
  const token = localStorage.getItem('token');
  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` },
  });

  // Filter states
  const [filters, setFilters] = useState({
    category: '',
    status: 'active',
    testMode: '',
    page: 1,
    limit: 10,
  });

  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchTests();
  }, [filters]);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.status) params.append('status', filters.status);
      if (filters.testMode) params.append('testMode', filters.testMode);
      params.append('page', filters.page);
      params.append('limit', filters.limit);

      const response = await axios.get(
        `${baseUrl}api/admin/tests?${params}`,
        getHeaders(),
      );
      setTests(response.data.data || []);
      setPagination(response.data.pagination || { total: 0, pages: 0 });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch tests',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTest = async (testId) => {
    if (!window.confirm('Are you sure you want to delete this test?')) return;

    try {
      await axios.delete(`${baseUrl}api/admin/tests/${testId}`, getHeaders());
      toast({
        title: 'Success',
        description: 'Test deleted successfully',
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
      fetchTests();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete test',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleViewTest = async (testId) => {
    try {
      const response = await axios.get(
        `${baseUrl}api/admin/tests/${testId}`,
        getHeaders(),
      );
      setSelectedTest(response.data.data);
      onOpen();
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error.response?.data?.message || 'Failed to fetch test details',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Split tests into two groups for better visual separation
  const grandTests = tests.filter((t) => t.category === 'grand');
  const subjectTests = tests.filter((t) => t.category === 'subject');

  return (
    <Box p={6} bg="gray.50" minH="100vh">
      <VStack spacing={8} align="stretch">
        {/* Header + Filters */}
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <Heading size="lg" color="gray.800">
            Test Management
          </Heading>

          <HStack spacing={3} flexWrap="wrap">
            <Select
              placeholder="All Categories"
              value={filters.category}
              onChange={(e) =>
                setFilters({ ...filters, category: e.target.value, page: 1 })
              }
              width={{ base: 'full', sm: '180px' }}
              bg="white"
              shadow="sm"
            >
              <option value="grand">Grand Test</option>
              <option value="subject">Subject Test</option>
            </Select>

            <Select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value, page: 1 })
              }
              width={{ base: 'full', sm: '160px' }}
              bg="white"
              shadow="sm"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </Select>

            <Select
              placeholder="All Modes"
              value={filters.testMode}
              onChange={(e) =>
                setFilters({ ...filters, testMode: e.target.value, page: 1 })
              }
              width={{ base: 'full', sm: '160px' }}
              bg="white"
              shadow="sm"
            >
              <option value="regular">Regular</option>
              <option value="exam">Exam</option>
            </Select>

            <IconButton
              aria-label="Search"
              icon={<SearchIcon />}
              colorScheme="blue"
              variant="outline"
              isDisabled // just visual for now
            />
          </HStack>
        </Flex>

        {loading ? (
          <Flex justify="center" align="center" h="60vh">
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="blue.500"
              size="xl"
            />
          </Flex>
        ) : (
          <VStack spacing={10} align="stretch">
            {/* GRAND TESTS SECTION */}
            <Card shadow="md" borderRadius="lg" overflow="hidden">
              <CardHeader bg="blue.600" color="white" py={4}>
                <Heading size="md">Grand Tests</Heading>
              </CardHeader>
              <CardBody p={0}>
                {grandTests.length === 0 ? (
                  <Flex justify="center" py={10} color="gray.500">
                    No Grand Tests found
                  </Flex>
                ) : (
                  <Box overflowX="auto">
                    <Table variant="simple">
                      <Thead bg="gray.100">
                        <Tr>
                          <Th>Test Title</Th>
                          <Th>Mode</Th>
                          <Th>Questions</Th>
                          <Th>Status</Th>
                          <Th>Created</Th>
                          <Th isNumeric>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {grandTests.map((test) => (
                          <Tr key={test._id} _hover={{ bg: 'gray.50' }}>
                            <Td fontWeight="medium">{test.testTitle}</Td>
                            <Td>
                              <Tag
                                colorScheme={
                                  test.testMode === 'exam' ? 'orange' : 'cyan'
                                }
                                variant="subtle"
                              >
                                {test.testMode}
                              </Tag>
                            </Td>
                            <Td>{test.totalQuestions}</Td>
                            <Td>
                              <Badge
                                colorScheme={
                                  test.status === 'active'
                                    ? 'green'
                                    : test.status === 'draft'
                                      ? 'purple'
                                      : 'gray'
                                }
                                px={3}
                                py={1}
                                borderRadius="full"
                              >
                                {test.status}
                              </Badge>
                            </Td>
                            <Td>
                              {new Date(test.createdAt).toLocaleDateString()}
                            </Td>
                            <Td isNumeric>
                              <HStack spacing={2} justify="flex-end">
                                <IconButton
                                  icon={<ViewIcon />}
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="blue"
                                  onClick={() => handleViewTest(test._id)}
                                />
                                {/* <IconButton
                                  icon={<EditIcon />}
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="blue"
                                  // onClick={() => handleEditTest(test._id)}
                                /> */}
                                <IconButton
                                  icon={<DeleteIcon />}
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="red"
                                  onClick={() => handleDeleteTest(test._id)}
                                />
                              </HStack>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                )}
              </CardBody>
            </Card>

            {/* SUBJECT TESTS SECTION */}
            <Card shadow="md" borderRadius="lg" overflow="hidden">
              <CardHeader bg="purple.600" color="white" py={4}>
                <Heading size="md">Subject Tests</Heading>
              </CardHeader>
              <CardBody p={0}>
                {subjectTests.length === 0 ? (
                  <Flex justify="center" py={10} color="gray.500">
                    No Subject Tests found
                  </Flex>
                ) : (
                  <Box overflowX="auto">
                    <Table variant="simple">
                      <Thead bg="gray.100">
                        <Tr>
                          <Th>Test Title</Th>
                          <Th>Mode</Th>
                          <Th>Questions</Th>
                          <Th>Status</Th>
                          <Th>Created</Th>
                          <Th isNumeric>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {subjectTests.map((test) => (
                          <Tr key={test._id} _hover={{ bg: 'gray.50' }}>
                            <Td fontWeight="medium">{test.testTitle}</Td>
                            <Td>
                              <Tag
                                colorScheme={
                                  test.testMode === 'exam' ? 'orange' : 'cyan'
                                }
                                variant="subtle"
                              >
                                {test.testMode}
                              </Tag>
                            </Td>
                            <Td>{test.totalQuestions}</Td>
                            <Td>
                              <Badge
                                colorScheme={
                                  test.status === 'active'
                                    ? 'green'
                                    : test.status === 'draft'
                                      ? 'purple'
                                      : 'gray'
                                }
                                px={3}
                                py={1}
                                borderRadius="full"
                              >
                                {test.status}
                              </Badge>
                            </Td>
                            <Td>
                              {new Date(test.createdAt).toLocaleDateString()}
                            </Td>
                            <Td isNumeric>
                              <HStack spacing={2} justify="flex-end">
                                <IconButton
                                  icon={<ViewIcon />}
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="blue"
                                  onClick={() => handleViewTest(test._id)}
                                />
                                {/* <IconButton
                                  icon={<EditIcon />}
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="blue"
                                  // onClick={() => handleEditTest(test._id)}
                                /> */}
                                <IconButton
                                  icon={<DeleteIcon />}
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="red"
                                  onClick={() => handleDeleteTest(test._id)}
                                />
                              </HStack>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                )}
              </CardBody>
            </Card>

            {/* Pagination */}
            <Flex justify="center" mt={6}>
              <HStack spacing={4}>
                <Button
                  colorScheme="blue"
                  variant="outline"
                  onClick={() =>
                    setFilters({
                      ...filters,
                      page: Math.max(1, filters.page - 1),
                    })
                  }
                  isDisabled={filters.page === 1}
                >
                  Previous
                </Button>

                <Text fontWeight="medium">
                  Page {filters.page} of {pagination.pages || 1}
                </Text>

                <Button
                  colorScheme="blue"
                  variant="outline"
                  onClick={() =>
                    setFilters({
                      ...filters,
                      page: Math.min(pagination.pages, filters.page + 1),
                    })
                  }
                  isDisabled={filters.page >= pagination.pages}
                >
                  Next
                </Button>
              </HStack>
            </Flex>
          </VStack>
        )}

        {/* DETAIL MODAL - slightly improved */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent borderRadius="xl">
            <ModalHeader bg="gray.100" borderBottomWidth="1px">
              {selectedTest?.testTitle || 'Test Details'}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody py={6}>
              {selectedTest && (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <Box>
                    <Text fontWeight="bold" color="gray.700">
                      Category
                    </Text>
                    <Tag
                      mt={1}
                      colorScheme={
                        selectedTest.category === 'grand' ? 'blue' : 'purple'
                      }
                    >
                      {selectedTest.category === 'grand'
                        ? 'Grand Test'
                        : 'Subject Test'}
                    </Tag>
                  </Box>

                  <Box>
                    <Text fontWeight="bold" color="gray.700">
                      Mode
                    </Text>
                    <Tag
                      mt={1}
                      colorScheme={
                        selectedTest.testMode === 'exam' ? 'orange' : 'cyan'
                      }
                    >
                      {selectedTest.testMode}
                    </Tag>
                  </Box>

                  <Box>
                    <Text fontWeight="bold" color="gray.700">
                      Month
                    </Text>
                    <Text mt={1}>{selectedTest.month || '-'}</Text>
                  </Box>

                  <Box>
                    <Text fontWeight="bold" color="gray.700">
                      Academic Year
                    </Text>
                    <Text mt={1}>{selectedTest.academicYear || '-'}</Text>
                  </Box>

                  <Box>
                    <Text fontWeight="bold" color="gray.700">
                      Total Questions
                    </Text>
                    <Text mt={1} fontSize="lg" fontWeight="semibold">
                      {selectedTest.totalQuestions}
                    </Text>
                  </Box>

                  {selectedTest.timeLimit && (
                    <Box>
                      <Text fontWeight="bold" color="gray.700">
                        Time Limit
                      </Text>
                      <Text mt={1}>{selectedTest.timeLimit} minutes</Text>
                    </Box>
                  )}

                  {selectedTest.description && (
                    <Box gridColumn="1 / -1">
                      <Text fontWeight="bold" color="gray.700">
                        Description
                      </Text>
                      <Text mt={2} whiteSpace="pre-wrap">
                        {selectedTest.description}
                      </Text>
                    </Box>
                  )}
                </SimpleGrid>
              )}
            </ModalBody>
            <ModalFooter borderTopWidth="1px" bg="gray.50">
              <Button colorScheme="blue" onClick={onClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  );
};

export default TestsList;
