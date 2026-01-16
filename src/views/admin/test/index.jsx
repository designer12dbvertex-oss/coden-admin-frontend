// // /* eslint-disable */
// // 'use client';

// // import {
// //   Box,
// //   Flex,
// //   Table,
// //   Tbody,
// //   Td,
// //   Text,
// //   Th,
// //   Thead,
// //   Tr,
// //   Button,
// //   Input,
// //   FormControl,
// //   FormLabel,
// //   Select,
// //   useToast,
// //   IconButton,
// //   Modal,
// //   ModalOverlay,
// //   ModalContent,
// //   ModalHeader,
// //   ModalFooter,
// //   ModalBody,
// //   ModalCloseButton,
// //   useDisclosure,
// //   InputGroup,
// //   InputLeftElement,
// // } from '@chakra-ui/react';
// // import { MdEdit, MdDelete, MdSearch, MdPublish } from 'react-icons/md';
// // import React, { useEffect, useState } from 'react';
// // import axios from 'axios';
// // import Card from 'components/card/Card';

// // export default function TestManagement() {
// //   const toast = useToast();
// //   const { isOpen, onOpen, onClose } = useDisclosure();

// //   const baseUrl = process.env.REACT_APP_BASE_URL;
// //   const token = localStorage.getItem('token');
// //   const headers = { headers: { Authorization: `Bearer ${token}` } };

// //   /* ================= STATES ================= */

// //   const [tests, setTests] = useState([]);
// //   const [searchTerm, setSearchTerm] = useState('');

// //   // dropdown data
// //   const [courses, setCourses] = useState([]);
// //   const [subjects, setSubjects] = useState([]);
// //   const [subSubjects, setSubSubjects] = useState([]);
// //   const [chapters, setChapters] = useState([]);

// //   // selections
// //   const [courseId, setCourseId] = useState('');
// //   const [subjectId, setSubjectId] = useState('');
// //   const [subSubjectId, setSubSubjectId] = useState('');
// //   const [chapterId, setChapterId] = useState('');
// //   const [scopeType, setScopeType] = useState('');

// //   // test config
// //   const [testType, setTestType] = useState('');
// //   const [totalQuestions, setTotalQuestions] = useState('');

// //   const [editData, setEditData] = useState(null);
// //   const [loading, setLoading] = useState(false);

// //   /* ================= FETCH MASTER DATA ================= */

// //   const fetchCourses = async () => {
// //     const res = await axios.get(`${baseUrl}api/admin/courses`, headers);
// //     setCourses(res.data.data || []);
// //   };

// //   const fetchSubjects = async (courseId, isEdit = false) => {
// //     if (!isEdit) {
// //       setSubjects([]);
// //       setSubSubjects([]);
// //       setChapters([]);
// //       setSubjectId('');
// //       setSubSubjectId('');
// //       setChapterId('');
// //     }

// //     const res = await axios.get(
// //       `${baseUrl}api/admin/subjects?courseId=${courseId}`,
// //       headers,
// //     );
// //     setSubjects(res.data.data || []);
// //   };

// //   const fetchSubSubjects = async (subjectId, isEdit = false) => {
// //     if (!isEdit) {
// //       setSubSubjects([]);
// //       setChapters([]);
// //       setSubSubjectId('');
// //       setChapterId('');
// //     }

// //     const res = await axios.get(
// //       `${baseUrl}api/admin/sub-subjects?subjectId=${subjectId}`,
// //       headers,
// //     );
// //     setSubSubjects(res.data.data || []);
// //   };

// //   const fetchChapters = async (subSubjectId, isEdit = false) => {
// //     if (!isEdit) {
// //       setChapters([]);
// //       setChapterId('');
// //     }

// //     const res = await axios.get(
// //       `${baseUrl}api/admin/chapters?subSubjectId=${subSubjectId}`,
// //       headers,
// //     );
// //     setChapters(res.data.data || []);
// //   };

// //   const fetchTests = async () => {
// //     const res = await axios.get(`${baseUrl}api/admin/tests`, headers);
// //     setTests(res.data.tests || []);
// //   };

// //   useEffect(() => {
// //     fetchCourses();
// //     fetchTests();
// //   }, []);

// //   /* ================= CREATE TEST ================= */

// //   const handleCreateTest = async () => {
// //     if (!courseId || !scopeType || !testType || !totalQuestions) {
// //       return toast({ title: 'All fields required', status: 'warning' });
// //     }

// //     if (scopeType === 'subject' && !subjectId) {
// //       return toast({ title: 'Select subject', status: 'warning' });
// //     }
// //     if (scopeType === 'sub-subject' && !subSubjectId) {
// //       return toast({ title: 'Select sub-subject', status: 'warning' });
// //     }
// //     if (scopeType === 'chapter' && !chapterId) {
// //       return toast({ title: 'Select chapter', status: 'warning' });
// //     }

// //     setLoading(true);
// //     try {
// //       await axios.post(
// //         `${baseUrl}api/admin/tests`,
// //         {
// //           courseId,
// //           subjectId: scopeType === 'subject' ? subjectId : null,
// //           subSubjectId:
// //             scopeType === 'sub-subject' || scopeType === 'chapter'
// //               ? subSubjectId
// //               : null,
// //           chapterId: scopeType === 'chapter' ? chapterId : null,
// //           scopeType,
// //           testType,
// //           totalQuestions: Number(totalQuestions),
// //         },
// //         headers,
// //       );

// //       toast({ title: 'Test created successfully', status: 'success' });
// //       fetchTests();

// //       // reset
// //       setCourseId('');
// //       setSubjectId('');
// //       setSubSubjectId('');
// //       setChapterId('');
// //       setScopeType('');
// //       setTestType('');
// //       setTotalQuestions('');
// //       setSubjects([]);
// //       setSubSubjects([]);
// //       setChapters([]);
// //     } catch (err) {
// //       toast({
// //         title: err.response?.data?.message || 'Create failed',
// //         status: 'error',
// //       });
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   /* ================= UPDATE ================= */

// //   const handleUpdate = async () => {
// //     if (
// //       !editData?.courseId ||
// //       !editData?.scopeType ||
// //       !editData?.testType ||
// //       !editData?.totalQuestions
// //     ) {
// //       return toast({ title: 'All fields are required', status: 'warning' });
// //     }

// //     const payload = {
// //       courseId: editData.courseId,
// //       scopeType: editData.scopeType,
// //       testType: editData.testType,
// //       totalQuestions: Number(editData.totalQuestions),
// //     };

// //     // 🔥 EXACT BACKEND MATCH
// //     if (editData.scopeType === 'subject') {
// //       payload.subjectId = editData.subjectId;
// //       payload.subSubjectId = null;
// //       payload.chapterId = null;
// //     }

// //     if (editData.scopeType === 'sub-subject') {
// //       payload.subjectId = null;
// //       payload.subSubjectId = editData.subSubjectId;
// //       payload.chapterId = null;
// //     }

// //     if (editData.scopeType === 'chapter') {
// //       payload.subjectId = null;
// //       payload.subSubjectId = editData.subSubjectId;
// //       payload.chapterId = editData.chapterId;
// //     }

// //     try {
// //       await axios.put(
// //         `${baseUrl}api/admin/tests/${editData._id}`,
// //         payload,
// //         headers,
// //       );

// //       toast({ title: 'Test updated successfully', status: 'success' });
// //       onClose();
// //       fetchTests();
// //     } catch (err) {
// //       toast({
// //         title: err.response?.data?.message || 'Update failed',
// //         status: 'error',
// //       });
// //     }
// //   };

// //   /* ================= UNPUBLISH ================= */

// //   const handleUnpublish = async (id) => {
// //     await axios.patch(`${baseUrl}api/admin/tests/${id}/unpublish`, {}, headers);
// //     toast({ title: 'Test unpublished', status: 'success' });
// //     fetchTests();
// //   };

// //   /* ================= LOAD EDIT DATA ================= */

// //   useEffect(() => {
// //     if (!editData) return;

// //     // Load all dropdown data in sequence for edit mode
// //     if (editData.courseId) {
// //       fetchSubjects(editData.courseId, true);
// //     }

// //     if (editData.subjectId) {
// //       fetchSubSubjects(editData.subjectId, true);
// //     }

// //     if (editData.subSubjectId) {
// //       fetchChapters(editData.subSubjectId, true);
// //     }
// //   }, [editData]);

// //   /* ================= TABLE ACTIONS ================= */

// //   const handleDelete = async (id) => {
// //     if (window.confirm('Delete this test?')) {
// //       await axios.delete(`${baseUrl}api/admin/tests/${id}`, headers);
// //       toast({ title: 'Test deleted', status: 'info' });
// //       fetchTests();
// //     }
// //   };

// //   const handlePublish = async (id) => {
// //     await axios.patch(`${baseUrl}api/admin/tests/${id}/publish`, {}, headers);
// //     toast({ title: 'Test published', status: 'success' });
// //     fetchTests();
// //   };

// //   const filteredTests = tests.filter((t) =>
// //     t.testType?.toLowerCase().includes(searchTerm.toLowerCase()),
// //   );

// //   /* ================= UI ================= */

// //   return (
// //     <Box pt={{ base: '130px', md: '80px' }}>
// //       {/* CREATE */}
// //       <Card p="20px" mb="20px">
// //         <Text fontSize="22px" fontWeight="700" mb="15px">
// //           Create Test
// //         </Text>

// //         <Flex gap="15px" wrap="wrap">
// //           <FormControl>
// //             <FormLabel>Course</FormLabel>
// //             <Select
// //               value={courseId}
// //               onChange={(e) => {
// //                 setCourseId(e.target.value);
// //                 fetchSubjects(e.target.value);
// //               }}
// //             >
// //               <option value="">Select</option>
// //               {courses.map((c) => (
// //                 <option key={c._id} value={c._id}>
// //                   {c.name}
// //                 </option>
// //               ))}
// //             </Select>
// //           </FormControl>

// //           <FormControl>
// //             <FormLabel>Subject</FormLabel>
// //             {/* <Select */}
// //               value={subjectId}
// //               onChange={(e) => {
// //                 setSubjectId(e.target.value);
// //                 fetchSubSubjects(e.target.value);
// //               }}
// //             >
// //               <option value="">Select</option>
// //               {subjects.map((s) => (
// //                 <option key={s._id} value={s._id}>
// //                   {s.name}
// //                 </option>
// //               ))}
// //             </Select>
// //           </FormControl>

// //           <FormControl>
// //             <FormLabel>Sub Subject</FormLabel>
// //             <Select
// //               value={subSubjectId}
// //               onChange={(e) => {
// //                 setSubSubjectId(e.target.value);
// //                 fetchChapters(e.target.value);
// //               }}
// //             >
// //               <option value="">Select</option>
// //               {subSubjects.map((ss) => (
// //                 <option key={ss._id} value={ss._id}>
// //                   {ss.name}
// //                 </option>
// //               ))}
// //             </Select>
// //           </FormControl>

// //           <FormControl>
// //             <FormLabel>Chapter</FormLabel>
// //             <Select
// //               value={chapterId}
// //               onChange={(e) => setChapterId(e.target.value)}
// //             >
// //               <option value="">Select</option>
// //               {chapters.map((c) => (
// //                 <option key={c._id} value={c._id}>
// //                   {c.name}
// //                 </option>
// //               ))}
// //             </Select>
// //           </FormControl>

// //           <FormControl>
// //             <FormLabel>Scope Type</FormLabel>
// //             <Select
// //               value={scopeType}
// //               onChange={(e) => setScopeType(e.target.value)}
// //             >
// //               <option value="">Select</option>
// //               <option value="subject">Subject</option>
// //               <option value="sub-subject">Sub Subject</option>
// //               <option value="chapter">Chapter</option>
// //             </Select>
// //           </FormControl>

// //           <FormControl>
// //             <FormLabel>Test Type</FormLabel>
// //             <Select
// //               value={testType}
// //               onChange={(e) => setTestType(e.target.value)}
// //             >
// //               <option value="">Select</option>
// //               <option value="regular">Regular</option>
// //               <option value="exam">Exam</option>
// //             </Select>
// //           </FormControl>

// //           <FormControl>
// //             <FormLabel>Total MCQs</FormLabel>
// //             <Input
// //               type="number"
// //               value={totalQuestions}
// //               onChange={(e) => setTotalQuestions(e.target.value)}
// //             />
// //           </FormControl>

// //           <Button
// //             colorScheme="blue"
// //             onClick={handleCreateTest}
// //             isLoading={loading}
// //           >
// //             Create Test
// //           </Button>
// //         </Flex>
// //       </Card>

// //       {/* TABLE */}
// //       <Card p="20px">
// //         <Flex justify="space-between" mb="15px">
// //           <Text fontWeight="700">All Tests</Text>
// //           <InputGroup maxW="300px">
// //             <InputLeftElement>
// //               <MdSearch />
// //             </InputLeftElement>
// //             <Input
// //               placeholder="Search..."
// //               value={searchTerm}
// //               onChange={(e) => setSearchTerm(e.target.value)}
// //             />
// //           </InputGroup>
// //         </Flex>

// //         <Table>
// //           <Thead>
// //             <Tr>
// //               <Th>#</Th>
// //               <Th>Scope</Th>
// //               <Th>Type</Th>
// //               <Th>MCQs</Th>
// //               <Th>Status</Th>
// //               <Th>Action</Th>
// //             </Tr>
// //           </Thead>
// //           <Tbody>
// //             {filteredTests.map((t, i) => (
// //               <Tr key={t._id}>
// //                 <Td>{i + 1}</Td>
// //                 <Td>{t.scopeType}</Td>
// //                 <Td>{t.testType}</Td>
// //                 <Td>{t.totalQuestions}</Td>
// //                 <Td>{t.isPublished ? 'Published' : 'Draft'}</Td>
// //                 <Td>
// //                   <IconButton
// //                     icon={<MdEdit />}
// //                     size="sm"
// //                     mr="2"
// //                     onClick={() => {
// //                       setEditData({
// //                         ...t,
// //                         courseId: t.courseId?._id || t.courseId,
// //                         subjectId: t.subjectId?._id || t.subjectId || '',
// //                         subSubjectId:
// //                           t.subSubjectId?._id || t.subSubjectId || '',
// //                         chapterId: t.chapterId?._id || t.chapterId || '',
// //                       });
// //                       onOpen();
// //                     }}
// //                   />
// //                   <IconButton
// //                     icon={<MdDelete />}
// //                     size="sm"
// //                     mr="2"
// //                     onClick={() => handleDelete(t._id)}
// //                   />
// //                   {!t.isPublished && (
// //                     <IconButton
// //                       icon={<MdPublish />}
// //                       size="sm"
// //                       onClick={() => handlePublish(t._id)}
// //                     />
// //                   )}
// //                   {t.isPublished && (
// //                     <IconButton
// //                       icon={<MdPublish />}
// //                       size="sm"
// //                       onClick={() => handleUnpublish(t._id)}
// //                     />
// //                   )}
// //                 </Td>
// //               </Tr>
// //             ))}
// //           </Tbody>
// //         </Table>
// //       </Card>

