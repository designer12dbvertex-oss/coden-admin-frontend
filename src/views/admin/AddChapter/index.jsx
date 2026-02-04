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
//   Progress,
//   Image,
//   Switch,
// } from '@chakra-ui/react';
// import { MdEdit, MdDelete, MdSearch } from 'react-icons/md';
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import Card from 'components/card/Card';

// export default function ChapterManagement() {
//   const [courses, setCourses] = useState([]); // ✅ ADD

//   const [subjects, setSubjects] = useState([]);
//   const [subSubjects, setSubSubjects] = useState([]);
//   const [topics, setTopics] = useState([]);
//   const [chapters, setChapters] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [loading, setLoading] = useState(false);

//   // Image State
//   const [chapterImage, setChapterImage] = useState(null);

//   // Form State (Backend-aligned)
//   const [formData, setFormData] = useState({
//     courseId: '',
//     subjectId: '',
//     subSubjectId: '',
//     topicId: '',
//     name: '',
//     description: '',
//     weightage: 0,
//     order: 0,
//     targetMcqs: 50,
//     isFreePreview: false,
//   });

//   const [editData, setEditData] = useState(null);
//   const { isOpen, onOpen, onClose } = useDisclosure();
//   const textColor = useColorModeValue('secondaryGray.900', 'white');
//   const toast = useToast();

//   const baseUrl = process.env.REACT_APP_BASE_URL;
//   const token = localStorage.getItem('token');
//   const headers = { Authorization: `Bearer ${token}` };

//   // 🔹 Fetch Subjects + Chapters
//   const fetchData = async () => {
//     try {
//       const [courseRes, subjectRes, chapterRes] = await Promise.all([
//         axios.get(`${baseUrl}api/admin/courses`, { headers }),
//         axios.get(`${baseUrl}api/admin/subjects`, { headers }),
//         axios.get(`${baseUrl}api/admin/chapters`, { headers }),
//       ]);

//       setCourses(courseRes.data.data || []); // ✅ FIXED
//       setSubjects(subjectRes.data.data || []);
//       setChapters(chapterRes.data.data || []);
//     } catch (err) {
//       toast({ title: 'Data load error', status: 'error' });
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);
//   const handleCourseChange = async (courseId) => {
//     setFormData({
//       ...formData,
//       courseId,
//       subjectId: '',
//       subSubjectId: '',
//       topicId: '',
//     });

//     setSubjects([]);
//     setSubSubjects([]);
//     setTopics([]);

//     if (!courseId) return;

//     try {
//       const res = await axios.get(
//         `${baseUrl}api/admin/subjects?courseId=${courseId}`,
//         { headers },
//       );
//       setSubjects(res.data.data || []);
//     } catch (err) {
//       toast({ title: 'Subject load error', status: 'error' });
//     }
//   };

//   // 🔹 Load Sub-Subjects when Subject changes
//   const handleSubjectChange = async (subjectId) => {
//     setFormData({
//       ...formData,
//       subjectId,
//       subSubjectId: '',
//       topicId: '',
//     });

//     setSubSubjects([]);
//     setTopics([]);

//     if (!subjectId) return;

//     try {
//       const res = await axios.get(
//         `${baseUrl}api/admin/sub-subjects?subjectId=${subjectId}`,
//         { headers },
//       );
//       setSubSubjects(res.data.data || []);
//     } catch (err) {
//       toast({ title: 'Sub-Subject load error', status: 'error' });
//     }
//   };

//   // 🔹 Load Topics when Sub-Subject changes
//   const handleSubSubjectChange = async (ssId) => {
//     setFormData({ ...formData, subSubjectId: ssId, topicId: '' });
//     setTopics([]);

//     if (!ssId) return;

//     try {
//       const res = await axios.get(
//         `${baseUrl}api/admin/topics/sub-subject/${ssId}`,
//         { headers },
//       );
//       setTopics(res.data.data || []);
//     } catch (err) {
//       toast({ title: 'Topic load error', status: 'error' });
//     }
//   };

