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
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, ViewIcon } from '@chakra-ui/icons';
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
        getHeaders()
      );
      setTests(response.data.data || []);
      setPagination(response.data.pagination || { total: 0, pages: 0 });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch tests',
        status: 'error',
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
      });
      fetchTests();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete test',
        status: 'error',
      });
    }
  };

  const handleViewTest = async (testId) => {
    try {
      const response = await axios.get(
        `${baseUrl}api/admin/tests/${testId}`,
        getHeaders()
      );
      setSelectedTest(response.data.data);
      onOpen();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch test details',
        status: 'error',
      });
    }
  };

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* FILTERS */}
        <HStack spacing={4}>
          <Select
            placeholder="All Categories"
            value={filters.category}
            onChange={(e) =>
              setFilters({ ...filters, category: e.target.value, page: 1 })
            }
            width="150px"
          >
            <option value="grand">Grand Test</option>
            <option value="subject">Subject Test</option>
          </Select>

          <Select
            value={filters.status}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value, page: 1 })
            }
            width="150px"
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
            width="150px"
          >
            <option value="regular">Regular</option>
            <option value="exam">Exam</option>
          </Select>
        </HStack>

        {/* TESTS TABLE */}
        {loading ? (
          <Spinner />
        ) : (
          <>
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Test Title</Th>
                    <Th>Category</Th>
                    <Th>Mode</Th>
                    <Th>Questions</Th>
                    <Th>Status</Th>
                    <Th>Created</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {tests.map((test) => (
                    <Tr key={test._id}>
                      <Td fontWeight="bold">{test.testTitle}</Td>
                      <Td>
                        <Badge colorScheme={test.category === 'grand' ? 'green' : 'blue'}>
                          {test.category === 'grand' ? 'Grand' : 'Subject'}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge colorScheme={test.testMode === 'exam' ? 'orange' : 'cyan'}>
                          {test.testMode}
                        </Badge>
                      </Td>
                      <Td>{test.totalQuestions}</Td>
                      <Td>
                        <Badge colorScheme={test.status === 'active' ? 'success' : 'gray'}>
                          {test.status}
                        </Badge>
                      </Td>
                      <Td>{new Date(test.createdAt).toLocaleDateString()}</Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            icon={<ViewIcon />}
                            size="sm"
                            onClick={() => handleViewTest(test._id)}
                          />
                          <IconButton
                            icon={<EditIcon />}
                            size="sm"
                            colorScheme="blue"
                            // onClick={() => handleEditTest(test._id)}
                          />
                          <IconButton
                            icon={<DeleteIcon />}
                            size="sm"
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

            {/* PAGINATION */}
            <HStack justify="center" spacing={4}>
              <Button
                onClick={() =>
                  setFilters({ ...filters, page: Math.max(1, filters.page - 1) })
                }
                disabled={filters.page === 1}
              >
                Previous
              </Button>
              <Text>
                Page {filters.page} of {pagination.pages}
              </Text>
              <Button
                onClick={() =>
                  setFilters({
                    ...filters,
                    page: Math.min(pagination.pages, filters.page + 1),
                  })
                }
                disabled={filters.page === pagination.pages}
              >
                Next
              </Button>
            </HStack>
          </>
        )}

        {/* DETAIL MODAL */}
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{selectedTest?.testTitle}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedTest && (
                <VStack align="start" spacing={4}>
                  <Box>
                    <Text fontWeight="bold">Month:</Text>
                    <Text>{selectedTest.month}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold">Academic Year:</Text>
                    <Text>{selectedTest.academicYear}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold">Total Questions:</Text>
                    <Text>{selectedTest.totalQuestions}</Text>
                  </Box>
                  {selectedTest.timeLimit && (
                    <Box>
                      <Text fontWeight="bold">Time Limit:</Text>
                      <Text>{selectedTest.timeLimit} minutes</Text>
                    </Box>
                  )}
                  {selectedTest.description && (
                    <Box>
                      <Text fontWeight="bold">Description:</Text>
                      <Text>{selectedTest.description}</Text>
                    </Box>
                  )}
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button onClick={onClose}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  );
};

export default TestsList;
