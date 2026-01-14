/* eslint-disable */
'use client';

import {
  Box, Flex, Table, Tbody, Td, Text, Th, Thead, Tr,
  Button, Input, FormControl, FormLabel, useToast,
  IconButton, Select, InputGroup, InputLeftElement
} from '@chakra-ui/react';
import { MdDelete, MdSearch, MdPublish } from 'react-icons/md';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Card from 'components/card/Card';

export default function TestManagement() {
  const [tests, setTests] = useState([]);
  const [courses, setCourses] = useState([]);

  // Form state
  const [courseId, setCourseId] = useState('');
  const [scopeType, setScopeType] = useState('subject');
  const [testType, setTestType] = useState('regular');
  const [totalQuestions, setTotalQuestions] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const toast = useToast();
  const baseUrl = process.env.REACT_APP_BASE_URL;
  const token = localStorage.getItem('token');

  // ================= FETCH DATA =================
  const fetchTests = async () => {
    try {
      const res = await axios.get(`${baseUrl}api/admin/tests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTests(res.data.tests || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await axios.get(`${baseUrl}api/course/getAll`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses(res.data.courses || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTests();
    fetchCourses();
  }, []);

  // ================= CREATE TEST =================
  const handleCreateTest = async () => {
    if (!courseId || !totalQuestions) {
      return toast({
        title: 'Course & total questions required',
        status: 'warning',
      });
    }

    setLoading(true);
    try {
      await axios.post(
        `${baseUrl}api/admin/tests`,
        {
          courseId,
          scopeType,
          testType,
          totalQuestions: Number(totalQuestions),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast({ title: 'Test created successfully', status: 'success' });
      setTotalQuestions('');
      fetchTests();
    } catch (err) {
      toast({ title: err.response?.data?.message || 'Error', status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // ================= PUBLISH =================
  const handlePublish = async (id) => {
    await axios.patch(
      `${baseUrl}api/admin/tests/${id}/publish`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    toast({ title: 'Test published', status: 'success' });
    fetchTests();
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this test?')) return;

    await axios.delete(`${baseUrl}api/admin/tests/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    toast({ title: 'Test deleted', status: 'success' });
    fetchTests();
  };

  // ================= SEARCH =================
  const filteredTests = tests.filter((t) =>
    t.courseId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.testType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box pt={{ base: '130px', md: '80px' }}>

      {/* ================= CREATE TEST ================= */}
      <Card mb='20px' p='20px'>
        <Text fontSize='22px' fontWeight='700' mb='20px'>Test Management</Text>

        <Flex gap='15px' align='flex-end' wrap='wrap'>
          <FormControl maxW='250px'>
            <FormLabel>Course</FormLabel>
            <Select placeholder='Select Course' onChange={(e) => setCourseId(e.target.value)}>
              {courses.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </Select>
          </FormControl>

          <FormControl maxW='200px'>
            <FormLabel>Scope</FormLabel>
            <Select value={scopeType} onChange={(e) => setScopeType(e.target.value)}>
              <option value='subject'>Subject</option>
              <option value='sub-subject'>Sub Subject</option>
              <option value='chapter'>Chapter</option>
            </Select>
          </FormControl>

          <FormControl maxW='200px'>
            <FormLabel>Test Type</FormLabel>
            <Select value={testType} onChange={(e) => setTestType(e.target.value)}>
              <option value='regular'>Regular</option>
              <option value='exam'>Exam</option>
            </Select>
          </FormControl>

          <FormControl maxW='200px'>
            <FormLabel>Total Questions</FormLabel>
            <Input
              type='number'
              value={totalQuestions}
              onChange={(e) => setTotalQuestions(e.target.value)}
            />
          </FormControl>

          <Button colorScheme='blue' onClick={handleCreateTest} isLoading={loading}>
            Create Test
          </Button>
        </Flex>
      </Card>

      {/* ================= TABLE ================= */}
      <Card p='20px'>
        <Flex justify='space-between' align='center' mb='20px'>
          <Text fontSize='18px' fontWeight='700'>All Tests</Text>

          <InputGroup maxW='300px'>
            <InputLeftElement>
              <MdSearch />
            </InputLeftElement>
            <Input
              placeholder='Search by course or type'
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
                <Th>Course</Th>
                <Th>Type</Th>
                <Th>Questions</Th>
                <Th>Duration</Th>
                <Th>Status</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredTests.map((t, i) => (
                <Tr key={t._id}>
                  <Td>{i + 1}</Td>
                  <Td fontWeight='600'>{t.courseId?.name}</Td>
                  <Td>{t.testType}</Td>
                  <Td>{t.totalQuestions}</Td>
                  <Td>{t.duration ? `${t.duration} min` : '—'}</Td>
                  <Td color={t.isPublished ? 'green.500' : 'orange.500'}>
                    {t.isPublished ? 'Published' : 'Draft'}
                  </Td>
                  <Td>
                    {!t.isPublished && (
                      <IconButton
                        icon={<MdPublish />}
                        size='sm'
                        colorScheme='blue'
                        mr='2'
                        onClick={() => handlePublish(t._id)}
                      />
                    )}
                    <IconButton
                      icon={<MdDelete />}
                      size='sm'
                      colorScheme='red'
                      onClick={() => handleDelete(t._id)}
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
