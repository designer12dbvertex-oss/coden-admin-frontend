// /* eslint-disable */
// 'use client';

// import {
//   Box, Flex, Table, Tbody, Td, Text, Th, Thead, Tr, useColorModeValue,
//   Button, Input, FormControl, FormLabel, useToast, IconButton,
//   Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
//   useDisclosure, InputGroup, InputLeftElement, Select
// } from '@chakra-ui/react';
// import { MdEdit, MdDelete, MdSearch } from 'react-icons/md';
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import Card from 'components/card/Card';

// export default function ChapterManagement() {
//   const [courses, setCourses] = useState([]);
//   const [subjects, setSubjects] = useState([]); // Filtered list
//   const [chapters, setChapters] = useState([]); // All data
//   const [searchTerm, setSearchTerm] = useState('');
//   const [loading, setLoading] = useState(false);

//   // Form States
//   const [selectedCourse, setSelectedCourse] = useState('');
//   const [selectedSubject, setSelectedSubject] = useState('');
//   const [chapterName, setChapterName] = useState('');
//   const [editData, setEditData] = useState({ id: '', name: '', subjectId: '' });

//   const { isOpen, onOpen, onClose } = useDisclosure();
//   const textColor = useColorModeValue('secondaryGray.900', 'white');
//   const toast = useToast();

//   const baseUrl = process.env.REACT_APP_BASE_URL;
//   const token = localStorage.getItem('token');

//   // 1. Initial Load (Courses & Chapters)
//   const fetchData = async () => {
//     try {
//       const [courseRes, chapterRes] = await Promise.all([
//         axios.get(`${baseUrl}api/course/getAll`, { headers: { Authorization: `Bearer ${token}` } }),
//         axios.get(`${baseUrl}api/chapter/getAll`, { headers: { Authorization: `Bearer ${token}` } })
//       ]);
//       setCourses(courseRes.data.courses || []);
//       setChapters(chapterRes.data.chapters || []);
//     } catch (err) {
//       console.error("Fetch Error:", err);
//     }
//   };

//   useEffect(() => { fetchData(); }, []);

//   // 2. Filter Subjects based on Selected Course
//   const handleCourseChange = async (courseId) => {
//     setSelectedCourse(courseId);
//     setSelectedSubject(''); // Reset subject selection
//     try {
//       const res = await axios.get(`${baseUrl}api/subject/getByCourse/${courseId}`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setSubjects(res.data.subjects || []);
//     } catch (err) {
//       setSubjects([]);
//     }
//   };

//   // 3. Add Chapter
//   const handleAddChapter = async () => {
//     if (!chapterName || !selectedSubject) {
//       return toast({ title: 'Please select Subject and enter Chapter name', status: 'warning' });
//     }
//     setLoading(true);
//     try {
//       await axios.post(`${baseUrl}api/chapter/add`,
//         { name: chapterName, subjectId: selectedSubject },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       toast({ title: 'Chapter Added Successfully!', status: 'success' });
//       setChapterName('');
//       fetchData();
//     } catch (err) {
//         toast({ title: 'Error adding chapter', status: 'error' });
//     } finally {
//         setLoading(false);
//     }
//   };

//   // 4. Search Filter
//   const filteredChapters = chapters.filter((c) =>
//     c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     c.subjectId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>

//       {/* ADD SECTION */}
//       <Card mb='20px' p='20px'>
//         <Text color={textColor} fontSize='22px' fontWeight='700' mb='20px'>Chapter Management</Text>
//         <Flex gap='15px' align='flex-end' direction={{ base: 'column', md: 'row' }}>
//           <FormControl flex='1'>
//             <FormLabel>Course</FormLabel>
//             <Select placeholder='Select Course' onChange={(e) => handleCourseChange(e.target.value)}>
//               {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
//             </Select>
//           </FormControl>

//           <FormControl flex='1'>
//             <FormLabel>Subject</FormLabel>
//             <Select
//               placeholder='Select Subject'
//               value={selectedSubject}
//               onChange={(e) => setSelectedSubject(e.target.value)}
//               isDisabled={!selectedCourse}
//             >
//               {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
//             </Select>
//           </FormControl>

//           <FormControl flex='1.5'>
//             <FormLabel>Chapter Name</FormLabel>
//             <Input
//               value={chapterName}
//               onChange={(e) => setChapterName(e.target.value)}
//               placeholder='Ex: Algebra Basics'
//             />
//           </FormControl>

//           <Button colorScheme='blue' onClick={handleAddChapter} isLoading={loading} px='30px'>
//             Add Chapter
//           </Button>
//         </Flex>
//       </Card>

//       {/* SEARCH & TABLE SECTION */}
//       <Card p='20px'>
//         <Flex justify='space-between' align='center' mb='20px' wrap='wrap' gap='10px'>
//           <Text color={textColor} fontSize='18px' fontWeight='700'>All Chapters</Text>
//           <InputGroup maxW='300px'>
//             <InputLeftElement><MdSearch color='gray.300' /></InputLeftElement>
//             <Input
//               placeholder='Search chapter or subject...'
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </InputGroup>
//         </Flex>