//   // 🔹 CREATE CHAPTER
//   const handleCreate = async () => {
//     if (
//       !formData.courseId ||
//       !formData.subjectId ||
//       !formData.subSubjectId ||
//       !formData.topicId ||
//       !formData.name
//     ) {
//       return toast({
//         title: 'Subject, Sub-Subject, Topic and Name required',
//         status: 'warning',
//       });
//     }

//     setLoading(true);
//     try {
//       const payload = new FormData();

//       Object.keys(formData).forEach((key) =>
//         payload.append(key, formData[key]),
//       );

//       if (chapterImage) {
//         payload.append('image', chapterImage);
//       }

//       await axios.post(`${baseUrl}api/admin/chapters`, payload, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'multipart/form-data',
//         },
//       });

//       toast({ title: 'Chapter Created!', status: 'success' });

//       setFormData({
//         courseId: '',
//         subjectId: '',
//         subSubjectId: '',
//         topicId: '',
//         name: '',
//         description: '',
//         weightage: 0,
//         order: 0,
//         targetMcqs: 50,
//         isFreePreview: false,
//       });

//       setChapterImage(null);
//       setSubSubjects([]);
//       setTopics([]);
//       fetchData();
//     } catch (err) {
//       toast({
//         title: err.response?.data?.message || 'Create failed',
//         status: 'error',
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 🔹 UPDATE CHAPTER
//   const handleUpdate = async () => {
//     try {
//       const payload = new FormData();

//       payload.append(
//         'subSubjectId',
//         editData.subSubjectId?._id || editData.subSubjectId,
//       );
//       payload.append('topicId', editData.topicId?._id || editData.topicId);
//       payload.append('name', editData.name);
//       payload.append('description', editData.description || '');
//       payload.append('weightage', editData.weightage);
//       payload.append('order', editData.order);
//       payload.append('targetMcqs', editData.targetMcqs);
//       payload.append('isFreePreview', editData.isFreePreview);

//       if (editData.newImage) {
//         payload.append('image', editData.newImage);
//       }

//       await axios.patch(
//         `${baseUrl}api/admin/chapters/${editData._id}`,
//         payload,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'multipart/form-data',
//           },
//         },
//       );

//       toast({ title: 'Updated Successfully', status: 'success' });
//       onClose();
//       fetchData();
//     } catch (err) {
//       toast({ title: 'Update failed', status: 'error' });
//     }
//   };

//   // 🔹 DELETE CHAPTER
//   const handleDelete = async (id) => {
//     if (window.confirm('Are you sure?')) {
//       try {
//         await axios.delete(`${baseUrl}api/admin/chapters/${id}`, { headers });
//         toast({ title: 'Deleted', status: 'info' });
//         fetchData();
//       } catch (err) {
//         toast({ title: 'Delete failed', status: 'error' });
//       }
//     }
//   };

//   // 🔹 SEARCH FILTER
//   const filteredData = chapters.filter(
//     (c) =>
//       c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       c.subSubjectId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       c.topicId?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
//   );

//   return (
//     <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
//       {/* ADD CHAPTER CARD */}
//       <Card mb="20px" p="20px">
//         <Text color={textColor} fontSize="22px" fontWeight="700" mb="20px">
//           Add New Chapter
//         </Text>

//         <Flex gap="15px" wrap="wrap">
//           {/* COURSE ✅ */}
//           <FormControl width={{ base: '100%', md: '20%' }}>
//             <FormLabel fontSize="sm" fontWeight="700">
//               Course
//             </FormLabel>
//             <Select
//               placeholder="Select Course"
//               value={formData.courseId}
//               onChange={(e) => handleCourseChange(e.target.value)}
//             >
//               {courses.map((c) => (
//                 <option key={c._id} value={c._id}>
//                   {c.name}
//                 </option>
//               ))}
//             </Select>
//           </FormControl>

