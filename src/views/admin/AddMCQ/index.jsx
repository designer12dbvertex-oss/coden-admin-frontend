// /* eslint-disable */
// 'use client';

// import {
//   Box,
//   Flex,
//   Table,
//   Tbody,
//   Td,
//   Text,
//   Th,
//   Thead,
//   Tr,
//   useColorModeValue,
//   Button,
//   Input,
//   FormControl,
//   FormLabel,
//   useToast,
//   IconButton,
//   Modal,
//   ModalOverlay,
//   ModalContent,
//   ModalHeader,
//   ModalFooter,
//   ModalBody,
//   ModalCloseButton,
//   useDisclosure,
//   InputGroup,
//   InputLeftElement,
//   Select,
//   Badge,
//   Tooltip,
//   Switch,
//   Textarea,
//   SimpleGrid,
// } from '@chakra-ui/react';
// import { MdEdit, MdDelete, MdSearch, MdAdd, MdClose } from 'react-icons/md';
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import Card from 'components/card/Card';

// export default function MCQManagement() {
//   const [chapters, setChapters] = useState([]);
//   const [mcqs, setMcqs] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [loading, setLoading] = useState(false);

//   // Form States
//   const [formData, setFormData] = useState({
//     chapterId: '',
//     question: '',
//     options: ['', '', '', ''],
//     correctAnswer: '',
//     explanation: '',
//     difficulty: 'medium',
//     marks: 4,
//     negativeMarks: 1,
//     previousYearTag: false,
//   });

//   const [editData, setEditData] = useState(null);
//   const { isOpen, onOpen, onClose } = useDisclosure();

//   const textColor = useColorModeValue('secondaryGray.900', 'white');
//   const toast = useToast();
//   const baseUrl = process.env.REACT_APP_BASE_URL;
//   const token = localStorage.getItem('token');
//   const headers = { Authorization: `Bearer ${token}` };

//   const fetchData = async () => {
//     try {
//       const [chapRes, mcqRes] = await Promise.all([
//         axios.get(`${baseUrl}api/admin/chapters`, { headers }),
//         axios.get(`${baseUrl}api/admin/mcqs`, { headers }),
//       ]);
//       setChapters(chapRes.data.data || []);
//       setMcqs(mcqRes.data.data || []);
//     } catch (err) {
//       toast({ title: 'Data load error', status: 'error' });
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   // Handle Dynamic Options
//   const handleOptionChange = (index, value) => {
//     const newOptions = [...formData.options];
//     newOptions[index] = value;
//     setFormData({ ...formData, options: newOptions });
//   };