// //       {/* EDIT MODAL */}
// //       <Modal isOpen={isOpen} onClose={onClose} size="xl">
// //         <ModalOverlay />
// //         <ModalContent>
// //           <ModalHeader>Edit Test</ModalHeader>
// //           <ModalCloseButton />
// //           <ModalBody>
// //             {/* COURSE */}
// //             <FormControl mb="3">
// //               <FormLabel>Course</FormLabel>
// //               <Select
// //                 value={editData?.courseId || ''}
// //                 onChange={(e) => {
// //                   setEditData({
// //                     ...editData,
// //                     courseId: e.target.value,
// //                     subjectId: '',
// //                     subSubjectId: '',
// //                     chapterId: '',
// //                   });
// //                   fetchSubjects(e.target.value);
// //                 }}
// //               >
// //                 <option value="">Select</option>
// //                 {courses.map((c) => (
// //                   <option key={c._id} value={c._id}>
// //                     {c.name}
// //                   </option>
// //                 ))}
// //               </Select>
// //             </FormControl>

// //             {/* SUBJECT */}
// //             <FormControl mb="3">
// //               <FormLabel>Subject</FormLabel>
// //               <Select
// //                 value={editData?.subjectId || ''}
// //                 onChange={(e) => {
// //                   setEditData({
// //                     ...editData,
// //                     subjectId: e.target.value,
// //                     subSubjectId: '',
// //                     chapterId: '',
// //                   });
// //                   fetchSubSubjects(e.target.value);
// //                 }}
// //               >
// //                 <option value="">Select</option>
// //                 {subjects.map((s) => (
// //                   <option key={s._id} value={s._id}>
// //                     {s.name}
// //                   </option>
// //                 ))}
// //               </Select>
// //             </FormControl>

// //             {/* SUB SUBJECT */}
// //             <FormControl mb="3">
// //               <FormLabel>Sub Subject</FormLabel>
// //               <Select
// //                 value={editData?.subSubjectId || ''}
// //                 onChange={(e) => {
// //                   setEditData({
// //                     ...editData,
// //                     subSubjectId: e.target.value,
// //                     chapterId: '',
// //                   });
// //                   fetchChapters(e.target.value);
// //                 }}
// //               >
// //                 <option value="">Select</option>
// //                 {subSubjects.map((ss) => (
// //                   <option key={ss._id} value={ss._id}>
// //                     {ss.name}
// //                   </option>
// //                 ))}
// //               </Select>
// //             </FormControl>

// //             {/* CHAPTER */}
// //             <FormControl mb="3">
// //               <FormLabel>Chapter</FormLabel>
// //               <Select
// //                 value={editData?.chapterId || ''}
// //                 onChange={(e) => {
// //                   setEditData({ ...editData, chapterId: e.target.value });
// //                 }}
// //               >
// //                 <option value="">Select</option>
// //                 {chapters.map((c) => (
// //                   <option key={c._id} value={c._id}>
// //                     {c.name}
// //                   </option>
// //                 ))}
// //               </Select>
// //             </FormControl>

// //             {/* SCOPE TYPE */}
// //             <FormControl mb="3">
// //               <FormLabel>Scope Type</FormLabel>
// //               <Select
// //                 value={editData?.scopeType}
// //                 onChange={(e) =>
// //                   setEditData({ ...editData, scopeType: e.target.value })
// //                 }
// //               >
// //                 <option value="subject">Subject</option>
// //                 <option value="sub-subject">Sub Subject</option>
// //                 <option value="chapter">Chapter</option>
// //               </Select>
// //             </FormControl>

// //             {/* TEST TYPE */}
// //             <FormControl mb="3">
// //               <FormLabel>Test Type</FormLabel>
// //               <Select
// //                 value={editData?.testType}
// //                 onChange={(e) =>
// //                   setEditData({ ...editData, testType: e.target.value })
// //                 }
// //               >
// //                 <option value="regular">Regular</option>
// //                 <option value="exam">Exam</option>
// //               </Select>
// //             </FormControl>

// //             {/* TOTAL QUESTIONS */}
// //             <FormControl>
// //               <FormLabel>Total Questions</FormLabel>
// //               <Input
// //                 type="number"
// //                 value={editData?.totalQuestions}
// //                 onChange={(e) =>
// //                   setEditData({
// //                     ...editData,
// //                     totalQuestions: e.target.value,
// //                   })
// //                 }
// //               />
// //             </FormControl>
// //           </ModalBody>
// //           <ModalFooter>
// //             <Button colorScheme="blue" onClick={handleUpdate}>
// //               Save
// //             </Button>
// //             <Button ml="2" onClick={onClose}>
// //               Cancel
// //             </Button>
// //           </ModalFooter>
// //         </ModalContent>
// //       </Modal>
// //     </Box>
// //   );
// // }
// // 'use client';

// // import React, { useState, useEffect } from 'react';
// // import {
// //   Box, Flex, Text, useColorModeValue, Button, IconButton, Select, 
// //   SimpleGrid, VStack, HStack, Badge, Divider, Collapse, Icon,
// //   useToast, Spinner, Center, Modal, ModalOverlay, ModalContent, 
// //   ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure,
// //   Input, FormControl, FormLabel
// // } from '@chakra-ui/react';
// // import { 
// //   MdAdd, MdDelete, MdTimer, MdCalendarToday, 
// //   MdMenuBook, MdArrowForwardIos, MdVisibility 
// // } from 'react-icons/md';
// // import axios from 'axios';
// // import Card from 'components/card/Card';

// // export default function TestManagement() {
// //   // --- THEME COLORS (Hooks at top level) ---
// //   const textColor = useColorModeValue('secondaryGray.900', 'white');
// //   const brandColor = useColorModeValue('brand.500', 'brand.400');
// //   const sectionBg = useColorModeValue('gray.50', 'navy.900');
// //   const cardBg = useColorModeValue('white', 'navy.800');
// //   const questionItemBg = useColorModeValue('gray.100', 'navy.700');
// //   const dividerColor = useColorModeValue('gray.300', 'whiteAlpha.300');

// //   // --- MODAL & TOAST ---
// //   const { isOpen, onOpen, onClose } = useDisclosure();
// //   const toast = useToast();

// //   // --- STATES ---
// //   const [tests, setTests] = useState([]);
// //   const [courses, setCourses] = useState([]);
// //   const [subjects, setSubjects] = useState([]);
// //   const [chapters, setChapters] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [btnLoading, setBtnLoading] = useState(false);
// //   const [expandedTest, setExpandedTest] = useState(null);

// //   // Form State
// //   const [formData, setFormData] = useState({
// //     courseId: '',
// //     subjectId: '',
// //     chapterId: '',
// //     testTitle: '',
// //     duration: 120, // Aapne 120 mins kaha tha
// //     month: '',
// //     academicYear: '2025-2026'
// //   });

// //   const baseUrl = process.env.REACT_APP_BASE_URL;
// //   const token = localStorage.getItem('token');
// //   const headers = { Authorization: `Bearer ${token}` };

// //   // --- API CALLS ---

// //   // 1. Fetch All Tests
// //   const fetchTests = async () => {
// //     try {
// //       setLoading(true);
// //       const res = await axios.get(`${baseUrl}api/admin/tests`, { headers });
// //       setTests(res.data.data || []);
// //     } catch (err) {
// //       toast({ title: 'Error fetching tests', status: 'error' });
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // 2. Fetch Dependent Data (Courses)
// //   const fetchCourses = async () => {
// //     try {
// //       const res = await axios.get(`${baseUrl}api/admin/courses`, { headers });
// //       setCourses(res.data.data || []);
// //     } catch (err) { console.log(err); }
// //   };

// //   useEffect(() => {
// //     fetchTests();
// //     fetchCourses();
// //   }, []);

// //   // 3. Handle Course Change -> Fetch Subjects
// //   const handleCourseChange = async (courseId) => {
// //     setFormData({ ...formData, courseId, subjectId: '', chapterId: '' });
// //     try {
// //       const res = await axios.get(`${baseUrl}api/admin/subjects?courseId=${courseId}`, { headers });
// //       setSubjects(res.data.data || []);
// //     } catch (err) { console.log(err); }
// //   };

// //   // 4. Handle Subject Change -> Fetch Chapters
// //   const handleSubjectChange = async (subjectId) => {
// //     setFormData({ ...formData, subjectId, chapterId: '' });
// //     try {
// //       const res = await axios.get(`${baseUrl}api/admin/chapters?subjectId=${subjectId}`, { headers });
// //       setChapters(res.data.data || []);
// //     } catch (err) { console.log(err); }
// //   };

// //   // 5. Create Test Logic
// //   const handleCreateSubmit = async () => {
// //     if (!formData.testTitle || !formData.month || !formData.courseId) {
// //       return toast({ title: 'Sare fields bharna zaroori hai', status: 'warning' });
// //     }
// //     setBtnLoading(true);
// //     try {
// //       await axios.post(`${baseUrl}api/admin/tests`, formData, { headers });
// //       toast({ title: 'Test Create Ho Gaya!', status: 'success' });
// //       fetchTests();
// //       onClose();
// //     } catch (err) {
// //       toast({ title: 'Error creating test', status: 'error' });
// //     } finally {
// //       setBtnLoading(false);
// //     }
// //   };

// //   const handleDelete = async (id, e) => {
// //     e.stopPropagation();
// //     if (window.confirm('Kya aap is test ko delete karna chahte hain?')) {
// //       try {
// //         await axios.delete(`${baseUrl}api/admin/tests/${id}`, { headers });
// //         toast({ title: 'Deleted', status: 'info' });
// //         fetchTests();
// //       } catch (err) { toast({ title: 'Delete Failed', status: 'error' }); }
// //     }
// //   };

// //   // --- GROUPING LOGIC ---
// //   const groupedByMonth = tests.reduce((acc, test) => {
// //     const key = `${test.month} ${test.academicYear}`;
// //     if (!acc[key]) acc[key] = [];
// //     acc[key].push(test);
// //     return acc;
// //   }, {});

// //   if (loading) return <Center h="50vh"><Spinner size="xl" color="brand.500" /></Center>;

// //   return (
// //     <Box pt={{ base: '130px', md: '80px' }} px="20px">
      
// //       {/* HEADER */}
// //       <Flex justify="space-between" align="center" mb="30px" direction={{ base: 'column', md: 'row' }} gap="4">
// //         <Box>
// //           <Text color={textColor} fontSize="28px" fontWeight="700">Test Management</Text>
// //           <Text color="gray.500">Month-wise categorized tests</Text>
// //         </Box>
// //         <Button leftIcon={<MdAdd />} colorScheme="brand" borderRadius="12px" onClick={onOpen}>
// //           Create New Test
// //         </Button>
// //       </Flex>

// //       {/* RENDER LIST */}
// //       {Object.keys(groupedByMonth).length === 0 ? (
// //         <Card p="40px" textAlign="center"><Text>No tests found.</Text></Card>
// //       ) : (
// //         Object.entries(groupedByMonth).map(([monthYear, monthTests]) => (
// //           <Box key={monthYear} mb="40px">
// //             <HStack mb="20px" spacing={4}>
// //               <Badge px="12px" py="6px" borderRadius="8px" colorScheme="brand" variant="subtle">
// //                 <Icon as={MdCalendarToday} mr="2" /> {monthYear}
// //               </Badge>
// //               <Divider borderColor={dividerColor} />
// //             </HStack>

// //             <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
// //               {monthTests.map((test) => (
// //                 <Box key={test._id}>
// //                   <Card 
// //                     p="20px" bg={cardBg} cursor="pointer" transition="0.2s"
// //                     border="1px solid" borderColor={expandedTest === test._id ? brandColor : "transparent"}
// //                     _hover={{ shadow: 'lg' }}
// //                     onClick={() => setExpandedTest(expandedTest === test._id ? null : test._id)}
// //                   >
// //                     <VStack align="stretch" spacing={3}>
// //                       <Flex justify="space-between" align="center">
// //                         <Badge colorScheme="purple">{test.courseId?.name || 'Test'}</Badge>
// //                         <IconButton size="xs" colorScheme="red" variant="ghost" icon={<MdDelete />} onClick={(e) => handleDelete(test._id, e)} />
// //                       </Flex>
// //                       <Text fontSize="lg" fontWeight="bold" noOfLines={1}>{test.testTitle}</Text>
// //                       <HStack fontSize="sm" color="gray.500">
// //                         <Icon as={MdTimer} /><Text>{test.duration} Min</Text>
// //                         <Icon as={MdMenuBook} /><Text>{test.questions?.length || 0} Questions</Text>
// //                       </HStack>
// //                     </VStack>
// //                   </Card>
                  
// //                   <Collapse in={expandedTest === test._id}>
// //                     <Box mt="2" p="3" bg={sectionBg} borderRadius="12px" border="1px dashed" borderColor={brandColor}>
// //                       {test.questions && test.questions.length > 0 ? (
// //                         test.questions.map((q, i) => (
// //                           <Text key={i} fontSize="xs" py="1" borderBottom="1px solid" borderColor={dividerColor}>
// //                             Q{i+1}: {q.questionText || "Image based question"}
// //                           </Text>
// //                         ))
// //                       ) : <Text fontSize="xs">No questions added yet.</Text>}
// //                     </Box>
// //                   </Collapse>
// //                 </Box>
// //               ))}
// //             </SimpleGrid>
// //           </Box>
// //         ))
// //       )}

// //       {/* CREATE MODAL */}
// //       <Modal isOpen={isOpen} onClose={onClose} size="xl">
// //         <ModalOverlay />
// //         <ModalContent borderRadius="20px">
// //           <ModalHeader>Test Configuration</ModalHeader>
// //           <ModalCloseButton />
// //           <ModalBody>
// //             <VStack spacing={4}>
// //               <FormControl isRequired>
// //                 <FormLabel>Test Title</FormLabel>
// //                 <Input placeholder="Ex: Unit Test 1" onChange={(e)=>setFormData({...formData, testTitle: e.target.value})} />
// //               </FormControl>

