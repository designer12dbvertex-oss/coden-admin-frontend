// //

// 'use client';

// import React, { useState, useEffect } from 'react';
// import {
//   Box,
//   Flex,
//   Text,
//   useColorModeValue,
//   Button,
//   Input,
//   FormControl,
//   FormLabel,
//   useToast,
//   IconButton,
//   Select,
//   Badge,
//   Textarea,
//   SimpleGrid,
//   VStack,
//   Image,
//   HStack,
//   InputGroup,
//   InputLeftElement,
//   Accordion,
//   AccordionItem,
//   AccordionButton,
//   AccordionPanel,
//   AccordionIcon,
//   Grid,
//   GridItem,
//   Icon,
// } from '@chakra-ui/react';
// import {
//   MdDelete,
//   MdSearch,
//   MdCloudUpload,
//   MdImage,
//   MdCheckCircle,
//   MdHelpOutline,
//   MdLayers,
//   MdEqualizer,
//   MdAddCircle,
//   MdOutlineQuiz,
// } from 'react-icons/md';
// import axios from 'axios';
// import Card from 'components/card/Card'; // adjust path if needed
// import ReactQuill from 'react-quill-new';
// import 'react-quill-new/dist/quill.snow.css';
// import { useLocation, useNavigate, useParams } from 'react-router-dom';

// const quillModules = {
//   toolbar: [
//     [{ header: [1, 2, 3, false] }],
//     ['bold', 'italic', 'underline'],
//     [{ list: 'ordered' }, { list: 'bullet' }],
//     ['link'],
//     [{ align: [] }],
//     ['clean'],
//   ],
// };

// const quillFormats = [
//   'header',
//   'bold',
//   'italic',
//   'underline',
//   'list',
//   'bullet',
//   'link',
//   'align',
// ];

// function normaliseMcqList(res) {
//   const raw = res?.data?.data ?? res?.data ?? [];
//   if (res?.data?.format === 'test-wise-grouped' && Array.isArray(raw))
//     return raw.flatMap((g) => g.mcqList || []);
//   return Array.isArray(raw) ? raw : [];
// }

// export default function MCQManagement() {
//   const textColor = useColorModeValue('secondaryGray.900', 'white');
//   const secondaryColor = useColorModeValue('gray.600', 'gray.400');
//   const listBg = useColorModeValue('white', 'navy.800');
//   const optionBorderColor = useColorModeValue('gray.200', 'whiteAlpha.300');
//   const brandColor = useColorModeValue('brand.500', 'brand.400');
//   const inputBg = useColorModeValue('gray.50', 'navy.900');
//   const optionSelectedBg = useColorModeValue('green.50', 'green.900');
//   const explanationBg = useColorModeValue('gray.50', 'navy.900');

//   // ── Data States ────────────────────────────────────────
//   const [courses, setCourses] = useState([]);
//   const [tests, setTests] = useState([]);
//   const [subjects, setSubjects] = useState([]);
//   const [subSubjects, setSubSubjects] = useState([]);
//   const [topics, setTopics] = useState([]);
//   const [chapters, setChapters] = useState([]);
//   const [tags, setTags] = useState([]);
//   const [mcqs, setMcqs] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [loading, setLoading] = useState(false);
//   const { mode } = useParams();
//   const finalMode = mode || 'manual';

//   const navigate = useNavigate();
//   const toast = useToast();
//   const location = useLocation();
//   const testIdFromList = location.state?.testId || null;
//   const [selectedTestDetails, setSelectedTestDetails] = useState(null);

//   useEffect(() => {
//     const fetchSelectedTest = async () => {
//       if (!testIdFromList) return;

//       try {
//         const res = await axios.get(
//           `${baseUrl}/api/admin/tests/${testIdFromList}`,
//           { headers },
//         );

//         const testData = res.data?.data;
//         setSelectedTestDetails(testData);

//         if (finalMode === 'regular') {
//           setFormData((prev) => ({
//             ...prev,
//             testId: testIdFromList,
//             courseId: testData.courseId?._id || '',
//             subjectId: testData.subjectId || '',
//             subSubjectId: testData.subSubjectId || '',
//             chapterId: testData.chapterId || '',
//           }));

//           // 🔥 Only load topics (NO subjects/subsubjects)
//           loadTopics(testData.chapterId);
//         }
//       } catch (err) {
//         toast({
//           title: 'Failed to load test details',
//           status: 'error',
//         });
//       }
//     };

//     fetchSelectedTest();
//   }, [testIdFromList]);

//   useEffect(() => {
//     if (testIdFromList) {
//       toast({
//         title: 'Add MCQ Mode',
//         description: `Adding MCQs for selected test`,
//         status: 'info',
//         duration: 3000,
//       });
//       setFormData((prev) => ({ ...prev, testId: testIdFromList }));
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [testIdFromList]);
//   useEffect(() => {
//     if (location.state?.editMcq) {
//       handleEdit(location.state.editMcq);
//     }
//     // eslint-disable-next-line
//   }, [location.state]);

//   const rawBaseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:4000';
//   const baseUrl = rawBaseUrl.endsWith('/')
//     ? rawBaseUrl.slice(0, -1)
//     : rawBaseUrl;
//   const token = localStorage.getItem('token');
//   const headers = { Authorization: `Bearer ${token}` };

//   const getImageUrl = (path) => {
//     if (!path) return '';
//     if (path.startsWith('http')) return path;
//     const cleanPath = path.startsWith('/') ? path.slice(1) : path;
//     return `${baseUrl}${cleanPath}`;
//   };

//   const initialFormState = {
//     testId: '',
//     courseId: '',
//     subjectId: '',
//     subSubjectId: '',
//     topicId: '',
//     chapterId: '',
//     tagId: '',
//     questionText: '',
//     questionFile: null,
//     options: [
//       { text: '', file: null },
//       { text: '', file: null },
//       { text: '', file: null },
//       { text: '', file: null },
//     ],
//     correctAnswer: 0,
//     explanationText: '',
//     explanationFile: null,
//     difficulty: 'medium',
//     marks: 4,
//     negativeMarks: 1,
//   };

//   const [formData, setFormData] = useState(initialFormState);
//   const [editingMCQ, setEditingMCQ] = useState(null);
//   const [isEditMode, setIsEditMode] = useState(false);
//   const handleEdit = (mcq) => {
//     setIsEditMode(true);
//     setEditingMCQ(mcq);
//     const tid = mcq.testId?._id || mcq.testId || '';

//     setFormData({
//       testId: tid,
//       courseId: mcq.courseId?._id || '',
//       subjectId: mcq.subjectId?._id || '',
//       subSubjectId: mcq.subSubjectId?._id || '',
//       topicId: mcq.topicId?._id || '',
//       chapterId: mcq.chapterId?._id || '',
//       tagId: mcq.tagId?._id || '',
//       questionText: mcq.question?.text || '',
//       questionFile: null,
//       options: mcq.options.map((o) => ({ text: o.text || '', file: null })),
//       correctAnswer: mcq.correctAnswer || 0,
//       explanationText: mcq.explanation?.text || '',
//       explanationFile: null,
//       difficulty: mcq.difficulty || 'medium',
//       marks: mcq.marks || 4,
//       negativeMarks: mcq.negativeMarks || 1,
//     });

//     loadSubjects(mcq.courseId?._id);
//     loadSubSubjects(mcq.subjectId?._id);
//     loadChapters(mcq.subSubjectId?._id);
//     loadTopics(mcq.chapterId?._id);
//   };
//   const handleUpdate = async () => {
//     if (!editingMCQ?._id) return;

//     setLoading(true);
//     const data = new FormData();
//     data.append(
//       'chapterId',
//       finalMode === 'regular'
//         ? selectedTestDetails?.chapterId
//         : formData.chapterId,
//     );

//     data.append('topicId', formData.topicId);

//     if (formData.tagId) data.append('tagId', formData.tagId);
//     data.append('correctAnswer', formData.correctAnswer);
//     data.append('difficulty', formData.difficulty);
//     data.append('marks', formData.marks);
//     data.append('negativeMarks', formData.negativeMarks);

//     data.append(
//       'question',
//       JSON.stringify({
//         text: formData.questionText,
//         replaceImages: !!formData.questionFile,
//       }),
//     );

//     data.append(
//       'explanation',
//       JSON.stringify({
//         text: formData.explanationText,
//         replaceImages: !!formData.explanationFile,
//       }),
//     );

//     data.append(
//       'options',
//       JSON.stringify(
//         formData.options.map((o) => ({
//           text: o.text,
//           replaceImage: !!o.file,
//         })),
//       ),
//     );

//     if (formData.questionFile)
//       data.append('questionImages', formData.questionFile);

//     if (formData.explanationFile)
//       data.append('explanationImages', formData.explanationFile);

//     formData.options.forEach((opt, i) => {
//       if (opt.file) data.append(`optionImage_${i}`, opt.file);
//     });

//     try {
//       await axios.put(`${baseUrl}/api/admin/mcqs/${editingMCQ._id}`, data, {
//         headers: { ...headers, 'Content-Type': 'multipart/form-data' },
//       });

//       toast({ title: 'MCQ updated successfully', status: 'success' });

//       setIsEditMode(false);
//       setEditingMCQ(null);
//       setFormData({
//         ...initialFormState,
//         testId: formData.testId || testIdFromList || '',
//       });