//           {/* SUBJECT */}
//           <FormControl width={{ base: '100%', md: '20%' }}>
//             <FormLabel fontSize="sm" fontWeight="700">
//               Subject
//             </FormLabel>
//             <Select
//               placeholder="Select Subject"
//               value={formData.subjectId}
//               onChange={(e) => handleSubjectChange(e.target.value)}
//               isDisabled={!formData.courseId}
//             >
//               {subjects.map((s) => (
//                 <option key={s._id} value={s._id}>
//                   {s.name}
//                 </option>
//               ))}
//             </Select>
//           </FormControl>

//           {/* SUB-SUBJECT */}
//           <FormControl width={{ base: '100%', md: '20%' }}>
//             <FormLabel fontSize="sm" fontWeight="700">
//               Sub-Subject
//             </FormLabel>
//             <Select
//               placeholder="Select Sub-Subject"
//               value={formData.subSubjectId}
//               onChange={(e) => handleSubSubjectChange(e.target.value)}
//               isDisabled={!formData.subjectId}
//             >
//               {subSubjects.map((s) => (
//                 <option key={s._id} value={s._id}>
//                   {s.name}
//                 </option>
//               ))}
//             </Select>
//           </FormControl>

//           {/* TOPIC */}
//           <FormControl width={{ base: '100%', md: '20%' }}>
//             <FormLabel fontSize="sm" fontWeight="700">
//               Topic
//             </FormLabel>
//             <Select
//               placeholder="Select Topic"
//               value={formData.topicId}
//               onChange={(e) =>
//                 setFormData({
//                   ...formData,
//                   topicId: e.target.value,
//                 })
//               }
//               isDisabled={!formData.subSubjectId}
//             >
//               {topics.map((t) => (
//                 <option key={t._id} value={t._id}>
//                   {t.name}
//                 </option>
//               ))}
//             </Select>
//           </FormControl>

//           {/* NAME */}
//           <FormControl width={{ base: '100%', md: '20%' }}>
//             <FormLabel fontSize="sm" fontWeight="700">
//               Chapter Name
//             </FormLabel>
//             <Input
//               value={formData.name}
//               onChange={(e) =>
//                 setFormData({
//                   ...formData,
//                   name: e.target.value,
//                 })
//               }
//               placeholder="Ex: Genetics"
//             />
//           </FormControl>

//           {/* DESCRIPTION ✅ */}
//           <FormControl width={{ base: '100%', md: '20%' }}>
//             <FormLabel fontSize="sm" fontWeight="700">
//               Description
//             </FormLabel>
//             <Input
//               value={formData.description}
//               onChange={(e) =>
//                 setFormData({
//                   ...formData,
//                   description: e.target.value,
//                 })
//               }
//               placeholder="Chapter description..."
//             />
//           </FormControl>

//           {/* IMAGE */}
//           <FormControl width={{ base: '100%', md: '20%' }}>
//             <FormLabel fontSize="sm" fontWeight="700">
//               Chapter Image
//             </FormLabel>
//             <Input
//               type="file"
//               accept="image/*"
//               onChange={(e) => setChapterImage(e.target.files[0])}
//               pt="1"
//             />
//           </FormControl>

//           <FormControl width={{ base: '100%', md: '15%' }}>
//             <FormLabel fontSize="sm" fontWeight="700">
//               Target MCQs
//             </FormLabel>
//             <Input
//               type="number"
//               value={formData.targetMcqs}
//               onChange={(e) =>
//                 setFormData({
//                   ...formData,
//                   targetMcqs: e.target.value,
//                 })
//               }
//             />
//           </FormControl>

//           <FormControl width={{ base: '100%', md: '10%' }}>
//             <FormLabel fontSize="sm" fontWeight="700">
//               Order
//             </FormLabel>
//             <Input
//               type="number"
//               value={formData.order}
//               onChange={(e) =>
//                 setFormData({
//                   ...formData,
//                   order: e.target.value,
//                 })
//               }
//             />
//           </FormControl>

//           <Button
//             colorScheme="brand"
//             mt="30px"
//             onClick={handleCreate}
//             isLoading={loading}
//           >
//             Save
//           </Button>
//         </Flex>
//       </Card>