// //               <SimpleGrid columns={2} spacing={4} w="full">
// //                 <FormControl isRequired>
// //                   <FormLabel>Course</FormLabel>
// //                   <Select placeholder="Select Course" onChange={(e) => handleCourseChange(e.target.value)}>
// //                     {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
// //                   </Select>
// //                 </FormControl>
// //                 <FormControl isRequired>
// //                   <FormLabel>Subject</FormLabel>
// //                   <Select placeholder="Select Subject" onChange={(e) => handleSubjectChange(e.target.value)}>
// //                     {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
// //                   </Select>
// //                 </FormControl>
// //               </SimpleGrid>

// //               <SimpleGrid columns={2} spacing={4} w="full">
// //                 <FormControl isRequired>
// //                   <FormLabel>Month</FormLabel>
// //                   <Select placeholder="Month" onChange={(e)=>setFormData({...formData, month: e.target.value})}>
// //                     {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
// //                       <option key={m} value={m}>{m}</option>
// //                     ))}
// //                   </Select>
// //                 </FormControl>
// //                 <FormControl isRequired>
// //                   <FormLabel>Duration (Mins)</FormLabel>
// //                   <Input type="number" defaultValue={120} onChange={(e)=>setFormData({...formData, duration: e.target.value})} />
// //                 </FormControl>
// //               </SimpleGrid>
// //             </VStack>
// //           </ModalBody>
// //           <ModalFooter>
// //             <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
// //             <Button colorScheme="brand" isLoading={btnLoading} onClick={handleCreateSubmit}>Create Test</Button>
// //           </ModalFooter>
// //         </ModalContent>
// //       </Modal>
// //     </Box>
// //   );
// // }

// 'use client';

// import React, { useState, useEffect } from 'react';
// import {
//   Box, Flex, Text, useColorModeValue, Button, IconButton, Select, 
//   SimpleGrid, VStack, HStack, Badge, Divider, Collapse, Icon,
//   useToast, Spinner, Center, Modal, ModalOverlay, ModalContent, 
//   ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure,
//   Input, FormControl, FormLabel, Textarea, Radio, RadioGroup
// } from '@chakra-ui/react';
// import { 
//   MdAdd, MdDelete, MdTimer, MdCalendarToday, 
//   MdMenuBook, MdArrowForwardIos, MdCloudUpload, MdCheckCircle
// } from 'react-icons/md';
// import axios from 'axios';
// import Card from 'components/card/Card';

// export default function TestManagement() {
//   // --- THEME COLORS ---
//   const textColor = useColorModeValue('secondaryGray.900', 'white');
//   const brandColor = useColorModeValue('brand.500', 'brand.400');
//   const cardBg = useColorModeValue('white', 'navy.800');
//   const sectionBg = useColorModeValue('gray.50', 'navy.900');
//   const dividerColor = useColorModeValue('gray.300', 'whiteAlpha.300');

//   // --- HOOKS & STATES ---
//   const { isOpen, onOpen, onClose } = useDisclosure();
//   const toast = useToast();
//   const [tests, setTests] = useState([]);
//   const [courses, setCourses] = useState([]);
//   const [subjects, setSubjects] = useState([]);
//   const [chapters, setChapters] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [btnLoading, setBtnLoading] = useState(false);
//   const [expandedTest, setExpandedTest] = useState(null);

//   // Form State for Test
//   const [formData, setFormData] = useState({
//     courseId: '', subjectId: '', chapterId: '',
//     testTitle: '', month: '', academicYear: '2025-2026',
//     questions: []
//   });

//   // Local state for adding a single question
//   const [currentQuestion, setCurrentQuestion] = useState({
//     questionText: '', questionImage: '',
//     options: ['', '', '', ''],
//     correctAnswer: 0
//   });

//   const baseUrl = process.env.REACT_APP_BASE_URL;
//   const token = localStorage.getItem('token');
//   const headers = { Authorization: `Bearer ${token}` };

//   // --- DATA FETCHING ---
//   const fetchData = async (url, setter) => {
//     try {
//       const res = await axios.get(`${baseUrl}${url}`, { headers });
//       setter(res.data.data || []);
//     } catch (err) { console.error("Fetch Error:", err); }
//   };

//   useEffect(() => {
//     fetchData('api/admin/tests', setTests).then(() => setLoading(false));
//     fetchData('api/admin/courses', setCourses);
//   }, []);

//   const handleCourseChange = (id) => {
//     setFormData({ ...formData, courseId: id, subjectId: '', chapterId: '' });
//     fetchData(`api/admin/subjects?courseId=${id}`, setSubjects);
//   };

//   const handleSubjectChange = (id) => {
//     setFormData({ ...formData, subjectId: id, chapterId: '' });
//     fetchData(`api/admin/chapters?subjectId=${id}`, setChapters);
//   };

//   // --- QUESTION LOGIC ---
//   const addQuestionToTest = () => {
//     if (!currentQuestion.questionText && !currentQuestion.questionImage) {
//       return toast({ title: "Please enter question text or image", status: "warning" });
//     }
//     setFormData({ ...formData, questions: [...formData.questions, currentQuestion] });
//     // Reset local question state
//     setCurrentQuestion({ questionText: '', questionImage: '', options: ['', '', '', ''], correctAnswer: 0 });
//     toast({ title: "Question added to list", status: "success" });
//   };

//   const handleCreateSubmit = async () => {
//     if (!formData.testTitle || formData.questions.length === 0) {
//       return toast({ title: "Please fill title and add at least one question", status: "error" });
//     }
//     setBtnLoading(true);
//     try {
//       // Auto-calculate duration: 2 mins per question
//       const finalData = { ...formData, duration: formData.questions.length * 2 };
//       await axios.post(`${baseUrl}api/admin/tests`, finalData, { headers });
//       toast({ title: "Test created successfully", status: "success" });
//       fetchData('api/admin/tests', setTests);
//       onClose();
//     } catch (err) {
//       toast({ title: "Failed to create test", status: "error" });
//     } finally { setBtnLoading(false); }
//   };

//   const groupedByMonth = tests.reduce((acc, test) => {
//     const key = `${test.month} ${test.academicYear}`;
//     if (!acc[key]) acc[key] = [];
//     acc[key].push(test);
//     return acc;
//   }, {});

//   if (loading) return <Center h="50vh"><Spinner size="xl" color="brand.500" /></Center>;

//   return (
//     <Box pt={{ base: '130px', md: '80px' }} px="20px">
//       <Flex justify="space-between" align="center" mb="30px">
//         <Box>
//           <Text color={textColor} fontSize="28px" fontWeight="700">Test Repository</Text>
//           <Text color="gray.500">Duration is auto-calculated based on questions</Text>
//         </Box>
//         <Button leftIcon={<MdAdd />} colorScheme="brand" onClick={onOpen}>Create New Test</Button>
//       </Flex>

//       {Object.entries(groupedByMonth).map(([monthYear, monthTests]) => (
//         <Box key={monthYear} mb="30px">
//           <HStack mb="4"><Badge colorScheme="brand" p="2">{monthYear}</Badge><Divider /></HStack>
//           <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
//             {monthTests.map((test) => (
//               <Card key={test._id} p="20" cursor="pointer" onClick={() => setExpandedTest(expandedTest === test._id ? null : test._id)}>
//                 <Text fontWeight="bold">{test.testTitle}</Text>
//                 <HStack mt="2" color="gray.500" fontSize="sm">
//                    <Icon as={MdTimer} /><Text>{test.duration} Mins</Text>
//                    <Icon as={MdMenuBook} /><Text>{test.questions?.length} Qns</Text>
//                 </HStack>
//               </Card>
//             ))}
//           </SimpleGrid>
//         </Box>
//       ))}

//       {/* FULL CREATE MODAL */}
//       <Modal isOpen={isOpen} onClose={onClose} size="full">
//         <ModalOverlay />
//         <ModalContent>
//           <ModalHeader borderBottom="1px solid" borderColor={dividerColor}>Create Examination Test</ModalHeader>
//           <ModalCloseButton />
//           <ModalBody bg={sectionBg}>
//             <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} mt="4">
              
//               {/* LEFT SIDE: TEST CONFIG */}
//               <VStack align="stretch" spacing={4} bg={cardBg} p="6" borderRadius="15">
//                 <Text fontWeight="bold">1. General Information</Text>
//                 <FormControl isRequired><FormLabel>Test Title</FormLabel><Input onChange={(e)=>setFormData({...formData, testTitle: e.target.value})} /></FormControl>
//                 <HStack>
//                   <FormControl isRequired><FormLabel>Course</FormLabel>
//                     <Select placeholder="Select" onChange={(e)=>handleCourseChange(e.target.value)}>
//                       {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
//                     </Select>
//                   </FormControl>
//                   <FormControl isRequired><FormLabel>Subject</FormLabel>
//                     <Select placeholder="Select" onChange={(e)=>handleSubjectChange(e.target.value)}>
//                       {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
//                     </Select>
//                   </FormControl>
//                 </HStack>
//                 <FormControl isRequired><FormLabel>Month</FormLabel>
//                   <Select placeholder="Select Month" onChange={(e)=>setFormData({...formData, month: e.target.value})}>
//                     {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => <option key={m} value={m}>{m}</option>)}
//                   </Select>
//                 </FormControl>
//                 <Box p="4" bg="orange.50" borderRadius="10" border="1px solid" borderColor="orange.200">
//                   <Text fontSize="sm" color="orange.700"><b>Auto-Duration:</b> {formData.questions.length * 2} Minutes total.</Text>
//                 </Box>
//                 <Button colorScheme="brand" h="50px" isLoading={btnLoading} onClick={handleCreateSubmit}>Finish & Save Test</Button>
//               </VStack>

//               {/* RIGHT SIDE: QUESTION BUILDER */}
//               <VStack align="stretch" spacing={4} bg={cardBg} p="6" borderRadius="15">
//                 <Text fontWeight="bold">2. Add Questions ({formData.questions.length})</Text>
//                 <FormControl>
//                   <FormLabel>Question Text</FormLabel>
//                   <Textarea value={currentQuestion.questionText} onChange={(e)=>setCurrentQuestion({...currentQuestion, questionText: e.target.value})} />
//                 </FormControl>
//                 <FormControl>
//                   <FormLabel>Question Image URL (Optional)</FormLabel>
//                   <Input value={currentQuestion.questionImage} onChange={(e)=>setCurrentQuestion({...currentQuestion, questionImage: e.target.value})} />
//                 </FormControl>
                
//                 <Text fontSize="sm" fontWeight="bold">Options & Correct Answer</Text>
//                 <RadioGroup onChange={(val)=>setCurrentQuestion({...currentQuestion, correctAnswer: parseInt(val)})} value={currentQuestion.correctAnswer.toString()}>
//                   <VStack align="stretch">
//                     {currentQuestion.options.map((opt, idx) => (
//                       <HStack key={idx}>
//                         <Radio value={idx.toString()} />
//                         <Input placeholder={`Option ${idx+1}`} value={opt} onChange={(e) => {
//                           const newOpts = [...currentQuestion.options];
//                           newOpts[idx] = e.target.value;
//                           setCurrentQuestion({...currentQuestion, options: newOpts});
//                         }} />
//                       </HStack>
//                     ))}
//                   </VStack>
//                 </RadioGroup>
//                 <Button leftIcon={<MdAdd />} variant="outline" colorScheme="brand" onClick={addQuestionToTest}>Add to Question List</Button>
//               </VStack>
//             </SimpleGrid>
//           </ModalBody>
//         </ModalContent>
//       </Modal>
//     </Box>
//   );
// }
// 'use client';

// import React, { useState, useEffect } from 'react';
// import {
//   Box, Flex, Text, useColorModeValue, Button, IconButton, Select, 
//   SimpleGrid, VStack, HStack, Badge, Divider, Collapse, Icon,
//   useToast, Spinner, Center, Modal, ModalOverlay, ModalContent, 
//   ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure,
//   Input, FormControl, FormLabel, Textarea, Radio, RadioGroup, List, ListItem
// } from '@chakra-ui/react';
// import { 
//   MdAdd, MdDelete, MdTimer, MdCalendarToday, 
//   MdMenuBook, MdArrowForwardIos, MdCheckCircle, MdImage
// } from 'react-icons/md';
// import axios from 'axios';
// import Card from 'components/card/Card';

// export default function TestManagement() {
//   // --- THEME COLORS ---
//   const textColor = useColorModeValue('secondaryGray.900', 'white');
//   const brandColor = useColorModeValue('brand.500', 'brand.400');
//   const cardBg = useColorModeValue('white', 'navy.800');
//   const sectionBg = useColorModeValue('gray.50', 'navy.900');
//   const dividerColor = useColorModeValue('gray.300', 'whiteAlpha.300');

//   // --- HOOKS & STATES ---
//   const { isOpen, onOpen, onClose } = useDisclosure();
//   const toast = useToast();
  
//   const [tests, setTests] = useState([]);
//   const [courses, setCourses] = useState([]);
//   const [subjects, setSubjects] = useState([]);
//   const [chapters, setChapters] = useState([]);
  
//   const [loading, setLoading] = useState(true);
//   const [btnLoading, setBtnLoading] = useState(false);
//   const [expandedTest, setExpandedTest] = useState(null);

//   // Form State
//   const [formData, setFormData] = useState({
//     courseId: '',
//     subjectId: '',
//     chapterId: '',
//     testTitle: '',
//     month: '',
//     academicYear: '2025-2026',
//     questions: []
//   });

//   // Local Question State
//   const [tempQuestion, setTempQuestion] = useState({
//     questionText: '',
//     questionImage: '',
//     options: ['', '', '', ''],
//     correctAnswer: 0
//   });

//   const baseUrl = process.env.REACT_APP_BASE_URL;
//   const token = localStorage.getItem('token');
//   const headers = { Authorization: `Bearer ${token}` };

//   // --- API CALLS ---

//   const fetchTests = async () => {
//     try {
//       const res = await axios.get(`${baseUrl}api/admin/tests`, { headers });
//       setTests(res.data.data || []);
//     } catch (err) {
//       toast({ title: "Failed to load tests", status: "error" });
//     } finally { setLoading(false); }
//   };