//       const res = await axios.get(`${baseUrl}/api/admin/mcqs`, { headers });
//       setMcqs(normaliseMcqList(res));
//     } catch (err) {
//       toast({
//         title: 'Update failed',
//         description: err.response?.data?.message || 'Server error',
//         status: 'error',
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── Fetch Master Data ──────────────────────────────────
//   useEffect(() => {
//     const fetchAll = async () => {
//       try {
//         const [courseRes, tagRes, mcqRes, testsRes] = await Promise.all([
//           axios.get(`${baseUrl}/api/admin/courses`, { headers }),
//           axios.get(`${baseUrl}/api/admin/tags`, { headers }),
//           axios.get(`${baseUrl}/api/admin/mcqs`, { headers }),
//           axios.get(`${baseUrl}/api/admin/tests?limit=500`, { headers }),
//         ]);

//         setCourses(courseRes.data.data || courseRes.data || []);
//         setTags(tagRes.data.data || tagRes.data || []);
//         setMcqs(normaliseMcqList(mcqRes));
//         const allTests = testsRes.data?.tests || [];

//         if (finalMode === 'manual') {
//           setTests([]);
//         } else {
//           setTests(allTests.filter((t) => t.testMode === finalMode));
//         }
//       } catch (err) {
//         toast({
//           title: 'Initial data load failed',
//           status: 'error',
//           description: err.message,
//         });
//       }
//     };
//     fetchAll();
//   }, []);

//   // Cascade fetches
//   // const loadSubjects = async (courseId) => {
//   //   if (!courseId) {
//   //     setSubjects([]);
//   //     setSubSubjects([]);
//   //     setTopics([]);
//   //     setChapters([]);
//   //     return;
//   //   }
//   //   try {
//   //     const res = await axios.get(
//   //       `${baseUrl}/api/admin/subjects?courseId=${courseId}`,
//   //       { headers },
//   //     );
//   //     setSubjects(res.data.data || []);
//   //     setSubSubjects([]);
//   //     setTopics([]);
//   //     setChapters([]);
//   //   } catch (err) {
//   //     toast({ title: 'Subjects load failed', status: 'error' });
//   //   }
//   // };
//   const loadSubjects = async (courseId) => {
//     if (!courseId) {
//       setSubjects([]);
//       return;
//     }
//     try {
//       const res = await axios.get(
//         `${baseUrl}/api/admin/subjects?courseId=${courseId}`,
//         { headers },
//       );

//       // Debugging ke liye log zaroor check karein
//       console.log('Subjects API Response:', res.data);

//       // Agar data property ke andar hai toh wo le, warna pura res.data le
//       const subjectsData = res.data.data || res.data || [];
//       setSubjects(Array.isArray(subjectsData) ? subjectsData : []);

//       // Purane states reset karein
//       setSubSubjects([]);
//       setTopics([]);
//       setChapters([]);
//     } catch (err) {
//       console.error('Subject fetch error:', err);
//       toast({
//         title: 'Subjects load failed',
//         description: err.response?.data?.message || 'Check network tab',
//         status: 'error',
//       });
//     }
//   };

//   const loadSubSubjects = async (subjectId) => {
//     if (!subjectId) {
//       setSubSubjects([]);
//       setChapters([]);
//       setTopics([]);
//       return;
//     }
//     try {
//       const res = await axios.get(
//         `${baseUrl}/api/admin/sub-subjects?subjectId=${subjectId}`,
//         { headers },
//       );
//       setSubSubjects(res.data.data || []);
//       setChapters([]);
//       setTopics([]);
//     } catch (err) {
//       toast({ title: 'Sub-Subjects load failed', status: 'error' });
//     }
//   };

//   // Load Chapters by SubSubjectId
//   const loadChapters = async (subSubjectId) => {
//     setChapters([]);
//     setTopics([]);

//     if (!subSubjectId) return;

//     try {
//       const res = await axios.get(
//         `${baseUrl}/api/admin/chapters/sub-subject/${subSubjectId}`,
//         { headers },
//       );

//       setChapters(res.data.data || []);
//       setTopics([]);
//     } catch (err) {
//       toast({ title: 'Chapters load failed', status: 'error' });
//     }
//   };

//   // Load Topics by ChapterId
//   const loadTopics = async (chapterId) => {
//     setTopics([]);

//     if (!chapterId) return;

//     try {
//       const res = await axios.get(
//         `${baseUrl}/api/admin/topics/chapter/${chapterId}`,
//         { headers },
//       );

//       setTopics(res.data.data || []);
//     } catch (err) {
//       toast({ title: 'Topics load failed', status: 'error' });
//     }
//   };

//   const handleFileChange = (e, field, index = null) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     setFormData((prev) => {
//       if (field === 'question') return { ...prev, questionFile: file };
//       if (field === 'explanation') return { ...prev, explanationFile: file };
//       if (field === 'option' && index != null) {
//         const newOpts = [...prev.options];
//         newOpts[index].file = file;
//         return { ...prev, options: newOpts };
//       }
//       return prev;
//     });
//   };

//   const handleCreate = async () => {
//     if (finalMode !== 'manual' && !formData.testId) {
//       toast({
//         title: 'Test is required to create MCQ',
//         description: 'Please select a test from the dropdown.',
//         status: 'warning',
//         duration: 4000,
//       });
//       return;
//     }

//     if (finalMode !== 'regular' && !formData.chapterId) {
//       toast({ title: 'Chapter is required', status: 'warning' });
//       return;
//     }

//     setLoading(true);
//     const data = new FormData();

//     if (finalMode !== 'manual') {
//       data.append('testId', formData.testId);
//     }

//     // Required hierarchy
//     data.append('courseId', formData.courseId);
//     data.append('subjectId', formData.subjectId);
//     data.append('subSubjectId', formData.subSubjectId);
//     data.append('chapterId', formData.chapterId);
//     data.append('topicId', formData.topicId);

//     // Optional / defaults
//     if (formData.tagId) data.append('tagId', formData.tagId);

//     data.append('correctAnswer', formData.correctAnswer);
//     data.append('difficulty', formData.difficulty);
//     data.append('marks', formData.marks);
//     data.append('negativeMarks', formData.negativeMarks);

//     // Structured JSON fields
//     data.append('question', JSON.stringify({ text: formData.questionText }));
//     data.append(
//       'explanation',
//       JSON.stringify({ text: formData.explanationText }),
//     );
//     data.append(
//       'options',
//       JSON.stringify(formData.options.map((o) => ({ text: o.text }))),
//     );

//     // Images – exact multer field names
//     if (formData.questionFile)
//       data.append('questionImages', formData.questionFile);
//     if (formData.explanationFile)
//       data.append('explanationImages', formData.explanationFile);

//     formData.options.forEach((opt, i) => {
//       if (opt.file) data.append(`optionImage_${i}`, opt.file);
//     });

//     try {
//       await axios.post(`${baseUrl}/api/admin/mcqs`, data, {
//         headers: { ...headers, 'Content-Type': 'multipart/form-data' },
//       });

//       toast({ title: 'MCQ created successfully', status: 'success' });
//       if (finalMode === 'regular') {
//         setFormData({
//           ...initialFormState,
//           testId: testIdFromList,
//           courseId: selectedTestDetails?.courseId?._id || '',
//           subjectId: selectedTestDetails?.subjectId || '',
//           subSubjectId: selectedTestDetails?.subSubjectId || '',
//           chapterId: selectedTestDetails?.chapterId || '',
//         });

//         // 🔥 reload topics so dropdown stays active
//         loadTopics(selectedTestDetails?.chapterId);
//       } else {
//         setFormData({
//           ...initialFormState,
//           testId: testIdFromList || formData.testId,
//         });
//       }

//       const res = await axios.get(`${baseUrl}/api/admin/mcqs`, { headers });
//       setMcqs(normaliseMcqList(res));
//     } catch (err) {
//       toast({
//         title: 'Failed to create MCQ',
//         description: err.response?.data?.message || 'Server error',
//         status: 'error',
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm('Delete this MCQ permanently?')) return;

//     try {
//       await axios.delete(`${baseUrl}/api/admin/mcqs/${id}`, { headers });
//       toast({ title: 'MCQ deleted', status: 'info' });
//       const res = await axios.get(`${baseUrl}/api/admin/mcqs`, { headers });
//       setMcqs(normaliseMcqList(res));
//     } catch (err) {
//       toast({ title: 'Delete failed', status: 'error' });
//     }
//   };

//   const filteredMCQs = mcqs
//     .filter((m) =>
//       /**
//        * STRICT MCQ FILTERING BY TYPE/MODE
//        *
//        * Manual: m.testId == null (no test association)
//        * Exam: m.testId exists AND testMode === 'exam'
//        * Regular: m.testId exists AND testMode === 'regular'
//        *
//        * ⚠️ CRITICAL RULE: Each type is completely isolated
//        * - Manual MCQs NEVER appear in exam or regular listings
//        * - Exam MCQs NEVER appear in manual or regular listings
//        * - Regular MCQs NEVER appear in manual or exam listings
//        */
//       finalMode === 'manual'
//         ? m.testId == null
//         : finalMode === 'exam'
//           ? m.testId && m.testId.testMode === 'exam'
//           : finalMode === 'regular'
//             ? m.testId && m.testId.testMode === 'regular'
//             : true,
//     )
//     .filter(
//       (m) =>
//         (m.question?.text || '')
//           .toLowerCase()
//           .includes(searchTerm.toLowerCase()) ||
//         (m.chapterId?.name || '')
//           .toLowerCase()
//           .includes(searchTerm.toLowerCase()),
//     );

