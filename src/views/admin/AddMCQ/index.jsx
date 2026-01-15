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
  Button,
  Input,
  FormControl,
  FormLabel,
  useToast,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  InputGroup,
  InputLeftElement,
  Select,
  Badge,
  Tooltip,
  Switch,
  Textarea,
  SimpleGrid,
} from '@chakra-ui/react';
import { MdEdit, MdDelete, MdSearch, MdAdd, MdClose } from 'react-icons/md';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from 'components/card/Card';

export default function MCQManagement() {
  const [chapters, setChapters] = useState([]);
  const [mcqs, setMcqs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    chapterId: '',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: '',
    difficulty: 'medium',
    marks: 4,
    negativeMarks: 1,
    previousYearTag: false,
  });

  const [editData, setEditData] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const toast = useToast();
  const baseUrl = process.env.REACT_APP_BASE_URL;
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchData = async () => {
    try {
      const [chapRes, mcqRes] = await Promise.all([
        axios.get(`${baseUrl}api/admin/chapters`, { headers }),
        axios.get(`${baseUrl}api/admin/mcqs`, { headers }),
      ]);
      setChapters(chapRes.data.data || []);
      setMcqs(mcqRes.data.data || []);
    } catch (err) {
      toast({ title: 'Data load error', status: 'error' });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Dynamic Options
  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleCreate = async () => {
    if (!formData.chapterId || !formData.question || !formData.correctAnswer) {
      return toast({
        title: 'Question, chapter, and correct answer are required',
        status: 'warning',
      });
    }
    setLoading(true);
    try {
      await axios.post(`${baseUrl}api/admin/mcqs`, formData, { headers });
      toast({ title: 'MCQ created successfully!', status: 'success' });
      setFormData({
        chapterId: '',
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        explanation: '',
        difficulty: 'medium',
        marks: 4,
        negativeMarks: 1,
        previousYearTag: false,
      });
      fetchData();
    } catch (err) {
      toast({
        title: err.response?.data?.message || 'Failed to create MCQ',
        status: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this?')) {
      try {
        await axios.delete(`${baseUrl}api/admin/mcqs/${id}`, { headers });
        toast({
          title: 'Subject has been deleted successfully',
          status: 'info',
        });
        fetchData();
      } catch (err) {
        toast({ title: 'Failed to delete subject', status: 'error' });
      }
    }
  };

  const filteredData = mcqs.filter(
    (m) =>
      m.question?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.chapterId?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* ADD MCQ CARD */}
      <Card mb="20px" p="20px">
        <Text color={textColor} fontSize="22px" fontWeight="700" mb="20px">
          Add New MCQ
        </Text>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
          <Box>
            <FormControl mb="3">
              <FormLabel fontSize="sm" fontWeight="700">
                Select Chapter
              </FormLabel>
              <Select
                placeholder="Select Chapter"
                value={formData.chapterId}
                onChange={(e) =>
                  setFormData({ ...formData, chapterId: e.target.value })
                }
              >
                {chapters.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl mb="3">
              <FormLabel fontSize="sm" fontWeight="700">
                Question Text
              </FormLabel>
              <Textarea
                value={formData.question}
                onChange={(e) =>
                  setFormData({ ...formData, question: e.target.value })
                }
                placeholder="Enter question here..."
              />
            </FormControl>

            <SimpleGrid columns={2} spacing={3} mb="3">
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="700">
                  Difficulty
                </FormLabel>
                <Select
                  value={formData.difficulty}
                  onChange={(e) =>
                    setFormData({ ...formData, difficulty: e.target.value })
                  }
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="700">
                  PYQ Tag?
                </FormLabel>
                <Flex align="center" h="40px">
                  <Switch
                    isChecked={formData.previousYearTag}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        previousYearTag: e.target.checked,
                      })
                    }
                  />
                  <Text ml="2" fontSize="xs">
                    Previous Year Question
                  </Text>
                </Flex>
              </FormControl>
            </SimpleGrid>
          </Box>

          <Box>
            <FormLabel fontSize="sm" fontWeight="700">
              Options (Enter at least 2)
            </FormLabel>
            {formData.options.map((opt, idx) => (
              <InputGroup key={idx} mb="2">
                <InputLeftElement children={`${idx + 1}.`} />
                <Input
                  value={opt}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  placeholder={`Option ${idx + 1}`}
                />
              </InputGroup>
            ))}

            <FormControl mt="3">
              <FormLabel fontSize="sm" fontWeight="700" color="brand.500">
                Correct Answer Text
              </FormLabel>
              <Input
                value={formData.correctAnswer}
                onChange={(e) =>
                  setFormData({ ...formData, correctAnswer: e.target.value })
                }
                placeholder="Must match one of the options"
              />
            </FormControl>

            <FormControl mt="3">
              <FormLabel fontSize="sm" fontWeight="700">
                Explanation
              </FormLabel>
              <Input
                value={formData.explanation}
                onChange={(e) =>
                  setFormData({ ...formData, explanation: e.target.value })
                }
                placeholder="Why is this answer correct?"
              />
            </FormControl>
          </Box>
        </SimpleGrid>

        <Button
          colorScheme="brand"
          mt="5"
          onClick={handleCreate}
          isLoading={loading}
          w="full"
        >
          Create MCQ
        </Button>
      </Card>

      {/* MCQ LIST */}
      <Card p="20px">
        <Flex justify="space-between" align="center" mb="20px">
          <Text color={textColor} fontSize="18px" fontWeight="700">
            MCQs List ({filteredData.length})
          </Text>
          <InputGroup maxW="300px">
            <InputLeftElement pointerEvents="none">
              <MdSearch color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search MCQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Flex>

        <Box overflowX="auto">
          <Table variant="simple" color="gray.500">
            <Thead bg={useColorModeValue('gray.50', 'navy.800')}>
              <Tr>
                <Th>Question</Th>
                <Th>Subject</Th>
                <Th>Sub-Subject</Th>
                <Th>Chapter</Th>
                <Th>Difficulty</Th>
                <Th>Marks</Th>
                <Th>PYQ</Th>
                <Th textAlign="right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredData.map((item) => (
                <Tr key={item._id}>
                  <Td maxW="300px">
                    <Tooltip label={item.question}>
                      <Text isTruncated fontWeight="700" color={textColor}>
                        {item.question}
                      </Text>
                    </Tooltip>
                  </Td>
                  {/* SUBJECT */}
                  <Td>
                    <Badge colorScheme="blue" variant="subtle">
                      {item.subjectId?.name || 'N/A'}
                    </Badge>
                  </Td>

                  {/* SUB-SUBJECT */}
                  <Td>
                    <Badge colorScheme="purple" variant="subtle">
                      {item.subSubjectId?.name || 'N/A'}
                    </Badge>
                  </Td>

                  <Td>
                    <Badge variant="outline">
                      {item.chapterId?.name || 'N/A'}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge
                      colorScheme={
                        item.difficulty === 'hard'
                          ? 'red'
                          : item.difficulty === 'medium'
                          ? 'orange'
                          : 'green'
                      }
                    >
                      {item.difficulty}
                    </Badge>
                  </Td>
                  <Td>
                    {item.marks} / -{item.negativeMarks}
                  </Td>
                  <Td>
                    {item.previousYearTag ? (
                      <Badge colorScheme="purple">PYQ</Badge>
                    ) : (
                      '-'
                    )}
                  </Td>
                  <Td textAlign="right">
                    <IconButton
                      variant="ghost"
                      colorScheme="red"
                      icon={<MdDelete />}
                      onClick={() => handleDelete(item._id)}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Card>
    </Box>
  );
}