//   const fetchCourses = async () => {
//     try {
//       const res = await axios.get(`${baseUrl}api/admin/courses`, { headers });
//       setCourses(res.data.data || []);
//     } catch (err) { console.error(err); }
//   };

//   useEffect(() => {
//     fetchTests();
//     fetchCourses();
//   }, []);

//   const handleCourseChange = async (id) => {
//     setFormData({ ...formData, courseId: id, subjectId: '', chapterId: '' });
//     try {
//       const res = await axios.get(`${baseUrl}api/admin/subjects?courseId=${id}`, { headers });
//       setSubjects(res.data.data || []);
//     } catch (err) { console.error(err); }
//   };

//   const handleSubjectChange = async (id) => {
//     setFormData({ ...formData, subjectId: id, chapterId: '' });
//     try {
//       const res = await axios.get(`${baseUrl}api/admin/chapters?subjectId=${id}`, { headers });
//       setChapters(res.data.data || []);
//     } catch (err) { console.error(err); }
//   };

//   // --- QUESTION LOGIC ---
//   const addQuestion = () => {
//     if (!tempQuestion.questionText && !tempQuestion.questionImage) {
//       return toast({ title: "Please provide question text or image", status: "warning" });
//     }
//     if (tempQuestion.options.some(opt => opt === '')) {
//       return toast({ title: "All 4 options are required", status: "warning" });
//     }

//     setFormData({ ...formData, questions: [...formData.questions, tempQuestion] });
//     setTempQuestion({ questionText: '', questionImage: '', options: ['', '', '', ''], correctAnswer: 0 });
//     toast({ title: "Question added to list", status: "success", duration: 1000 });
//   };

//   const handleFinalSubmit = async () => {
//     if (formData.questions.length === 0) {
//       return toast({ title: "Add at least one question", status: "error" });
//     }
//     setBtnLoading(true);
//     try {
//       // Auto duration calculation as per your controller logic
//       const submissionData = { ...formData, duration: formData.questions.length };
//       await axios.post(`${baseUrl}api/admin/tests`, submissionData, { headers });
//       toast({ title: "Test successfully created", status: "success" });
//       fetchTests();
//       onClose();
//     } catch (err) {
//       toast({ title: "Error creating test", status: "error" });
//     } finally { setBtnLoading(false); }
//   };

//   // --- GROUPING LOGIC ---
//   const groupedByMonth = tests.reduce((acc, test) => {
//     const key = `${test.month || 'Other'} ${test.academicYear || ''}`;
//     if (!acc[key]) acc[key] = [];
//     acc[key].push(test);
//     return acc;
//   }, {});

//   if (loading) return <Center h="50vh"><Spinner size="xl" color="brand.500" /></Center>;

//   return (
//     <Box pt={{ base: '130px', md: '80px' }} px="20px">
//       <Flex justify="space-between" align="center" mb="30px">
//         <Box>
//           <Text color={textColor} fontSize="28px" fontWeight="700">Test Management</Text>
//           <Text color="gray.500">Duration is auto-calculated based on question count</Text>
//         </Box>
//         <Button leftIcon={<MdAdd />} colorScheme="brand" borderRadius="12px" onClick={onOpen}>Create New Test</Button>
//       </Flex>

//       {Object.entries(groupedByMonth).map(([monthYear, monthTests]) => (
//         <Box key={monthYear} mb="40px">
//           <HStack mb="20px" spacing={4}>
//             <Badge px="12px" py="6px" borderRadius="8px" colorScheme="brand" variant="subtle">
//               <Icon as={MdCalendarToday} mr="2" /> {monthYear}
//             </Badge>
//             <Divider />
//           </HStack>

//           <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
//             {monthTests.map((test) => (
//               <Card key={test._id} p="20px" cursor="pointer" onClick={() => setExpandedTest(expandedTest === test._id ? null : test._id)}>
//                 <VStack align="stretch">
//                   <Badge alignSelf="start" colorScheme="purple">{test.courseId?.name}</Badge>
//                   <Text fontWeight="bold" fontSize="lg">{test.testTitle}</Text>
//                   <HStack spacing={4} color="gray.500" fontSize="sm">
//                     <HStack><Icon as={MdTimer} /><Text>{test.duration} Min</Text></HStack>
//                     <HStack><Icon as={MdMenuBook} /><Text>{test.questions?.length} Qns</Text></HStack>
//                   </HStack>
//                 </VStack>
//               </Card>
//             ))}
//           </SimpleGrid>
//         </Box>
//       ))}

//       {/* CREATE MODAL */}
//       <Modal isOpen={isOpen} onClose={onClose} size="full">
//         <ModalOverlay />
//         <ModalContent borderRadius="0">
//           <ModalHeader borderBottom="1px solid" borderColor={dividerColor}>Create New Examination Test</ModalHeader>
//           <ModalCloseButton />
//           <ModalBody bg={sectionBg} p="8">
//             <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
              
//               {/* LEFT: FORM INFO */}
//               <VStack align="stretch" spacing={5} bg={cardBg} p="6" borderRadius="20px" shadow="sm">
//                 <Text fontSize="xl" fontWeight="700" color={brandColor}>1. Test Configuration</Text>
//                 <FormControl isRequired>
//                   <FormLabel>Test Title</FormLabel>
//                   <Input placeholder="Enter title" onChange={(e)=>setFormData({...formData, testTitle: e.target.value})} />
//                 </FormControl>
                
//                 <SimpleGrid columns={2} spacing={4}>
//                   <FormControl isRequired>
//                     <FormLabel>Course</FormLabel>
//                     <Select placeholder="Select Course" onChange={(e)=>handleCourseChange(e.target.value)}>
//                       {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
//                     </Select>
//                   </FormControl>
//                   <FormControl isRequired>
//                     <FormLabel>Subject</FormLabel>
//                     <Select placeholder="Select Subject" onChange={(e)=>handleSubjectChange(e.target.value)}>
//                       {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
//                     </Select>
//                   </FormControl>
//                 </SimpleGrid>

//                 <FormControl isRequired>
//                   <FormLabel>Chapter</FormLabel>
//                   <Select placeholder="Select Chapter" onChange={(e)=>setFormData({...formData, chapterId: e.target.value})}>
//                     {chapters.map(ch => <option key={ch._id} value={ch._id}>{ch.name}</option>)}
//                   </Select>
//                 </FormControl>

//                 <FormControl isRequired>
//                   <FormLabel>Month</FormLabel>
//                   <Select placeholder="Select Month" onChange={(e)=>setFormData({...formData, month: e.target.value})}>
//                     {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => <option key={m} value={m}>{m}</option>)}
//                   </Select>
//                 </FormControl>

//                 <Box p="4" bg="brand.50" borderRadius="15px">
//                   <Text fontWeight="bold" color="brand.600">Questions Added: {formData.questions.length}</Text>
//                   <Text fontSize="xs">Duration will be {formData.questions.length} minutes.</Text>
//                 </Box>

//                 <Button colorScheme="brand" size="lg" h="60px" isLoading={btnLoading} onClick={handleFinalSubmit}>
//                   Create Test Now
//                 </Button>
//               </VStack>

//               {/* RIGHT: QUESTION BUILDER */}
//               <VStack align="stretch" spacing={5} bg={cardBg} p="6" borderRadius="20px" shadow="sm">
//                 <Text fontSize="xl" fontWeight="700" color="orange.400">2. Add MCQ Questions</Text>
                
//                 <FormControl>
//                   <FormLabel>Question Text</FormLabel>
//                   <Textarea value={tempQuestion.questionText} onChange={(e)=>setTempQuestion({...tempQuestion, questionText: e.target.value})} placeholder="Type question here..." />
//                 </FormControl>

//                 <FormControl>
//                   <FormLabel>Image URL (Optional)</FormLabel>
//                   <Input value={tempQuestion.questionImage} onChange={(e)=>setTempQuestion({...tempQuestion, questionImage: e.target.value})} placeholder="https://image-link.com" />
//                 </FormControl>

//                 <Box>
//                   <FormLabel>Options (Check the correct one)</FormLabel>
//                   <RadioGroup onChange={(val)=>setTempQuestion({...tempQuestion, correctAnswer: parseInt(val)})} value={tempQuestion.correctAnswer.toString()}>
//                     <VStack align="stretch">
//                       {tempQuestion.options.map((opt, idx) => (
//                         <HStack key={idx}>
//                           <Radio value={idx.toString()} colorScheme="green" />
//                           <Input variant="filled" placeholder={`Option ${idx + 1}`} value={opt} onChange={(e) => {
//                             const newOpts = [...tempQuestion.options];
//                             newOpts[idx] = e.target.value;
//                             setTempQuestion({...tempQuestion, options: newOpts});
//                           }} />
//                         </HStack>
//                       ))}
//                     </VStack>
//                   </RadioGroup>
//                 </Box>

//                 <Button leftIcon={<MdAdd />} variant="outline" colorScheme="orange" onClick={addQuestion}>
//                   Add to Test List
//                 </Button>

//                 <Divider />
                
//                 <Text fontWeight="bold" fontSize="sm">Preview of Added Questions:</Text>
//                 <Box maxH="200px" overflowY="auto">
//                   {formData.questions.map((q, i) => (
//                     <HStack key={i} justify="space-between" p="2" borderBottom="1px solid" borderColor={dividerColor}>
//                       <Text fontSize="xs" noOfLines={1}>{i+1}. {q.questionText || "Image Question"}</Text>
//                       <IconButton size="xs" icon={<MdDelete />} onClick={() => setFormData({...formData, questions: formData.questions.filter((_, index) => index !== i)})} />
//                     </HStack>
//                   ))}
//                 </Box>
//               </VStack>

//             </SimpleGrid>
//           </ModalBody>
//         </ModalContent>
//       </Modal>
//     </Box>
//   );
// }
// 'use client';

// import React, { useState, useEffect } from 'react';
// import {
//   Box, Flex, Text, useColorModeValue, Button, IconButton, Select, 
//   SimpleGrid, VStack, HStack, Badge, Divider, Icon, useToast, 
//   Spinner, Center, Modal, ModalOverlay, ModalContent, ModalHeader, 
//   ModalFooter, ModalBody, ModalCloseButton, useDisclosure,
//   Input, FormControl, FormLabel, Textarea, Radio, RadioGroup, Tooltip,
// } from '@chakra-ui/react';
// import { 
//   MdAdd, MdDelete, MdTimer, MdCalendarToday, 
//   MdCheckCircle, MdOutlineRadioButtonUnchecked, MdCloudUpload ,MdMenuBook
// } from 'react-icons/md';
// import axios from 'axios';
// import Card from 'components/card/Card';

// export default function TestManagement() {
//   // --- THEME & UI ---
//   const textColor = useColorModeValue('secondaryGray.900', 'white');
//   const brandColor = useColorModeValue('brand.500', 'brand.400');
//   const cardBg = useColorModeValue('white', 'navy.800');
//   const sectionBg = useColorModeValue('gray.50', 'navy.900');

//   const { isOpen, onOpen, onClose } = useDisclosure();
//   const toast = useToast();

//   // --- STATES ---
//   const [tests, setTests] = useState([]);
//   const [courses, setCourses] = useState([]);
//   const [subjects, setSubjects] = useState([]);
//   const [chapters, setChapters] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [btnLoading, setBtnLoading] = useState(false);

//   // Form State (Aligned with your Backend Requirements)
//   const [formData, setFormData] = useState({
//     courseId: '',
//     subjectId: '',
//     chapterId: '',
//     testTitle: '',
//     month: 'January',
//     academicYear: '2025-2026',
//     endDate: '', // REQUIRED FIXED
//     questions: []
//   });

//   // Individual Question Builder State
//   const [currentQuestion, setCurrentQuestion] = useState({
//     questionText: '',
//     questionImage: '',
//     options: [
//       { text: '', isCorrect: true }, // Default first option correct
//       { text: '', isCorrect: false },
//       { text: '', isCorrect: false },
//       { text: '', isCorrect: false }
//     ]
//   });

//   const baseUrl = process.env.REACT_APP_BASE_URL;
//   const token = localStorage.getItem('token');
//   const headers = { Authorization: `Bearer ${token}` };

//   // --- API LOGIC ---

//   const fetchInitialData = async () => {
//     try {
//       setLoading(true);
//       const [testsRes, coursesRes] = await Promise.all([
//         axios.get(`${baseUrl}api/admin/tests`, { headers }),
//         axios.get(`${baseUrl}api/admin/courses`, { headers })
//       ]);
//       setTests(testsRes.data.data || []);
//       setCourses(coursesRes.data.data || []);
//     } catch (err) {
//       toast({ title: "Error fetching data", status: "error" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetchInitialData(); }, []);

//   const handleCourseChange = async (id) => {
//     setFormData({ ...formData, courseId: id, subjectId: '', chapterId: '' });
//     setSubjects([]); setChapters([]);
//     if (!id) return;
//     try {
//       const res = await axios.get(`${baseUrl}api/admin/subjects?courseId=${id}`, { headers });
//       setSubjects(res.data.data || []);
//     } catch (err) { console.error(err); }
//   };

//   const handleSubjectChange = async (id) => {
//     setFormData({ ...formData, subjectId: id, chapterId: '' });
//     setChapters([]);
//     if (!id) return;
//     try {
//       const res = await axios.get(`${baseUrl}api/admin/chapters?subjectId=${id}`, { headers });
//       setChapters(res.data.data || []);
//     } catch (err) { console.error(err); }
//   };

//   // --- QUESTION HANDLERS ---

//   const updateOptionText = (index, text) => {
//     const updatedOptions = [...currentQuestion.options];
//     updatedOptions[index].text = text;
//     setCurrentQuestion({ ...currentQuestion, options: updatedOptions });
//   };

//   const setCorrectOption = (index) => {
//     const updatedOptions = currentQuestion.options.map((opt, i) => ({
//       ...opt,
//       isCorrect: i === index
//     }));
//     setCurrentQuestion({ ...currentQuestion, options: updatedOptions });
//   };

//   const addQuestionToTest = () => {
//     if (!currentQuestion.questionText && !currentQuestion.questionImage) {
//       return toast({ title: "Question text or image is required", status: "warning" });
//     }
//     if (currentQuestion.options.some(opt => !opt.text)) {
//       return toast({ title: "Please fill all 4 options", status: "warning" });
//     }