//         <Box overflowX='auto'>
//           <Table variant='simple'>
//             <Thead bg='gray.50'>
//               <Tr>
//                 <Th>S.No</Th>
//                 <Th>Chapter Name</Th>
//                 <Th>Subject</Th>
//                 <Th>Course</Th>
//                 <Th>Action</Th>
//               </Tr>
//             </Thead>
//             <Tbody>
//               {filteredChapters.map((c, i) => (
//                 <Tr key={c._id}>
//                   <Td>{i + 1}</Td>
//                   <Td fontWeight='600'>{c.name}</Td>
//                   <Td>{c.subjectId?.name || 'N/A'}</Td>
//                   <Td color='blue.500'>{c.subjectId?.courseId?.name || 'N/A'}</Td>
//                   <Td>
//                     <IconButton icon={<MdEdit />} colorScheme='green' size='sm' mr='2' />
//                     <IconButton icon={<MdDelete />} colorScheme='red' size='sm' />
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
  Tooltip,
  Switch,
} from '@chakra-ui/react';
import {
  MdEdit,
  MdDelete,
  MdSearch,
  MdInfoOutline,
  MdLibraryBooks,
} from 'react-icons/md';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from 'components/card/Card';

export default function ChapterManagement() {
  const [subSubjects, setSubSubjects] = useState([]); // For dropdown
  const [chapters, setChapters] = useState([]); // List data
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    subSubjectId: '',
    name: '',
    description: '',
    weightage: 0,
    order: 0,
    isFreePreview: false,
  });

  // Edit State
  const [editData, setEditData] = useState(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const toast = useToast();

  const baseUrl = process.env.REACT_APP_BASE_URL;
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  // 1. Fetch Chapters & Sub-Subjects
  const fetchData = async () => {
    try {
      const [subRes, chapterRes] = await Promise.all([
        axios.get(`${baseUrl}api/admin/sub-subjects`, { headers }),
        axios.get(`${baseUrl}api/admin/chapters`, { headers }),
      ]);
      setSubSubjects(subRes.data.data || []);
      setChapters(chapterRes.data.data || []);
    } catch (err) {
      toast({ title: 'Data load error', status: 'error' });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Create Chapter
  const handleCreate = async () => {
    if (!formData.subSubjectId || !formData.name) {
      return toast({
        title: 'Sub-Subject is  required',
        status: 'warning',
      });
    }
    setLoading(true);
    try {
      await axios.post(`${baseUrl}api/admin/chapters`, formData, { headers });
      toast({ title: 'Chapter Created!', status: 'success' });
      setFormData({
        subSubjectId: '',
        name: '',
        description: '',
        weightage: 0,
        order: 0,
        isFreePreview: false,
      });
      fetchData();
    } catch (err) {
      toast({ title: err.response?.data?.message || 'Error', status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // 3. Update Chapter
  const handleUpdate = async () => {
    try {
      await axios.put(
        `${baseUrl}api/admin/chapters/${editData._id}`,
        editData,
        { headers },
      );
      toast({ title: 'Updated Successfully', status: 'success' });
      onClose();
      fetchData();
    } catch (err) {
      toast({ title: 'Update failed', status: 'error' });
    }
  };

  // 4. Delete Chapter
  const handleDelete = async (id) => {
    if (
      window.confirm(
        'Kya aap is chapter ko permanently delete karna chahte hain?',
      )
    ) {
      try {
        await axios.delete(`${baseUrl}api/admin/chapters/${id}`, { headers });
        toast({ title: 'Chapter Deleted', status: 'info' });
        fetchData();
      } catch (err) {
        toast({ title: 'Delete failed', status: 'error' });
      }
    }
  };

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
          <FormControl width={{ base: '100%', md: '30%' }}>
            <FormLabel fontSize="sm" fontWeight="700">
              Select Sub-Subject
            </FormLabel>
            <Select
              placeholder="Select Sub-Subject"
              value={formData.subSubjectId}
              onChange={(e) =>
                setFormData({ ...formData, subSubjectId: e.target.value })
              }
            >
              {subSubjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl width={{ base: '100%', md: '30%' }}>
            <FormLabel fontSize="sm" fontWeight="700">
              Chapter Name
            </FormLabel>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Ex: Thermodynamics"
            />
          </FormControl>

          <FormControl width={{ base: '100%', md: '15%' }}>
            <FormLabel fontSize="sm" fontWeight="700">
              Weightage (%)
            </FormLabel>
            <Input
              type="number"
              value={formData.weightage}
              onChange={(e) =>
                setFormData({ ...formData, weightage: e.target.value })
              }
            />
          </FormControl>

          <FormControl width={{ base: '100%', md: '15%' }}>
            <FormLabel fontSize="sm" fontWeight="700">
              Order
            </FormLabel>
            <Input
              type="number"
              value={formData.order}
              onChange={(e) =>
                setFormData({ ...formData, order: e.target.value })
              }
            />
          </FormControl>

          <FormControl flex="1" minW="300px">
            <FormLabel fontSize="sm" fontWeight="700">
              Description
            </FormLabel>
            <Input
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Chapter details..."
            />
          </FormControl>

          <Flex align="center" mt="30px">
            <Text fontSize="sm" fontWeight="700" mr="2">
              Free Preview?
            </Text>
            <Switch
              isChecked={formData.isFreePreview}
              onChange={(e) =>
                setFormData({ ...formData, isFreePreview: e.target.checked })
              }
            />
          </Flex>

          <Button
            colorScheme="brand"
            mt="25px"
            onClick={handleCreate}
            isLoading={loading}
            width={{ base: '100%', md: 'auto' }}
          >
            Save Chapter
          </Button>
        </Flex>
      </Card>

      {/* CHAPTER LIST TABLE */}
      <Card p="20px">
        <Flex justify="space-between" align="center" mb="20px">
          <Text color={textColor} fontSize="18px" fontWeight="700">
            Chapters List
          </Text>
          <InputGroup maxW="300px">
            <InputLeftElement pointerEvents="none">
              <MdSearch color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search chapter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Flex>

        <Box overflowX="auto">
          <Table variant="simple" color="gray.500">
            <Thead bg={useColorModeValue('gray.50', 'navy.800')}>
              <Tr>
                <Th>Order</Th>
                <Th>Chapter Name</Th>
                <Th>Subject</Th>
                <Th>Sub-Subject</Th>
                <Th>Weightage</Th>
                <Th>Description</Th>
                <Th>Free</Th>
                <Th textAlign="right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredData.map((item) => (
                <Tr key={item._id}>
                  <Td>{item.order}</Td>
                  <Td fontWeight="700" color={textColor}>
                    {item.name}
                  </Td>
                  {/* ✅ SUBJECT */}
                  <Td>
                    <Badge colorScheme="blue" variant="subtle">
                      {item.subSubjectId?.subjectId?.name || 'N/A'}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme="purple" variant="subtle">
                      {item.subSubjectId?.name || 'N/A'}
                    </Badge>
                  </Td>
                  <Td>{item.weightage}%</Td>
                  <Td maxW="200px">
                    <Tooltip label={item.description}>
                      <Text isTruncated fontSize="sm">
                        {item.description || '-'}
                      </Text>
                    </Tooltip>
                  </Td>
                  <Td>
                    <Badge colorScheme={item.isFreePreview ? 'green' : 'gray'}>
                      {item.isFreePreview ? 'YES' : 'NO'}
                    </Badge>
                  </Td>
                  <Td textAlign="right">
                    <IconButton
                      variant="ghost"
                      colorScheme="blue"
                      icon={<MdEdit />}
                      onClick={() => {
                        setEditData(item);
                        onOpen();
                      }}
                      mr="2"
                    />
                    <IconButton
                      variant="ghost"
                      colorScheme="red"
                      icon={<MdDelete />}
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
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update Chapter</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {editData && (
              <Flex direction="column" gap="4">
                <FormControl>
                  <FormLabel>Sub-Subject</FormLabel>
                  <Select
                    value={editData.subSubjectId?._id || editData.subSubjectId}
                    onChange={(e) =>
                      setEditData({ ...editData, subSubjectId: e.target.value })
                    }
                  >
                    {subSubjects.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Chapter Name</FormLabel>
                  <Input
                    value={editData.name}
                    onChange={(e) =>
                      setEditData({ ...editData, name: e.target.value })
                    }
                  />
                </FormControl>
                <Flex gap="4">
                  <FormControl>
                    <FormLabel>Weightage</FormLabel>
                    <Input
                      type="number"
                      value={editData.weightage}
                      onChange={(e) =>
                        setEditData({ ...editData, weightage: e.target.value })
                      }
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Order</FormLabel>
                    <Input
                      type="number"
                      value={editData.order}
                      onChange={(e) =>
                        setEditData({ ...editData, order: e.target.value })
                      }
                    />
                  </FormControl>
                </Flex>
                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Input
                    value={editData.description}
                    onChange={(e) =>
                      setEditData({ ...editData, description: e.target.value })
                    }
                  />
                </FormControl>
                <Flex align="center">
                  <Text mr="2">Free Preview:</Text>
                  <Switch
                    isChecked={editData.isFreePreview}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        isFreePreview: e.target.checked,
                      })
                    }
                  />
                </Flex>
              </Flex>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="brand" mr={3} onClick={handleUpdate}>
              Update
            </Button>
            <Button onClick={onClose} variant="ghost">
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
