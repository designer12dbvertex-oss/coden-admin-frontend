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
  Button,
  Input,
  FormControl,
  FormLabel,
  Select,
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
} from '@chakra-ui/react';
import { MdEdit, MdDelete, MdSearch, MdPublish } from 'react-icons/md';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Card from 'components/card/Card';

export default function TestManagement() {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const baseUrl = process.env.REACT_APP_BASE_URL;
  const token = localStorage.getItem('token');
  const headers = { headers: { Authorization: `Bearer ${token}` } };

  /* ================= STATES ================= */

  const [tests, setTests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // dropdown data
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [subSubjects, setSubSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);

  // selections
  const [courseId, setCourseId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [subSubjectId, setSubSubjectId] = useState('');
  const [chapterId, setChapterId] = useState('');
  const [scopeType, setScopeType] = useState('');

  // test config
  const [testType, setTestType] = useState('');
  const [totalQuestions, setTotalQuestions] = useState('');

  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH MASTER DATA ================= */

  const fetchCourses = async () => {
    const res = await axios.get(`${baseUrl}api/admin/courses`, headers);
    setCourses(res.data.data || []);
  };

  const fetchSubjects = async (courseId) => {
    setSubjects([]);
    setSubSubjects([]);
    setChapters([]);
    setSubjectId('');
    setSubSubjectId('');
    setChapterId('');

    const res = await axios.get(
      `${baseUrl}api/admin/subjects?courseId=${courseId}`,
      headers,
    );
    setSubjects(res.data.data || []);
  };

  const fetchSubSubjects = async (subjectId) => {
    setSubSubjects([]);
    setChapters([]);
    setSubSubjectId('');
    setChapterId('');

    const res = await axios.get(
      `${baseUrl}api/admin/sub-subjects?subjectId=${subjectId}`,
      headers,
    );
    setSubSubjects(res.data.data || []);
  };

  const fetchChapters = async (subSubjectId) => {
    setChapters([]);
    setChapterId('');

    const res = await axios.get(
      `${baseUrl}api/admin/chapters?subSubjectId=${subSubjectId}`,
      headers,
    );
    setChapters(res.data.data || []);
  };

  const fetchTests = async () => {
    const res = await axios.get(`${baseUrl}api/admin/tests`, headers);
    setTests(res.data.tests || []);
  };

  useEffect(() => {
    fetchCourses();
    fetchTests();
  }, []);

  /* ================= CREATE TEST ================= */

  const handleCreateTest = async () => {
    if (!courseId || !scopeType || !testType || !totalQuestions) {
      return toast({ title: 'All fields required', status: 'warning' });
    }

    if (scopeType === 'subject' && !subjectId) {
      return toast({ title: 'Select subject', status: 'warning' });
    }
    if (scopeType === 'sub-subject' && !subSubjectId) {
      return toast({ title: 'Select sub-subject', status: 'warning' });
    }
    if (scopeType === 'chapter' && !chapterId) {
      return toast({ title: 'Select chapter', status: 'warning' });
    }

    setLoading(true);
    try {
      await axios.post(
        `${baseUrl}api/admin/tests`,
        {
          courseId,
          subjectId: scopeType === 'subject' ? subjectId : null,
          subSubjectId:
            scopeType === 'sub-subject' || scopeType === 'chapter'
              ? subSubjectId
              : null,
          chapterId: scopeType === 'chapter' ? chapterId : null,
          scopeType,
          testType,
          totalQuestions: Number(totalQuestions),
        },
        headers,
      );

      toast({ title: 'Test created successfully', status: 'success' });
      fetchTests();

      // reset
      setCourseId('');
      setSubjectId('');
      setSubSubjectId('');
      setChapterId('');
      setScopeType('');
      setTestType('');
      setTotalQuestions('');
      setSubjects([]);
      setSubSubjects([]);
      setChapters([]);
    } catch (err) {
      toast({
        title: err.response?.data?.message || 'Create failed',
        status: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  /* ================= UPDATE ================= */

  const handleUpdate = async () => {
    await axios.put(
      `${baseUrl}api/admin/tests/${editData._id}`,
      {
        courseId: editData.courseId?._id || editData.courseId,
        subjectId: editData.subjectId?._id || null,
        subSubjectId: editData.subSubjectId?._id || null,
        chapterId: editData.chapterId?._id || null,
        scopeType: editData.scopeType,
        testType: editData.testType,
        totalQuestions: Number(editData.totalQuestions),
      },
      headers,
    );

    toast({ title: 'Test updated', status: 'success' });
    onClose();
    fetchTests();
  };

  /* ================= UNPUBLISH ================= */

  const handleUnpublish = async (id) => {
    await axios.patch(`${baseUrl}api/admin/tests/${id}/unpublish`, {}, headers);
    toast({ title: 'Test unpublished', status: 'success' });
    fetchTests();
  };

  /* ================= LOAD EDIT DATA ================= */

  useEffect(() => {
    if (editData) {
      const courseId = editData.courseId?._id || editData.courseId;
      setCourseId(courseId);
      if (courseId) {
        fetchSubjects(courseId);
      }
    }
  }, [editData]);

  /* ================= TABLE ACTIONS ================= */

  const handleDelete = async (id) => {
    if (window.confirm('Delete this test?')) {
      await axios.delete(`${baseUrl}api/admin/tests/${id}`, headers);
      toast({ title: 'Test deleted', status: 'info' });
      fetchTests();
    }
  };

  const handlePublish = async (id) => {
    await axios.patch(`${baseUrl}api/admin/tests/${id}/publish`, {}, headers);
    toast({ title: 'Test published', status: 'success' });
    fetchTests();
  };

  const filteredTests = tests.filter((t) =>
    t.testType?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  /* ================= UI ================= */

  return (
    <Box pt={{ base: '130px', md: '80px' }}>
      {/* CREATE */}
      <Card p="20px" mb="20px">
        <Text fontSize="22px" fontWeight="700" mb="15px">
          Create Test
        </Text>

        <Flex gap="15px" wrap="wrap">
          <FormControl>
            <FormLabel>Course</FormLabel>
            <Select
              value={courseId}
              onChange={(e) => {
                setCourseId(e.target.value);
                fetchSubjects(e.target.value);
              }}
            >
              <option value="">Select</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Subject</FormLabel>
            <Select
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value);
                fetchSubSubjects(e.target.value);
              }}
            >
              <option value="">Select</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Sub Subject</FormLabel>
            <Select
              value={subSubjectId}
              onChange={(e) => {
                setSubSubjectId(e.target.value);
                fetchChapters(e.target.value);
              }}
            >
              <option value="">Select</option>
              {subSubjects.map((ss) => (
                <option key={ss._id} value={ss._id}>
                  {ss.name}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Chapter</FormLabel>
            <Select
              value={chapterId}
              onChange={(e) => setChapterId(e.target.value)}
            >
              <option value="">Select</option>
              {chapters.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Scope Type</FormLabel>
            <Select
              value={scopeType}
              onChange={(e) => setScopeType(e.target.value)}
            >
              <option value="">Select</option>
              <option value="subject">Subject</option>
              <option value="sub-subject">Sub Subject</option>
              <option value="chapter">Chapter</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Test Type</FormLabel>
            <Select
              value={testType}
              onChange={(e) => setTestType(e.target.value)}
            >
              <option value="">Select</option>
              <option value="regular">Regular</option>
              <option value="exam">Exam</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Total MCQs</FormLabel>
            <Input
              type="number"
              value={totalQuestions}
              onChange={(e) => setTotalQuestions(e.target.value)}
            />
          </FormControl>

          <Button
            colorScheme="blue"
            onClick={handleCreateTest}
            isLoading={loading}
          >
            Create Test
          </Button>
        </Flex>
      </Card>

      {/* TABLE */}
      <Card p="20px">
        <Flex justify="space-between" mb="15px">
          <Text fontWeight="700">All Tests</Text>
          <InputGroup maxW="300px">
            <InputLeftElement>
              <MdSearch />
            </InputLeftElement>
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Flex>

        <Table>
          <Thead>
            <Tr>
              <Th>#</Th>
              <Th>Scope</Th>
              <Th>Type</Th>
              <Th>MCQs</Th>
              <Th>Status</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredTests.map((t, i) => (
              <Tr key={t._id}>
                <Td>{i + 1}</Td>
                <Td>{t.scopeType}</Td>
                <Td>{t.testType}</Td>
                <Td>{t.totalQuestions}</Td>
                <Td>{t.isPublished ? 'Published' : 'Draft'}</Td>
                <Td>
                  <IconButton
                    icon={<MdEdit />}
                    size="sm"
                    mr="2"
                    onClick={() => {
                      setEditData(t);
                      onOpen();
                    }}
                  />
                  <IconButton
                    icon={<MdDelete />}
                    size="sm"
                    mr="2"
                    onClick={() => handleDelete(t._id)}
                  />
                  {!t.isPublished && (
                    <IconButton
                      icon={<MdPublish />}
                      size="sm"
                      onClick={() => handlePublish(t._id)}
                    />
                  )}
                  {t.isPublished && (
                    <IconButton
                      icon={<MdPublish />}
                      size="sm"
                      onClick={() => handleUnpublish(t._id)}
                    />
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>

      {/* EDIT MODAL */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Test</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb="3">
              <FormLabel>Course</FormLabel>
              <Select
                value={courseId}
                onChange={(e) => {
                  setCourseId(e.target.value);
                  setEditData({ ...editData, courseId: e.target.value });
                  fetchSubjects(e.target.value);
                }}
              >
                <option value="">Select</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl mb="3">
              <FormLabel>Subject</FormLabel>
              <Select
                value={subjectId}
                onChange={(e) => {
                  setSubjectId(e.target.value);
                  setEditData({ ...editData, subjectId: e.target.value });
                  fetchSubSubjects(e.target.value);
                }}
              >
                <option value="">Select</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl mb="3">
              <FormLabel>Sub Subject</FormLabel>
              <Select
                value={subSubjectId}
                onChange={(e) => {
                  setSubSubjectId(e.target.value);
                  setEditData({ ...editData, subSubjectId: e.target.value });
                  fetchChapters(e.target.value);
                }}
              >
                <option value="">Select</option>
                {subSubjects.map((ss) => (
                  <option key={ss._id} value={ss._id}>
                    {ss.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl mb="3">
              <FormLabel>Chapter</FormLabel>
              <Select
                value={chapterId}
                onChange={(e) => {
                  setChapterId(e.target.value);
                  setEditData({ ...editData, chapterId: e.target.value });
                }}
              >
                <option value="">Select</option>
                {chapters.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl mb="3">
              <FormLabel>Scope Type</FormLabel>
              <Select
                value={editData?.scopeType}
                onChange={(e) =>
                  setEditData({ ...editData, scopeType: e.target.value })
                }
              >
                <option value="subject">Subject</option>
                <option value="sub-subject">Sub Subject</option>
                <option value="chapter">Chapter</option>
              </Select>
            </FormControl>

            <FormControl mb="3">
              <FormLabel>Test Type</FormLabel>
              <Select
                value={editData?.testType}
                onChange={(e) =>
                  setEditData({ ...editData, testType: e.target.value })
                }
              >
                <option value="regular">Regular</option>
                <option value="exam">Exam</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Total Questions</FormLabel>
              <Input
                type="number"
                value={editData?.totalQuestions}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    totalQuestions: e.target.value,
                  })
                }
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleUpdate}>
              Save
            </Button>
            <Button ml="2" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