//     setFormData({ ...formData, questions: [...formData.questions, currentQuestion] });
//     // Reset question builder
//     setCurrentQuestion({
//       questionText: '',
//       questionImage: '',
//       options: [
//         { text: '', isCorrect: true },
//         { text: '', isCorrect: false },
//         { text: '', isCorrect: false },
//         { text: '', isCorrect: false }
//       ]
//     });
//     toast({ title: "Question added successfully", status: "success", duration: 1000 });
//   };

//   const removeQuestion = (index) => {
//     const filtered = formData.questions.filter((_, i) => i !== index);
//     setFormData({ ...formData, questions: filtered });
//   };

//   const handleSubmit = async () => {
//     if (!formData.testTitle || !formData.endDate || !formData.courseId) {
//       return toast({ title: "Please fill all required fields including End Date", status: "error" });
//     }
//     if (formData.questions.length === 0) {
//       return toast({ title: "Please add at least one question", status: "error" });
//     }

//     setBtnLoading(true);
//     try {
//       // Backend controller uses duration = questions.length
//       const finalPayload = { ...formData, duration: formData.questions.length };
//       await axios.post(`${baseUrl}api/admin/tests`, finalPayload, { headers });
//       toast({ title: "Test Created Successfully", status: "success" });
//       onClose();
//       fetchInitialData();
//     } catch (err) {
//       const errorMsg = err.response?.data?.message || "Internal Server Error";
//       toast({ title: "Creation Failed", description: errorMsg, status: "error" });
//     } finally {
//       setBtnLoading(false);
//     }
//   };

//   if (loading) return <Center h="50vh"><Spinner size="xl" color="brand.500" /></Center>;

//   return (
//     <Box pt={{ base: '130px', md: '80px' }} px="20px">
//       <Flex justify="space-between" align="center" mb="30px">
//         <Box>
//           <Text color={textColor} fontSize="28px" fontWeight="700">Test Management</Text>
//           <Text color="gray.500">Manage your hierarchy-based examination tests</Text>
//         </Box>
//         <Button leftIcon={<MdAdd />} colorScheme="brand" onClick={onOpen}>Create New Test</Button>
//       </Flex>

//       {/* TEST LISTING */}
//       <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
//         {tests.map(test => (
//           <Card key={test._id} p="20px">
//             <VStack align="stretch" spacing={2}>
//               <Badge colorScheme="brand" w="fit-content">{test.courseId?.name}</Badge>
//               <Text fontWeight="bold" fontSize="lg">{test.testTitle}</Text>
//               <HStack color="gray.500" fontSize="sm">
//                 <Icon as={MdTimer} /> <Text>{test.duration} Mins</Text>
//                 <Icon as={MdMenuBook} /> <Text>{test.questions?.length} Qns</Text>
//               </HStack>
//             </VStack>
//           </Card>
//         ))}
//       </SimpleGrid>

//       {/* CREATE TEST MODAL */}
//       <Modal isOpen={isOpen} onClose={onClose} size="full">
//         <ModalOverlay />
//         <ModalContent>
//           <ModalHeader borderBottom="1px solid" borderColor="gray.200">New Test Configuration</ModalHeader>
//           <ModalCloseButton />
//           <ModalBody bg={sectionBg} p="8">
//             <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
              
//               {/* LEFT: SETTINGS */}
//               <VStack align="stretch" spacing={5} bg={cardBg} p="6" borderRadius="20px" shadow="sm">
//                 <Text fontSize="xl" fontWeight="700" color={brandColor}>1. Basic Information</Text>
//                 <FormControl isRequired>
//                   <FormLabel>Test Title</FormLabel>
//                   <Input placeholder="E.g. Monthly Assessment" onChange={(e)=>setFormData({...formData, testTitle: e.target.value})} />
//                 </FormControl>

//                 <SimpleGrid columns={2} spacing={4}>
//                   <FormControl isRequired>
//                     <FormLabel>Course</FormLabel>
//                     <Select placeholder="Select Course" onChange={(e)=>handleCourseChange(e.target.value)}>
//                       {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
//                     </Select>
//                   </FormControl>
//                   <FormControl isRequired>
//                     <FormLabel>Subject</FormLabel>
//                     <Select placeholder="Select Subject" isDisabled={!formData.courseId} onChange={(e)=>handleSubjectChange(e.target.value)}>
//                       {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
//                     </Select>
//                   </FormControl>
//                 </SimpleGrid>

//                 <FormControl isRequired>
//                   <FormLabel>Chapter</FormLabel>
//                   <Select placeholder="Select Chapter" isDisabled={!formData.subjectId} onChange={(e)=>setFormData({...formData, chapterId: e.target.value})}>
//                     {chapters.map(ch => <option key={ch._id} value={ch._id}>{ch.name}</option>)}
//                   </Select>
//                 </FormControl>

//                 <HStack>
//                   <FormControl isRequired>
//                     <FormLabel>Academic Year</FormLabel>
//                     <Select onChange={(e)=>setFormData({...formData, academicYear: e.target.value})}>
//                       <option value="2025-2026">2025-2026</option>
//                       <option value="2026-2027">2026-2027</option>
//                     </Select>
//                   </FormControl>
//                   <FormControl isRequired>
//                     <FormLabel>End Date</FormLabel>
//                     <Input type="date" onChange={(e)=>setFormData({...formData, endDate: e.target.value})} />
//                   </FormControl>
//                 </HStack>

//                 <Button colorScheme="brand" size="lg" h="60px" mt="4" isLoading={btnLoading} onClick={handleSubmit}>
//                   Save and Publish Test
//                 </Button>
//               </VStack>

//               {/* RIGHT: QUESTION BUILDER */}
//               <VStack align="stretch" spacing={5} bg={cardBg} p="6" borderRadius="20px" shadow="sm">
//                 <Text fontSize="xl" fontWeight="700" color="orange.400">2. Add Questions ({formData.questions.length})</Text>
                
//                 <FormControl isRequired>
//                   <FormLabel>Question Text</FormLabel>
//                   <Textarea value={currentQuestion.questionText} onChange={(e)=>setCurrentQuestion({...currentQuestion, questionText: e.target.value})} placeholder="Type your question here..." />
//                 </FormControl>

//                 <FormControl>
//                   <FormLabel>Question Image URL (Optional)</FormLabel>
//                   <Input value={currentQuestion.questionImage} onChange={(e)=>setCurrentQuestion({...currentQuestion, questionImage: e.target.value})} placeholder="https://image-url.com/img.jpg" />
//                 </FormControl>

//                 <Box>
//                   <Text fontWeight="bold" mb="2" fontSize="sm">Options (Mark one as Correct)</Text>
//                   <VStack align="stretch" spacing={3}>
//                     {currentQuestion.options.map((opt, idx) => (
//                       <HStack key={idx} spacing={3}>
//                         <IconButton
//                           aria-label="Mark Correct"
//                           icon={opt.isCorrect ? <MdCheckCircle /> : <MdOutlineRadioButtonUnchecked />}
//                           colorScheme={opt.isCorrect ? "green" : "gray"}
//                           variant="ghost"
//                           onClick={() => setCorrectOption(idx)}
//                         />
//                         <Input 
//                           placeholder={`Option ${idx + 1}`} 
//                           value={opt.text} 
//                           onChange={(e) => updateOptionText(idx, e.target.value)}
//                         />
//                       </HStack>
//                     ))}
//                   </VStack>
//                 </Box>

//                 <Button leftIcon={<MdAdd />} colorScheme="orange" variant="solid" onClick={addQuestionToTest}>
//                   Add Question to List
//                 </Button>

//                 <Divider />
//                 <Text fontWeight="bold" fontSize="sm">Review Added Questions</Text>
//                 <Box maxH="150px" overflowY="auto" border="1px solid" borderColor="gray.100" p="2" borderRadius="md">
//                    {formData.questions.length === 0 && <Text fontSize="xs" color="gray.400">No questions added yet</Text>}
//                    {formData.questions.map((q, i) => (
//                      <HStack key={i} justify="space-between" bg="gray.50" p="2" mb="2" borderRadius="md">
//                        <Text fontSize="xs" noOfLines={1}>{i+1}. {q.questionText || 'Image Question'}</Text>
//                        <IconButton size="xs" colorScheme="red" variant="ghost" icon={<MdDelete />} onClick={() => removeQuestion(i)} />
//                      </HStack>
//                    ))}
//                 </Box>
//               </VStack>

//             </SimpleGrid>
//           </ModalBody>
//         </ModalContent>
//       </Modal>
//     </Box>
//   );
// }

// 'use client';

// import React, { useState, useEffect } from 'react';
// import {
//   Box, Flex, Text, useColorModeValue, Button, IconButton, Select, 
//   SimpleGrid, VStack, HStack, Badge, Divider, Icon, useToast, 
//   Spinner, Center, Modal, ModalOverlay, ModalContent, ModalHeader, 
//   ModalBody, ModalCloseButton, useDisclosure,
//   Input, FormControl, FormLabel, Textarea
// } from '@chakra-ui/react';
// import { 
//   MdAdd, MdDelete, MdTimer, MdCheckCircle, 
//   MdOutlineRadioButtonUnchecked, MdMenuBook 
// } from 'react-icons/md';
// import axios from 'axios';
// import Card from 'components/card/Card';

// export default function TestManagement() {
//   const textColor = useColorModeValue('secondaryGray.900', 'white');
//   const brandColor = useColorModeValue('brand.500', 'brand.400');
//   const cardBg = useColorModeValue('white', 'navy.800');
//   const sectionBg = useColorModeValue('gray.50', 'navy.900');

//   const { isOpen, onOpen, onClose } = useDisclosure();
//   const toast = useToast();

//   const [tests, setTests] = useState([]);
//   const [courses, setCourses] = useState([]);
//   const [subjects, setSubjects] = useState([]);
//   const [chapters, setChapters] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [btnLoading, setBtnLoading] = useState(false);

//   const [formData, setFormData] = useState({
//     courseId: '',
//     subjectId: '',
//     chapterId: '',
//     testTitle: '',
//     month: 'January',
//     academicYear: '2025-2026',
//     endDate: '', 
//     questions: []
//   });

//   const [currentQuestion, setCurrentQuestion] = useState({
//     questionText: '',
//     questionImage: '',
//     correctAnswer: 0, // NEW: Added to track the index
//     options: [
//       { text: '', isCorrect: true },
//       { text: '', isCorrect: false },
//       { text: '', isCorrect: false },
//       { text: '', isCorrect: false }
//     ]
//   });

//   const baseUrl = process.env.REACT_APP_BASE_URL;
//   const token = localStorage.getItem('token');
//   const headers = { Authorization: `Bearer ${token}` };

//   const fetchInitialData = async () => {
//     try {
//       setLoading(true);
//       const [testsRes, coursesRes] = await Promise.all([
//         axios.get(`${baseUrl}api/admin/tests`, { headers }),
//         axios.get(`${baseUrl}api/admin/courses`, { headers })
//       ]);
//       setTests(testsRes.data.data || []);
//       setCourses(coursesRes.data.data || []);
//     } catch (err) {
//       toast({ title: "Error fetching initial data", status: "error" });
//     } finally { setLoading(false); }
//   };

//   useEffect(() => { fetchInitialData(); }, []);

//   const handleCourseChange = async (id) => {
//     setFormData({ ...formData, courseId: id, subjectId: '', chapterId: '' });
//     setSubjects([]); setChapters([]);
//     if (!id) return;
//     try {
//       const res = await axios.get(`${baseUrl}api/admin/subjects?courseId=${id}`, { headers });
//       setSubjects(res.data.data || []);
//     } catch (err) { console.error(err); }
//   };

//   const handleSubjectChange = async (id) => {
//     setFormData({ ...formData, subjectId: id, chapterId: '' });
//     setChapters([]);
//     if (!id) return;
//     try {
//       const res = await axios.get(`${baseUrl}api/admin/chapters?subjectId=${id}`, { headers });
//       setChapters(res.data.data || []);
//     } catch (err) { console.error(err); }
//   };

//   const updateOptionText = (index, text) => {
//     const updatedOptions = [...currentQuestion.options];
//     updatedOptions[index].text = text;
//     setCurrentQuestion({ ...currentQuestion, options: updatedOptions });
//   };

//   const setCorrectOption = (index) => {
//     const updatedOptions = currentQuestion.options.map((opt, i) => ({
//       ...opt, isCorrect: i === index
//     }));
//     // Also updating the top-level correctAnswer field for the backend
//     setCurrentQuestion({ ...currentQuestion, options: updatedOptions, correctAnswer: index });
//   };

//   const addQuestionToTest = () => {
//     if (!currentQuestion.questionText && !currentQuestion.questionImage) {
//       return toast({ title: "Question content is required", status: "warning" });
//     }
//     if (currentQuestion.options.some(opt => opt.text.trim() === '')) {
//       return toast({ title: "Please fill all 4 options", status: "warning" });
//     }

//     // Creating a clean object to push to ensure correctAnswer is present
//     const questionToPush = {
//       ...currentQuestion,
//       correctAnswer: currentQuestion.correctAnswer // Ensuring this is sent
//     };

//     setFormData({ ...formData, questions: [...formData.questions, questionToPush] });
    
//     // Reset builder
//     setCurrentQuestion({
//       questionText: '', questionImage: '',
//       correctAnswer: 0,
//       options: [
//         { text: '', isCorrect: true },
//         { text: '', isCorrect: false },
//         { text: '', isCorrect: false },
//         { text: '', isCorrect: false }
//       ]
//     });
//     toast({ title: "Question added", status: "success", duration: 1000 });
//   };

//   const removeQuestion = (index) => {
//     const filtered = formData.questions.filter((_, i) => i !== index);
//     setFormData({ ...formData, questions: filtered });
//   };

//   const handleSubmit = async () => {
//     if (!formData.testTitle || !formData.endDate || !formData.courseId) {
//       return toast({ title: "Missing Fields", description: "Title, Course and End Date are required", status: "error" });
//     }
//     if (formData.questions.length === 0) {
//       return toast({ title: "No Questions", description: "Add at least one question", status: "error" });
//     }

//     setBtnLoading(true);
//     try {
//       const finalPayload = { ...formData, duration: formData.questions.length };
//       console.log("Submitting Payload:", finalPayload); // Check this in console if fails
//       await axios.post(`${baseUrl}api/admin/tests`, finalPayload, { headers });
//       toast({ title: "Test Published Successfully", status: "success" });
//       onClose();
//       fetchInitialData();
//     } catch (err) {
//       const errorMsg = err.response?.data?.message || "Check your data and try again";
//       toast({ title: "Save Failed", description: errorMsg, status: "error" });
//     } finally { setBtnLoading(false); }
//   };