//   const handleViewMcqs = (testId) => {
//     if (finalMode === 'regular') {
//       navigate('/admin/mcqs-q-test-list', { state: { testId } });
//     } else if (finalMode === 'exam') {
//       navigate('/admin/mcqs-test-list', { state: { testId } });
//     } else {
//       navigate('/admin/mcqs-manual');
//     }
//   };

//   return (
//     <Box pt={{ base: '130px', md: '80px' }} px="20px">
//       <Button
//         size="sm"
//         variant="outline"
//         colorScheme="blue"
//         mb={3} // 👈 thoda upar space mil jayega
//         alignSelf="flex-start"
//         onClick={() => {
//           if (finalMode === 'regular') {
//             navigate('/admin/q-test-list');
//           } else if (finalMode === 'exam') {
//             navigate('/admin/test-list');
//           } else {
//             navigate('/admin/mcqs-manual');
//           }
//         }}
//       >
//         ← Back to Tests
//       </Button>

//       {/* CREATE FORM */}
//       <Card mb="30px" p="25px">
//         <Flex align="center" mb="25px">
//           <Icon
//             as={MdAddCircle}
//             color={brandColor}
//             w="28px"
//             h="28px"
//             me="12px"
//           />

//           <HStack>
//             <Text color={textColor} fontSize="22px" fontWeight="700">
//               Create New MCQ
//             </Text>

//             {mode === 'manual' && (
//               <Badge colorScheme="purple" variant="solid">
//                 Manual Mode
//               </Badge>
//             )}
//           </HStack>
//         </Flex>

//         <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={10}>
//           {/* LEFT – Metadata & Question */}
//           <VStack align="stretch" spacing={6}>
//             {finalMode !== 'manual' && (
//               <FormControl isRequired>
//                 <FormLabel
//                   fontSize="sm"
//                   fontWeight="700"
//                   color={secondaryColor}
//                 >
//                   <Icon as={MdOutlineQuiz} me="1" /> Test
//                 </FormLabel>
//                 <Select
//                   variant="filled"
//                   placeholder="Select Test"
//                   value={formData.testId}
//                   isDisabled={isEditMode}
//                   onChange={(e) =>
//                     setFormData((p) => ({ ...p, testId: e.target.value }))
//                   }
//                 >
//                   {tests.map((t) => (
//                     <option key={t._id} value={t._id}>
//                       {t.testTitle || t.title || t.name || t._id}
//                     </option>
//                   ))}
//                 </Select>
//               </FormControl>
//             )}

//             {/* Course → Subject → SubSubject → Topic → Chapter */}
//             {finalMode !== 'regular' && (
//               <>
//                 <Grid templateColumns="repeat(2, 1fr)" gap={4}>
//                   <GridItem colSpan={{ base: 2, md: 1 }}>
//                     <FormControl isRequired>
//                       <FormLabel fontSize="sm" fontWeight="700">
//                         Course
//                       </FormLabel>
//                       <Select
//                         variant="filled"
//                         placeholder="Select Course"
//                         value={formData.courseId}
//                         onChange={(e) => {
//                           const val = e.target.value;
//                           setFormData((p) => ({
//                             ...p,
//                             courseId: val,
//                             subjectId: '',
//                             subSubjectId: '',
//                             chapterId: '',
//                             topicId: '',
//                           }));
//                           loadSubjects(val);
//                         }}
//                       >
//                         {courses.map((c) => (
//                           <option key={c._id} value={c._id}>
//                             {c.name}
//                           </option>
//                         ))}
//                       </Select>
//                     </FormControl>
//                   </GridItem>

//                   <GridItem colSpan={{ base: 2, md: 1 }}>
//                     <FormControl isRequired>
//                       <FormLabel
//                         fontSize="sm"
//                         fontWeight="700"
//                         color={secondaryColor}
//                       >
//                         Subject
//                       </FormLabel>
//                       <Select
//                         variant="filled"
//                         placeholder="Select Subject"
//                         isDisabled={!formData.courseId}
//                         value={formData.subjectId}
//                         onChange={(e) => {
//                           const val = e.target.value;
//                           setFormData((p) => ({
//                             ...p,
//                             subjectId: val,
//                             subSubjectId: '',
//                             chapterId: '',
//                             topicId: '',
//                           }));
//                           loadSubSubjects(val);
//                         }}
//                       >
//                         {subjects.map((s) => (
//                           <option key={s._id} value={s._id}>
//                             {s.name}
//                           </option>
//                         ))}
//                       </Select>
//                     </FormControl>
//                   </GridItem>
//                 </Grid>

//                 <Grid templateColumns="repeat(2, 1fr)" gap={4}>
//                   <GridItem>
//                     <FormControl isRequired>
//                       <FormLabel
//                         fontSize="sm"
//                         fontWeight="700"
//                         color={secondaryColor}
//                       >
//                         Sub-Subject
//                       </FormLabel>
//                       <Select
//                         variant="filled"
//                         placeholder="Select Sub-Subject"
//                         isDisabled={!formData.subjectId}
//                         value={formData.subSubjectId}
//                         onChange={(e) => {
//                           const val = e.target.value;

//                           // 🔥 clear old data first
//                           setChapters([]);
//                           setTopics([]);

//                           setFormData((p) => ({
//                             ...p,
//                             subSubjectId: val,
//                             chapterId: '',
//                             topicId: '',
//                           }));
//                           loadChapters(val);
//                         }}
//                       >
//                         {subSubjects.map((ss) => (
//                           <option key={ss._id} value={ss._id}>
//                             {ss.name}
//                           </option>
//                         ))}
//                       </Select>
//                     </FormControl>
//                   </GridItem>

//                   <GridItem>
//                     <FormControl isRequired>
//                       <FormLabel
//                         fontSize="sm"
//                         fontWeight="700"
//                         color={secondaryColor}
//                       >
//                         Chapter
//                       </FormLabel>
//                       <Select
//                         variant="filled"
//                         placeholder="Select Chapter"
//                         isDisabled={!formData.subSubjectId}
//                         value={formData.chapterId}
//                         onChange={(e) => {
//                           const val = e.target.value;

//                           // 🔥 clear old data first
//                           setTopics([]);

//                           setFormData((p) => ({
//                             ...p,
//                             chapterId: val,
//                             topicId: '',
//                           }));
//                           loadTopics(val);
//                         }}
//                       >
//                         {chapters.map((c) => (
//                           <option key={c._id} value={c._id}>
//                             {c.name}
//                           </option>
//                         ))}
//                       </Select>
//                     </FormControl>
//                   </GridItem>
//                 </Grid>
//               </>
//             )}

//             <FormControl isRequired>
//               <FormLabel fontSize="sm" fontWeight="700" color={secondaryColor}>
//                 Topic
//               </FormLabel>
//               <Select
//                 variant="filled"
//                 placeholder="Select Topic"
//                 isDisabled={!formData.chapterId}
//                 value={formData.topicId}
//                 onChange={(e) =>
//                   setFormData((p) => ({ ...p, topicId: e.target.value }))
//                 }
//               >
//                 {topics.map((t) => (
//                   <option key={t._id} value={t._id}>
//                     {t.name}
//                   </option>
//                 ))}
//               </Select>
//             </FormControl>

//             <FormControl>
//               <FormLabel fontSize="sm" fontWeight="700" color={secondaryColor}>
//                 <Icon as={MdEqualizer} me="1" /> Difficulty
//               </FormLabel>
//               <Select
//                 variant="filled"
//                 value={formData.difficulty}
//                 onChange={(e) =>
//                   setFormData((p) => ({ ...p, difficulty: e.target.value }))
//                 }
//               >
//                 <option value="easy">🟢 Easy</option>
//                 <option value="medium">🟡 Medium</option>
//                 <option value="hard">🔴 Hard</option>
//               </Select>
//             </FormControl>

//             <FormControl>
//               <FormLabel fontSize="sm" fontWeight="700" color={secondaryColor}>
//                 Tag (optional)
//               </FormLabel>
//               <Select
//                 variant="filled"
//                 placeholder="Select Tag"
//                 value={formData.tagId}
//                 onChange={(e) =>
//                   setFormData((p) => ({ ...p, tagId: e.target.value }))
//                 }
//               >
//                 <option value="">No Tag</option>
//                 {tags.map((t) => (
//                   <option key={t._id} value={t._id}>
//                     {t.name}
//                   </option>
//                 ))}
//               </Select>
//             </FormControl>

//             {/* Question */}
//             <FormControl>
//               <FormLabel fontSize="sm" fontWeight="700" color={secondaryColor}>
//                 <Icon as={MdHelpOutline} me="1" /> Question
//               </FormLabel>
//               <Textarea
//                 minH="110px"
//                 variant="auth"
//                 placeholder="Enter question text..."
//                 value={formData.questionText}
//                 onChange={(e) =>
//                   setFormData((p) => ({ ...p, questionText: e.target.value }))
//                 }
//               />
//               <Button
//                 as="label"
//                 mt={2}
//                 size="sm"
//                 leftIcon={<MdCloudUpload />}
//                 colorScheme="brand"
//                 variant="subtle"
//                 cursor="pointer"
//               >
//                 {formData.questionFile
//                   ? 'Image selected'
//                   : 'Upload Question Image'}
//                 <input
//                   type="file"
//                   hidden
//                   accept="image/*"
//                   onChange={(e) => handleFileChange(e, 'question')}
//                 />
//               </Button>
//             </FormControl>
//           </VStack>