//       {/* LIST TABLE */}
//       <Card p="20px">
//         <Flex justify="space-between" mb="20px">
//           <Text color={textColor} fontSize="18px" fontWeight="700">
//             Chapters
//           </Text>

//           <InputGroup maxW="300px">
//             <InputLeftElement children={<MdSearch />} />
//             <Input
//               placeholder="Search..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </InputGroup>
//         </Flex>

//         <Box overflowX="auto">
//           <Table variant="simple">
//             <Thead bg={useColorModeValue('gray.50', 'navy.800')}>
//               <Tr>
//                 <Th>Image</Th>
//                 <Th>Name</Th>
//                 <Th>Topic</Th>
//                 <Th>Sub-Subject</Th>
//                 <Th>QBank Target</Th>
//                 <Th>Actions</Th>
//               </Tr>
//             </Thead>

//             <Tbody>
//               {filteredData.map((item) => (
//                 <Tr key={item._id}>
//                   <Td>
//                     <Image
//                       src={
//                         item.image
//                           ? item.image.startsWith('http')
//                             ? item.image
//                             : `${baseUrl.replace(/\/$/, '')}${item.image}`
//                           : 'https://via.placeholder.com/50'
//                       }
//                       w="40px"
//                       h="40px"
//                       borderRadius="8px"
//                       objectFit="cover"
//                       fallbackSrc="https://via.placeholder.com/40"
//                     />
//                   </Td>

//                   <Td fontWeight="700">{item.name}</Td>

//                   <Td>
//                     <Badge colorScheme="orange">
//                       {item.topicId?.name || 'N/A'}
//                     </Badge>
//                   </Td>

//                   <Td>
//                     <Badge colorScheme="purple">
//                       {item.subSubjectId?.name || 'N/A'}
//                     </Badge>
//                   </Td>

//                   <Td minW="150px">
//                     <Text fontSize="xs" mb="1">
//                       Target: {item.targetMcqs || 50} MCQs
//                     </Text>
//                     <Progress
//                       value={((item.topicsCount || 0) / 10) * 100}
//                       size="xs"
//                       colorScheme="green"
//                       borderRadius="full"
//                     />
//                   </Td>

//                   <Td>
//                     <IconButton
//                       icon={<MdEdit />}
//                       onClick={() => {
//                         setEditData(item);
//                         onOpen();
//                       }}
//                       mr="2"
//                     />
//                     <IconButton
//                       icon={<MdDelete />}
//                       colorScheme="red"
//                       onClick={() => handleDelete(item._id)}
//                     />
//                   </Td>
//                 </Tr>
//               ))}
//             </Tbody>
//           </Table>
//         </Box>
//       </Card>

//       {/* EDIT MODAL */}
//       <Modal isOpen={isOpen} onClose={onClose}>
//         <ModalOverlay />
//         <ModalContent pb="4">
//           <ModalHeader>Edit Chapter</ModalHeader>
//           <ModalCloseButton />
//           <ModalBody>
//             {editData && (
//               <Flex direction="column" gap="4">
//                 <FormControl>
//                   <FormLabel>Chapter Name</FormLabel>
//                   <Input
//                     value={editData.name}
//                     onChange={(e) =>
//                       setEditData({
//                         ...editData,
//                         name: e.target.value,
//                       })
//                     }
//                   />
//                 </FormControl>

//                 <FormControl>
//                   <FormLabel>Topic</FormLabel>
//                   <Select
//                     value={editData.topicId?._id || editData.topicId}
//                     onChange={(e) =>
//                       setEditData({
//                         ...editData,
//                         topicId: e.target.value,
//                       })
//                     }
//                   >
//                     {topics.map((t) => (
//                       <option key={t._id} value={t._id}>
//                         {t.name}
//                       </option>
//                     ))}
//                   </Select>
//                 </FormControl>