//   if (loading) return <Center h="50vh"><Spinner size="xl" color="brand.500" /></Center>;

//   return (
//     <Box pt={{ base: '130px', md: '80px' }} px="20px">
//       {/* HEADER SECTION */}
//       <Flex justify="space-between" align="center" mb="30px">
//         <Box>
//           <Text color={textColor} fontSize="28px" fontWeight="700">Test Management</Text>
//           <Text color="gray.500">Manage your examination hierarchy</Text>
//         </Box>
//         <Button leftIcon={<MdAdd />} colorScheme="brand" onClick={onOpen}>Create New Test</Button>
//       </Flex>

//       {/* TEST CARDS */}
//       <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
//         {tests.map(test => (
//           <Card key={test._id} p="20px">
//             <VStack align="stretch" spacing={2}>
//               <Badge colorScheme="brand" w="fit-content">{test.courseId?.name || "General"}</Badge>
//               <Text fontWeight="bold" fontSize="lg" noOfLines={1}>{test.testTitle}</Text>
//               <HStack color="gray.500" fontSize="sm">
//                 <Icon as={MdTimer} /> <Text>{test.duration} Mins</Text>
//                 <Icon as={MdMenuBook} /> <Text>{test.questions?.length} Qns</Text>
//               </HStack>
//             </VStack>
//           </Card>
//         ))}
//       </SimpleGrid>

//       {/* FULL SCREEN MODAL */}
//       <Modal isOpen={isOpen} onClose={onClose} size="full">
//         <ModalOverlay />
//         <ModalContent>
//           <ModalHeader borderBottom="1px solid" borderColor="gray.100">Setup New Examination</ModalHeader>
//           <ModalCloseButton />
//           <ModalBody bg={sectionBg} p="8">
//             <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
              
//               {/* LEFT COLUMN: SETTINGS */}
//               <VStack align="stretch" spacing={5} bg={cardBg} p="6" borderRadius="20px" shadow="sm">
//                 <Text fontSize="xl" fontWeight="700" color={brandColor}>1. Test Configuration</Text>
//                 <FormControl isRequired>
//                   <FormLabel>Test Title</FormLabel>
//                   <Input placeholder="Enter Title" onChange={(e)=>setFormData({...formData, testTitle: e.target.value})} />
//                 </FormControl>

//                 <SimpleGrid columns={2} spacing={4}>
//                   <FormControl isRequired>
//                     <FormLabel>Course</FormLabel>
//                     <Select placeholder="Select Course" onChange={(e)=>handleCourseChange(e.target.value)}>
//                       {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
//                     </Select>
//                   </FormControl>
//                   <FormControl isRequired>
//                     <FormLabel>Subject</FormLabel>
//                     <Select placeholder="Select Subject" isDisabled={!formData.courseId} onChange={(e)=>handleSubjectChange(e.target.value)}>
//                       {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
//                     </Select>
//                   </FormControl>
//                 </SimpleGrid>

//                 <FormControl isRequired>
//                   <FormLabel>Chapter</FormLabel>
//                   <Select placeholder="Select Chapter" isDisabled={!formData.subjectId} onChange={(e)=>setFormData({...formData, chapterId: e.target.value})}>
//                     {chapters.map(ch => <option key={ch._id} value={ch._id}>{ch.name}</option>)}
//                   </Select>
//                 </FormControl>

//                 <HStack>
//                   <FormControl isRequired>
//                     <FormLabel>End Date</FormLabel>
//                     <Input type="date" onChange={(e)=>setFormData({...formData, endDate: e.target.value})} />
//                   </FormControl>
//                   <FormControl isRequired>
//                     <FormLabel>Academic Year</FormLabel>
//                     <Select onChange={(e)=>setFormData({...formData, academicYear: e.target.value})}>
//                       <option value="2025-2026">2025-2026</option>
//                       <option value="2026-2027">2026-2027</option>
//                     </Select>
//                   </FormControl>
//                 </HStack>

//                 <Button colorScheme="brand" size="lg" h="60px" mt="4" isLoading={btnLoading} onClick={handleSubmit}>
//                   Final Publish Test
//                 </Button>
//               </VStack>

//               {/* RIGHT COLUMN: QUESTION BUILDER */}
//               <VStack align="stretch" spacing={5} bg={cardBg} p="6" borderRadius="20px" shadow="sm">
//                 <Text fontSize="xl" fontWeight="700" color="orange.400">2. Questions Dashboard ({formData.questions.length})</Text>
                
//                 <FormControl isRequired>
//                   <FormLabel>Question Text</FormLabel>
//                   <Textarea value={currentQuestion.questionText} onChange={(e)=>setCurrentQuestion({...currentQuestion, questionText: e.target.value})} placeholder="Write question..." />
//                 </FormControl>

//                 <Box>
//                   <Text fontWeight="bold" mb="2" fontSize="sm">Options</Text>
//                   <VStack align="stretch" spacing={3}>
//                     {currentQuestion.options.map((opt, idx) => (
//                       <HStack key={idx}>
//                         <IconButton
//                           aria-label="Correct"
//                           icon={opt.isCorrect ? <MdCheckCircle /> : <MdOutlineRadioButtonUnchecked />}
//                           colorScheme={opt.isCorrect ? "green" : "gray"}
//                           onClick={() => setCorrectOption(idx)}
//                         />
//                         <Input 
//                           placeholder={`Option ${idx + 1}`} 
//                           value={opt.text} 
//                           onChange={(e) => updateOptionText(idx, e.target.value)} 
//                         />
//                       </HStack>
//                     ))}
//                   </VStack>
//                 </Box>

//                 <Button leftIcon={<MdAdd />} colorScheme="orange" variant="solid" onClick={addQuestionToTest}>
//                   Add Question to List
//                 </Button>

//                 <Divider />
//                 <Box maxH="180px" overflowY="auto" border="1px dashed" borderColor="gray.200" borderRadius="md" p="2">
//                   {formData.questions.length === 0 && <Text textAlign="center" color="gray.400" py="4">No questions added yet</Text>}
//                   {formData.questions.map((q, i) => (
//                     <HStack key={i} justify="space-between" bg="gray.50" p="2" mb="2" borderRadius="md">
//                       <VStack align="start" spacing={0}>
//                         <Text fontSize="xs" fontWeight="bold">Q{i+1}. {q.questionText || 'Image Q'}</Text>
//                         <Text fontSize="10px" color="green.600">Correct: Index {q.correctAnswer}</Text>
//                       </VStack>
//                       <IconButton size="xs" colorScheme="red" variant="ghost" icon={<MdDelete />} onClick={() => removeQuestion(i)} />
//                     </HStack>
//                   ))}
//                 </Box>
//               </VStack>

//             </SimpleGrid>
//           </ModalBody>
//         </ModalContent>
//       </Modal>
//     </Box>
//   );
// }
// 'use client';

// import React, { useState, useEffect } from 'react';
// import {
//   Box, Flex, Text, useColorModeValue, Button, IconButton, Select, 
//   SimpleGrid, VStack, HStack, Badge, Divider, Icon, useToast, 
//   Spinner, Center, Modal, ModalOverlay, ModalContent, ModalHeader, 
//   ModalBody, ModalCloseButton, useDisclosure,
//   Input, FormControl, FormLabel, Textarea, Tooltip
// } from '@chakra-ui/react';
// import { 
//   MdAdd, MdDelete, MdTimer, MdCheckCircle, 
//   MdOutlineRadioButtonUnchecked, MdMenuBook, MdEdit, MdArrowBack 
// } from 'react-icons/md';
// import axios from 'axios';
// import Card from 'components/card/Card';

// export default function TestManagement() {
//   const textColor = useColorModeValue('secondaryGray.900', 'white');
//   const brandColor = useColorModeValue('brand.500', 'brand.400');
//   const cardBg = useColorModeValue('white', 'navy.800');
//   const sectionBg = useColorModeValue('gray.50', 'navy.900');

//   const { isOpen, onOpen, onClose } = useDisclosure();
//   const toast = useToast();

//   const [tests, setTests] = useState([]);
//   const [courses, setCourses] = useState([]);
//   const [subjects, setSubjects] = useState([]);
//   const [chapters, setChapters] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [btnLoading, setBtnLoading] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editId, setEditId] = useState(null);

//   const [formData, setFormData] = useState({
//     courseId: '', subjectId: '', chapterId: '',
//     testTitle: '', month: 'January', academicYear: '2025-2026',
//     endDate: '', questions: []
//   });

//   const [currentQuestion, setCurrentQuestion] = useState({
//     questionText: '', questionImage: '', correctAnswer: 0,
//     options: [
//       { text: '', isCorrect: true }, { text: '', isCorrect: false },
//       { text: '', isCorrect: false }, { text: '', isCorrect: false }
//     ]
//   });

//   const baseUrl = process.env.REACT_APP_BASE_URL;
//   const token = localStorage.getItem('token');
//   const headers = { Authorization: `Bearer ${token}` };

//   const fetchInitialData = async () => {
//     try {
//       setLoading(true);
//       const [testsRes, coursesRes] = await Promise.all([
//         axios.get(`${baseUrl}api/admin/tests`, { headers }),
//         axios.get(`${baseUrl}api/admin/courses`, { headers })
//       ]);
//       setTests(testsRes.data.data || []);
//       setCourses(coursesRes.data.data || []);
//     } catch (err) { toast({ title: "Error fetching data", status: "error" });
//     } finally { setLoading(false); }
//   };

//   useEffect(() => { fetchInitialData(); }, []);

//   // --- MONTH GROUPING LOGIC ---
//   const groupedByMonth = tests.reduce((acc, test) => {
//     const month = test.month || 'Other';
//     if (!acc[month]) acc[month] = [];
//     acc[month].push(test);
//     return acc;
//   }, {});

//   const monthsList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

//   // --- CRUD FUNCTIONS ---
//   const handleDelete = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this test?")) return;
//     try {
//       await axios.delete(`${baseUrl}api/admin/tests/${id}`, { headers });
//       toast({ title: "Test Deleted", status: "success" });
//       fetchInitialData();
//     } catch (err) { toast({ title: "Delete Failed", status: "error" }); }
//   };

//   const handleEdit = (test) => {
//     setFormData({
//       courseId: test.courseId?._id || '',
//       subjectId: test.subjectId?._id || '',
//       chapterId: test.chapterId?._id || '',
//       testTitle: test.testTitle,
//       month: test.month || 'January',
//       academicYear: test.academicYear,
//       endDate: test.endDate?.split('T')[0],
//       questions: test.questions
//     });
//     setEditId(test._id);
//     setIsEditing(true);
//     onOpen();
//   };

//   // --- EXISTING LOGIC (RETAINED) ---
//   const handleCourseChange = async (id) => {
//     setFormData({ ...formData, courseId: id, subjectId: '', chapterId: '' });
//     try {
//       const res = await axios.get(`${baseUrl}api/admin/subjects?courseId=${id}`, { headers });
//       setSubjects(res.data.data || []);
//     } catch (err) { console.error(err); }
//   };

//   const handleSubjectChange = async (id) => {
//     setFormData({ ...formData, subjectId: id, chapterId: '' });
//     try {
//       const res = await axios.get(`${baseUrl}api/admin/chapters?subjectId=${id}`, { headers });
//       setChapters(res.data.data || []);
//     } catch (err) { console.error(err); }
//   };

//   const setCorrectOption = (index) => {
//     const updatedOptions = currentQuestion.options.map((opt, i) => ({ ...opt, isCorrect: i === index }));
//     setCurrentQuestion({ ...currentQuestion, options: updatedOptions, correctAnswer: index });
//   };

//   const addQuestionToTest = () => {
//     if (!currentQuestion.questionText) return toast({ title: "Text required", status: "warning" });
//     setFormData({ ...formData, questions: [...formData.questions, { ...currentQuestion }] });
//     setCurrentQuestion({
//       questionText: '', questionImage: '', correctAnswer: 0,
//       options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false }]
//     });
//   };

//   const handleSubmit = async () => {
//     setBtnLoading(true);
//     try {
//       const url = isEditing ? `${baseUrl}api/admin/tests/${editId}` : `${baseUrl}api/admin/tests`;
//       const method = isEditing ? 'put' : 'post';
//       await axios[method](url, { ...formData, duration: formData.questions.length }, { headers });
//       toast({ title: isEditing ? "Updated" : "Created", status: "success" });
//       onClose();
//       fetchInitialData();
//     } catch (err) { toast({ title: "Failed", status: "error" });
//     } finally { setBtnLoading(false); }
//   };

//   if (loading) return <Center h="50vh"><Spinner size="xl" color="brand.500" /></Center>;

//   return (
//     <Box pt={{ base: '130px', md: '80px' }} px="20px">
//       <Flex justify="space-between" align="center" mb="30px">
//         <Text color={textColor} fontSize="28px" fontWeight="700">Test Management</Text>
//         <Button leftIcon={<MdAdd />} colorScheme="brand" onClick={() => { setIsEditing(false); onOpen(); }}>Create New Test</Button>
//       </Flex>

//       {/* MONTH WISE SECTIONS */}
//       {monthsList.map(month => groupedByMonth[month] && (
//         <Box key={month} mb="40px">
//           <HStack mb="20px">
//             <Badge colorScheme="brand" p="2" borderRadius="md" fontSize="md">{month}</Badge>
//             <Divider />
//           </HStack>
//           <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
//             {groupedByMonth[month].map(test => (
//               <Card key={test._id} p="20px">
//                 <Flex justify="space-between" align="start">
//                   <VStack align="stretch" spacing={2}>
//                     <Badge colorScheme="purple" w="fit-content">{test.courseId?.name}</Badge>
//                     <Text fontWeight="bold" fontSize="lg">{test.testTitle}</Text>
//                     <Text fontSize="xs" color="gray.500">{test.subjectId?.name} | {test.questions.length} Qns</Text>
//                   </VStack>
//                   <HStack>
//                     <IconButton size="sm" icon={<MdEdit />} colorScheme="blue" variant="ghost" onClick={() => handleEdit(test)} />
//                     <IconButton size="sm" icon={<MdDelete />} colorScheme="red" variant="ghost" onClick={() => handleDelete(test._id)} />
//                   </HStack>
//                 </Flex>
//               </Card>
//             ))}
//           </SimpleGrid>
//         </Box>
//       ))}

