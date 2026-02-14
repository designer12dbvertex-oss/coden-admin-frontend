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
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Card from 'components/card/Card';
import { useDisclosure } from '@chakra-ui/react';
import { MdEdit } from 'react-icons/md';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { MdContentCopy } from 'react-icons/md';

export default function TopicManagement() {
  // Data States (Subject → SubSubject → Chapter → Topic)
  const [subjects, setSubjects] = useState([]);
  const [subSubjects, setSubSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
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
    chapterId: '',
    name: '',
    description: '',
    order: 0,
  });

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const toast = useToast();
  const baseUrl = process.env.REACT_APP_BASE_URL;
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      ['clean'],
    ],
  };

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
  }, [baseUrl]);

  // 2. Hierarchy Logic: Handle Subject Change
  const handleSubjectChange = async (sId) => {
    setFormData({
      ...formData,
      subjectId: sId,
      subSubjectId: '',
      chapterId: '',
    });
    setSubSubjects([]);
    setChapters([]);
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
    setFormData({ ...formData, subSubjectId: ssId, chapterId: '' });
    setChapters([]);
    if (!ssId) return;

    try {
      const res = await axios.get(
        `${baseUrl}api/admin/chapters?subSubjectId=${ssId}`,
        { headers },
      );
      setChapters(res.data.data || []);
    } catch (err) {
      toast({ title: 'Chapter load error', status: 'error' });
    }
  };

  // 4. Hierarchy Logic: Handle Chapter Change
  const handleChapterChange = (chId) => {
    setFormData({ ...formData, chapterId: chId });
  };

  // 5. Fetch All Topics for Table
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

  // 6. Create Topic (Backend-aligned with chapterId)
  const handleCreate = async () => {
    if (!formData.chapterId || !formData.name) {
      return toast({
        title: 'Chapter and Topic Name required',
        status: 'warning',
      });
    }

    setLoading(true);
    try {
      await axios.post(
        `${baseUrl}api/admin/topics`,
        {
          chapterId: formData.chapterId,
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
      toast({
        title: err.response?.data?.message || 'Failed to add topic',
        status: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // 7. Update Topic
  const handleUpdate = async () => {
    try {
      await axios.patch(
        `${baseUrl}api/admin/topics/${editData._id}`,
        {
          name: editData.name,
          description: editData.description,
          order: editData.order,
          chapterId: editData.chapterId?._id || editData.chapterId,
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

  // 8. Delete Topic
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
  const handleCopy = (value) => {
    if (!value) return;

    navigator.clipboard.writeText(value);
    toast({
      title: 'Topic ID copied!',
      status: 'success',
      duration: 1500,
      isClosable: true,
    });
  };

  // 9. Search logic (Topic name, Chapter, SubSubject, Subject)
  const filteredTopics = topics.filter(
    (t) =>
      t.codonId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.chapterId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.chapterId?.subSubjectId?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      t.chapterId?.subSubjectId?.subjectId?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()),
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

        {/* Subject → SubSubject → Chapter Dropdowns */}
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
              isDisabled={!formData.subjectId}
            >
              {subSubjects.map((ss) => (
                <option key={ss._id} value={ss._id}>
                  {ss.name}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm" fontWeight="700">
              3. Chapter
            </FormLabel>
            <Select
              placeholder="Select Chapter"
              value={formData.chapterId}
              onChange={(e) => handleChapterChange(e.target.value)}
              isDisabled={!formData.subSubjectId}
            >
              {chapters.map((ch) => (
                <option key={ch._id} value={ch._id}>
                  {ch.name}
                </option>
              ))}
            </Select>
          </FormControl>
        </SimpleGrid>

        {/* Topic Details */}
        <Flex gap="15px" wrap="wrap" align="flex-end">
          <FormControl width={{ base: '100%', md: '35%' }}>
            <FormLabel fontSize="sm" fontWeight="700">
              4. Topic Name
            </FormLabel>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Ex: Muscles of Mastication"
              isDisabled={!formData.chapterId}
            />
          </FormControl>

          {/* <FormControl width={{ base: '100%', md: '10%' }}>
            <FormLabel fontSize="sm" fontWeight="700">
              Order
            </FormLabel>
            <Input
              type="number"
              value={formData.order}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  order: parseInt(e.target.value) || 0,
                })
              }
              isDisabled={!formData.chapterId}
            />
          </FormControl> */}

          <FormControl flex="1">
            <FormLabel fontSize="sm" fontWeight="700">
              Description
            </FormLabel>

            <ReactQuill
              theme="snow"
              value={formData.description}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  description: value,
                })
              }
              modules={modules}
              style={{ height: '150px', marginBottom: '40px' }}
              // style={{ height: '250px', marginBottom: '40px' }}
            />
          </FormControl>

          <Button
            colorScheme="brand"
            px="40px"
            onClick={handleCreate}
            isLoading={loading}
            isDisabled={!formData.chapterId || !formData.name}
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
            All Topics ({filteredTopics.length})
          </Text>
          <InputGroup maxW="300px">
            <InputLeftElement children={<MdSearch color="gray.300" />} />
            <Input
              placeholder="Search topic, chapter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Flex>

        <Box overflowX="auto">
          <Table variant="simple" color="gray.500">
            <Thead bg={useColorModeValue('gray.50', 'navy.800')}>
              <Tr>
                <Th>Topic ID</Th>
                <Th>Topic Name</Th>
                <Th>Chapter</Th>
                <Th>Sub-Subject</Th>
                <Th>Subject</Th>
                <Th textAlign="right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredTopics.map((item) => (
                <Tr key={item._id}>
                  <Td>
                    <Flex align="center" gap="2">
                      <Text fontSize="sm" fontWeight="600" color="gray.600">
                        {item.codonId || 'N/A'}
                      </Text>

                      <IconButton
                        size="xs"
                        icon={<MdContentCopy />}
                        aria-label="Copy Topic ID"
                        variant="ghost"
                        onClick={() => handleCopy(item.codonId)}
                      />
                    </Flex>
                  </Td>

                  <Td fontWeight="700" color={textColor}>
                    {item.name}
                  </Td>

                  {/* CHAPTER NAME */}
                  <Td>
                    <Badge colorScheme="cyan" variant="subtle">
                      {item.chapterId?.name || 'N/A'}
                    </Badge>
                  </Td>

                  {/* SUB-SUBJECT NAME */}
                  <Td>
                    <Badge colorScheme="purple" variant="subtle">
                      {item.chapterId?.subSubjectId?.name || 'N/A'}
                    </Badge>
                  </Td>

                  {/* SUBJECT NAME */}
                  <Td>
                    <Badge colorScheme="blue" variant="subtle">
                      {item.chapterId?.subSubjectId?.subjectId?.name || 'N/A'}
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
                      aria-label="Edit topic"
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

                      <ReactQuill
                        theme="snow"
                        value={editData.description || ''}
                        onChange={(value) =>
                          setEditData({
                            ...editData,
                            description: value,
                          })
                        }
                        modules={modules}
                        style={{ height: '150px', marginBottom: '40px' }}
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