//                 <FormControl>
//                   <FormLabel>Update Image</FormLabel>
//                   <Input
//                     type="file"
//                     accept="image/*"
//                     onChange={(e) =>
//                       setEditData({
//                         ...editData,
//                         newImage: e.target.files[0],
//                       })
//                     }
//                     pt="1"
//                   />
//                 </FormControl>

//                 <Flex gap="4">
//                   <FormControl>
//                     <FormLabel>Target MCQs</FormLabel>
//                     <Input
//                       type="number"
//                       value={editData.targetMcqs}
//                       onChange={(e) =>
//                         setEditData({
//                           ...editData,
//                           targetMcqs: e.target.value,
//                         })
//                       }
//                     />
//                   </FormControl>

//                   <FormControl>
//                     <FormLabel>Order</FormLabel>
//                     <Input
//                       type="number"
//                       value={editData.order}
//                       onChange={(e) =>
//                         setEditData({
//                           ...editData,
//                           order: e.target.value,
//                         })
//                       }
//                     />
//                   </FormControl>
//                 </Flex>

//                 <FormControl>
//                   <FormLabel>Free Preview</FormLabel>
//                   <Switch
//                     isChecked={editData.isFreePreview}
//                     onChange={(e) =>
//                       setEditData({
//                         ...editData,
//                         isFreePreview: e.target.checked,
//                       })
//                     }
//                   />
//                 </FormControl>
//               </Flex>
//             )}
//           </ModalBody>

//           <ModalFooter>
//             <Button colorScheme="brand" onClick={handleUpdate}>
//               Update
//             </Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>
//     </Box>
//   );
// }

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
  Select,
  Badge,
  Image,
  Switch,
} from '@chakra-ui/react';
import { MdEdit, MdDelete, MdSearch } from 'react-icons/md';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from 'components/card/Card';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