//       {/* CENTERED POPUP MODAL */}
//       <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered scrollBehavior="inside">
//         <ModalOverlay backdropFilter='blur(4px)' />
//         <ModalContent borderRadius="25px" maxH="90vh">
//           <ModalHeader borderBottom="1px solid" borderColor="gray.100">
//              <HStack>
//                 <IconButton icon={<MdArrowBack />} variant="ghost" onClick={onClose} aria-label="back" />
//                 <Text>{isEditing ? "Update Test" : "Create New Test"}</Text>
//              </HStack>
//           </ModalHeader>
//           <ModalCloseButton />
//           <ModalBody p="6">
//             <VStack spacing={6}>
//               <FormControl isRequired>
//                 <FormLabel>Select Month</FormLabel>
//                 <Select value={formData.month} onChange={(e) => setFormData({ ...formData, month: e.target.value })}>
//                   {monthsList.map(m => <option key={m} value={m}>{m}</option>)}
//                 </Select>
//               </FormControl>

//               <SimpleGrid columns={2} w="full" spacing={4}>
//                 <FormControl isRequired><FormLabel>Course</FormLabel>
//                   <Select placeholder="Course" value={formData.courseId} onChange={(e) => handleCourseChange(e.target.value)}>
//                     {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
//                   </Select>
//                 </FormControl>
//                 <FormControl isRequired><FormLabel>Test Title</FormLabel>
//                   <Input value={formData.testTitle} onChange={(e) => setFormData({ ...formData, testTitle: e.target.value })} />
//                 </FormControl>
//               </SimpleGrid>

//               {/* Question Section */}
//               <Box w="full" p="4" bg="gray.50" borderRadius="xl">
//                 <Text fontWeight="bold" mb="4">Add Question</Text>
//                 <Textarea value={currentQuestion.questionText} onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionText: e.target.value })} mb="4" placeholder="Question text..." />
//                 {currentQuestion.options.map((opt, idx) => (
//                   <HStack key={idx} mb="2">
//                     <IconButton icon={opt.isCorrect ? <MdCheckCircle /> : <MdOutlineRadioButtonUnchecked />} 
//                       colorScheme={opt.isCorrect ? "green" : "gray"} onClick={() => setCorrectOption(idx)} />
//                     <Input placeholder={`Option ${idx + 1}`} value={opt.text} onChange={(e) => {
//                       const newOpts = [...currentQuestion.options];
//                       newOpts[idx].text = e.target.value;
//                       setCurrentQuestion({ ...currentQuestion, options: newOpts });
//                     }} />
//                   </HStack>
//                 ))}
//                 <Button mt="4" w="full" leftIcon={<MdAdd />} onClick={addQuestionToTest}>Add to List</Button>
//               </Box>

//               <Button w="full" colorScheme="brand" h="50px" isLoading={btnLoading} onClick={handleSubmit}>
//                 {isEditing ? "Update Test Now" : "Publish Test Now"}
//               </Button>
//             </VStack>
//           </ModalBody>
//         </ModalContent>
//       </Modal>
//     </Box>
//   );
// }
// 'use client';

// import React, { useState, useEffect } from 'react';
// import {
//   Box, Flex, Text, useColorModeValue, Button, IconButton, Select, 
//   SimpleGrid, VStack, HStack, Badge, Divider, Icon, useToast, 
//   Spinner, Center, Modal, ModalOverlay, ModalContent, ModalHeader, 
//   ModalBody, ModalCloseButton, useDisclosure,
//   Input, FormControl, FormLabel, Textarea
// } from '@chakra-ui/react';
// import { 
//   MdAdd, MdDelete, MdTimer, MdCheckCircle, 
//   MdOutlineRadioButtonUnchecked, MdMenuBook, MdEdit, MdArrowBack 
// } from 'react-icons/md';
// import axios from 'axios';
// import Card from 'components/card/Card';

// export default function TestManagement() {
//   const textColor = useColorModeValue('secondaryGray.900', 'white');
//   const brandColor = useColorModeValue('brand.500', 'brand.400');
//   const cardBg = useColorModeValue('white', 'navy.800');
//   const sectionBg = useColorModeValue('gray.50', 'navy.900');

//   const { isOpen, onOpen, onClose } = useDisclosure();
//   const toast = useToast();

//   const [tests, setTests] = useState([]);
//   const [courses, setCourses] = useState([]);
//   const [subjects, setSubjects] = useState([]);
//   const [chapters, setChapters] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [btnLoading, setBtnLoading] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editId, setEditId] = useState(null);

//   const [formData, setFormData] = useState({
//     courseId: '', subjectId: '', chapterId: '',
//     testTitle: '', month: 'January', academicYear: '2025-2026',
//     endDate: '', questions: []
//   });

//   const [currentQuestion, setCurrentQuestion] = useState({
//     questionText: '', questionImage: '', correctAnswer: 0,
//     options: [
//       { text: '', isCorrect: true }, { text: '', isCorrect: false },
//       { text: '', isCorrect: false }, { text: '', isCorrect: false }
//     ]
//   });

//   const baseUrl = process.env.REACT_APP_BASE_URL;
//   const token = localStorage.getItem('token');
//   const headers = { Authorization: `Bearer ${token}` };

//   const fetchInitialData = async () => {
//     try {
//       setLoading(true);
//       const [testsRes, coursesRes] = await Promise.all([
//         axios.get(`${baseUrl}api/admin/tests`, { headers }),
//         axios.get(`${baseUrl}api/admin/courses`, { headers })
//       ]);
//       setTests(testsRes.data.data || []);
//       setCourses(coursesRes.data.data || []);
//     } catch (err) { toast({ title: "Error fetching data", status: "error" });
//     } finally { setLoading(false); }
//   };

//   useEffect(() => { fetchInitialData(); }, []);

//   const monthsList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

//   const groupedByMonth = tests.reduce((acc, test) => {
//     const month = test.month || 'Other';
//     if (!acc[month]) acc[month] = [];
//     acc[month].push(test);
//     return acc;
//   }, {});

//   const handleEdit = (test) => {
//     setFormData({
//       courseId: test.courseId?._id || '',
//       subjectId: test.subjectId?._id || '',
//       chapterId: test.chapterId?._id || '',
//       testTitle: test.testTitle,
//       month: test.month || 'January',
//       academicYear: test.academicYear || '2025-2026',
//       endDate: test.endDate?.split('T')[0],
//       questions: test.questions || []
//     });
//     setEditId(test._id);
//     setIsEditing(true);
//     onOpen();
//     if(test.courseId?._id) handleCourseChange(test.courseId._id);
//   };

//   // --- QUESTION EDIT LOGIC (NEW) ---
//   const loadQuestionToEdit = (q, index) => {
//     setCurrentQuestion({ ...q });
//     // Purana version remove kar dete hain taaki edit ke baad naya add ho
//     const filtered = formData.questions.filter((_, i) => i !== index);
//     setFormData({ ...formData, questions: filtered });
//     toast({ title: "Question loaded for editing", status: "info", duration: 2000 });
//   };

//   const handleCourseChange = async (id) => {
//     setFormData(prev => ({ ...prev, courseId: id, subjectId: '', chapterId: '' }));
//     try {
//       const res = await axios.get(`${baseUrl}api/admin/subjects?courseId=${id}`, { headers });
//       setSubjects(res.data.data || []);
//     } catch (err) { console.error(err); }
//   };

//   const handleSubjectChange = async (id) => {
//     setFormData(prev => ({ ...prev, subjectId: id, chapterId: '' }));
//     try {
//       const res = await axios.get(`${baseUrl}api/admin/chapters?subjectId=${id}`, { headers });
//       setChapters(res.data.data || []);
//     } catch (err) { console.error(err); }
//   };

//   const setCorrectOption = (index) => {
//     const updatedOptions = currentQuestion.options.map((opt, i) => ({ ...opt, isCorrect: i === index }));
//     setCurrentQuestion({ ...currentQuestion, options: updatedOptions, correctAnswer: index });
//   };

//   const addQuestionToTest = () => {
//     if (!currentQuestion.questionText && !currentQuestion.questionImage) return toast({ title: "Add content", status: "warning" });
//     setFormData({ ...formData, questions: [...formData.questions, { ...currentQuestion }] });
//     setCurrentQuestion({
//       questionText: '', questionImage: '', correctAnswer: 0,
//       options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false }]
//     });
//   };

//   const removeQuestion = (index) => {
//     const filtered = formData.questions.filter((_, i) => i !== index);
//     setFormData({ ...formData, questions: filtered });
//   };

//   const handleSubmit = async () => {
//     setBtnLoading(true);
//     try {
//       // Time automatic questions ke count ke barabar (1 min per question) ya backend handle karega
//       const payload = { ...formData, duration: formData.questions.length }; 
//       const url = isEditing ? `${baseUrl}api/admin/tests/${editId}` : `${baseUrl}api/admin/tests`;
//       await axios[isEditing ? 'put' : 'post'](url, payload, { headers });
//       toast({ title: "Success", status: "success" });
//       onClose();
//       fetchInitialData();
//     } catch (err) { toast({ title: "Failed", status: "error" });
//     } finally { setBtnLoading(false); }
//   };

//   return (
//     <Box pt={{ base: '130px', md: '80px' }} px="20px">
//       <Flex justify="space-between" align="center" mb="30px">
//         <Text color={textColor} fontSize="28px" fontWeight="700">Test Management</Text>
//         <Button leftIcon={<MdAdd />} colorScheme="brand" onClick={() => { setIsEditing(false); setFormData({ ...formData, questions: [] }); onOpen(); }}>Create New Test</Button>
//       </Flex>

//       {monthsList.map(month => groupedByMonth[month] && (
//         <Box key={month} mb="40px">
//           <HStack mb="20px"><Badge colorScheme="brand" p="2" px="4" borderRadius="full">{month}</Badge><Divider /></HStack>
//           <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
//             {groupedByMonth[month].map(test => (
//               <Card key={test._id} p="20px">
//                 <Flex justify="space-between">
//                   <VStack align="start" spacing={1}>
//                     <Badge colorScheme="purple">{test.courseId?.name}</Badge>
//                     <Text fontWeight="bold">{test.testTitle}</Text>
//                     <HStack fontSize="xs" color="gray.500">
//                       <Icon as={MdTimer} /> <Text>{test.duration} Min</Text>
//                       <Icon as={MdMenuBook} /> <Text>{test.questions.length} Qns</Text>
//                     </HStack>
//                   </VStack>
//                   <HStack>
//                     <IconButton size="sm" icon={<MdEdit />} onClick={() => handleEdit(test)} variant="ghost" colorScheme="blue" />
//                     <IconButton size="sm" icon={<MdDelete />} onClick={() => { if(window.confirm("Delete?")) axios.delete(`${baseUrl}api/admin/tests/${test._id}`, {headers}).then(fetchInitialData)}} variant="ghost" colorScheme="red" />
//                   </HStack>
//                 </Flex>
//               </Card>
//             ))}
//           </SimpleGrid>
//         </Box>
//       ))}

//       <Modal isOpen={isOpen} onClose={onClose} size="2xl" isCentered scrollBehavior="inside">
//         <ModalOverlay backdropFilter='blur(4px)' />
//         <ModalContent borderRadius="20px">
//           <ModalHeader borderBottom="1px solid" borderColor="gray.100">
//             <HStack><IconButton icon={<MdArrowBack />} variant="ghost" onClick={onClose} /><Text>{isEditing ? "Edit Test" : "New Test"}</Text></HStack>
//           </ModalHeader>
//           <ModalCloseButton />
//           <ModalBody p="6">
//             <VStack spacing={4}>
//               <SimpleGrid columns={2} w="full" spacing={4}>
//                 <FormControl isRequired><FormLabel>Month</FormLabel>
//                   <Select value={formData.month} onChange={(e)=>setFormData({...formData, month: e.target.value})}>
//                     {monthsList.map(m => <option key={m} value={m}>{m}</option>)}
//                   </Select>
//                 </FormControl>
//                 <FormControl isRequired><FormLabel>Academic Year</FormLabel>
//                   <Input placeholder="e.g. 2025-2026" value={formData.academicYear} onChange={(e)=>setFormData({...formData, academicYear: e.target.value})} />
//                 </FormControl>
//               </SimpleGrid>

//               <SimpleGrid columns={2} w="full" spacing={4}>
//                 <FormControl isRequired><FormLabel>Course</FormLabel>
//                   <Select value={formData.courseId} onChange={(e)=>handleCourseChange(e.target.value)}>
//                     <option value="">Select</option>
//                     {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
//                   </Select>
//                 </FormControl>
//                 <FormControl isRequired><FormLabel>Test Title</FormLabel>
//                   <Input value={formData.testTitle} onChange={(e)=>setFormData({...formData, testTitle: e.target.value})} />
//                 </FormControl>
//               </SimpleGrid>

//               <FormControl isRequired><FormLabel>End Date</FormLabel>
//                 <Input type="date" value={formData.endDate} onChange={(e)=>setFormData({...formData, endDate: e.target.value})} />
//               </FormControl>

//               <Box w="full" p="4" bg="gray.50" borderRadius="lg" border="1px solid" borderColor="gray.200">
//                 <Text fontWeight="bold" mb="2">Question Builder</Text>
//                 <Textarea placeholder="Question Text" value={currentQuestion.questionText} onChange={(e)=>setCurrentQuestion({...currentQuestion, questionText: e.target.value})} mb="2" size="sm" />
//                 <VStack align="stretch" spacing={2}>
//                   {currentQuestion.options.map((opt, idx) => (
//                     <HStack key={idx}>
//                       <IconButton size="sm" icon={opt.isCorrect ? <MdCheckCircle /> : <MdOutlineRadioButtonUnchecked />} 
//                         colorScheme={opt.isCorrect ? "green" : "gray"} onClick={() => setCorrectOption(idx)} />
//                       <Input size="sm" placeholder={`Option ${idx+1}`} value={opt.text} onChange={(e)=>{
//                         const newOpts = [...currentQuestion.options]; newOpts[idx].text = e.target.value;
//                         setCurrentQuestion({...currentQuestion, options: newOpts});
//                       }} />
//                     </HStack>
//                   ))}
//                 </VStack>
//                 <Button mt="3" size="sm" w="full" colorScheme="brand" onClick={addQuestionToTest}>Save Question to List</Button>
//               </Box>

