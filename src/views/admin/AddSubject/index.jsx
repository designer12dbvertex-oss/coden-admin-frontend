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

export default function SubjectManagement() {
  const [courses, setCourses] = useState([]); // Dropdown list
  const [subjects, setSubjects] = useState([]); // Table list
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Form States
  const [selectedCourse, setSelectedCourse] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [editData, setEditData] = useState({ id: '', name: '', courseId: '' });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const toast = useToast();

  const baseUrl = process.env.REACT_APP_BASE_URL;
  const token = localStorage.getItem('token');

  // 1. Fetch Initial Data
  const fetchData = async () => {
    try {
      const [courseRes, subjectRes] = await Promise.all([
        axios.get(`${baseUrl}api/course/getAll`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${baseUrl}api/subject/getAll`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setCourses(courseRes.data.courses || []);
      setSubjects(subjectRes.data.subjects || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // 2. Add Subject linked to Course
  const handleAddSubject = async () => {
    if (!subjectName || !selectedCourse) {
      return toast({ title: 'Please select a course and enter subject name', status: 'warning' });
    }
    setLoading(true);
    try {
      await axios.post(`${baseUrl}api/subject/add`, 
        { name: subjectName, courseId: selectedCourse }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({ title: 'Subject Added Successfully!', status: 'success' });
      setSubjectName('');
      fetchData();
    } catch (err) { 
      toast({ title: 'Error adding subject', status: 'error' }); 
    } finally { 
      setLoading(false); 
    }
  };

  // 3. Filter Logic (Search by Subject or Course Name)
  const filteredSubjects = subjects.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.courseId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 4. Update Logic
  const openEditModal = (subject) => {
    setEditData({ id: subject._id, name: subject.name, courseId: subject.courseId?._id });
    onOpen();
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`${baseUrl}api/subject/update/${editData.id}`, 
        { name: editData.name, courseId: editData.courseId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({ title: 'Subject Updated!', status: 'success' });
      onClose();
      fetchData();
    } catch (err) { 
      toast({ title: 'Update failed', status: 'error' }); 
    }
  };

  // 5. Delete Logic
  const handleDelete = async (id) => {
    if(window.confirm("Are you sure you want to delete this subject?")) {
      try {
        await axios.delete(`${baseUrl}api/subject/delete/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast({ title: 'Subject Deleted!', status: 'info' });
        fetchData();
      } catch (err) { 
        toast({ title: 'Delete failed', status: 'error' }); 
      }
    }
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      
      {/* ADD SECTION */}
      <Card mb='20px' p='20px'>
        <Text color={textColor} fontSize='22px' fontWeight='700' mb='20px'>Subject Management</Text>
        <Flex gap='20px' align='flex-end' direction={{ base: 'column', md: 'row' }}>
          <FormControl flex='1'>
            <FormLabel>Select Course</FormLabel>
            <Select 
              placeholder='Choose Course' 
              value={selectedCourse} 
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              {courses.map(course => (
                <option key={course._id} value={course._id}>{course.name}</option>
              ))}
            </Select>
          </FormControl>
          <FormControl flex='1'>
            <FormLabel>Subject Name</FormLabel>
            <Input 
              value={subjectName} 
              onChange={(e) => setSubjectName(e.target.value)} 
              placeholder='Ex: Mathematics' 
            />
          </FormControl>
          <Button colorScheme='blue' onClick={handleAddSubject} isLoading={loading} px='40px'>
            Add Subject
          </Button>
        </Flex>
      </Card>

      {/* SEARCH & TABLE SECTION */}
      <Card p='20px'>
        <Flex direction={{ base: 'column', md: 'row' }} justify='space-between' align={{ md: 'center' }} mb='20px' gap='10px'>
          <Text color={textColor} fontSize='18px' fontWeight='700'>All Subjects</Text>
          <InputGroup maxW={{ md: '300px' }}>
            <InputLeftElement pointerEvents='none'><MdSearch color='gray.300' /></InputLeftElement>
            <Input 
              placeholder='Search subject or course...' 
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
                <Th>Subject Name</Th>
                <Th>Course Name</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredSubjects.map((s, i) => (
                <Tr key={s._id}>
                  <Td>{i + 1}</Td>
                  <Td fontWeight='600'>{s.name}</Td>
                  <Td color='blue.500'>{s.courseId?.name || 'N/A'}</Td>
                  <Td>
                    <IconButton icon={<MdEdit />} colorScheme='green' onClick={() => openEditModal(s)} mr='2' size='sm' />
                    <IconButton icon={<MdDelete />} colorScheme='red' onClick={() => handleDelete(s._id)} size='sm' />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Card>

      {/* UPDATE MODAL */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update Subject</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb='4'>
              <FormLabel>Course</FormLabel>
              <Select 
                value={editData.courseId} 
                onChange={(e) => setEditData({...editData, courseId: e.target.value})}
              >
                {courses.map(course => (
                  <option key={course._id} value={course._id}>{course.name}</option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Subject Name</FormLabel>
              <Input 
                value={editData.name} 
                onChange={(e) => setEditData({...editData, name: e.target.value})} 
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={handleUpdate}>Save Changes</Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </Box>
  );
}