//           {/* RIGHT – Options + Explanation */}
//           <Box bg={inputBg} p="6" borderRadius="20px">
//             <FormLabel fontSize="md" fontWeight="700" mb="4">
//               Options (A–D)
//             </FormLabel>

//             {formData.options.map((opt, idx) => (
//               <Box
//                 key={idx}
//                 p="4"
//                 mb="4"
//                 border="2px solid"
//                 borderRadius="16px"
//                 borderColor={
//                   formData.correctAnswer === idx
//                     ? 'green.400'
//                     : optionBorderColor
//                 }
//                 bg={
//                   formData.correctAnswer === idx
//                     ? optionSelectedBg
//                     : 'transparent'
//                 }
//               >
//                 <Flex align="center" gap={4}>
//                   <input
//                     type="radio"
//                     checked={formData.correctAnswer === idx}
//                     onChange={() =>
//                       setFormData((p) => ({ ...p, correctAnswer: idx }))
//                     }
//                   />
//                   <VStack flex="1" align="stretch" spacing={2}>
//                     <Input
//                       variant="unstyled"
//                       fontWeight="600"
//                       placeholder={`Option ${String.fromCharCode(65 + idx)} ...`}
//                       value={opt.text}
//                       onChange={(e) => {
//                         const newOpts = [...formData.options];
//                         newOpts[idx].text = e.target.value;
//                         setFormData((p) => ({ ...p, options: newOpts }));
//                       }}
//                     />
//                     <Button
//                       as="label"
//                       size="xs"
//                       variant="ghost"
//                       colorScheme="blue"
//                       p="0"
//                       justifyContent="flex-start"
//                       leftIcon={<MdCloudUpload />}
//                     >
//                       {opt.file ? 'Image selected' : 'Add option image'}
//                       <input
//                         type="file"
//                         hidden
//                         accept="image/*"
//                         onChange={(e) => handleFileChange(e, 'option', idx)}
//                       />
//                     </Button>
//                   </VStack>
//                 </Flex>
//               </Box>
//             ))}

//             {/* Explanation */}
//             <FormControl mt={6}>
//               <FormLabel fontSize="sm" fontWeight="700" color={secondaryColor}>
//                 Detailed Explanation / Solution
//               </FormLabel>

//               <Box
//                 border="1px solid"
//                 borderColor={optionBorderColor}
//                 borderRadius="12px"
//                 bg="white"
//                 overflow="hidden"
//                 sx={{
//                   '.ql-toolbar': {
//                     border: 'none',
//                     borderBottom: '1px solid',
//                     borderColor: optionBorderColor,
//                     background: '#f9fafb',
//                   },
//                   '.ql-container': {
//                     border: 'none',
//                     minHeight: '160px',
//                     fontSize: '14px',
//                   },
//                   '.ql-editor': {
//                     minHeight: '140px',
//                     padding: '12px',
//                   },
//                 }}
//               >
//                 <ReactQuill
//                   theme="snow"
//                   value={formData.explanationText}
//                   onChange={(val) =>
//                     setFormData((p) => ({ ...p, explanationText: val }))
//                   }
//                   modules={quillModules}
//                   formats={quillFormats}
//                   placeholder="Enter detailed explanation / solution..."
//                 />
//               </Box>

//               <Button
//                 as="label"
//                 mt={2}
//                 size="sm"
//                 leftIcon={<MdImage />}
//                 variant="outline"
//                 fontSize="xs"
//               >
//                 {formData.explanationFile
//                   ? 'Image selected'
//                   : 'Upload Explanation Image'}
//                 <input
//                   type="file"
//                   hidden
//                   accept="image/*"
//                   onChange={(e) => handleFileChange(e, 'explanation')}
//                 />
//               </Button>
//             </FormControl>

//             <Button
//               colorScheme={isEditMode ? 'orange' : 'brand'}
//               mt={8}
//               w="full"
//               size="lg"
//               onClick={isEditMode ? handleUpdate : handleCreate}
//               isLoading={loading}
//             >
//               {isEditMode ? 'UPDATE MCQ' : 'CREATE MCQ'}
//             </Button>

//             {isEditMode && (
//               <Button
//                 mt={3}
//                 w="full"
//                 size="md"
//                 variant="outline"
//                 onClick={() => {
//                   setIsEditMode(false);
//                   setEditingMCQ(null);
//                   setFormData({
//                     ...initialFormState,
//                     testId: formData.testId || testIdFromList || '',
//                   });
//                 }}
//               >
//                 Cancel Edit
//               </Button>
//             )}
//           </Box>
//         </SimpleGrid>
//       </Card>
//       {/* LIST */}
//       <Card p="25px">
//         <Flex
//           direction={{ base: 'column', md: 'row' }}
//           justify="space-between"
//           align={{ base: 'start', md: 'center' }}
//           mb="30px"
//           gap={4}
//         >
//           <Text fontSize="22px" fontWeight="700" color={textColor}>
//             {finalMode === 'manual'
//               ? 'Manual MCQs'
//               : finalMode === 'regular'
//                 ? 'Q-Test MCQs'
//                 : 'Exam MCQs'}
//           </Text>

//           <InputGroup maxW="350px">
//             <InputLeftElement children={<MdSearch color="gray.400" />} />
//             <Input
//               borderRadius="full"
//               variant="filled"
//               placeholder="Search question..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </InputGroup>
//         </Flex>

//         <Box overflowX="auto">
//           <SimpleGrid columns={1} spacing={4}>
//             <Box
//               border="1px solid"
//               borderColor={optionBorderColor}
//               borderRadius="12px"
//               overflow="hidden"
//             >
//               <Flex
//                 bg={listBg}
//                 px="4"
//                 py="3"
//                 fontWeight="700"
//                 borderBottom="1px solid"
//                 borderColor={optionBorderColor}
//               >
//                 <Box flex="3">Question</Box>
//                 <Box flex="2">Correct Answer</Box>
//                 <Box flex="1" textAlign="center">
//                   Action
//                 </Box>
//               </Flex>

//               {filteredMCQs.map((item, idx) => {
//                 const correctOpt =
//                   item.options?.[item.correctAnswer]?.text || 'N/A';

//                 return (
//                   <Flex
//                     key={item._id}
//                     px="4"
//                     py="3"
//                     align="center"
//                     borderBottom="1px solid"
//                     borderColor={optionBorderColor}
//                     _last={{ borderBottom: 'none' }}
//                   >
//                     {/* Question */}
//                     <Box flex="3">
//                       <Text fontSize="sm" fontWeight="600" noOfLines={2}>
//                         {item.question?.text}
//                       </Text>
//                     </Box>

//                     {/* Correct Answer */}
//                     <Box flex="2">
//                       <Text fontSize="sm" color="green.600" fontWeight="600">
//                         {correctOpt}
//                       </Text>
//                     </Box>

//                     {/* View Button */}
//                     <Box flex="1" textAlign="center">
//                       <Button
//                         size="sm"
//                         colorScheme="brand"
//                         variant="outline"
//                         onClick={() => handleViewMcqs(item.testId?._id)}
//                       >
//                         View
//                       </Button>
//                     </Box>
//                     <Box flex="1" textAlign="center">
//                       <HStack justify="center" spacing={2}>
//                         <Button
//                           size="sm"
//                           colorScheme="blue"
//                           variant="outline"
//                           onClick={() => handleEdit(item)}
//                         >
//                           Edit
//                         </Button>
//                         <IconButton
//                           size="sm"
//                           colorScheme="red"
//                           variant="ghost"
//                           icon={<MdDelete />}
//                           onClick={() => handleDelete(item._id)}
//                         />
//                       </HStack>
//                     </Box>
//                   </Flex>
//                 );
//               })}

//               {filteredMCQs.length === 0 && (
//                 <Box py="8" textAlign="center">
//                   <Text color="gray.500">No MCQs found</Text>
//                 </Box>
//               )}
//             </Box>
//           </SimpleGrid>
//         </Box>
//       </Card>

//       {/* LIST
//       <Card p="25px">
//         <Flex
//           direction={{ base: 'column', md: 'row' }}
//           justify="space-between"
//           align={{ base: 'start', md: 'center' }}
//           mb="30px"
//           gap={4}
//         >
//           <Text fontSize="22px" fontWeight="700" color={textColor}>
//             MCQ Repository
//           </Text>
//           <InputGroup maxW="350px">
//             <InputLeftElement children={<MdSearch color="gray.400" />} />
//             <Input
//               borderRadius="full"
//               variant="filled"
//               placeholder="Search question / chapter / mode..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </InputGroup>
//         </Flex>