//               <Box w="full">
//                 <Text fontWeight="bold" fontSize="sm" mb="2">Questions in this Test (Click to Edit):</Text>
//                 <VStack align="stretch" maxH="200px" overflowY="auto" spacing={2}>
//                   {formData.questions.map((q, i) => (
//                     <HStack key={i} bg="white" p="2" borderRadius="md" border="1px solid" borderColor="gray.100" justify="space-between" cursor="pointer" onClick={() => loadQuestionToEdit(q, i)}>
//                       <HStack><Badge colorScheme="gray">{i+1}</Badge><Text fontSize="xs" noOfLines={1}>{q.questionText}</Text></HStack>
//                       <IconButton size="xs" icon={<MdDelete />} colorScheme="red" variant="ghost" onClick={(e) => { e.stopPropagation(); removeQuestion(i); }} />
//                     </HStack>
//                   ))}
//                 </VStack>
//               </Box>

//               <Button w="full" colorScheme="orange" h="50px" isLoading={btnLoading} onClick={handleSubmit}>
//                 {isEditing ? "Update Complete Test" : "Publish Test"}
//               </Button>
//             </VStack>
//           </ModalBody>
//         </ModalContent>
//       </Modal>
//     </Box>
//   );
// }
'use client';

import React, { useState, useEffect } from 'react';
import {
  Box, Flex, Text, useColorModeValue, Button, IconButton, Select, 
  SimpleGrid, VStack, HStack, Badge, Divider, Icon, useToast, 
  Spinner, Center, Modal, ModalOverlay, ModalContent, ModalHeader, 
  ModalBody, ModalCloseButton, useDisclosure,
  Input, FormControl, FormLabel, Textarea, Image
} from '@chakra-ui/react';
import { 
  MdAdd, MdDelete, MdTimer, MdCheckCircle, 
  MdOutlineRadioButtonUnchecked, MdMenuBook, MdEdit, MdArrowBack, MdCloudUpload 
} from 'react-icons/md';
import axios from 'axios';
import Card from 'components/card/Card';

export default function TestManagement() {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const [tests, setTests] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    courseId: '', subjectId: '', chapterId: '',
    testTitle: '', month: 'January', academicYear: '2025-2026',
    endDate: '', questions: []
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: '', questionImage: '', correctAnswer: 0,
    options: [
      { text: '', isCorrect: true, optionImage: '' }, 
      { text: '', isCorrect: false, optionImage: '' },
      { text: '', isCorrect: false, optionImage: '' }, 
      { text: '', isCorrect: false, optionImage: '' }
    ]
  });

  const baseUrl = process.env.REACT_APP_BASE_URL;
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  // --- NEW: IMAGE UPLOAD LOGIC ---
  const handleImageUpload = async (e, type, optIdx = null) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('image', file);

    try {
      const res = await axios.post(`${baseUrl}api/admin/tests/upload-image`, data, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' }
      });

      const imageUrl = res.data.url;

      if (type === 'question') {
        setCurrentQuestion(prev => ({ ...prev, questionImage: imageUrl }));
      } else {
        const newOpts = [...currentQuestion.options];
        newOpts[optIdx].optionImage = imageUrl;
        setCurrentQuestion(prev => ({ ...prev, options: newOpts }));
      }
      toast({ title: "Image Uploaded", status: "success", duration: 2000 });
    } catch (err) {
      toast({ title: "Upload Failed", status: "error" });
    }
  };

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [testsRes, coursesRes] = await Promise.all([
        axios.get(`${baseUrl}api/admin/tests`, { headers }),
        axios.get(`${baseUrl}api/admin/courses`, { headers })
      ]);
      setTests(testsRes.data.data || []);
      setCourses(coursesRes.data.data || []);
    } catch (err) { toast({ title: "Error fetching data", status: "error" });
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchInitialData(); }, []);

  const handleCourseChange = async (id) => {
    setFormData(prev => ({ ...prev, courseId: id, subjectId: '', chapterId: '' }));
    if (!id) return;
    try {
      const res = await axios.get(`${baseUrl}api/admin/subjects?courseId=${id}`, { headers });
      setSubjects(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const handleSubjectChange = async (id) => {
    setFormData(prev => ({ ...prev, subjectId: id, chapterId: '' }));
    if (!id) return;
    try {
      const res = await axios.get(`${baseUrl}api/admin/chapters?subjectId=${id}`, { headers });
      setChapters(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const monthsList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const groupedByMonth = tests.reduce((acc, test) => {
    const month = test.month || 'Other';
    if (!acc[month]) acc[month] = [];
    acc[month].push(test);
    return acc;
  }, {});

  const handleEdit = (test) => {
    setFormData({
      courseId: test.courseId?._id || '',
      subjectId: test.subjectId?._id || '',
      chapterId: test.chapterId?._id || '',
      testTitle: test.testTitle,
      month: test.month || 'January',
      academicYear: test.academicYear || '2025-2026',
      endDate: test.endDate?.split('T')[0],
      questions: test.questions || []
    });
    setEditId(test._id);
    setIsEditing(true);
    onOpen();
    if(test.courseId?._id) handleCourseChange(test.courseId._id);
    if(test.subjectId?._id) handleSubjectChange(test.subjectId._id);
  };

  const loadQuestionToEdit = (q, index) => {
    setCurrentQuestion({ ...q });
    const filtered = formData.questions.filter((_, i) => i !== index);
    setFormData({ ...formData, questions: filtered });
  };

  const setCorrectOption = (index) => {
    const updatedOptions = currentQuestion.options.map((opt, i) => ({ ...opt, isCorrect: i === index }));
    setCurrentQuestion({ ...currentQuestion, options: updatedOptions, correctAnswer: index });
  };

  const addQuestionToTest = () => {
    if (!currentQuestion.questionText && !currentQuestion.questionImage) return toast({ title: "Add text or image", status: "warning" });
    setFormData({ ...formData, questions: [...formData.questions, { ...currentQuestion }] });
    setCurrentQuestion({
      questionText: '', questionImage: '', correctAnswer: 0,
      options: [
        { text: '', isCorrect: true, optionImage: '' }, 
        { text: '', isCorrect: false, optionImage: '' }, 
        { text: '', isCorrect: false, optionImage: '' }, 
        { text: '', isCorrect: false, optionImage: '' }
      ]
    });
  };

  const handleSubmit = async () => {
    if (!formData.courseId || !formData.testTitle) return toast({ title: "Course and Title required", status: "error" });
    setBtnLoading(true);
    try {
      const payload = { ...formData, duration: formData.questions.length }; 
      const url = isEditing ? `${baseUrl}api/admin/tests/${editId}` : `${baseUrl}api/admin/tests`;
      await axios[isEditing ? 'put' : 'post'](url, payload, { headers });
      toast({ title: "Success", status: "success" });
      onClose();
      fetchInitialData();
    } catch (err) { toast({ title: "Failed", status: "error" });
    } finally { setBtnLoading(false); }
  };

  return (
    <Box pt={{ base: '130px', md: '80px' }} px="20px">
      <Flex justify="space-between" align="center" mb="30px">
        <Text color={textColor} fontSize="28px" fontWeight="700">Test Management</Text>
        <Button leftIcon={<MdAdd />} colorScheme="brand" onClick={() => { setIsEditing(false); setFormData({ courseId: '', subjectId: '', chapterId: '', testTitle: '', month: 'January', academicYear: '2025-2026', endDate: '', questions: [] }); onOpen(); }}>Create New Test</Button>
      </Flex>

      {loading ? <Center><Spinner /></Center> : monthsList.map(month => groupedByMonth[month] && (
        <Box key={month} mb="40px">
          <HStack mb="20px"><Badge colorScheme="brand" p="2" px="4" borderRadius="full">{month}</Badge><Divider /></HStack>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            {groupedByMonth[month].map(test => (
              <Card key={test._id} p="20px">
                <Flex justify="space-between">
                  <VStack align="start" spacing={1}>
                    <Badge colorScheme="purple">{test.courseId?.name || "Test"}</Badge>
                    <Text fontWeight="bold" noOfLines={1}>{test.testTitle}</Text>
                    <HStack fontSize="xs" color="gray.500">
                      <Icon as={MdTimer} /> <Text>{test.duration} Min</Text>
                      <Icon as={MdMenuBook} /> <Text>{test.questions.length} Qns</Text>
                    </HStack>
                  </VStack>
                  <HStack>
                    <IconButton size="sm" icon={<MdEdit />} onClick={() => handleEdit(test)} variant="ghost" colorScheme="blue" />
                    <IconButton size="sm" icon={<MdDelete />} onClick={() => { if(window.confirm("Delete?")) axios.delete(`${baseUrl}api/admin/tests/${test._id}`, {headers}).then(fetchInitialData)}} variant="ghost" colorScheme="red" />
                  </HStack>
                </Flex>
              </Card>
            ))}
          </SimpleGrid>
        </Box>
      ))}

      <Modal isOpen={isOpen} onClose={onClose} size="2xl" isCentered scrollBehavior="inside">
        <ModalOverlay backdropFilter='blur(4px)' />
        <ModalContent borderRadius="20px">
          <ModalHeader borderBottom="1px solid" borderColor="gray.100">
            <HStack><IconButton icon={<MdArrowBack />} variant="ghost" onClick={onClose} /><Text>{isEditing ? "Edit Test" : "New Test"}</Text></HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody p="6">
            <VStack spacing={4}>
              <SimpleGrid columns={2} w="full" spacing={4}>
                <FormControl isRequired><FormLabel>Month</FormLabel>
                  <Select value={formData.month} onChange={(e)=>setFormData({...formData, month: e.target.value})}>
                    {monthsList.map(m => <option key={m} value={m}>{m}</option>)}
                  </Select>
                </FormControl>
                <FormControl isRequired><FormLabel>Academic Year</FormLabel>
                  <Input placeholder="e.g. 2025-2026" value={formData.academicYear} onChange={(e)=>setFormData({...formData, academicYear: e.target.value})} />
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={2} w="full" spacing={4}>
                <FormControl isRequired><FormLabel>Course</FormLabel>
                  <Select value={formData.courseId} onChange={(e)=>handleCourseChange(e.target.value)}>
                    <option value="">Select Course</option>
                    {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </Select>
                </FormControl>
                <FormControl isRequired><FormLabel>Test Title</FormLabel>
                  <Input value={formData.testTitle} onChange={(e)=>setFormData({...formData, testTitle: e.target.value})} />
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={2} w="full" spacing={4}>
                <FormControl><FormLabel>Subject</FormLabel>
                  <Select value={formData.subjectId} onChange={(e)=>handleSubjectChange(e.target.value)}>
                    <option value="">Select Subject</option>
                    {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </Select>
                </FormControl>
                <FormControl><FormLabel>Chapter</FormLabel>
                  <Select value={formData.chapterId} onChange={(e)=>setFormData({...formData, chapterId: e.target.value})}>
                    <option value="">Select Chapter</option>
                    {chapters.map(ch => <option key={ch._id} value={ch._id}>{ch.name}</option>)}
                  </Select>
                </FormControl>
              </SimpleGrid>

              <FormControl isRequired><FormLabel>End Date</FormLabel>
                <Input type="date" value={formData.endDate} onChange={(e)=>setFormData({...formData, endDate: e.target.value})} />
              </FormControl>

              {/* QUESTION BUILDER WITH IMAGES */}
              <Box w="full" p="4" bg="gray.50" borderRadius="lg" border="1px solid" borderColor="gray.200">
                <Text fontWeight="bold" mb="2">Question Builder</Text>
                <Textarea placeholder="Question Text" value={currentQuestion.questionText} onChange={(e)=>setCurrentQuestion({...currentQuestion, questionText: e.target.value})} mb="2" size="sm" bg="white" />
                
                <HStack mb="4">
                    <FormControl>
                        <FormLabel fontSize="xs">Question Image</FormLabel>
                        <Input type="file" size="sm" p="1" onChange={(e) => handleImageUpload(e, 'question')} />
                    </FormControl>
                    {currentQuestion.questionImage && <Image src={`${baseUrl}${currentQuestion.questionImage}`} boxSize="50px" objectFit="cover" borderRadius="md" />}
                </HStack>

                <VStack align="stretch" spacing={3}>
                  {currentQuestion.options.map((opt, idx) => (
                    <Box key={idx} p="2" bg="white" borderRadius="md" border="1px solid" borderColor="gray.100">
                      <HStack mb="1">
                        <IconButton size="sm" icon={opt.isCorrect ? <MdCheckCircle /> : <MdOutlineRadioButtonUnchecked />} 
                          colorScheme={opt.isCorrect ? "green" : "gray"} onClick={() => setCorrectOption(idx)} />
                        <Input size="sm" placeholder={`Option ${idx+1} Text`} value={opt.text} onChange={(e)=>{
                          const newOpts = [...currentQuestion.options]; newOpts[idx].text = e.target.value;
                          setCurrentQuestion({...currentQuestion, options: newOpts});
                        }} />
                      </HStack>
                      <HStack pl="10">
                         <Input type="file" size="xs" border="none" onChange={(e) => handleImageUpload(e, 'option', idx)} />
                         {opt.optionImage && <Image src={`${baseUrl}${opt.optionImage}`} boxSize="30px" borderRadius="md" />}
                      </HStack>
                    </Box>
                  ))}
                </VStack>
                <Button mt="3" size="sm" w="full" colorScheme="brand" onClick={addQuestionToTest}>Save Question to List</Button>
              </Box>

              <Box w="full">
                <Text fontWeight="bold" fontSize="sm" mb="2">Questions in this Test ({formData.questions.length}):</Text>
                <VStack align="stretch" maxH="150px" overflowY="auto" spacing={2}>
                  {formData.questions.map((q, i) => (
                    <HStack key={i} bg="white" p="2" borderRadius="md" border="1px solid" borderColor="gray.100" justify="space-between" cursor="pointer" onClick={() => loadQuestionToEdit(q, i)}>
                      <HStack><Badge colorScheme="brand">{i+1}</Badge><Text fontSize="xs" noOfLines={1}>{q.questionText || "Image Question"}</Text></HStack>
                      <IconButton size="xs" icon={<MdDelete />} colorScheme="red" variant="ghost" onClick={(e) => { e.stopPropagation(); setFormData({...formData, questions: formData.questions.filter((_, idx) => idx !== i)}) }} />
                    </HStack>
                  ))}
                </VStack>
              </Box>

              <Button w="full" colorScheme="orange" h="50px" isLoading={btnLoading} onClick={handleSubmit}>
                {isEditing ? "Update Complete Test" : "Publish Test"}
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}