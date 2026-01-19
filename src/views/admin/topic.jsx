'use client';

import {
  Box, Flex, Table, Tbody, Td, Text, Th, Thead, Tr, useColorModeValue,
  Button, Input, FormControl, FormLabel, useToast, IconButton,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter,
  ModalBody, ModalCloseButton, useDisclosure, InputGroup,
  InputLeftElement, Select, Badge, Tooltip, Switch, SimpleGrid
} from '@chakra-ui/react';
import {
  MdEdit, MdDelete, MdSearch, MdTopic, MdAccountTree, MdFormatListNumbered
} from 'react-icons/md';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from 'components/card/Card';

export default function TopicManagement() {
  // Data States
  const [subjects, setSubjects] = useState([]);
  const [subSubjects, setSubSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [topics, setTopics] = useState([]);
  
  // Table/UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editData, setEditData] = useState(null);

  // Form States (Hierarchy based)
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

  // 1. Fetch Initial Data (Subjects)
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await axios.get(`${baseUrl}api/admin/subjects`, { headers });
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
    setFormData({ ...formData, subjectId: sId, subSubjectId: '', chapterId: '' });
    setSubSubjects([]);
    setChapters([]);
    if (!sId) return;
    try {
      const res = await axios.get(`${baseUrl}api/admin/sub-subjects?subjectId=${sId}`, { headers });
      setSubSubjects(res.data.data || []);
    } catch (err) { toast({ title: 'Sub-subject load error', status: 'error' }); }
  };

  // 3. Hierarchy Logic: Handle Sub-Subject Change
  const handleSubSubjectChange = async (ssId) => {
    setFormData({ ...formData, subSubjectId: ssId, chapterId: '' });
    setChapters([]);
    if (!ssId) return;
    try {
      const res = await axios.get(`${baseUrl}api/admin/chapters?subSubjectId=${ssId}`, { headers });
      setChapters(res.data.data || []);
    } catch (err) { toast({ title: 'Chapter load error', status: 'error' }); }
  };

  // 4. Fetch All Topics for Table
 const fetchAllTopics = async () => {
  try {
    const res = await axios.get(`${baseUrl}api/admin/topics`, { headers });
    // Structure check: res.data.data
    if (res.data && res.data.success) {
      setTopics(res.data.data); 
    } else {
      console.log("Data structure issue:", res.data);
    }
  } catch (err) {
    console.error("List load error:", err);
  }
};

  // 5. Create Topic
  const handleCreate = async () => {
    if (!formData.chapterId || !formData.name) {
      return toast({ title: 'Chapter and Topic Name required', status: 'warning' });
    }
    setLoading(true);
    try {
      await axios.post(`${baseUrl}api/admin/topics`, formData, { headers });
      toast({ title: 'Topic added to QBank!', status: 'success' });
      setFormData({ ...formData, name: '', description: '', order: 0 });
      fetchAllTopics();
    } catch (err) {
      toast({ title: 'Failed to add topic', status: 'error' });
    } finally { setLoading(false); }
  };

  // 6. Delete Topic
  const handleDelete = async (id) => {
    if (window.confirm('Delete this topic?')) {
      try {
        await axios.delete(`${baseUrl}api/admin/topics/${id}`, { headers });
        toast({ title: 'Topic deleted', status: 'info' });
        fetchAllTopics();
      } catch (err) { toast({ title: 'Delete failed', status: 'error' }); }
    }
  };

  const filteredTopics = topics.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.chapterId?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* ADD TOPIC CARD (QBank Hierarchy) */}
      <Card mb="20px" p="20px">
        <Flex align="center" mb="20px">
          <MdAccountTree size="24px" style={{marginRight: '10px'}} />
          <Text color={textColor} fontSize="22px" fontWeight="700">Add QBank Topic</Text>
        </Flex>
        
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing="15px" mb="15px">
          <FormControl>
            <FormLabel fontSize="sm" fontWeight="700">1. Subject </FormLabel>
            <Select placeholder="Select Subject" value={formData.subjectId} onChange={(e) => handleSubjectChange(e.target.value)}>
              {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm" fontWeight="700">2. Sub-Subject </FormLabel>
            <Select placeholder="Select Sub-Subject" value={formData.subSubjectId} onChange={(e) => handleSubSubjectChange(e.target.value)}>
              {subSubjects.map(ss => <option key={ss._id} value={ss._id}>{ss.name}</option>)}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm" fontWeight="700">3. Chapter </FormLabel>
            <Select placeholder="Select Chapter" value={formData.chapterId} onChange={(e) => setFormData({...formData, chapterId: e.target.value})}>
              {chapters.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </Select>
          </FormControl>
        </SimpleGrid>

        <Flex gap="15px" wrap="wrap" align="flex-end">
          <FormControl width={{ base: '100%', md: '40%' }}>
            <FormLabel fontSize="sm" fontWeight="700">4. Topic Name</FormLabel>
            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: Muscles of Mastication" />
          </FormControl>

          <FormControl width={{ base: '100%', md: '10%' }}>
            <FormLabel fontSize="sm" fontWeight="700">Order</FormLabel>
            <Input type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: e.target.value })} />
          </FormControl>

          <FormControl flex="1">
            <FormLabel fontSize="sm" fontWeight="700">Topic Description</FormLabel>
            <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Details about this topic..." />
          </FormControl>

          <Button colorScheme="brand" px="40px" onClick={handleCreate} isLoading={loading} leftIcon={<MdTopic />}>
            Save Topic
          </Button>
        </Flex>
      </Card>

      {/* TOPIC LIST TABLE */}
      <Card p="20px">
        <Flex justify="space-between" align="center" mb="20px">
          <Text color={textColor} fontSize="18px" fontWeight="700">All Topics</Text>
          <InputGroup maxW="300px">
            <InputLeftElement children={<MdSearch color="gray.300" />} />
            <Input placeholder="Search topic or chapter..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </InputGroup>
        </Flex>

        <Box overflowX="auto">
          <Table variant="simple" color="gray.500">
            <Thead bg={useColorModeValue('gray.50', 'navy.800')}>
              <Tr>
                <Th>Order</Th>
                <Th>Topic Name</Th>
                <Th>Chapter</Th>
                <Th>Sub-Subject</Th>
                <Th textAlign="right">Actions</Th>
              </Tr>
            </Thead>
           <Tbody>
  {filteredTopics.map((item) => (
    <Tr key={item._id}>
      <Td>{item.order}</Td>
      <Td fontWeight="700" color={textColor}>{item.name}</Td>
      
      {/* CHAPTER NAME */}
      <Td>
        <Badge colorScheme="orange" variant="outline">
          {item.chapterId?.name || 'No Chapter'}
        </Badge>
      </Td>

      {/* SUB-SUBJECT NAME (Nested Populate) */}
      <Td>
        <Badge colorScheme="purple" variant="subtle">
          {item.chapterId?.subSubjectId?.name || 'N/A'}
        </Badge>
      </Td>

      <Td textAlign="right">
        {/* Actions buttons... */}
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