//         <VStack spacing={6} align="stretch">
//           {filteredMCQs.map((item, idx) => (
//             <Box
//               key={item._id}
//               p="6"
//               borderRadius="20px"
//               border="1px solid"
//               borderColor={optionBorderColor}
//               bg={listBg}
//               shadow="sm"
//             >
//               <Flex justify="space-between" mb="4" wrap="wrap" gap={2}>
//                 <HStack spacing={2} flexWrap="wrap">
//                   <Badge colorScheme="purple">{item.chapterId?.name}</Badge>
//                   {item.tagId?.name && (
//                     <Badge colorScheme="orange" variant="outline">
//                       {item.tagId.name}
//                     </Badge>
//                   )}
//                   <Badge
//                     colorScheme={
//                       item.difficulty === 'easy'
//                         ? 'green'
//                         : item.difficulty === 'medium'
//                           ? 'yellow'
//                           : 'red'
//                     }
//                   >
//                     {item.difficulty}
//                   </Badge>
//                   <Badge colorScheme="blue">{item.mode?.toUpperCase()}</Badge>
//                 </HStack>
//                 <IconButton
//                   size="sm"
//                   colorScheme="red"
//                   variant="ghost"
//                   icon={<MdDelete />}
//                   onClick={() => handleDelete(item._id)}
//                 />
//               </Flex>

//               <Text fontSize="lg" fontWeight="700" mb="4" color={textColor}>
//                 Q{idx + 1}. {item.question?.text}
//               </Text>

//               {item.question?.images?.[0] && (
//                 <Image
//                   src={getImageUrl(item.question.images[0])}
//                   maxH="240px"
//                   borderRadius="15px"
//                   mb="5"
//                   objectFit="contain"
//                 />
//               )}

//               <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb="5">
//                 {item.options?.map((opt, i) => (
//                   <Flex
//                     key={i}
//                     p="4"
//                     borderRadius="15px"
//                     border="1px solid"
//                     borderColor={
//                       item.correctAnswer === i ? 'green.400' : optionBorderColor
//                     }
//                     bg={
//                       item.correctAnswer === i
//                         ? optionSelectedBg
//                         : 'transparent'
//                     }
//                     align="center"
//                     gap={3}
//                   >
//                     <Text fontWeight="bold" minW="24px">
//                       {String.fromCharCode(65 + i)}.
//                     </Text>
//                     <Box flex={1}>
//                       <Text>{opt.text}</Text>
//                       {opt.image && (
//                         <Image
//                           src={getImageUrl(opt.image)}
//                           maxH="90px"
//                           mt={2}
//                           borderRadius="8px"
//                           objectFit="contain"
//                         />
//                       )}
//                     </Box>
//                     {item.correctAnswer === i && (
//                       <Icon as={MdCheckCircle} color="green.500" boxSize={5} />
//                     )}
//                   </Flex>
//                 ))}
//               </SimpleGrid>

//               <Accordion allowToggle>
//                 <AccordionItem border="none">
//                   <AccordionButton p="0">
//                     <Box
//                       flex="1"
//                       textAlign="left"
//                       color="brand.500"
//                       fontWeight="700"
//                     >
//                       Show Explanation
//                     </Box>
//                     <AccordionIcon />
//                   </AccordionButton>
//                   <AccordionPanel
//                     pb={4}
//                     mt={2}
//                     bg={explanationBg}
//                     borderRadius="12px"
//                   >
//                     <div
//                       dangerouslySetInnerHTML={{
//                         __html: item.explanation?.text || '',
//                       }}
//                     />
//                     {item.explanation?.images?.map((img, i) => (
//                       <Image
//                         key={i}
//                         src={getImageUrl(img)}
//                         maxH="220px"
//                         mt={4}
//                         borderRadius="12px"
//                         objectFit="contain"
//                       />
//                     ))}
//                   </AccordionPanel>
//                 </AccordionItem>
//               </Accordion>
//             </Box>
//           ))}

//           {filteredMCQs.length === 0 && (
//             <Text textAlign="center" color="gray.500" py={10}>
//               No MCQs found
//             </Text>
//           )}
//         </VStack>
//       </Card> */}

//     </Box>
//   );
// }


'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Flex,
  Text,
  useColorModeValue,
  Button,
  Input,
  FormControl,
  FormLabel,
  useToast,
  IconButton,
  Select,
  Badge,
  Textarea,
  SimpleGrid,
  VStack,
  Image,
  HStack,
  InputGroup,
  InputLeftElement,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Grid,
  GridItem,
  Icon,
} from '@chakra-ui/react';
import {
  MdDelete,
  MdSearch,
  MdCloudUpload,
  MdImage,
  MdCheckCircle,
  MdHelpOutline,
  MdLayers,
  MdEqualizer,
  MdAddCircle,
  MdOutlineQuiz,
  MdFlashOn,
  MdEdit, // 🔥 Added missing import
} from 'react-icons/md';
import axios from 'axios';
import Card from 'components/card/Card';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    [{ align: [] }],
    ['clean'],
  ],
};

const quillFormats = [
  'header',
  'bold',
  'italic',
  'underline',
  'list',
  'bullet',
  'link',
  'align',
];

function normaliseMcqList(res) {
  const raw = res?.data?.data ?? res?.data ?? [];
  if (res?.data?.format === 'test-wise-grouped' && Array.isArray(raw))
    return raw.flatMap((g) => g.mcqList || []);
  return Array.isArray(raw) ? raw : [];
}

