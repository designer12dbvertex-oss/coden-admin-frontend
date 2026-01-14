/* eslint-disable */
'use client';

import {
  Box, Flex, Table, Tbody, Td, Text, Th, Thead, Tr, useColorModeValue,
  Button, Input, FormControl, FormLabel, useToast, IconButton,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  useDisclosure, InputGroup, InputLeftElement, Select
} from '@chakra-ui/react';
import { MdEdit, MdDelete, MdSearch } from 'react-icons/md';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from 'components/card/Card';

export default function ChapterManagement() {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]); // Filtered list
  const [chapters, setChapters] = useState([]); // All data
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Form States
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [chapterName, setChapterName] = useState('');
  const [editData, setEditData] = useState({ id: '', name: '', subjectId: '' });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const toast = useToast();

  const baseUrl = process.env.REACT_APP_BASE_URL;
  const token = localStorage.getItem('token');

  // 1. Initial Load (Courses & Chapters)
  const fetchData = async () => {
    try {
      const [courseRes, chapterRes] = await Promise.all([
        axios.get(`${baseUrl}api/course/getAll`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${baseUrl}api/chapter/getAll`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setCourses(courseRes.data.courses || []);
      setChapters(chapterRes.data.chapters || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // 2. Filter Subjects based on Selected Course
  const handleCourseChange = async (courseId) => {
    setSelectedCourse(courseId);
    setSelectedSubject(''); // Reset subject selection
    try {
      const res = await axios.get(`${baseUrl}api/subject/getByCourse/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubjects(res.data.subjects || []);
    } catch (err) {
      setSubjects([]);
    }
  };

  // 3. Add Chapter
  const handleAddChapter = async () => {
    if (!chapterName || !selectedSubject) {
      return toast({ title: 'Please select Subject and enter Chapter name', status: 'warning' });
    }
    setLoading(true);
    try {
      await axios.post(`${baseUrl}api/chapter/add`, 
        { name: chapterName, subjectId: selectedSubject }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({ title: 'Chapter Added Successfully!', status: 'success' });
      setChapterName('');
      fetchData();
    } catch (err) { 
        toast({ title: 'Error adding chapter', status: 'error' }); 
    } finally { 
        setLoading(false); 
    }
  };

  // 4. Search Filter
  const filteredChapters = chapters.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.subjectId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      
      {/* ADD SECTION */}
      <Card mb='20px' p='20px'>
        <Text color={textColor} fontSize='22px' fontWeight='700' mb='20px'>Chapter Management</Text>
        <Flex gap='15px' align='flex-end' direction={{ base: 'column', md: 'row' }}>
          <FormControl flex='1'>
            <FormLabel>Course</FormLabel>
            <Select placeholder='Select Course' onChange={(e) => handleCourseChange(e.target.value)}>
              {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </Select>
          </FormControl>
          
          <FormControl flex='1'>
            <FormLabel>Subject</FormLabel>
            <Select 
              placeholder='Select Subject' 
              value={selectedSubject} 
              onChange={(e) => setSelectedSubject(e.target.value)}
              isDisabled={!selectedCourse}
            >
              {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </Select>
          </FormControl>

          <FormControl flex='1.5'>
            <FormLabel>Chapter Name</FormLabel>
            <Input 
              value={chapterName} 
              onChange={(e) => setChapterName(e.target.value)} 
              placeholder='Ex: Algebra Basics' 
            />
          </FormControl>

          <Button colorScheme='blue' onClick={handleAddChapter} isLoading={loading} px='30px'>
            Add Chapter
          </Button>
        </Flex>
      </Card>

      {/* SEARCH & TABLE SECTION */}
      <Card p='20px'>
        <Flex justify='space-between' align='center' mb='20px' wrap='wrap' gap='10px'>
          <Text color={textColor} fontSize='18px' fontWeight='700'>All Chapters</Text>
          <InputGroup maxW='300px'>
            <InputLeftElement><MdSearch color='gray.300' /></InputLeftElement>
            <Input 
              placeholder='Search chapter or subject...' 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </InputGroup>
        </Flex>

        <Box overflowX='auto'>
          <Table variant='simple'>
            <Thead bg='gray.50'>
              <Tr>
                <Th>S.No</Th>
                <Th>Chapter Name</Th>
                <Th>Subject</Th>
                <Th>Course</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredChapters.map((c, i) => (
                <Tr key={c._id}>
                  <Td>{i + 1}</Td>
                  <Td fontWeight='600'>{c.name}</Td>
                  <Td>{c.subjectId?.name || 'N/A'}</Td>
                  <Td color='blue.500'>{c.subjectId?.courseId?.name || 'N/A'}</Td>
                  <Td>
                    <IconButton icon={<MdEdit />} colorScheme='green' size='sm' mr='2' />
                    <IconButton icon={<MdDelete />} colorScheme='red' size='sm' />
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