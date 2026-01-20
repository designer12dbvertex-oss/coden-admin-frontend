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
  InputGroup,
  InputLeftElement,
  Select,
  Badge,
  SimpleGrid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  IconButton,
} from '@chakra-ui/react';
import { MdDelete, MdSearch, MdTopic, MdAccountTree } from 'react-icons/md';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from 'components/card/Card';
import { useDisclosure } from '@chakra-ui/react';
import { MdEdit } from 'react-icons/md';

export default function TopicManagement() {
  // Data States
  const [subjects, setSubjects] = useState([]);
  const [subSubjects, setSubSubjects] = useState([]);
  const [topics, setTopics] = useState([]);

  // Table/UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Form States (Backend-aligned)
  const [formData, setFormData] = useState({
    subjectId: '',
    subSubjectId: '',
    name: '',
    description: '',
    order: 0,
  });

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const toast = useToast();
  const baseUrl = process.env.REACT_APP_BASE_URL;
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  // 1. Fetch Initial Data (Subjects)
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await axios.get(`${baseUrl}api/admin/subjects`, {
          headers,
        });
        setSubjects(res.data.data || []);
      } catch (err) {
        toast({ title: 'Error loading subjects', status: 'error' });
      }
    };
    fetchSubjects();
    fetchAllTopics(); // Initial table load
  }, []);

  // 2. Hierarchy Logic: Handle Subject Change
  const handleSubjectChange = async (sId) => {
    setFormData({
      ...formData,
      subjectId: sId,
      subSubjectId: '',
    });
    setSubSubjects([]);
    if (!sId) return;

    try {
      const res = await axios.get(
        `${baseUrl}api/admin/sub-subjects?subjectId=${sId}`,
        { headers },
      );
      setSubSubjects(res.data.data || []);
    } catch (err) {
      toast({ title: 'Sub-subject load error', status: 'error' });
    }
  };

  // 3. Hierarchy Logic: Handle Sub-Subject Change
  const handleSubSubjectChange = async (ssId) => {
    setFormData({ ...formData, subSubjectId: ssId });
    if (!ssId) return;
  };

  // 4. Fetch All Topics for Table
  const fetchAllTopics = async () => {
    try {
      const res = await axios.get(`${baseUrl}api/admin/topics`, { headers });
      if (res.data && res.data.success) {
        setTopics(res.data.data);
      }
    } catch (err) {
      console.error('List load error:', err);
    }
  };

  // 5. Create Topic (Backend-aligned)
  const handleCreate = async () => {
    if (!formData.subSubjectId || !formData.name) {
      return toast({
        title: 'Sub-Subject and Topic Name required',
        status: 'warning',
      });
    }

    setLoading(true);
    try {
      await axios.post(
        `${baseUrl}api/admin/topics`,
        {
          subSubjectId: formData.subSubjectId,
          name: formData.name,
          description: formData.description,
          order: formData.order,
        },
        { headers },
      );

      toast({ title: 'Topic added successfully!', status: 'success' });

      setFormData({
        ...formData,
        name: '',
        description: '',
        order: 0,
      });

      fetchAllTopics();
    } catch (err) {
      toast({ title: 'Failed to add topic', status: 'error' });
    } finally {
      setLoading(false);
    }
  };
  const handleUpdate = async () => {
    try {
      await axios.patch(
        `${baseUrl}api/admin/topics/${editData._id}`,
        {
          name: editData.name,
          description: editData.description,
          order: editData.order,
          subSubjectId: editData.subSubjectId?._id || editData.subSubjectId,
        },
        { headers },
      );

      toast({ title: 'Topic updated successfully', status: 'success' });
      onClose();
      fetchAllTopics();
    } catch (err) {
      toast({ title: 'Update failed', status: 'error' });
    }
  };

  // 6. Delete Topic
  const handleDelete = async (id) => {
    if (window.confirm('Delete this topic?')) {
      try {
        await axios.delete(`${baseUrl}api/admin/topics/${id}`, { headers });
        toast({ title: 'Topic deleted', status: 'info' });
        fetchAllTopics();
      } catch (err) {
        toast({ title: 'Delete failed', status: 'error' });
      }
    }
  };

  // 7. Search logic (Backend-aligned)
  const filteredTopics = topics.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subSubjectId?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* ADD TOPIC CARD */}
      <Card mb="20px" p="20px">
        <Flex align="center" mb="20px">
          <MdAccountTree size="24px" style={{ marginRight: '10px' }} />
          <Text color={textColor} fontSize="22px" fontWeight="700">
            Add Topic
          </Text>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing="15px" mb="15px">
          <FormControl>
            <FormLabel fontSize="sm" fontWeight="700">
              1. Subject
            </FormLabel>
            <Select
              placeholder="Select Subject"
              value={formData.subjectId}
              onChange={(e) => handleSubjectChange(e.target.value)}
            >
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm" fontWeight="700">
              2. Sub-Subject
            </FormLabel>
            <Select
              placeholder="Select Sub-Subject"
              value={formData.subSubjectId}
              onChange={(e) => handleSubSubjectChange(e.target.value)}
            >
              {subSubjects.map((ss) => (
                <option key={ss._id} value={ss._id}>
                  {ss.name}
                </option>
              ))}
            </Select>
          </FormControl>
        </SimpleGrid>

        <Flex gap="15px" wrap="wrap" align="flex-end">
          <FormControl width={{ base: '100%', md: '40%' }}>
            <FormLabel fontSize="sm" fontWeight="700">
              3. Topic Name
            </FormLabel>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Ex: Muscles of Mastication"
            />
          </FormControl>

          <FormControl width={{ base: '100%', md: '10%' }}>
            <FormLabel fontSize="sm" fontWeight="700">
              Order
            </FormLabel>
            <Input
              type="number"
              value={formData.order}
              onChange={(e) =>
                setFormData({ ...formData, order: e.target.value })
              }
            />
          </FormControl>

          <FormControl flex="1">
            <FormLabel fontSize="sm" fontWeight="700">
              Topic Description
            </FormLabel>
            <Input
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
              placeholder="Details about this topic..."
            />
          </FormControl>

          <Button
            colorScheme="brand"
            px="40px"
            onClick={handleCreate}
            isLoading={loading}
            leftIcon={<MdTopic />}
          >
            Save Topic
          </Button>
        </Flex>
      </Card>

      {/* TOPIC LIST TABLE */}
      <Card p="20px">
        <Flex justify="space-between" align="center" mb="20px">
          <Text color={textColor} fontSize="18px" fontWeight="700">
            All Topics
          </Text>
          <InputGroup maxW="300px">
            <InputLeftElement children={<MdSearch color="gray.300" />} />
            <Input
              placeholder="Search topic or sub-subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Flex>

        <Box overflowX="auto">
          <Table variant="simple" color="gray.500">
            <Thead bg={useColorModeValue('gray.50', 'navy.800')}>
              <Tr>
                <Th>Order</Th>
                <Th>Topic Name</Th>
                <Th>Sub-Subject</Th>
                <Th>Subject</Th>
                <Th textAlign="right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredTopics.map((item) => (
                <Tr key={item._id}>
                  <Td>{item.order}</Td>
                  <Td fontWeight="700" color={textColor}>
                    {item.name}
                  </Td>

                  {/* SUB-SUBJECT NAME */}
                  <Td>
                    <Badge colorScheme="purple" variant="subtle">
                      {item.subSubjectId?.name || 'N/A'}
                    </Badge>
                  </Td>
                  {/* ✅ SUBJECT NAME */}
                  <Td>
                    <Badge colorScheme="blue" variant="subtle">
                      {item.subSubjectId?.subjectId?.name || 'N/A'}
                    </Badge>
                  </Td>

                  <Td textAlign="right">
                    <IconButton
                      size="sm"
                      icon={<MdEdit />}
                      mr="2"
                      onClick={() => {
                        setEditData(item);
                        onOpen();
                      }}
                    />

                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => handleDelete(item._id)}
                      leftIcon={<MdDelete />}
                    >
                      Delete
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          {/* EDIT MODAL */}
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent pb="4">
              <ModalHeader>Edit Topic</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                {editData && (
                  <Flex direction="column" gap="4">
                    <FormControl>
                      <FormLabel>Topic Name</FormLabel>
                      <Input
                        value={editData.name}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            name: e.target.value,
                          })
                        }
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Description</FormLabel>
                      <Input
                        value={editData.description || ''}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            description: e.target.value,
                          })
                        }
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Order</FormLabel>
                      <Input
                        type="number"
                        value={editData.order}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            order: e.target.value,
                          })
                        }
                      />
                    </FormControl>
                  </Flex>
                )}
              </ModalBody>

              <ModalFooter>
                <Button colorScheme="brand" onClick={handleUpdate}>
                  Update
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </Box>
      </Card>
    </Box>
  );
}