export default function MCQManagement() {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const secondaryColor = useColorModeValue('gray.600', 'gray.400');
  const listBg = useColorModeValue('white', 'navy.800');
  const optionBorderColor = useColorModeValue('gray.200', 'whiteAlpha.300');
  const brandColor = useColorModeValue('brand.500', 'brand.400');
  const inputBg = useColorModeValue('gray.50', 'navy.900');
  const optionSelectedBg = useColorModeValue('green.50', 'green.900');
  const explanationBg = useColorModeValue('gray.50', 'navy.900');

  // ── Data States ────────────────────────────────────────
  const [courses, setCourses] = useState([]);
  const [tests, setTests] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [subSubjects, setSubSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [tags, setTags] = useState([]);
  const [mcqs, setMcqs] = useState([]);
  const [allTopicsList, setAllTopicsList] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const { mode } = useParams();
  const finalMode = mode || 'manual';

  const navigate = useNavigate();
  const toast = useToast();
  const location = useLocation();
  const testIdFromList = location.state?.testId || null;
  const [selectedTestDetails, setSelectedTestDetails] = useState(null);

  const rawBaseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:4000';
  const baseUrl = rawBaseUrl.endsWith('/')
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const initialFormState = {
    // testId: '',
    testId: [],
    courseId: '',
    subjectId: '',
    subSubjectId: '',
    topicId: '',
    chapterId: '',
    tagId: '',
    questionText: '',
    questionFile: null,
    options: [
      { text: '', file: null },
      { text: '', file: null },
      { text: '', file: null },
      { text: '', file: null },
    ],
    correctAnswer: 0,
    explanationText: '',
    explanationFile: null,
    difficulty: 'medium',
    marks: 4,
    negativeMarks: 1,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [editingMCQ, setEditingMCQ] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // ── Cascade Fetch Functions ──────────────────────────────
  const loadSubjects = async (courseId) => {
    if (!courseId) { setSubjects([]); return; }
    try {
      const res = await axios.get(`${baseUrl}/api/admin/subjects?courseId=${courseId}`, { headers });
      const data = res.data.data || res.data || [];
      setSubjects(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  const loadSubSubjects = async (subjectId) => {
    if (!subjectId) { setSubSubjects([]); return; }
    try {
      const res = await axios.get(`${baseUrl}/api/admin/sub-subjects?subjectId=${subjectId}`, { headers });
      setSubSubjects(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const loadChapters = async (subSubjectId) => {
    if (!subSubjectId) { setChapters([]); return; }
    try {
      const res = await axios.get(`${baseUrl}/api/admin/chapters/sub-subject/${subSubjectId}`, { headers });
      setChapters(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const loadTopics = async (chapterId) => {
    if (!chapterId) { setTopics([]); return; }
    try {
      const res = await axios.get(`${baseUrl}/api/admin/topics/chapter/${chapterId}`, { headers });
      setTopics(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  // 🔥 Quick Select Logic
  // const handleQuickTopicSelect = async (topicId) => {
  //   if (!topicId) return;
  //   const selectedTopic = allTopicsList.find(t => t._id === topicId);
  //   if (!selectedTopic) return;

  //   const chap = selectedTopic.chapterId;
  //   const subSub = chap?.subSubjectId;
  //   const sub = subSub?.subjectId;
  //   const cour = sub?.courseId;

  //   const chapId = chap?._id || chap;
  //   const ssId = subSub?._id || subSub;
  //   const sId = sub?._id || sub;
  //   const cId = cour?._id || cour;

  //   setFormData(prev => ({
  //     ...prev,
  //     courseId: cId || '',
  //     subjectId: sId || '',
  //     subSubjectId: ssId || '',
  //     chapterId: chapId || '',
  //     topicId: topicId
  //   }));

  //   if (cId) loadSubjects(cId);
  //   if (sId) loadSubSubjects(sId);
  //   if (ssId) loadChapters(ssId);
  //   if (chapId) loadTopics(chapId);

  //   toast({ title: 'Topic Details Loaded', status: 'success', duration: 2000 });
  // };
  // 🔥 FAIL-SAFE QUICK SELECT: IDs ko extract karke dropdowns load karein
  const handleQuickTopicSelect = (topicId) => {
    if (!topicId) return;

    // 1. Topic dhoondhein
    const selectedTopic = allTopicsList.find((t) => t._id === topicId);
    if (!selectedTopic) return;

    console.log("Quick Select Data:", selectedTopic);

    // 2. Deep extraction with fallbacks (IDs nikalne ke liye)
    // Hum har jagah check karenge ki data nested object hai ya plain string ID
    const chap = selectedTopic.chapterId;
    const chapId = chap?._id || chap || '';

    const ss = chap?.subSubjectId || selectedTopic.subSubjectId;
    const ssId = ss?._id || ss || '';

    const sub = ss?.subjectId || chap?.subjectId || selectedTopic.subjectId;
    const sId = sub?._id || sub || '';

    const cour = sub?.courseId || ss?.courseId || chap?.courseId || selectedTopic.courseId;
    const cId = cour?._id || cour || '';

    // 3. Form Data ko turant update karein
    setFormData((prev) => ({
      ...prev,
      courseId: cId,
      subjectId: sId,
      subSubjectId: ssId,
      chapterId: chapId,
      topicId: topicId,
    }));

    // 4. Dropdown lists ko fill karne ke liye purane functions call karein
    // Isse UI mein "Select Course" ki jagah actual name dikhne lagega
    if (cId) loadSubjects(cId);
    if (sId) loadSubSubjects(sId);
    if (ssId) loadChapters(ssId);
    if (chapId) loadTopics(chapId);

    toast({ title: 'Topic Selected', status: 'success', duration: 1500 });
  };

  // ── Initial Data Fetch ──────────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [courseRes, tagRes, mcqRes, testsRes, topicsRes] = await Promise.all([
          axios.get(`${baseUrl}/api/admin/courses`, { headers }),
          axios.get(`${baseUrl}/api/admin/tags`, { headers }),
          axios.get(`${baseUrl}/api/admin/mcqs`, { headers }),
          axios.get(`${baseUrl}/api/admin/tests?limit=500`, { headers }),
          axios.get(`${baseUrl}/api/admin/topics`, { headers }), 
        ]);

        setCourses(courseRes.data.data || courseRes.data || []);
        setTags(tagRes.data.data || tagRes.data || []);
        setMcqs(normaliseMcqList(mcqRes));
        setAllTopicsList(topicsRes.data.data || []); 

        const allTests = testsRes.data?.tests || [];
        if (finalMode !== 'manual') {
          setTests(allTests.filter((t) => t.testMode === finalMode));
        }
      } catch (err) {
        toast({ title: 'Data load failed', status: 'error' });
      }
    };
    fetchAll();
  }, [baseUrl, finalMode, token]);

  useEffect(() => {
    const fetchSelectedTest = async () => {
      if (!testIdFromList) return;
      try {
        const res = await axios.get(`${baseUrl}/api/admin/tests/${testIdFromList}`, { headers });
        const testData = res.data?.data;
        setSelectedTestDetails(testData);

        if (finalMode === 'regular') {
          setFormData((prev) => ({
            ...prev,
             testId: [testIdFromList],
            courseId: testData.courseId?._id || '',
            subjectId: testData.subjectId || '',
            subSubjectId: testData.subSubjectId || '',
            chapterId: testData.chapterId || '',
          }));
          loadTopics(testData.chapterId);
        }
      } catch (err) { console.error(err); }
    };
    fetchSelectedTest();
  }, [testIdFromList]);

  // const handleEdit = (mcq) => {
  //   setIsEditMode(true);
  //   setEditingMCQ(mcq);
  //   const tid = mcq.testId?._id || mcq.testId || '';

  //   setFormData({
  //     testId: tid,
  //     courseId: mcq.courseId?._id || '',
  //     subjectId: mcq.subjectId?._id || '',
  //     subSubjectId: mcq.subSubjectId?._id || '',
  //     topicId: mcq.topicId?._id || '',
  //     chapterId: mcq.chapterId?._id || '',
  //     tagId: mcq.tagId?._id || '',
  //     questionText: mcq.question?.text || '',
  //     questionFile: null,
  //     options: mcq.options.map((o) => ({ text: o.text || '', file: null })),
  //     correctAnswer: mcq.correctAnswer || 0,
  //     explanationText: mcq.explanation?.text || '',
  //     explanationFile: null,
  //     difficulty: mcq.difficulty || 'medium',
  //     marks: mcq.marks || 4,
  //     negativeMarks: mcq.negativeMarks || 1,
  //   });

  //   loadSubjects(mcq.courseId?._id);
  //   loadSubSubjects(mcq.subjectId?._id);
  //   loadChapters(mcq.subSubjectId?._id);
  //   loadTopics(mcq.chapterId?._id);
  // };
const handleEdit = (mcq) => {
    setIsEditMode(true);
    setEditingMCQ(mcq);

    // 1. Check karein ki testId array hai ya single object, aur IDs nikal kar array banayein
    let testIdsArray = [];
    if (Array.isArray(mcq.testId)) {
      // Agar backend se array aa raha hai
      testIdsArray = mcq.testId.map(t => (typeof t === 'object' ? t._id : t));
    } else if (mcq.testId) {
      // Agar single testId hai (purana data)
      testIdsArray = [typeof mcq.testId === 'object' ? mcq.testId._id : mcq.testId];
    }

    setFormData({
      testId: testIdsArray, // Ab ye hamesha array rahega
      courseId: mcq.courseId?._id || mcq.courseId || '',
      subjectId: mcq.subjectId?._id || mcq.subjectId || '',
      subSubjectId: mcq.subSubjectId?._id || mcq.subSubjectId || '',
      topicId: mcq.topicId?._id || mcq.topicId || '',
      chapterId: mcq.chapterId?._id || mcq.chapterId || '',
      tagId: mcq.tagId?._id || mcq.tagId || '',
      questionText: mcq.question?.text || '',
      questionFile: null,
      options: mcq.options.map((o) => ({ text: o.text || '', file: null })),
      correctAnswer: mcq.correctAnswer || 0,
      explanationText: mcq.explanation?.text || '',
      explanationFile: null,
      difficulty: mcq.difficulty || 'medium',
      marks: mcq.marks || 4,
      negativeMarks: mcq.negativeMarks || 1,
    });

    // Dropdowns load karne ke liye IDs ka use karein
    const cId = mcq.courseId?._id || mcq.courseId;
    const sId = mcq.subjectId?._id || mcq.subjectId;
    const ssId = mcq.subSubjectId?._id || mcq.subSubjectId;
    const chapId = mcq.chapterId?._id || mcq.chapterId;

    if (cId) loadSubjects(cId);
    if (sId) loadSubSubjects(sId);
    if (ssId) loadChapters(ssId);
    if (chapId) loadTopics(chapId);
  };
  // const handleUpdate = async () => {
  //   if (!editingMCQ?._id) return;
  //   setLoading(true);
  //   const data = new FormData();
  //   data.append('chapterId', finalMode === 'regular' ? selectedTestDetails?.chapterId : formData.chapterId);
  //   data.append('topicId', formData.topicId);
  //   if (formData.tagId) data.append('tagId', formData.tagId);
  //   data.append('correctAnswer', formData.correctAnswer);
  //   data.append('difficulty', formData.difficulty);
  //   data.append('marks', formData.marks);
  //   data.append('negativeMarks', formData.negativeMarks);
  //   data.append('question', JSON.stringify({ text: formData.questionText, replaceImages: !!formData.questionFile }));
  //   data.append('explanation', JSON.stringify({ text: formData.explanationText, replaceImages: !!formData.explanationFile }));
  //   data.append('options', JSON.stringify(formData.options.map((o) => ({ text: o.text, replaceImage: !!o.file }))));
  //   if (formData.questionFile) data.append('questionImages', formData.questionFile);
  //   if (formData.explanationFile) data.append('explanationImages', formData.explanationFile);
  //   formData.options.forEach((opt, i) => { if (opt.file) data.append(`optionImage_${i}`, opt.file); });

  //   try {
  //     await axios.put(`${baseUrl}/api/admin/mcqs/${editingMCQ._id}`, data, { headers: { ...headers, 'Content-Type': 'multipart/form-data' } });
  //     toast({ title: 'MCQ updated successfully', status: 'success' });
  //     setIsEditMode(false);
  //     setEditingMCQ(null);
  //     setFormData({ ...initialFormState, testId: formData.testId || testIdFromList || '' });
  //     const res = await axios.get(`${baseUrl}/api/admin/mcqs`, { headers });
  //     setMcqs(normaliseMcqList(res));
  //   } catch (err) { toast({ title: 'Update failed', status: 'error' }); } finally { setLoading(false); }
  // };
const handleUpdate = async () => {
  if (!editingMCQ?._id) return;
  setLoading(true);
  const data = new FormData();

  // 🔥 NAYA BADLAV: Multiple Test IDs ko loop karke append karna
  // Isse backend ko [id1, id2] ke roop mein data milega
  if (Array.isArray(formData.testId) && formData.testId.length > 0) {
    formData.testId.forEach((id) => {
      data.append('testId', id);
    });
  } else {
    // Agar koi test select nahi hai toh empty bhejne ke liye (optional depend on backend)
    data.append('testId', ''); 
  }

  // Baki dropdown fields (Course, Subject etc.) bhi update ke liye bhejni chahiye
  data.append('courseId', formData.courseId);
  data.append('subjectId', formData.subjectId);
  data.append('subSubjectId', formData.subSubjectId);
  data.append('chapterId', finalMode === 'regular' ? (selectedTestDetails?.chapterId || formData.chapterId) : formData.chapterId);
  data.append('topicId', formData.topicId);

  if (formData.tagId) data.append('tagId', formData.tagId);
  
  data.append('correctAnswer', formData.correctAnswer);
  data.append('difficulty', formData.difficulty);
  data.append('marks', formData.marks);
  data.append('negativeMarks', formData.negativeMarks);

  // Question, Explanation aur Options (JSON stringified)
  data.append('question', JSON.stringify({ 
    text: formData.questionText, 
    replaceImages: !!formData.questionFile 
  }));
  data.append('explanation', JSON.stringify({ 
    text: formData.explanationText, 
    replaceImages: !!formData.explanationFile 
  }));
  data.append('options', JSON.stringify(formData.options.map((o) => ({ 
    text: o.text, 
    replaceImage: !!o.file 
  }))));

  // Files handling
  if (formData.questionFile) data.append('questionImages', formData.questionFile);
  if (formData.explanationFile) data.append('explanationImages', formData.explanationFile);
  formData.options.forEach((opt, i) => { 
    if (opt.file) data.append(`optionImage_${i}`, opt.file); 
  });

  try {
    await axios.put(`${baseUrl}/api/admin/mcqs/${editingMCQ._id}`, data, { 
      headers: { ...headers, 'Content-Type': 'multipart/form-data' } 
    });
    
    toast({ title: 'MCQ updated successfully', status: 'success' });
    
    // Reset state
    setIsEditMode(false);
    setEditingMCQ(null);
    
    // Reset form: testId ko wapas empty array [] karein
    setFormData({ 
      ...initialFormState, 
      testId: [] 
    });

    // Refresh list
    const res = await axios.get(`${baseUrl}/api/admin/mcqs`, { headers });
    setMcqs(normaliseMcqList(res));
  } catch (err) { 
    console.error(err);
    toast({ title: 'Update failed', status: 'error' }); 
  } finally { 
    setLoading(false); 
  }
};
  const handleCreate = async () => {
    if (finalMode !== 'manual' && !formData.testId) {
      toast({ title: 'Test is required', status: 'warning' });
      return;
    }
    setLoading(true);
    const data = new FormData();
    // if (finalMode !== 'manual') data.append('testId', formData.testId);
    formData.testId.forEach((id) => {
  data.append('testId', id); 
});
    data.append('courseId', formData.courseId);
    data.append('subjectId', formData.subjectId);
    data.append('subSubjectId', formData.subSubjectId);
    data.append('chapterId', formData.chapterId);
    data.append('topicId', formData.topicId);
    if (formData.tagId) data.append('tagId', formData.tagId);
    data.append('correctAnswer', formData.correctAnswer);
    data.append('difficulty', formData.difficulty);
    data.append('marks', formData.marks);
    data.append('negativeMarks', formData.negativeMarks);
    data.append('question', JSON.stringify({ text: formData.questionText }));
    data.append('explanation', JSON.stringify({ text: formData.explanationText }));
    data.append('options', JSON.stringify(formData.options.map((o) => ({ text: o.text }))));
    if (formData.questionFile) data.append('questionImages', formData.questionFile);
    if (formData.explanationFile) data.append('explanationImages', formData.explanationFile);
    formData.options.forEach((opt, i) => { if (opt.file) data.append(`optionImage_${i}`, opt.file); });

    try {
      await axios.post(`${baseUrl}/api/admin/mcqs`, data, { headers: { ...headers, 'Content-Type': 'multipart/form-data' } });
      toast({ title: 'MCQ created successfully', status: 'success' });
      if (finalMode === 'regular') {
        setFormData({ ...initialFormState, testId: testIdFromList, courseId: selectedTestDetails?.courseId?._id || '', subjectId: selectedTestDetails?.subjectId || '', subSubjectId: selectedTestDetails?.subSubjectId || '', chapterId: selectedTestDetails?.chapterId || '' });
        loadTopics(selectedTestDetails?.chapterId);
      } else {
        setFormData({ ...initialFormState, testId: testIdFromList || formData.testId });
      }
      const res = await axios.get(`${baseUrl}/api/admin/mcqs`, { headers });
      setMcqs(normaliseMcqList(res));
    } catch (err) { toast({ title: 'Failed to create', status: 'error' }); } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this MCQ?')) return;
    try {
      await axios.delete(`${baseUrl}/api/admin/mcqs/${id}`, { headers });
      toast({ title: 'Deleted', status: 'info' });
      const res = await axios.get(`${baseUrl}/api/admin/mcqs`, { headers });
      setMcqs(normaliseMcqList(res));
    } catch (err) { toast({ title: 'Delete failed', status: 'error' }); }
  };

  const handleFileChange = (e, field, index = null) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormData((prev) => {
      if (field === 'question') return { ...prev, questionFile: file };
      if (field === 'explanation') return { ...prev, explanationFile: file };
      if (field === 'option' && index != null) {
        const newOpts = [...prev.options];
        newOpts[index].file = file;
        return { ...prev, options: newOpts };
      }
      return prev;
    });
  };

  // const filteredMCQs = mcqs.filter((m) =>
  //   finalMode === 'manual' ? m.testId == null : 
  //   finalMode === 'exam' ? m.testId?.testMode === 'exam' : 
  //   finalMode === 'regular' ? m.testId?.testMode === 'regular' : true
  // ).filter((m) => 
  //   (m.question?.text || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
  //   (m.chapterId?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  // );
const filteredMCQs = mcqs.filter((m) => {
    // 1. Manual Mode Check
    if (finalMode === 'manual') {
      // Agar testId null hai, ya empty array hai, toh wo manual hai
      return !m.testId || (Array.isArray(m.testId) && m.testId.length === 0);
    }

    // 2. Mode Check (Exam or Regular)
    // Hum ek helper function banate hain jo check karega ki MCQ ke kisi bhi test ka mode match karta hai ya nahi
    const checkMode = (targetMode) => {
      if (Array.isArray(m.testId)) {
        // Agar array hai (Naya format)
        return m.testId.some((t) => (t?.testMode || t) === targetMode);
      } else if (m.testId && typeof m.testId === 'object') {
        // Agar single object hai (Purana format)
        return m.testId.testMode === targetMode;
      }
      return false;
    };

    if (finalMode === 'exam') return checkMode('exam');
    if (finalMode === 'regular') return checkMode('regular');

    return true;
  }).filter((m) => 
    // Search filter
    (m.question?.text || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (m.chapterId?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <Box pt={{ base: '130px', md: '80px' }} px="20px">
      <Button
        size="sm"
        variant="outline"
        colorScheme="blue"
        mb={3}
        onClick={() => navigate(finalMode === 'regular' ? '/admin/q-test-list' : finalMode === 'exam' ? '/admin/test-list' : '/admin/mcqs-manual')}
      >
        ← Back to Tests
      </Button>

      <Card mb="30px" p="25px">
        <Flex align="center" mb="25px">
          <Icon as={MdAddCircle} color={brandColor} w="28px" h="28px" me="12px" />
          <HStack>
            <Text color={textColor} fontSize="22px" fontWeight="700">Create New MCQ</Text>
            {finalMode === 'manual' && <Badge colorScheme="purple">Manual Mode</Badge>}
          </HStack>
        </Flex>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={10}>
          <VStack align="stretch" spacing={6}>
            
            {/* 🔥 QUICK SELECT TOPIC (Auto-fill) */}
            {finalMode !== 'regular' && (
              <Box bg="blue.50" p="4" borderRadius="15px" border="1px dashed" borderColor="blue.300">
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="800" color="blue.700">
                    <Icon as={MdFlashOn} me="1" /> Quick Select Topic (Auto-fill)
                  </FormLabel>
                  <Select
                    placeholder="Search Topic..."
                    bg="white"
                    onChange={(e) => handleQuickTopicSelect(e.target.value)}
                  >
                    {allTopicsList.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name} (In: {t.chapterId?.name || '...'})
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}

            {/* {finalMode !== 'manual' && (
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="700" color={secondaryColor}>
                  <Icon as={MdOutlineQuiz} me="1" /> Test
                </FormLabel>
                <Select variant="filled" placeholder="Select Test" value={formData.testId} isDisabled={isEditMode} onChange={(e) => setFormData(p => ({ ...p, testId: e.target.value }))}>
                  {tests.map((t) => <option key={t._id} value={t._id}>{t.testTitle || t.name || t._id}</option>)}
                </Select>
              </FormControl>
            )} */}
            {/* 🔥 Multiple Test Selection */}
{finalMode !== 'manual' && (
  <FormControl isRequired>
    <FormLabel fontSize="sm" fontWeight="700" color={secondaryColor}>
      <Icon as={MdOutlineQuiz} me="1" /> Select Tests (Multiple)
    </FormLabel>
    <Box 
      maxH="150px" 
      overflowY="auto" 
      p="3" 
      bg={inputBg} 
      borderRadius="md" 
      border="1px solid" 
      borderColor={optionBorderColor}
    >
      {/* <VStack align="start" spacing={1}>
        {tests.map((t) => (
          <HStack key={t._id}>
            <input 
              type="checkbox"
              checked={formData.testId.includes(t._id)}
              onChange={(e) => {
                const checked = e.target.checked;
                setFormData(prev => ({
                  ...prev,
                  testId: checked 
                    ? [...prev.testId, t._id] 
                    : prev.testId.filter(id => id !== t._id)
                }));
              }}
            />
            <Text fontSize="sm">{t.testTitle || t.name}</Text>
          </HStack>
        ))}
      </VStack> */}
      {/* 🔥 Select Tests Checkbox Logic */}
<VStack align="start" spacing={1}>
  {tests.map((t) => (
    <HStack key={t._id}>
      <input 
        type="checkbox"
        // checked={formData.testId.includes(t._id)}
        checked={(formData.testId || []).includes(t._id)}
        onChange={async (e) => {
          const checked = e.target.checked;
          const newTestIds = checked 
            ? [...formData.testId, t._id] 
            : formData.testId.filter(id => id !== t._id);
          
          setFormData(prev => ({ ...prev, testId: newTestIds }));

          // Agar pehla test select hua hai, toh uski details se chapter load karein
          if (checked && newTestIds.length === 1) {
            try {
              const res = await axios.get(`${baseUrl}/api/admin/tests/${t._id}`, { headers });
              const testData = res.data?.data;
              if (testData) {
                setFormData(prev => ({
                  ...prev,
                  courseId: testData.courseId?._id || testData.courseId || '',
                  subjectId: testData.subjectId || '',
                  subSubjectId: testData.subSubjectId || '',
                  chapterId: testData.chapterId || '',
                }));
                // 🔥 Yahan topics load honge
                if (testData.chapterId) loadTopics(testData.chapterId);
              }
            } catch (err) { console.error("Test load error", err); }
          }
        }}
      />
      <Text fontSize="sm">{t.testTitle || t.name}</Text>
    </HStack>
  ))}
</VStack>
    </Box>
  </FormControl>
)}

            {finalMode !== 'regular' && (
              <>
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <GridItem colSpan={{ base: 2, md: 1 }}>
                    <FormControl isRequired>
                      <FormLabel fontSize="sm" fontWeight="700">Course</FormLabel>
                      <Select variant="filled" placeholder="Select Course" value={formData.courseId} onChange={(e) => { const v = e.target.value; setFormData(p => ({ ...p, courseId: v, subjectId: '', subSubjectId: '', chapterId: '', topicId: '' })); loadSubjects(v); }}>
                        {courses.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                      </Select>
                    </FormControl>
                  </GridItem>
                  <GridItem colSpan={{ base: 2, md: 1 }}>
                    <FormControl isRequired>
                      <FormLabel fontSize="sm" fontWeight="700">Subject</FormLabel>
                      <Select variant="filled" placeholder="Select Subject" isDisabled={!formData.courseId} value={formData.subjectId} onChange={(e) => { const v = e.target.value; setFormData(p => ({ ...p, subjectId: v, subSubjectId: '', chapterId: '', topicId: '' })); loadSubSubjects(v); }}>
                        {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                      </Select>
                    </FormControl>
                  </GridItem>
                </Grid>

                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <GridItem>
                    <FormControl isRequired>
                      <FormLabel fontSize="sm" fontWeight="700">Sub-Subject</FormLabel>
                      <Select variant="filled" placeholder="Select Sub-Subject" isDisabled={!formData.subjectId} value={formData.subSubjectId} onChange={(e) => { const v = e.target.value; setFormData(p => ({ ...p, subSubjectId: v, chapterId: '', topicId: '' })); loadChapters(v); }}>
                        {subSubjects.map((ss) => <option key={ss._id} value={ss._id}>{ss.name}</option>)}
                      </Select>
                    </FormControl>
                  </GridItem>
                  <GridItem>
                    <FormControl isRequired>
                      <FormLabel fontSize="sm" fontWeight="700">Chapter</FormLabel>
                      <Select variant="filled" placeholder="Select Chapter" isDisabled={!formData.subSubjectId} value={formData.chapterId} onChange={(e) => { const v = e.target.value; setFormData(p => ({ ...p, chapterId: v, topicId: '' })); loadTopics(v); }}>
                        {chapters.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                      </Select>
                    </FormControl>
                  </GridItem>
                </Grid>
              </>
            )}

            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="700">Topic</FormLabel>
              <Select variant="filled" placeholder="Select Topic" isDisabled={!formData.chapterId} value={formData.topicId} onChange={(e) => setFormData(p => ({ ...p, topicId: e.target.value }))}>
                {topics.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm" fontWeight="700"><Icon as={MdEqualizer} me="1" /> Difficulty</FormLabel>
              <Select variant="filled" value={formData.difficulty} onChange={(e) => setFormData(p => ({ ...p, difficulty: e.target.value }))}>
                <option value="easy">🟢 Easy</option>
                <option value="medium">🟡 Medium</option>
                <option value="hard">🔴 Hard</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm" fontWeight="700">Tag (optional)</FormLabel>
              <Select variant="filled" placeholder="Select Tag" value={formData.tagId} onChange={(e) => setFormData(p => ({ ...p, tagId: e.target.value }))}>
                <option value="">No Tag</option>
                {tags.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm" fontWeight="700"><Icon as={MdHelpOutline} me="1" /> Question</FormLabel>
              <Textarea minH="110px" variant="auth" placeholder="Enter question text..." value={formData.questionText} onChange={(e) => setFormData(p => ({ ...p, questionText: e.target.value }))} />
              <Button as="label" mt={2} size="sm" leftIcon={<MdCloudUpload />} colorScheme="brand" variant="subtle" cursor="pointer">
                {formData.questionFile ? 'Image selected' : 'Upload Image'}
                <input type="file" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'question')} />
              </Button>
            </FormControl>
          </VStack>

          <Box bg={inputBg} p="6" borderRadius="20px">
            <FormLabel fontSize="md" fontWeight="700" mb="4">Options (A–D)</FormLabel>
            {formData.options.map((opt, idx) => (
              <Box key={idx} p="4" mb="4" border="2px solid" borderRadius="16px" borderColor={formData.correctAnswer === idx ? 'green.400' : optionBorderColor} bg={formData.correctAnswer === idx ? optionSelectedBg : 'transparent'}>
                <Flex align="center" gap={4}>
                  <input type="radio" checked={formData.correctAnswer === idx} onChange={() => setFormData(p => ({ ...p, correctAnswer: idx }))} />
                  <VStack flex="1" align="stretch" spacing={2}>
                    <Input variant="unstyled" fontWeight="600" placeholder={`Option ${String.fromCharCode(65 + idx)}`} value={opt.text} onChange={(e) => { const n = [...formData.options]; n[idx].text = e.target.value; setFormData(p => ({ ...p, options: n })); }} />
                    <Button as="label" size="xs" variant="ghost" colorScheme="blue" p="0" leftIcon={<MdCloudUpload />}>
                      {opt.file ? 'Image selected' : 'Add image'}
                      <input type="file" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'option', idx)} />
                    </Button>
                  </VStack>
                </Flex>
              </Box>
            ))}

            <FormControl mt={6}>
              <FormLabel fontSize="sm" fontWeight="700">Solution</FormLabel>
              <Box border="1px solid" borderColor={optionBorderColor} borderRadius="12px" bg="white" overflow="hidden">
                <ReactQuill theme="snow" value={formData.explanationText} onChange={(v) => setFormData(p => ({ ...p, explanationText: v }))} modules={quillModules} formats={quillFormats} />
              </Box>
            </FormControl>

            <Button colorScheme={isEditMode ? 'orange' : 'brand'} mt={8} w="full" size="lg" onClick={isEditMode ? handleUpdate : handleCreate} isLoading={loading}>
              {isEditMode ? 'UPDATE MCQ' : 'CREATE MCQ'}
            </Button>
          </Box>
        </SimpleGrid>
      </Card>

      <Card p="25px">
        <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" mb="30px" gap={4}>
          <Text fontSize="22px" fontWeight="700">{finalMode === 'manual' ? 'Manual MCQs' : finalMode === 'regular' ? 'Q-Test MCQs' : 'Exam MCQs'}</Text>
          <InputGroup maxW="350px">
            <InputLeftElement children={<MdSearch color="gray.400" />} />
            <Input borderRadius="full" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </InputGroup>
        </Flex>

        <Box overflowX="auto">
          <SimpleGrid columns={1} spacing={4}>
            <Box border="1px solid" borderColor={optionBorderColor} borderRadius="12px" overflow="hidden">
              <Flex bg={listBg} px="4" py="3" fontWeight="700" borderBottom="1px solid" borderColor={optionBorderColor}>
                <Box flex="3">Question</Box>
                <Box flex="2">Correct Answer</Box>
                <Box flex="1" textAlign="center">Action</Box>
              </Flex>
              {filteredMCQs.map((item) => (
                <Flex key={item._id} px="4" py="3" align="center" borderBottom="1px solid" borderColor={optionBorderColor} _last={{ borderBottom: 'none' }}>
                  <Box flex="3"><Text fontSize="sm" fontWeight="600" noOfLines={2}>{item.question?.text}</Text></Box>
                  <Box flex="2"><Text fontSize="sm" color="green.600" fontWeight="600">{item.options?.[item.correctAnswer]?.text || 'N/A'}</Text></Box>
                  <Box flex="1" textAlign="center">
                    <HStack justify="center" spacing={2}>
                      <IconButton size="sm" colorScheme="blue" icon={<MdEdit />} onClick={() => handleEdit(item)} />
                      <IconButton size="sm" colorScheme="red" variant="ghost" icon={<MdDelete />} onClick={() => handleDelete(item._id)} />
                    </HStack>
                  </Box>
                </Flex>
              ))}
            </Box>
          </SimpleGrid>
        </Box>
      </Card>
    </Box>
  );
}