export default function ChapterManagement() {
  const [courses, setCourses] = useState([]); // ✅ ADD

  const [subjects, setSubjects] = useState([]);
  const [subSubjects, setSubSubjects] = useState([]);

  const [chapters, setChapters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Image State
  const [chapterImage, setChapterImage] = useState(null);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  // Form State (Backend-aligned)
  const [formData, setFormData] = useState({
    courseId: '',
    subjectId: '',
    subSubjectId: '',
    name: '',
    description: '',
    weightage: 0,
    isFreePreview: false,
  });

  const [editData, setEditData] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const toast = useToast();

  const baseUrl = process.env.REACT_APP_BASE_URL;
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  // 🔹 Fetch Subjects + Chapters
  const fetchData = async () => {
    try {
      setLoading(true);

      const [courseRes, subjectRes, chapterRes] = await Promise.all([
        axios.get(`${baseUrl}api/admin/courses`, { headers }),
        axios.get(`${baseUrl}api/admin/subjects`, { headers }),
        axios.get(`${baseUrl}api/admin/chapters`, { headers }),
      ]);

      setCourses(courseRes.data.data || []);
      setSubjects(subjectRes.data.data || []);
      setChapters(chapterRes.data.data || []);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/auth/sign-in';
      }

      toast({
        title: err.response?.data?.message || 'Data load failed',
        status: 'error',
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!token) {
      window.location.href = '/auth/sign-in';
      return;
    }

    fetchData();
  }, [token]);
  


  useEffect(() => {
  // Agar page refresh hua aur formData me courseId hai, toh subjects fetch karo
  if (formData.courseId) {
    fetchSubjectsByCourse(formData.courseId);
  }
}, [formData.courseId]); // 🟢 Iska matlab: jab bhi courseId badle (ya refresh pe set ho), ye chalao.

  // const handleCourseChange = async (courseId) => {
  //   setFormData({
  //     ...formData,
  //     courseId,
  //     subjectId: '',
  //     subSubjectId: '',
  //   });

  //   setSubjects([]);
  //   setSubSubjects([]);

  //   if (!courseId) return;

  //   try {
  //     const res = await axios.get(
  //       `${baseUrl}api/admin/subjects?courseId=${courseId}`,
  //       { headers },
  //     );
  //     setSubjects(res.data.data || []);
  //   } catch (err) {
  //     toast({ title: 'Subject load error', status: 'error' });
  //   }
  // };

  //  const handleCourseChange = async (courseId) => {
  //   // 1. Reset dependent fields immediately
  //   setFormData((prev) => ({
  //     ...prev,
  //     courseId,
  //     subjectId: '',
  //     subSubjectId: '',
  //   }));

  //   setSubjects([]);
  //   setSubSubjects([]);

  //   if (!courseId) return;

  //   try {
  //     const res = await axios.get(
  //       `${baseUrl}api/admin/subjects?courseId=${courseId}`,
  //       { headers },
  //     );

  //     console.log("Subject API Raw Response:", res.data); // 🟢 Debugging line

  //     // Check if data exists in res.data.data or just res.data
  //     const subjectList = res.data.data || res.data || [];
      
  //     if (Array.isArray(subjectList)) {
  //       setSubjects(subjectList);
  //       console.log("Subjects set to state:", subjectList);
  //     } else {
  //       console.error("Subjects data is not an array:", subjectList);
  //       setSubjects([]);
  //     }
  //   } catch (err) {
  //     console.error("Subject Load Error:", err);
  //     toast({ title: 'Subject load error', status: 'error' });
  //   }
  // };
  const handleCourseChange = async (courseId) => {
  setFormData((prev) => ({
    ...prev,
    courseId: courseId,
    subjectId: '', // Subject reset karein
    subSubjectId: '', // Sub-subject reset karein
  }));

  if (!courseId) {
    setSubjects([]);
    return;
  }

  setLoadingSubjects(true); // 🟢 Loading shuru
  try {
    const res = await axios.get(
      `${baseUrl}api/admin/subjects?courseId=${courseId}`,
      { headers },
    );

    const subjectList = res.data.data || res.data || [];
    setSubjects(Array.isArray(subjectList) ? subjectList : []);
  } catch (err) {
    console.error("Subject load error:", err);
    toast({ title: 'Error loading subjects', status: 'error' });
  } finally {
    setLoadingSubjects(false); // 🟢 Loading khatam
  }
};

  // 🔹 Load Sub-Subjects when Subject changes
  // const handleSubjectChange = async (subjectId) => {
  //   setFormData({
  //     ...formData,
  //     subjectId,
  //     subSubjectId: '',
  //   });

  //   setSubSubjects([]);

  //   if (!subjectId) return;

  //   try {
  //     const res = await axios.get(
  //       `${baseUrl}api/admin/sub-subjects?subjectId=${subjectId}`,
  //       { headers },
  //     );
  //     setSubSubjects(res.data.data || []);
  //   } catch (err) {
  //     toast({ title: 'Sub-Subject load error', status: 'error' });
  //   }
  // };
  const handleSubjectChange = async (subjectId) => {
    setFormData((prev) => ({
      ...prev,
      subjectId,
      subSubjectId: '',
    }));

    setSubSubjects([]);

    if (!subjectId) return;

    try {
      const res = await axios.get(
        `${baseUrl}api/admin/sub-subjects?subjectId=${subjectId}`,
        { headers },
      );
      
      const subSubjectList = res.data.data || res.data || [];
      setSubSubjects(Array.isArray(subSubjectList) ? subSubjectList : []);
    } catch (err) {
      toast({ title: 'Sub-Subject load error', status: 'error' });
    }
  };
  const fetchSubjectsByCourse = async (courseId) => {
  if (!courseId) {
    setSubjects([]);
    return;
  }
  setLoadingSubjects(true);
  try {
    const res = await axios.get(
      `${baseUrl}api/admin/subjects?courseId=${courseId}`,
      { headers }
    );
    const subjectList = res.data.data || res.data || [];
    setSubjects(Array.isArray(subjectList) ? subjectList : []);
  } catch (err) {
    console.error("Error fetching subjects:", err);
  } finally {
    setLoadingSubjects(false);
  }
};

  // 🔹 Load Topics when Sub-Subject changes
  const handleSubSubjectChange = (ssId) => {
    setFormData({
      ...formData,
      subSubjectId: ssId,
    });
  };

  // 🔹 CREATE CHAPTER
  const handleCreate = async () => {
    // 🔹 VALIDATION
    if (!formData.courseId || !formData.subjectId || !formData.subSubjectId) {
      return toast({
        title: 'Course, Subject and Sub-Subject required',
        status: 'warning',
      });
    }

    if (!formData.name || formData.name.trim().length < 3) {
      return toast({
        title: 'Chapter name must be at least 3 characters',
        status: 'warning',
      });
    }

    if (loading) return; // 🔥 Prevent double submit

    setLoading(true);

    try {
      const payload = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          payload.append(key, value);
        }
      });

      if (chapterImage) {
        payload.append('image', chapterImage);
      }

      await axios.post(`${baseUrl}api/admin/chapters`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      toast({ title: 'Chapter Created!', status: 'success' });

      setFormData({
        courseId: '',
        subjectId: '',
        subSubjectId: '',
        name: '',
        description: '',
        weightage: 0,
        isFreePreview: false,
      });

      setChapterImage(null);
      setSubSubjects([]);

      await fetchData();
    } catch (err) {
      toast({
        title: err.response?.data?.message || 'Create failed',
        status: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔹 UPDATE CHAPTER
  const handleUpdate = async () => {
    try {
      const payload = new FormData();

      payload.append(
        'subSubjectId',
        editData.subSubjectId?._id || editData.subSubjectId,
      );

      payload.append('name', editData.name);
      payload.append('description', editData.description || '');
      payload.append('weightage', editData.weightage);
      payload.append('isFreePreview', editData.isFreePreview);

      if (editData.newImage) {
        payload.append('image', editData.newImage);
      }

      await axios.patch(
        `${baseUrl}api/admin/chapters/${editData._id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      toast({ title: 'Updated Successfully', status: 'success' });
      onClose();
      fetchData();
    } catch (err) {
      toast({
        title: err.response?.data?.message || 'Something went wrong',
        status: 'error',
      });
    }
  };

  // 🔹 DELETE CHAPTER
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await axios.delete(`${baseUrl}api/admin/chapters/${id}`, { headers });
        toast({ title: 'Deleted', status: 'info' });
        fetchData();
      } catch (err) {
        toast({ title: 'Delete failed', status: 'error' });
      }
    }
  };

  // 🔹 SEARCH FILTER
  const filteredData = chapters.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.subSubjectId?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* ADD CHAPTER CARD */}
      <Card mb="20px" p="20px">
        <Text color={textColor} fontSize="22px" fontWeight="700" mb="20px">
          Add New Chapter
        </Text>

        <Flex gap="15px" wrap="wrap">
          {/* COURSE ✅ */}
          <FormControl width={{ base: '100%', md: '20%' }}>
            <FormLabel fontSize="sm" fontWeight="700">
              Course
            </FormLabel>
            <Select
              placeholder="Select Course"
              value={formData.courseId}
              onChange={(e) => handleCourseChange(e.target.value)}
            >
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </FormControl>

          {/* SUBJECT */}
          {/* <FormControl width={{ base: '100%', md: '20%' }}>
            <FormLabel fontSize="sm" fontWeight="700">
              Subject
            </FormLabel>
            <Select
              placeholder="Select Subject"
              value={formData.subjectId}
              onChange={(e) => handleSubjectChange(e.target.value)}
              isDisabled={!formData.courseId}
            >
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </FormControl> */}
  {/* SUBJECT DROPDOWN */}
<FormControl width={{ base: '100%', md: '20%' }}>
  <FormLabel fontSize="sm" fontWeight="700">Subject</FormLabel>
<Select
  placeholder={loadingSubjects ? "Loading..." : "Select Subject"}
  value={formData.subjectId}
  onChange={(e) => handleSubjectChange(e.target.value)}
  isDisabled={!formData.courseId || loadingSubjects} // Jab load ho raha ho tab bhi disabled rahe
>
  {subjects.map((s) => (
    <option key={s._id} value={s._id}>
      {s.name}
    </option>
  ))}
</Select>
</FormControl>

          {/* SUB-SUBJECT */}
          <FormControl width={{ base: '100%', md: '20%' }}>
            <FormLabel fontSize="sm" fontWeight="700">
              Sub-Subject
            </FormLabel>
            <Select
              placeholder="Select Sub-Subject"
              value={formData.subSubjectId}
              onChange={(e) => handleSubSubjectChange(e.target.value)}
              isDisabled={!formData.subjectId}
            >
              {subSubjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </FormControl>

          {/* NAME */}
          <FormControl width={{ base: '100%', md: '20%' }}>
            <FormLabel fontSize="sm" fontWeight="700">
              Chapter Name
            </FormLabel>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }
              placeholder="Ex: Genetics"
            />
          </FormControl>

          {/* DESCRIPTION ✅ */}
          <FormControl width="100%">
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
              style={{ background: 'white' }}
            />
          </FormControl>

          {/* IMAGE */}
          <FormControl width={{ base: '100%', md: '20%' }}>
            <FormLabel fontSize="sm" fontWeight="700">
              Chapter Image
            </FormLabel>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];

                if (!file) return;

                if (!file.type.startsWith('image/')) {
                  toast({
                    title: 'Only image files allowed',
                    status: 'warning',
                  });
                  return;
                }

                if (file.size > 2 * 1024 * 1024) {
                  toast({
                    title: 'Image must be less than 2MB',
                    status: 'warning',
                  });
                  return;
                }

                setChapterImage(file);
              }}
              pt="1"
            />
          </FormControl>

          <Button
            colorScheme="brand"
            mt="30px"
            onClick={handleCreate}
            isLoading={loading}
          >
            Save
          </Button>
        </Flex>
      </Card>

      {/* LIST TABLE */}
      <Card p="20px">
        <Flex justify="space-between" mb="20px">
          <Text color={textColor} fontSize="18px" fontWeight="700">
            Chapters
          </Text>

          <InputGroup maxW="300px">
            <InputLeftElement children={<MdSearch />} />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Flex>

        <Box overflowX="auto">
          <Table variant="simple">
            <Thead bg={useColorModeValue('gray.50', 'navy.800')}>
              <Tr>
                <Th>Image</Th>
                <Th>Name</Th>

                <Th>Sub-Subject</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>

            <Tbody>
              {filteredData.map((item) => (
                <Tr key={item._id}>
                  <Td>
                    <Image
                      src={
                        item.image
                          ? item.image.startsWith('http')
                            ? item.image
                            : `${baseUrl.replace(/\/$/, '')}${item.image}`
                          : 'https://via.placeholder.com/50'
                      }
                      w="40px"
                      h="40px"
                      borderRadius="8px"
                      objectFit="cover"
                      fallbackSrc="https://via.placeholder.com/40"
                    />
                  </Td>

                  <Td fontWeight="700">{item.name}</Td>

                  <Td>
                    <Badge colorScheme="purple">
                      {item.subSubjectId?.name || 'N/A'}
                    </Badge>
                  </Td>

                  <Td>
                    <IconButton
                      icon={<MdEdit />}
                      onClick={() => {
                        setEditData(item);
                        onOpen();
                      }}
                      mr="2"
                    />
                    <IconButton
                      icon={<MdDelete />}
                      colorScheme="red"
                      onClick={() => handleDelete(item._id)}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Card>

      {/* EDIT MODAL */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent pb="4">
          <ModalHeader>Edit Chapter</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {editData && (
              <Flex direction="column" gap="4">
                <FormControl>
                  <FormLabel>Chapter Name</FormLabel>
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
                  <FormLabel>Update Image</FormLabel>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        newImage: e.target.files[0],
                      })
                    }
                    pt="1"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Free Preview</FormLabel>
                  <Switch
                    isChecked={editData.isFreePreview}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        isFreePreview: e.target.checked,
                      })
                    }
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
  );
}
