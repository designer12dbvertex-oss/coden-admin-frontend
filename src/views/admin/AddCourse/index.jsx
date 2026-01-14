/* eslint-disable */
'use client';

import {
  Box, Flex, Table, Tbody, Td, Text, Th, Thead, Tr, useColorModeValue,
  Button, Input, FormControl, FormLabel, useToast, IconButton,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  useDisclosure, InputGroup, InputLeftElement
} from '@chakra-ui/react';
import { MdEdit, MdDelete, MdSearch } from 'react-icons/md';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from 'components/card/Card';

export default function CourseManagement() {
  const [courses, setCourses] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Form States (Add/Update)
  const [courseName, setCourseName] = useState('');
  const [editData, setEditData] = useState({ id: '', name: '' });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const toast = useToast();

  const baseUrl = process.env.REACT_APP_BASE_URL;
  const token = localStorage.getItem('token');

  // 1. Fetch All Courses
  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${baseUrl}api/course/getAll`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses(response.data.courses || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  // 2. Search Filter (By Course Name)
  const filteredCourses = courses.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 3. Add Course (Category removed as requested)
  const handleAddCourse = async () => {
    if (!courseName) {
      return toast({ title: 'Please enter course name', status: 'warning', duration: 2000 });
    }
    setLoading(true);
    try {
      await axios.post(`${baseUrl}api/course/add`, 
        { name: courseName }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({ title: 'Course Added Successfully!', status: 'success', duration: 2000 });
      setCourseName('');
      fetchCourses();
    } catch (err) { 
      toast({ title: 'Error adding course', status: 'error' }); 
    } finally { 
      setLoading(false); 
    }
  };

  // 4. Update Logic
  const openEditModal = (course) => {
    setEditData({ id: course._id, name: course.name });
    onOpen();
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`${baseUrl}api/course/update/${editData.id}`, 
        { name: editData.name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({ title: 'Course Updated Successfully!', status: 'success' });
      onClose();
      fetchCourses();
    } catch (err) { 
      toast({ title: 'Update failed', status: 'error' }); 
    }
  };

  // 5. Delete Logic
  const handleDelete = async (id) => {
    if(window.confirm("Are you sure you want to delete this course?")) {
      try {
        await axios.delete(`${baseUrl}api/course/delete/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast({ title: 'Course Deleted!', status: 'info' });
        fetchCourses();
      } catch (err) { 
        toast({ title: 'Delete failed', status: 'error' }); 
      }
    }
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      
      {/* ADD SECTION */}
      <Card mb='20px' p='20px'>
        <Text color={textColor} fontSize='22px' fontWeight='700' mb='20px'>Course Management</Text>
        <Flex gap='20px' align='flex-end' direction={{ base: 'column', md: 'row' }}>
          <FormControl>
            <FormLabel>Course Name</FormLabel>
            <Input 
              value={courseName} 
              onChange={(e) => setCourseName(e.target.value)} 
              placeholder='Ex: Web Development' 
            />
          </FormControl>
          <Button colorScheme='blue' onClick={handleAddCourse} isLoading={loading} px='40px'>
            Add Course
          </Button>
        </Flex>
      </Card>

      {/* SEARCH & TABLE SECTION */}
      <Card p='20px'>
        <Flex direction={{ base: 'column', md: 'row' }} justify='space-between' align={{ md: 'center' }} mb='20px' gap='10px'>
          <Text color={textColor} fontSize='18px' fontWeight='700'>All Courses List</Text>
          <InputGroup maxW={{ md: '300px' }}>
            <InputLeftElement pointerEvents='none'><MdSearch color='gray.300' /></InputLeftElement>
            <Input 
              placeholder='Search by course name...' 
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
                <Th>Course Name</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredCourses.map((c, i) => (
                <Tr key={c._id}>
                  <Td>{i + 1}</Td>
                  <Td fontWeight='600' color='blue.500'>{c.name}</Td>
                  <Td>
                    <IconButton 
                      icon={<MdEdit />} 
                      colorScheme='green' 
                      onClick={() => openEditModal(c)} 
                      mr='2' 
                      size='sm' 
                    />
                    <IconButton 
                      icon={<MdDelete />} 
                      colorScheme='red' 
                      onClick={() => handleDelete(c._id)} 
                      size='sm' 
                    />
                  </Td>
                </Tr>
              ))}
              {filteredCourses.length === 0 && (
                <Tr>
                  <Td colSpan={3} textAlign='center' py='4'>No matching courses found</Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>
      </Card>

      {/* UPDATE MODAL */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Course Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Course Name</FormLabel>
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