//   const handleCreate = async () => {
//     if (!formData.chapterId || !formData.question || !formData.correctAnswer) {
//       return toast({
//         title: 'Question, chapter, and correct answer are required',
//         status: 'warning',
//       });
//     }
//     setLoading(true);
//     try {
//       await axios.post(`${baseUrl}api/admin/mcqs`, formData, { headers });
//       toast({ title: 'MCQ created successfully!', status: 'success' });
//       setFormData({
//         chapterId: '',
//         question: '',
//         options: ['', '', '', ''],
//         correctAnswer: '',
//         explanation: '',
//         difficulty: 'medium',
//         marks: 4,
//         negativeMarks: 1,
//         previousYearTag: false,
//       });
//       fetchData();
//     } catch (err) {
//       toast({
//         title: err.response?.data?.message || 'Failed to create MCQ',
//         status: 'error',
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm('Are you sure you want to delete this?')) {
//       try {
//         await axios.delete(`${baseUrl}api/admin/mcqs/${id}`, { headers });
//         toast({
//           title: 'Subject has been deleted successfully',
//           status: 'info',
//         });
//         fetchData();
//       } catch (err) {
//         toast({ title: 'Failed to delete subject', status: 'error' });
//       }
//     }
//   };

//   const filteredData = mcqs.filter(
//     (m) =>
//       m.question?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       m.chapterId?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
//   );

//   return (
//     <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
//       {/* ADD MCQ CARD */}
//       <Card mb="20px" p="20px">
//         <Text color={textColor} fontSize="22px" fontWeight="700" mb="20px">
//           Add New MCQ
//         </Text>
//         <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
//           <Box>
//             <FormControl mb="3">
//               <FormLabel fontSize="sm" fontWeight="700">
//                 Select Chapter
//               </FormLabel>
//               <Select
//                 placeholder="Select Chapter"
//                 value={formData.chapterId}
//                 onChange={(e) =>
//                   setFormData({ ...formData, chapterId: e.target.value })
//                 }
//               >
//                 {chapters.map((c) => (
//                   <option key={c._id} value={c._id}>
//                     {c.name}
//                   </option>
//                 ))}
//               </Select>
//             </FormControl>

//             <FormControl mb="3">
//               <FormLabel fontSize="sm" fontWeight="700">
//                 Question Text
//               </FormLabel>
//               <Textarea
//                 value={formData.question}
//                 onChange={(e) =>
//                   setFormData({ ...formData, question: e.target.value })
//                 }
//                 placeholder="Enter question here..."
//               />
//             </FormControl>

//             <SimpleGrid columns={2} spacing={3} mb="3">
//               <FormControl>
//                 <FormLabel fontSize="sm" fontWeight="700">
//                   Difficulty
//                 </FormLabel>
//                 <Select
//                   value={formData.difficulty}
//                   onChange={(e) =>
//                     setFormData({ ...formData, difficulty: e.target.value })
//                   }
//                 >
//                   <option value="easy">Easy</option>
//                   <option value="medium">Medium</option>
//                   <option value="hard">Hard</option>
//                 </Select>
//               </FormControl>
//               <FormControl>
//                 <FormLabel fontSize="sm" fontWeight="700">
//                   PYQ Tag?
//                 </FormLabel>
//                 <Flex align="center" h="40px">
//                   <Switch
//                     isChecked={formData.previousYearTag}
//                     onChange={(e) =>
//                       setFormData({
//                         ...formData,
//                         previousYearTag: e.target.checked,
//                       })
//                     }
//                   />
//                   <Text ml="2" fontSize="xs">
//                     Previous Year Question
//                   </Text>
//                 </Flex>
//               </FormControl>
//             </SimpleGrid>
//           </Box>

//           <Box>
//             <FormLabel fontSize="sm" fontWeight="700">
//               Options (Enter at least 2)
//             </FormLabel>
//             {formData.options.map((opt, idx) => (
//               <InputGroup key={idx} mb="2">
//                 <InputLeftElement children={`${idx + 1}.`} />
//                 <Input
//                   value={opt}
//                   onChange={(e) => handleOptionChange(idx, e.target.value)}
//                   placeholder={`Option ${idx + 1}`}
//                 />
//               </InputGroup>
//             ))}

//             <FormControl mt="3">
//               <FormLabel fontSize="sm" fontWeight="700" color="brand.500">
//                 Correct Answer Text
//               </FormLabel>
//               <Input
//                 value={formData.correctAnswer}
//                 onChange={(e) =>
//                   setFormData({ ...formData, correctAnswer: e.target.value })
//                 }
//                 placeholder="Must match one of the options"
//               />
//             </FormControl>

//             <FormControl mt="3">
//               <FormLabel fontSize="sm" fontWeight="700">
//                 Explanation
//               </FormLabel>
//               <Input
//                 value={formData.explanation}
//                 onChange={(e) =>
//                   setFormData({ ...formData, explanation: e.target.value })
//                 }
//                 placeholder="Why is this answer correct?"
//               />
//             </FormControl>
//           </Box>
//         </SimpleGrid>

//         <Button
//           colorScheme="brand"
//           mt="5"
//           onClick={handleCreate}
//           isLoading={loading}
//           w="full"
//         >
//           Create MCQ
//         </Button>
//       </Card>

//       {/* MCQ LIST */}
//       <Card p="20px">
//         <Flex justify="space-between" align="center" mb="20px">
//           <Text color={textColor} fontSize="18px" fontWeight="700">
//             MCQs List ({filteredData.length})
//           </Text>
//           <InputGroup maxW="300px">
//             <InputLeftElement pointerEvents="none">
//               <MdSearch color="gray.300" />
//             </InputLeftElement>
//             <Input
//               placeholder="Search MCQs..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </InputGroup>
//         </Flex>

//         <Box overflowX="auto">
//           <Table variant="simple" color="gray.500">
//             <Thead bg={useColorModeValue('gray.50', 'navy.800')}>
//               <Tr>
//                 <Th>Question</Th>
//                 <Th>Subject</Th>
//                 <Th>Sub-Subject</Th>
//                 <Th>Chapter</Th>
//                 <Th>Difficulty</Th>
//                 <Th>Marks</Th>
//                 <Th>PYQ</Th>
//                 <Th textAlign="right">Actions</Th>
//               </Tr>
//             </Thead>
//             <Tbody>
//               {filteredData.map((item) => (
//                 <Tr key={item._id}>
//                   <Td maxW="300px">
//                     <Tooltip label={item.question}>
//                       <Text isTruncated fontWeight="700" color={textColor}>
//                         {item.question}
//                       </Text>
//                     </Tooltip>
//                   </Td>
//                   {/* SUBJECT */}
//                   <Td>
//                     <Badge colorScheme="blue" variant="subtle">
//                       {item.subjectId?.name || 'N/A'}
//                     </Badge>
//                   </Td>

//                   {/* SUB-SUBJECT */}
//                   <Td>
//                     <Badge colorScheme="purple" variant="subtle">
//                       {item.subSubjectId?.name || 'N/A'}
//                     </Badge>
//                   </Td>

//                   <Td>
//                     <Badge variant="outline">
//                       {item.chapterId?.name || 'N/A'}
//                     </Badge>
//                   </Td>
//                   <Td>
//                     <Badge
//                       colorScheme={
//                         item.difficulty === 'hard'
//                           ? 'red'
//                           : item.difficulty === 'medium'
//                           ? 'orange'
//                           : 'green'
//                       }
//                     >
//                       {item.difficulty}
//                     </Badge>
//                   </Td>
//                   <Td>
//                     {item.marks} / -{item.negativeMarks}
//                   </Td>
//                   <Td>
//                     {item.previousYearTag ? (
//                       <Badge colorScheme="purple">PYQ</Badge>
//                     ) : (
//                       '-'
//                     )}
//                   </Td>
//                   <Td textAlign="right">
//                     <IconButton
//                       variant="ghost"
//                       colorScheme="red"
//                       icon={<MdDelete />}
//                       onClick={() => handleDelete(item._id)}
//                     />
//                   </Td>
//                 </Tr>
//               ))}
//             </Tbody>
//           </Table>
//         </Box>
//       </Card>
//     </Box>
//   );
// }

// 'use client';

// import React, { useState, useEffect } from 'react';
// import {
//   Box, Flex, Text, useColorModeValue, Button, Input, FormControl, FormLabel,
//   useToast, IconButton, Select, Badge, Textarea, SimpleGrid,
//   VStack, Divider, Image, HStack, InputGroup, InputLeftElement
// } from '@chakra-ui/react';
// import { MdDelete, MdSearch, MdCloudUpload, MdLink, MdEdit } from 'react-icons/md';
// import axios from 'axios';
// import Card from 'components/card/Card';

// // Rich Text Editor
// import ReactQuill from 'react-quill-new';
// import 'react-quill-new/dist/quill.snow.css';

// export default function MCQManagement() {
//   const [chapters, setChapters] = useState([]);
//   const [tags, setTags] = useState([]);
//   const [mcqs, setMcqs] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [loading, setLoading] = useState(false);

//   const textColor = useColorModeValue('secondaryGray.900', 'white');
//   const listBg = useColorModeValue('white', 'navy.800');
//   const optionBorderColor = useColorModeValue('gray.200', 'whiteAlpha.300');

//   const toast = useToast();
//   const baseUrl = process.env.REACT_APP_BASE_URL;
//   const token = localStorage.getItem('token');
//   const headers = { Authorization: `Bearer ${token}` };

//   const initialFormState = {
//     chapterId: '',
//     tagId: '',
//     question: { text: '', images: [] },
//     options: [
//       { text: '', image: '' }, { text: '', image: '' },
//       { text: '', image: '' }, { text: '', image: '' }
//     ],
//     correctAnswer: 0,
//     explanation: { text: '', images: [] },
//     difficulty: 'medium',
//     marks: 4,
//     negativeMarks: 1,
//   };

//   const [formData, setFormData] = useState(initialFormState);

//   // --- Functions ---

//   const fetchData = async () => {
//     try {
//       const [chapRes, tagRes, mcqRes] = await Promise.all([
//         axios.get(`${baseUrl}api/admin/chapters`, { headers }),
//         axios.get(`${baseUrl}api/admin/tags`, { headers }),
//         axios.get(`${baseUrl}api/admin/mcqs`, { headers }),
//       ]);
//       setChapters(chapRes.data.data || []);
//       setTags(tagRes.data.data || []);
//       setMcqs(mcqRes.data.data || []);
//     } catch (err) {
//       toast({ title: 'Data load error', status: 'error' });
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const handleImageUpload = async (e, type, index = null) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     const uploadData = new FormData();
//     uploadData.append('file', file);

//     try {
//       toast({ title: 'Uploading...', status: 'info', duration: 1000 });
//       const res = await axios.post(`${baseUrl}api/admin/upload`, uploadData, { headers });
//       const imageUrl = res.data.url;

//       if (type === 'question') {
//         setFormData(prev => ({ ...prev, question: { ...prev.question, images: [imageUrl] } }));
//       } else if (type === 'option') {
//         let newOpt = [...formData.options];
//         newOpt[index].image = imageUrl;
//         setFormData(prev => ({ ...prev, options: newOpt }));
//       } else if (type === 'explanation') {
//         setFormData(prev => ({ ...prev, explanation: { ...prev.explanation, images: [imageUrl] } }));
//       }
//       toast({ title: 'Uploaded!', status: 'success' });
//     } catch (err) {
//       toast({ title: 'Upload failed', status: 'error' });
//     }
//   };

//   const handleCreate = async () => {
//     if (!formData.chapterId) return toast({ title: 'Please select chapter', status: 'warning' });
//     setLoading(true);
//     try {
//       await axios.post(`${baseUrl}api/admin/mcqs`, formData, { headers });
//       toast({ title: 'MCQ Created!', status: 'success' });
//       setFormData(initialFormState);
//       fetchData();
//     } catch (err) {
//       toast({ title: 'Error creating MCQ', status: 'error' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fixed the missing handleDelete function
//   const handleDelete = async (id) => {
//     if (window.confirm('Are you sure you want to delete this MCQ?')) {
//       try {
//         await axios.delete(`${baseUrl}api/admin/mcqs/${id}`, { headers });
//         toast({ title: 'MCQ Deleted', status: 'info' });
//         fetchData();
//       } catch (err) {
//         toast({ title: 'Delete failed', status: 'error' });
//       }
//     }
//   };

//   const filteredData = mcqs.filter((m) =>
//     m.question?.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     m.chapterId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <Box pt={{ base: '130px', md: '80px' }}>
//       <Card mb="20px" p="20px">
//         <Text color={textColor} fontSize="22px" fontWeight="700" mb="20px">Add MCQ (Rich Editor + Upload)</Text>
        
//         <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
//           <VStack align="stretch" spacing={4}>
//             <FormControl isRequired>
//               <FormLabel fontWeight="700">Chapter & Tag</FormLabel>
//               <HStack>
//                 <Select placeholder="Chapter" value={formData.chapterId} onChange={(e) => setFormData({ ...formData, chapterId: e.target.value })}>
//                   {chapters.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
//                 </Select>
//                 <Select placeholder="Tag" value={formData.tagId} onChange={(e) => setFormData({ ...formData, tagId: e.target.value })}>
//                   {tags.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
//                 </Select>
//               </HStack>
//             </FormControl>

//             <FormControl>
//               <FormLabel fontWeight="700">Question Content</FormLabel>
//               <Textarea placeholder="Question Text" mb="2" value={formData.question.text} onChange={(e) => setFormData({ ...formData, question: { ...formData.question, text: e.target.value } })} />
//               <HStack>
//                 <InputGroup size="sm">
//                   <InputLeftElement children={<MdLink />} />
//                   <Input placeholder="Image URL" value={formData.question.images[0] || ''} onChange={(e) => setFormData({ ...formData, question: { ...formData.question, images: [e.target.value] } })} />
//                 </InputGroup>
//                 <Button as="label" leftIcon={<MdCloudUpload />} size="sm" cursor="pointer">
//                   Upload <input type="file" hidden onChange={(e) => handleImageUpload(e, 'question')} />
//                 </Button>
//               </HStack>
//             </FormControl>
//           </VStack>

//           <Box>
//             <FormLabel fontWeight="700">Options (Select Radio for Correct)</FormLabel>
//             {formData.options.map((opt, idx) => (
//               <Box key={idx} p="2" mb="2" borderWidth="1px" borderRadius="md" bg={formData.correctAnswer === idx ? "green.50" : "transparent"}>
//                 <Flex align="center" gap={3}>
//                   <input type="radio" name="mcq-option" checked={formData.correctAnswer === idx} onChange={() => setFormData({...formData, correctAnswer: idx})} />
//                   <VStack flex="1" spacing={1}>
//                     <Input size="sm" variant="flushed" placeholder={`Option ${idx + 1}`} value={opt.text} onChange={(e) => {
//                       let newOpt = [...formData.options]; newOpt[idx].text = e.target.value; setFormData({...formData, options: newOpt});
//                     }} />
//                     <HStack w="full">
//                       <Input size="xs" placeholder="Img URL" value={opt.image || ''} onChange={(e) => {
//                          let newOpt = [...formData.options]; newOpt[idx].image = e.target.value; setFormData({...formData, options: newOpt});
//                       }} />
//                       <IconButton size="xs" icon={<MdCloudUpload />} as="label"><input type="file" hidden onChange={(e) => handleImageUpload(e, 'option', idx)} /></IconButton>
//                     </HStack>
//                   </VStack>
//                 </Flex>
//               </Box>
//             ))}
//           </Box>
//         </SimpleGrid>

//         <FormControl mt="6">
//           <FormLabel fontWeight="700">Explanation (Rich Text)</FormLabel>
//           <Box bg="white" color="black" borderRadius="md" mb="2" border="1px solid #E2E8F0">
//             <ReactQuill theme="snow" value={formData.explanation.text} onChange={(val) => setFormData({...formData, explanation: {...formData.explanation, text: val}})} />
//           </Box>
//           <HStack mt="2">
//             <Input size="sm" placeholder="Explanation Image URL" value={formData.explanation.images[0] || ''} onChange={(e) => setFormData({...formData, explanation: {...formData.explanation, images: [e.target.value]}})} />
//             <Button as="label" leftIcon={<MdCloudUpload />} size="sm">Upload <input type="file" hidden onChange={(e) => handleImageUpload(e, 'explanation')} /></Button>
//           </HStack>
//         </FormControl>

//         <Button colorScheme="brand" mt="6" w="full" onClick={handleCreate} isLoading={loading}>Save MCQ</Button>
//       </Card>

//       <Card p="20px">
//         <InputGroup mb="5">
//           <InputLeftElement children={<MdSearch />} />
//           <Input placeholder="Search by Question or Chapter..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
//         </InputGroup>

//         <VStack spacing={6} align="stretch">
//           {filteredData.map((item, index) => (
//             <Box key={item._id} p="5" borderWidth="1px" borderRadius="xl" bg={listBg} shadow="sm">
//               <Flex justify="space-between" align="start">
//                 <HStack mb="3">
//                   <Badge colorScheme="blue">{item.chapterId?.name}</Badge>
//                   <Badge colorScheme="purple">{item.tagId?.name || 'No Tag'}</Badge>
//                   <Badge variant="outline">{item.difficulty}</Badge>
//                 </HStack>
//                 <IconButton size="sm" colorScheme="red" variant="ghost" icon={<MdDelete />} onClick={() => handleDelete(item._id)} />
//               </Flex>

//               <Text fontWeight="700" fontSize="lg" color={textColor} mt="2">{index + 1}. {item.question?.text}</Text>
//               {item.question?.images?.[0] && <Image src={item.question.images[0]} maxH="250px" my="3" borderRadius="md" alt="Question" />}
              
//               <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} mt="4">
//                 {item.options?.map((opt, i) => (
//                   <Box key={i} p="3" borderRadius="md" border="1px solid" borderColor={item.correctAnswer === i ? "green.400" : optionBorderColor} bg={item.correctAnswer === i ? "green.50" : "transparent"}>
//                     <Text fontWeight="600" color={textColor}>{i+1}. {opt.text}</Text>
//                     {opt.image && <Image src={opt.image} maxH="100px" mt="2" borderRadius="sm" />}
//                   </Box>
//                 ))}
//               </SimpleGrid>

//               <Box mt="4" p="4" bg="gray.50" borderRadius="lg">
//                 <Text fontWeight="bold" color="brand.500" mb="1">Explanation:</Text>
//                 <div className="ql-editor" style={{ padding: 0, color: 'black' }} dangerouslySetInnerHTML={{ __html: item.explanation?.text }} />
//                 {item.explanation?.images?.[0] && <Image src={item.explanation.images[0]} maxH="200px" mt="2" borderRadius="md" />}
//               </Box>
//             </Box>
//           ))}
//         </VStack>
//       </Card>
//     </Box>
//   );
// }
// 'use client';

// import React, { useState, useEffect } from 'react';
// import {
//   Box, Flex, Text, useColorModeValue, Button, Input, FormControl, FormLabel,
//   useToast, IconButton, Select, Badge, Textarea, SimpleGrid,
//   VStack, Image, HStack, InputGroup, InputLeftElement
// } from '@chakra-ui/react';
// import { MdDelete, MdSearch, MdCloudUpload, MdLink } from 'react-icons/md';
// import axios from 'axios';
// import Card from 'components/card/Card';

// // Rich Text Editor
// import ReactQuill from 'react-quill-new';
// import 'react-quill-new/dist/quill.snow.css';

// export default function MCQManagement() {
//   const [chapters, setChapters] = useState([]);
//   const [tags, setTags] = useState([]);
//   const [mcqs, setMcqs] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [loading, setLoading] = useState(false);

//   const textColor = useColorModeValue('secondaryGray.900', 'white');
//   const listBg = useColorModeValue('white', 'navy.800');
//   const optionBorderColor = useColorModeValue('gray.200', 'whiteAlpha.300');

//   const toast = useToast();
//   const baseUrl = process.env.REACT_APP_BASE_URL;
//   const token = localStorage.getItem('token');
//   const headers = { Authorization: `Bearer ${token}` };

//   const initialFormState = {
//     chapterId: '',
//     tagId: '',
//     question: { text: '', images: [] },
//     options: [
//       { text: '', image: '' }, { text: '', image: '' },
//       { text: '', image: '' }, { text: '', image: '' }
//     ],
//     correctAnswer: 0,
//     explanation: { text: '', images: [] },
//     difficulty: 'medium',
//     marks: 4,
//     negativeMarks: 1,
//   };

//   const [formData, setFormData] = useState(initialFormState);

//   const fetchData = async () => {
//     try {
//       const [chapRes, tagRes, mcqRes] = await Promise.all([
//         axios.get(`${baseUrl}api/admin/chapters`, { headers }),
//         axios.get(`${baseUrl}api/admin/tags`, { headers }),
//         axios.get(`${baseUrl}api/admin/mcqs`, { headers }),
//       ]);
//       setChapters(chapRes.data.data || []);
//       setTags(tagRes.data.data || []);
//       setMcqs(mcqRes.data.data || []);
//     } catch (err) {
//       toast({ title: 'Data load error', status: 'error' });
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   // ✅ FIXED IMAGE UPLOAD LOGIC
//   const handleImageUpload = async (e, type, index = null) => {
//     const file = e.target.files[0];
//     if (!file) return;
    
//     const uploadData = new FormData();
//     uploadData.append('file', file);

//     try {
//       toast({ title: 'Uploading...', status: 'info', duration: 1000 });
//       const res = await axios.post(`${baseUrl}api/admin/upload`, uploadData, { 
//         headers: { ...headers, 'Content-Type': 'multipart/form-data' } 
//       });
      
//       const imageUrl = res.data.url; // Make sure your backend returns { url: "..." }

//       if (type === 'question') {
//         setFormData(prev => ({
//           ...prev,
//           question: { ...prev.question, images: [imageUrl] } // Single image for now, as per backend
//         }));
//       } else if (type === 'option' && index !== null) {
//         setFormData(prev => {
//           const newOptions = [...prev.options];
//           newOptions[index] = { ...newOptions[index], image: imageUrl };
//           return { ...prev, options: newOptions };
//         });
//       } else if (type === 'explanation') {
//         setFormData(prev => ({
//           ...prev,
//           explanation: { ...prev.explanation, images: [imageUrl] }
//         }));
//       }
//       toast({ title: 'Uploaded Successfully!', status: 'success' });
//     } catch (err) {
//       toast({ title: 'Upload failed', description: err.response?.data?.message, status: 'error' });
//     }
//   };

//   const handleCreate = async () => {
//     if (!formData.chapterId) return toast({ title: 'Please select chapter', status: 'warning' });
    
//     setLoading(true);
//     try {
//       // Backend expects correctAnswer as Number, question/explanation as Objects
//       await axios.post(`${baseUrl}api/admin/mcqs`, formData, { headers });
//       toast({ title: 'MCQ Created!', status: 'success' });
//       setFormData(initialFormState);
//       fetchData();
//     } catch (err) {
//       toast({ title: 'Error creating MCQ', description: err.response?.data?.message, status: 'error' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm('Are you sure you want to delete this MCQ?')) {
//       try {
//         await axios.delete(`${baseUrl}api/admin/mcqs/${id}`, { headers });
//         toast({ title: 'MCQ Deleted', status: 'info' });
//         fetchData();
//       } catch (err) {
//         toast({ title: 'Delete failed', status: 'error' });
//       }
//     }
//   };

//   const filteredData = mcqs.filter((m) =>
//     m.question?.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     m.chapterId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <Box pt={{ base: '130px', md: '80px' }}>
//       <Card mb="20px" p="20px">
//         <Text color={textColor} fontSize="22px" fontWeight="700" mb="20px">Add MCQ (Image Upload Fixed)</Text>
        
//         <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
//           <VStack align="stretch" spacing={4}>
//             <FormControl isRequired>
//               <FormLabel fontWeight="700">Chapter & Tag</FormLabel>
//               <HStack>
//                 <Select placeholder="Chapter" value={formData.chapterId} onChange={(e) => setFormData({ ...formData, chapterId: e.target.value })}>
//                   {chapters.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
//                 </Select>
//                 <Select placeholder="Tag (Optional)" value={formData.tagId} onChange={(e) => setFormData({ ...formData, tagId: e.target.value })}>
//                   {tags.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
//                 </Select>
//               </HStack>
//             </FormControl>

//             <FormControl>
//               <FormLabel fontWeight="700">Question Content</FormLabel>
//               <Textarea placeholder="Question Text" mb="2" value={formData.question.text} onChange={(e) => setFormData({ ...formData, question: { ...formData.question, text: e.target.value } })} />
              
//               <HStack>
//                 <InputGroup size="sm">
//                   <InputLeftElement children={<MdLink />} />
//                   <Input placeholder="Image URL (Manual)" value={formData.question.images[0] || ''} onChange={(e) => setFormData({ ...formData, question: { ...formData.question, images: [e.target.value] } })} />
//                 </InputGroup>
//                 <Button as="label" leftIcon={<MdCloudUpload />} size="sm" cursor="pointer" colorScheme="blue">
//                   Upload <input type="file" hidden onChange={(e) => handleImageUpload(e, 'question')} />
//                 </Button>
//               </HStack>
//               {formData.question.images[0] && <Image src={formData.question.images[0]} maxH="100px" mt="2" borderRadius="md" />}
//             </FormControl>
//           </VStack>

//           <Box>
//             <FormLabel fontWeight="700">Options (Select Radio for Correct)</FormLabel>
//             {formData.options.map((opt, idx) => (
//               <Box key={idx} p="2" mb="2" borderWidth="1px" borderRadius="md" borderColor={formData.correctAnswer === idx ? "green.400" : "gray.200"} bg={formData.correctAnswer === idx ? "green.50" : "transparent"}>
//                 <Flex align="center" gap={3}>
//                   <input type="radio" name="mcq-option" checked={formData.correctAnswer === idx} onChange={() => setFormData({...formData, correctAnswer: idx})} />
//                   <VStack flex="1" spacing={1}>
//                     <Input size="sm" variant="flushed" placeholder={`Option ${idx + 1} text`} value={opt.text} onChange={(e) => {
//                       const newOpt = [...formData.options]; newOpt[idx].text = e.target.value; setFormData({...formData, options: newOpt});
//                     }} />
//                     <HStack w="full">
//                       <Input size="xs" placeholder="Option Img URL" value={opt.image || ''} onChange={(e) => {
//                          const newOpt = [...formData.options]; newOpt[idx].image = e.target.value; setFormData({...formData, options: newOpt});
//                       }} />
//                       <IconButton size="xs" icon={<MdCloudUpload />} colorScheme="teal" as="label"><input type="file" hidden onChange={(e) => handleImageUpload(e, 'option', idx)} /></IconButton>
//                     </HStack>
//                     {opt.image && <Image src={opt.image} maxH="50px" mt="1" borderRadius="sm" />}
//                   </VStack>
//                 </Flex>
//               </Box>
//             ))}
//           </Box>
//         </SimpleGrid>

//         <FormControl mt="6">
//           <FormLabel fontWeight="700">Explanation (Text & Image)</FormLabel>
//           <Box bg="white" color="black" borderRadius="md" mb="2" border="1px solid #E2E8F0">
//             <ReactQuill theme="snow" value={formData.explanation.text} onChange={(val) => setFormData({...formData, explanation: {...formData.explanation, text: val}})} />
//           </Box>
//           <HStack mt="2">
//             <Input size="sm" placeholder="Explanation Image URL" value={formData.explanation.images[0] || ''} onChange={(e) => setFormData({...formData, explanation: {...formData.explanation, images: [e.target.value]}})} />
//             <Button as="label" leftIcon={<MdCloudUpload />} size="sm" colorScheme="blue">Upload <input type="file" hidden onChange={(e) => handleImageUpload(e, 'explanation')} /></Button>
//           </HStack>
//           {formData.explanation.images[0] && <Image src={formData.explanation.images[0]} maxH="100px" mt="2" borderRadius="md" />}
//         </FormControl>

//         <Button colorScheme="brand" mt="6" w="full" onClick={handleCreate} isLoading={loading} size="lg">Create MCQ</Button>
//       </Card>

//       {/* List section is fine, keeping your logic for display */}
//       <Card p="20px">
//         <InputGroup mb="5">
//           <InputLeftElement children={<MdSearch />} />
//           <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
//         </InputGroup>
//         <VStack spacing={6} align="stretch">
//           {filteredData.map((item, index) => (
//             <Box key={item._id} p="5" borderWidth="1px" borderRadius="xl" bg={listBg} shadow="sm">
//               <Flex justify="space-between" align="start">
//                 <HStack mb="3">
//                   <Badge colorScheme="blue">{item.chapterId?.name}</Badge>
//                   <Badge colorScheme="purple">{item.tagId?.name || 'No Tag'}</Badge>
//                 </HStack>
//                 <IconButton size="sm" colorScheme="red" variant="ghost" icon={<MdDelete />} onClick={() => handleDelete(item._id)} />
//               </Flex>
//               <Text fontWeight="700" fontSize="lg" color={textColor}>{index + 1}. {item.question?.text}</Text>
//               {item.question?.images?.[0] && <Image src={item.question.images[0]} maxH="200px" my="3" borderRadius="md" />}
              
//               <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} mt="4">
//                 {item.options?.map((opt, i) => (
//                   <Box key={i} p="3" borderRadius="md" border="1px solid" borderColor={item.correctAnswer === i ? "green.400" : optionBorderColor} bg={item.correctAnswer === i ? "green.50" : "transparent"}>
//                     <Text fontWeight="600">{i+1}. {opt.text}</Text>
//                     {opt.image && <Image src={opt.image} maxH="80px" mt="2" />}
//                   </Box>
//                 ))}
//               </SimpleGrid>
//             </Box>
//           ))}
//         </VStack>
//       </Card>
//     </Box>
//   );
// }
// 'use client';

// import React, { useState, useEffect } from 'react';
// import {
//   Box, Flex, Text, useColorModeValue, Button, Input, FormControl, FormLabel,
//   useToast, IconButton, Select, Badge, Textarea, SimpleGrid,
//   VStack, Image, HStack, InputGroup, InputLeftElement,
//   Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon
// } from '@chakra-ui/react';
// import { MdDelete, MdSearch, MdCloudUpload, MdImage, MdCheckCircle } from 'react-icons/md';
// import axios from 'axios';
// import Card from 'components/card/Card';
// import ReactQuill from 'react-quill-new';
// import 'react-quill-new/dist/quill.snow.css';

// export default function MCQManagement() {
//   const [chapters, setChapters] = useState([]);
//   const [tags, setTags] = useState([]); // ✅ Tags state added
//   const [mcqs, setMcqs] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [loading, setLoading] = useState(false);

//   const textColor = useColorModeValue('secondaryGray.900', 'white');
//   const listBg = useColorModeValue('white', 'navy.800');
//   const optionBorderColor = useColorModeValue('gray.200', 'whiteAlpha.300');

//   const toast = useToast();
//   const rawBaseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';
//   const baseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
//   const token = localStorage.getItem('token');
//   const headers = { Authorization: `Bearer ${token}` };

//   const getImageUrl = (path) => {
//     if (!path) return "";
//     if (path.startsWith('http')) return path;
//     const cleanPath = path.startsWith('/') ? path.slice(1) : path;
//     return `${baseUrl}/${cleanPath}`;
//   };

//   const initialFormState = {
//     chapterId: '',
//     tagId: '', // ✅ Tag ID field
//     questionText: '',
//     questionFile: null,
//     options: [
//       { text: '', file: null }, { text: '', file: null },
//       { text: '', file: null }, { text: '', file: null }
//     ],
//     correctAnswer: 0,
//     explanationText: '',
//     explanationFile: null,
//     difficulty: 'medium',
//     marks: 4,
//     negativeMarks: 1,
//   };

//   const [formData, setFormData] = useState(initialFormState);

//   const fetchData = async () => {
//     try {
//       const [chapRes, tagRes, mcqRes] = await Promise.all([
//         axios.get(`${baseUrl}/api/admin/chapters`, { headers }),
//         axios.get(`${baseUrl}/api/admin/tags`, { headers }), // ✅ Fetch tags
//         axios.get(`${baseUrl}/api/admin/mcqs`, { headers }),
//       ]);
//       setChapters(chapRes.data.data || []);
//       setTags(tagRes.data.data || []); // ✅ Set tags state
//       setMcqs(mcqRes.data.data || []);
//     } catch (err) {
//       toast({ title: 'Data load error', status: 'error' });
//     }
//   };

//   useEffect(() => { fetchData(); }, []);

//   const handleFileChange = (e, type, index = null) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     if (type === 'question') setFormData(prev => ({ ...prev, questionFile: file }));
//     else if (type === 'explanation') setFormData(prev => ({ ...prev, explanationFile: file }));
//     else if (type === 'option' && index !== null) {
//       const newOptions = [...formData.options];
//       newOptions[index].file = file;
//       setFormData(prev => ({ ...prev, options: newOptions }));
//     }
//   };

//   const handleCreate = async () => {
//     if (!formData.chapterId) return toast({ title: 'Select Chapter', status: 'warning' });
//     setLoading(true);
//     const data = new FormData();
//     data.append('chapterId', formData.chapterId);
//     data.append('tagId', formData.tagId); // ✅ Append tagId
//     data.append('correctAnswer', formData.correctAnswer);
//     data.append('difficulty', formData.difficulty);
//     data.append('marks', formData.marks);
//     data.append('question', JSON.stringify({ text: formData.questionText }));
//     data.append('explanation', JSON.stringify({ text: formData.explanationText }));
//     data.append('options', JSON.stringify(formData.options.map(o => ({ text: o.text }))));

//     if (formData.questionFile) data.append('questionImages', formData.questionFile);
//     if (formData.explanationFile) data.append('explanationImages', formData.explanationFile);
//     formData.options.forEach((opt, idx) => {
//       if (opt.file) data.append(`optionImage_${idx}`, opt.file);
//     });

//     try {
//       await axios.post(`${baseUrl}/api/admin/mcqs`, data, { headers: { ...headers, 'Content-Type': 'multipart/form-data' } });
//       toast({ title: 'MCQ Created!', status: 'success' });
//       setFormData(initialFormState);
//       fetchData();
//     } catch (err) {
//       toast({ title: 'Error', description: err.response?.data?.message, status: 'error' });
//     } finally { setLoading(false); }
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm('Delete this MCQ?')) {
//       try {
//         await axios.delete(`${baseUrl}/api/admin/mcqs/${id}`, { headers });
//         fetchData();
//         toast({ title: 'MCQ Deleted', status: 'info' });
//       } catch (err) { toast({ title: 'Delete failed', status: 'error' }); }
//     }
//   };

//   const filteredMCQs = mcqs.filter(m => 
//     m.question?.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     m.chapterId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <Box pt={{ base: '130px', md: '80px' }}>
//       <Card mb="20px" p="20px">
//         <Text color={textColor} fontSize="22px" fontWeight="700" mb="20px">Add New MCQ</Text>
//         <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
//           <VStack align="stretch" spacing={5}>
//             <FormControl isRequired>
//               <FormLabel fontWeight="600">Chapter, Tag & Difficulty</FormLabel>
//               <VStack spacing={3}>
//                 <Select placeholder="Select Chapter" value={formData.chapterId} onChange={(e) => setFormData({ ...formData, chapterId: e.target.value })}>
//                   {chapters.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
//                 </Select>
                
//                 {/* ✅ TAG SELECTION OPTION */}
//                 <Select placeholder="Select Tag (Optional)" value={formData.tagId} onChange={(e) => setFormData({ ...formData, tagId: e.target.value })}>
//                   {tags.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
//                 </Select>

//                 <Select value={formData.difficulty} onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}>
//                   <option value="easy">Easy</option>
//                   <option value="medium">Medium</option>
//                   <option value="hard">Hard</option>
//                 </Select>
//               </VStack>
//             </FormControl>
            
//             <FormControl>
//               <FormLabel fontWeight="600">Question</FormLabel>
//               <Textarea placeholder="Question Text" value={formData.questionText} onChange={(e) => setFormData({ ...formData, questionText: e.target.value })} />
//               <Button as="label" mt="2" size="sm" leftIcon={<MdCloudUpload />} colorScheme="blue" cursor="pointer">
//                 {formData.questionFile ? "Image Selected" : "Upload Image"}
//                 <input type="file" hidden onChange={(e) => handleFileChange(e, 'question')} />
//               </Button>
//             </FormControl>

//             <FormControl>
//               <FormLabel fontWeight="600">Explanation</FormLabel>
//               <Box bg="white" color="black" borderRadius="md" border="1px solid #E2E8F0">
//                 <ReactQuill theme="snow" value={formData.explanationText} onChange={(val) => setFormData({...formData, explanationText: val})} />
//               </Box>
//               <Button as="label" mt="2" size="sm" leftIcon={<MdImage />} variant="outline">
//                 {formData.explanationFile ? "Exp. Image Selected" : "Upload Exp. Image"}
//                 <input type="file" hidden onChange={(e) => handleFileChange(e, 'explanation')} />
//               </Button>
//             </FormControl>
//           </VStack>

//           <Box>
//             <FormLabel fontWeight="600">Options</FormLabel>
//             {formData.options.map((opt, idx) => (
//               <Box key={idx} p="3" mb="3" border="1px solid" borderRadius="lg" borderColor={formData.correctAnswer === idx ? "green.400" : optionBorderColor} bg={formData.correctAnswer === idx ? "green.50" : "transparent"}>
//                 <Flex align="center" gap={3}>
//                   <input type="radio" checked={formData.correctAnswer === idx} onChange={() => setFormData({...formData, correctAnswer: idx})} />
//                   <VStack flex="1" align="stretch">
//                     <Input variant="unstyled" placeholder={`Option ${idx + 1}`} value={opt.text} onChange={(e) => {
//                       const newOpts = [...formData.options]; newOpts[idx].text = e.target.value; setFormData({...formData, options: newOpts});
//                     }} />
//                     <Button as="label" size="xs" variant="ghost" leftIcon={<MdCloudUpload />}>
//                       {opt.file ? "Selected" : "Image"}
//                       <input type="file" hidden onChange={(e) => handleFileChange(e, 'option', idx)} />
//                     </Button>
//                   </VStack>
//                 </Flex>
//               </Box>
//             ))}
//           </Box>
//         </SimpleGrid>
//         <Button colorScheme="brand" mt="10" w="full" size="lg" onClick={handleCreate} isLoading={loading}>Save MCQ</Button>
//       </Card>

//       {/* SECTION 2: LIST VIEW */}
//       <Card p="20px">
//         <Flex justify="space-between" align="center" mb="5">
//             <Text fontSize="xl" fontWeight="700">MCQ List</Text>
//             <InputGroup maxW="300px">
//                 <InputLeftElement children={<MdSearch />} />
//                 <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
//             </InputGroup>
//         </Flex>

//         <VStack spacing={5} align="stretch">
//           {filteredMCQs.map((item, index) => (
//             <Box key={item._id} p="5" borderWidth="1px" borderRadius="xl" bg={listBg}>
//               <Flex justify="space-between" mb="3">
//                 <HStack>
//                   <Badge colorScheme="purple">{item.chapterId?.name}</Badge>
//                   {/* ✅ SHOW TAG IN LIST */}
//                   {item.tagId && <Badge colorScheme="orange">{item.tagId?.name}</Badge>}
//                   <Badge colorScheme="teal">{item.difficulty}</Badge>
//                 </HStack>
//                 <IconButton size="sm" colorScheme="red" variant="ghost" icon={<MdDelete />} onClick={() => handleDelete(item._id)} />
//               </Flex>

//               <Text fontWeight="700" mb="3">Q{index + 1}. {item.question?.text}</Text>

//               {item.question?.images?.[0] && (
//                 <Image src={getImageUrl(item.question.images[0])} maxH="200px" borderRadius="md" mb="4" />
//               )}

//               <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
//                 {item.options?.map((opt, i) => (
//                   <Flex key={i} p="3" borderRadius="lg" border="1px solid" borderColor={item.correctAnswer === i ? "green.400" : optionBorderColor} bg={item.correctAnswer === i ? "green.50" : "transparent"}>
//                     <Box flex="1">
//                         <Text fontSize="sm"><b>{String.fromCharCode(65 + i)}.</b> {opt.text}</Text>
//                         {opt.image && <Image src={getImageUrl(opt.image)} maxH="80px" mt="2" borderRadius="md" />}
//                     </Box>
//                     {item.correctAnswer === i && <MdCheckCircle color="green" />}
//                   </Flex>
//                 ))}
//               </SimpleGrid>

//               <Accordion allowToggle mt="4">
//                 <AccordionItem border="none">
//                   <AccordionButton p="0"><Box flex="1" textAlign="left" color="blue.500" fontSize="sm">Show Explanation</Box><AccordionIcon /></AccordionButton>
//                   <AccordionPanel>
//                     <div dangerouslySetInnerHTML={{ __html: item.explanation?.text }} />
//                     {item.explanation?.images?.[0] && <Image src={getImageUrl(item.explanation.images[0])} maxH="150px" mt="2" borderRadius="md" />}
//                   </AccordionPanel>
//                 </AccordionItem>
//               </Accordion>
//             </Box>
//           ))}
//         </VStack>
//       </Card>
//     </Box>
//   );
// }

'use client';

import React, { useState, useEffect } from 'react';
import {
  Box, Flex, Text, useColorModeValue, Button, Input, FormControl, FormLabel,
  useToast, IconButton, Select, Badge, Textarea, SimpleGrid,
  VStack, Image, HStack, InputGroup, InputLeftElement,
  Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
  Divider, Grid, GridItem, Icon
} from '@chakra-ui/react';
import { 
  MdDelete, MdSearch, MdCloudUpload, MdImage, MdCheckCircle, 
  MdHelpOutline, MdLayers, MdEqualizer, MdAddCircle 
} from 'react-icons/md';
import axios from 'axios';
import Card from 'components/card/Card';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

export default function MCQManagement() {
  // --- COLORS & THEME (Hooks called at top level to avoid errors) ---
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const secondaryColor = useColorModeValue('gray.600', 'gray.400');
  const listBg = useColorModeValue('white', 'navy.800');
  const optionBorderColor = useColorModeValue('gray.200', 'whiteAlpha.300');
  const brandColor = useColorModeValue('brand.500', 'brand.400');
  const inputBg = useColorModeValue('gray.50', 'navy.900');
  const optionSelectedBg = useColorModeValue("green.50", "green.900");
  const explanationBg = useColorModeValue('gray.50', 'navy.900');

  // --- STATES ---
  const [chapters, setChapters] = useState([]);
  const [tags, setTags] = useState([]);
  const [mcqs, setMcqs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const toast = useToast();
  const rawBaseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';
  const baseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const getImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${baseUrl}/${cleanPath}`;
  };

  const initialFormState = {
    chapterId: '',
    tagId: '',
    questionText: '',
    questionFile: null,
    options: [
      { text: '', file: null }, { text: '', file: null },
      { text: '', file: null }, { text: '', file: null }
    ],
    correctAnswer: 0,
    explanationText: '',
    explanationFile: null,
    difficulty: 'medium',
    marks: 4,
    negativeMarks: 1,
  };

  const [formData, setFormData] = useState(initialFormState);

  // --- FUNCTIONS ---
  const fetchData = async () => {
    try {
      const [chapRes, tagRes, mcqRes] = await Promise.all([
        axios.get(`${baseUrl}/api/admin/chapters`, { headers }),
        axios.get(`${baseUrl}/api/admin/tags`, { headers }),
        axios.get(`${baseUrl}/api/admin/mcqs`, { headers }),
      ]);
      setChapters(chapRes.data.data || []);
      setTags(tagRes.data.data || []);
      setMcqs(mcqRes.data.data || []);
    } catch (err) {
      toast({ title: 'Data load error', status: 'error' });
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleFileChange = (e, type, index = null) => {
    const file = e.target.files[0];
    if (!file) return;
    if (type === 'question') setFormData(prev => ({ ...prev, questionFile: file }));
    else if (type === 'explanation') setFormData(prev => ({ ...prev, explanationFile: file }));
    else if (type === 'option' && index !== null) {
      const newOptions = [...formData.options];
      newOptions[index].file = file;
      setFormData(prev => ({ ...prev, options: newOptions }));
    }
  };

  const handleCreate = async () => {
    if (!formData.chapterId) return toast({ title: 'Select Chapter', status: 'warning' });
    setLoading(true);
    const data = new FormData();
    data.append('chapterId', formData.chapterId);
    data.append('tagId', formData.tagId);
    data.append('correctAnswer', formData.correctAnswer);
    data.append('difficulty', formData.difficulty);
    data.append('marks', formData.marks);
    data.append('question', JSON.stringify({ text: formData.questionText }));
    data.append('explanation', JSON.stringify({ text: formData.explanationText }));
    data.append('options', JSON.stringify(formData.options.map(o => ({ text: o.text }))));

    if (formData.questionFile) data.append('questionImages', formData.questionFile);
    if (formData.explanationFile) data.append('explanationImages', formData.explanationFile);
    formData.options.forEach((opt, idx) => {
      if (opt.file) data.append(`optionImage_${idx}`, opt.file);
    });

    try {
      await axios.post(`${baseUrl}/api/admin/mcqs`, data, { headers: { ...headers, 'Content-Type': 'multipart/form-data' } });
      toast({ title: 'MCQ Created!', status: 'success' });
      setFormData(initialFormState);
      fetchData();
    } catch (err) {
      toast({ title: 'Error', description: err.response?.data?.message, status: 'error' });
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this MCQ?')) {
      try {
        await axios.delete(`${baseUrl}/api/admin/mcqs/${id}`, { headers });
        fetchData();
        toast({ title: 'MCQ Deleted', status: 'info' });
      } catch (err) { toast({ title: 'Delete failed', status: 'error' }); }
    }
  };

  const filteredMCQs = mcqs.filter(m => 
    m.question?.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.chapterId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box pt={{ base: '130px', md: '80px' }} px="20px">
      {/* SECTION 1: ADD MCQ FORM */}
      <Card mb="30px" p="25px">
        <Flex align="center" mb="25px">
            <Icon as={MdAddCircle} color={brandColor} w="28px" h="28px" me="12px" />
            <Text color={textColor} fontSize="22px" fontWeight="700">Create MCQ</Text>
        </Flex>
        
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={10}>
          <VStack align="stretch" spacing={6}>
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem colSpan={{base: 2, md: 1}}>
                    <FormControl isRequired>
                      <FormLabel fontSize="sm" fontWeight="700" color={secondaryColor}><Icon as={MdLayers} me="1" /> Chapter</FormLabel>
                      <Select variant="filled" placeholder="Select Chapter" value={formData.chapterId} onChange={(e) => setFormData({ ...formData, chapterId: e.target.value })}>
                        {chapters.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                      </Select>
                    </FormControl>
                </GridItem>
                <GridItem colSpan={{base: 2, md: 1}}>
                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="700" color={secondaryColor}>Tag (Optional)</FormLabel>
                      <Select variant="filled" placeholder="Select Tag" value={formData.tagId} onChange={(e) => setFormData({ ...formData, tagId: e.target.value })}>
                        {tags.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                      </Select>
                    </FormControl>
                </GridItem>
            </Grid>

            <FormControl>
              <FormLabel fontSize="sm" fontWeight="700" color={secondaryColor}><Icon as={MdEqualizer} me="1" /> Difficulty</FormLabel>
              <Select variant="filled" value={formData.difficulty} onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}>
                <option value="easy">🟢 Easy</option>
                <option value="medium">🟡 Medium</option>
                <option value="hard">🔴 Hard</option>
              </Select>
            </FormControl>
            
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="700" color={secondaryColor}><Icon as={MdHelpOutline} me="1" /> Question Text</FormLabel>
              <Textarea borderRadius="12px" minH="120px" variant="auth" placeholder="Write your question here..." value={formData.questionText} onChange={(e) => setFormData({ ...formData, questionText: e.target.value })} />
              <Button as="label" mt="2" size="sm" leftIcon={<MdCloudUpload />} colorScheme="brand" variant="subtle" cursor="pointer">
                {formData.questionFile ? "Image Attached" : "Upload Question Image"}
                <input type="file" hidden onChange={(e) => handleFileChange(e, 'question')} />
              </Button>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm" fontWeight="700" color={secondaryColor}>Detailed Explanation</FormLabel>
              <Box borderRadius="12px" overflow="hidden" border="1px solid" borderColor={optionBorderColor} bg="white">
                <ReactQuill theme="snow" value={formData.explanationText} onChange={(val) => setFormData({...formData, explanationText: val})} />
              </Box>
              <Button as="label" mt="2" size="sm" leftIcon={<MdImage />} variant="outline" fontSize="xs">
                {formData.explanationFile ? "Exp. Image Ready" : "Add Explanation Image"}
                <input type="file" hidden onChange={(e) => handleFileChange(e, 'explanation')} />
              </Button>
            </FormControl>
          </VStack>

          <Box bg={inputBg} p="6" borderRadius="20px">
            <FormLabel fontSize="md" fontWeight="700" mb="4">Answer Options</FormLabel>
            {formData.options.map((opt, idx) => (
              <Box key={idx} p="4" mb="4" border="2px solid" borderRadius="16px" 
                borderColor={formData.correctAnswer === idx ? "green.400" : optionBorderColor} 
                bg={formData.correctAnswer === idx ? (formData.correctAnswer === idx ? "green.50" : "transparent") : listBg}
                transition="all 0.2s">
                <Flex align="center" gap={4}>
                  <input type="radio" checked={formData.correctAnswer === idx} onChange={() => setFormData({...formData, correctAnswer: idx})} />
                  <VStack flex="1" align="stretch" spacing={2}>
                    <Input variant="unstyled" fontWeight="600" fontSize="sm" placeholder={`Option ${String.fromCharCode(65 + idx)}...`} value={opt.text} onChange={(e) => {
                      const newOpts = [...formData.options]; newOpts[idx].text = e.target.value; setFormData({...formData, options: newOpts});
                    }} />
                    <Button as="label" size="xs" variant="ghost" colorScheme="blue" p="0" justifyContent="flex-start" leftIcon={<MdCloudUpload />}>
                      {opt.file ? "Image Attached" : "Add Option Image"}
                      <input type="file" hidden onChange={(e) => handleFileChange(e, 'option', idx)} />
                    </Button>
                  </VStack>
                </Flex>
              </Box>
            ))}
            <Button colorScheme="brand" mt="4" w="full" size="lg" onClick={handleCreate} isLoading={loading}>SAVE MCQ DATA</Button>
          </Box>
        </SimpleGrid>
      </Card>

      {/* SECTION 2: LIST VIEW */}
      <Card p="25px">
        <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "start", md: "center" }} mb="30px" gap="4">
            <Box>
                <Text fontSize="22px" fontWeight="700" color={textColor}>MCQ Repository</Text>
            </Box>
            <InputGroup maxW="350px">
                <InputLeftElement children={<MdSearch color="gray.400" />} />
                <Input borderRadius="full" variant="filled" placeholder="Search chapter or question..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </InputGroup>
        </Flex>

        <VStack spacing={6} align="stretch">
          {filteredMCQs.map((item, index) => (
            <Box key={item._id} p="6" borderRadius="20px" border="1px solid" borderColor={optionBorderColor} bg={listBg} shadow="sm">
              <Flex justify="space-between" mb="4">
                <HStack spacing={2}>
                  <Badge borderRadius="full" px="3" colorScheme="purple">{item.chapterId?.name}</Badge>
                  {item.tagId && <Badge borderRadius="full" px="3" colorScheme="orange" variant="outline">{item.tagId?.name}</Badge>}
                  <Badge borderRadius="full" px="3" colorScheme={item.difficulty === 'hard' ? 'red' : 'green'}>{item.difficulty}</Badge>
                </HStack>
                <IconButton size="sm" colorScheme="red" variant="subtle" icon={<MdDelete />} onClick={() => handleDelete(item._id)} />
              </Flex>

              <Text fontSize="lg" fontWeight="700" mb="4" color={textColor}>
                Q{index + 1}. {item.question?.text}
              </Text>

              {item.question?.images?.[0] && (
                <Image src={getImageUrl(item.question.images[0])} maxH="250px" borderRadius="15px" mb="4" border="1px solid" borderColor={optionBorderColor} />
              )}

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb="4">
                {item.options?.map((opt, i) => (
                  <Flex key={i} p="4" borderRadius="15px" border="1px solid" 
                    borderColor={item.correctAnswer === i ? "green.400" : optionBorderColor} 
                    bg={item.correctAnswer === i ? optionSelectedBg : "transparent"}
                    align="center">
                    <Box flex="1">
                        <Text fontSize="sm"><b>{String.fromCharCode(65 + i)}.</b> {opt.text}</Text>
                        {opt.image && <Image src={getImageUrl(opt.image)} maxH="100px" mt="2" borderRadius="8px" />}
                    </Box>
                    {item.correctAnswer === i && <Icon as={MdCheckCircle} color="green.500" w="18px" h="18px" />}
                  </Flex>
                ))}
              </SimpleGrid>

              <Accordion allowToggle>
                <AccordionItem border="none">
                  <AccordionButton p="0"><Box flex="1" textAlign="left" color="brand.500" fontWeight="700">Show Solution</Box><AccordionIcon /></AccordionButton>
                  <AccordionPanel pb="4" mt="2" bg={explanationBg} borderRadius="12px">
                    <div dangerouslySetInnerHTML={{ __html: item.explanation?.text }} />
                    {item.explanation?.images?.[0] && <Image src={getImageUrl(item.explanation.images[0])} maxH="200px" mt="3" borderRadius="12px" />}
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            </Box>
          ))}
        </VStack>
      </Card>
    </Box>
  );
}