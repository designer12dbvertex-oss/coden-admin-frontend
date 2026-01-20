// 'use client';

// import {
//   Box, Flex, Table, Tbody, Td, Text, Th, Thead, Tr, useColorModeValue,
//   Button, Input, FormControl, FormLabel, useToast, IconButton,
//   Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter,
//   ModalBody, ModalCloseButton, useDisclosure, InputGroup,
//   InputLeftElement, Select, Badge, Tooltip, Switch, Progress, Image
// } from '@chakra-ui/react';
// import {
//   MdEdit, MdDelete, MdSearch, MdFormatListBulleted
// } from 'react-icons/md';
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import Card from 'components/card/Card';

// export default function ChapterManagement() {
//   const [subSubjects, setSubSubjects] = useState([]);
//   const [chapters, setChapters] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [loading, setLoading] = useState(false);

//   // Image State
//   const [chapterImage, setChapterImage] = useState(null);

//   const [formData, setFormData] = useState({
//     subSubjectId: '',
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
//   const imgUrl = process.env.REACT_APP_IMG_URL || 'http://localhost:5000'; // Image render karne ke liye
//   const token = localStorage.getItem('token');
//   const headers = { Authorization: `Bearer ${token}` };

//   const fetchData = async () => {
//     try {
//       const [subRes, chapterRes] = await Promise.all([
//         axios.get(`${baseUrl}api/admin/sub-subjects`, { headers }),
//         axios.get(`${baseUrl}api/admin/chapters`, { headers }),
//       ]);
//       setSubSubjects(subRes.data.data || []);
//       setChapters(chapterRes.data.data || []);
//     } catch (err) {
//       toast({ title: 'Data load error', status: 'error' });
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const handleCreate = async () => {
//     if (!formData.subSubjectId || !formData.name) {
//       return toast({ title: 'Sub-Subject and Name required', status: 'warning' });
//     }

//     setLoading(true);
//     try {
//       const payload = new FormData();
//       // Sabhi text fields append karein
//       Object.keys(formData).forEach(key => payload.append(key, formData[key]));

//       // Image file append karein agar select ki gayi hai
//       if (chapterImage) {
//         payload.append('image', chapterImage);
//       }

//       await axios.post(`${baseUrl}api/admin/chapters`, payload, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'multipart/form-data'
//         },
//       });

//       toast({ title: 'Chapter Created!', status: 'success' });
//       setFormData({ subSubjectId: '', name: '', description: '', weightage: 0, order: 0, targetMcqs: 50, isFreePreview: false });
//       setChapterImage(null);
//       fetchData();
//     } catch (err) {
//       toast({ title: err.response?.data?.message || 'Error', status: 'error' });
//     } finally { setLoading(false); }
//   };

//   const handleUpdate = async () => {
//     try {
//       const payload = new FormData();
//       payload.append('subSubjectId', editData.subSubjectId?._id || editData.subSubjectId);
//       payload.append('name', editData.name);
//       payload.append('description', editData.description || '');
//       payload.append('weightage', editData.weightage);
//       payload.append('order', editData.order);
//       payload.append('targetMcqs', editData.targetMcqs);
//       payload.append('isFreePreview', editData.isFreePreview);

//       // Check if new image is selected in Edit
//       if (editData.newImage) {
//         payload.append('image', editData.newImage);
//       }

//       await axios.patch(`${baseUrl}api/admin/chapters/${editData._id}`, payload, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'multipart/form-data'
//         },
//       });

//       toast({ title: 'Updated Successfully', status: 'success' });
//       onClose();
//       fetchData();
//     } catch (err) {
//       toast({ title: 'Update failed', status: 'error' });
//     }
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm('Are you sure?')) {
//       try {
//         await axios.delete(`${baseUrl}api/admin/chapters/${id}`, { headers });
//         toast({ title: 'Deleted', status: 'info' });
//         fetchData();
//       } catch (err) { toast({ title: 'Delete failed', status: 'error' }); }
//     }
//   };

//   const filteredData = chapters.filter(c =>
//     c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     c.subSubjectId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
//       {/* ADD CHAPTER CARD */}
//       <Card mb="20px" p="20px">
//         <Text color={textColor} fontSize="22px" fontWeight="700" mb="20px">Add New Chapter</Text>
//         <Flex gap="15px" wrap="wrap">
//           <FormControl width={{ base: '100%', md: '30%' }}>
//             <FormLabel fontSize="sm" fontWeight="700">Sub-Subject</FormLabel>
//             <Select placeholder="Select" value={formData.subSubjectId} onChange={(e) => setFormData({ ...formData, subSubjectId: e.target.value })}>
//               {subSubjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
//             </Select>
//           </FormControl>

//           <FormControl width={{ base: '100%', md: '30%' }}>
//             <FormLabel fontSize="sm" fontWeight="700">Chapter Name</FormLabel>
//             <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: Genetics" />
//           </FormControl>

//           {/* IMAGE UPLOAD INPUT */}
//           <FormControl width={{ base: '100%', md: '30%' }}>
//             <FormLabel fontSize="sm" fontWeight="700">Chapter Image</FormLabel>
//             <Input type="file" accept="image/*" onChange={(e) => setChapterImage(e.target.files[0])} pt="1" />
//           </FormControl>

//           <FormControl width={{ base: '100%', md: '15%' }}>
//             <FormLabel fontSize="sm" fontWeight="700">Target MCQs</FormLabel>
//             <Input type="number" value={formData.targetMcqs} onChange={(e) => setFormData({ ...formData, targetMcqs: e.target.value })} />
//           </FormControl>

//           <FormControl width={{ base: '100%', md: '10%' }}>
//             <FormLabel fontSize="sm" fontWeight="700">Order</FormLabel>
//             <Input type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: e.target.value })} />
//           </FormControl>

//           <Button colorScheme="brand" mt="30px" onClick={handleCreate} isLoading={loading}>Save</Button>
//         </Flex>
//       </Card>

//       {/* LIST TABLE */}
//       <Card p="20px">
//         <Flex justify="space-between" mb="20px">
//           <Text color={textColor} fontSize="18px" fontWeight="700">Chapters & QBank Progress</Text>
//           <InputGroup maxW="300px">
//             <InputLeftElement children={<MdSearch />} />
//             <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
//           </InputGroup>
//         </Flex>

//         <Box overflowX="auto">
//           <Table variant="simple">
//             <Thead bg={useColorModeValue('gray.50', 'navy.800')}>
//               <Tr>
//                 <Th>Image</Th>
//                 <Th>Name</Th>
//                 <Th>Sub-Subject</Th>
//                 <Th>Topics</Th>
//                 <Th>QBank Target</Th>
//                 <Th>Actions</Th>
//               </Tr>
//             </Thead>
//             <Tbody>
//               {filteredData.map((item) => (
//                 <Tr key={item._id}>
//                   <Td>
//                     <Image
//                       src={item.image ? `${imgUrl}${item.image}` : 'https://via.placeholder.com/50'}
//                       w="40px" h="40px" borderRadius="8px" objectFit="cover"
//                       fallbackSrc='https://via.placeholder.com/40'
//                     />
//                   </Td>
//                   <Td fontWeight="700">{item.name}</Td>
//                   <Td><Badge colorScheme="purple">{item.subSubjectId?.name}</Badge></Td>

//                   <Td>
//                     <Flex align="center">
//                       <MdFormatListBulleted style={{ marginRight: '5px' }} />
//                       <Text fontWeight="600">{item.topicsCount || 0}</Text>
//                     </Flex>
//                   </Td>

//                   <Td minW="150px">
//                     <Text fontSize="xs" mb="1">Target: {item.targetMcqs || 50} MCQs</Text>
//                     <Progress value={(item.topicsCount / 10) * 100} size="xs" colorScheme="green" borderRadius="full" />
//                   </Td>

//                   <Td>
//                     <IconButton icon={<MdEdit />} onClick={() => { setEditData(item); onOpen(); }} mr="2" />
//                     <IconButton icon={<MdDelete />} colorScheme="red" onClick={() => handleDelete(item._id)} />
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
//                   <Input value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
//                 </FormControl>

//                 <FormControl>
//                   <FormLabel>Update Image</FormLabel>
//                   <Input type="file" accept="image/*" onChange={(e) => setEditData({ ...editData, newImage: e.target.files[0] })} pt="1" />
//                 </FormControl>

//                 <Flex gap="4">
//                     <FormControl>
//                         <FormLabel>Target MCQs</FormLabel>
//                         <Input type="number" value={editData.targetMcqs} onChange={(e) => setEditData({ ...editData, targetMcqs: e.target.value })} />
//                     </FormControl>
//                     <FormControl>
//                         <FormLabel>Order</FormLabel>
//                         <Input type="number" value={editData.order} onChange={(e) => setEditData({ ...editData, order: e.target.value })} />
//                     </FormControl>
//                 </Flex>
//                 <FormControl>
//                   <FormLabel>Free Preview</FormLabel>
//                   <Switch isChecked={editData.isFreePreview} onChange={(e) => setEditData({ ...editData, isFreePreview: e.target.checked })} />
//                 </FormControl>
//               </Flex>
//             )}
//           </ModalBody>
//           <ModalFooter>
//             <Button colorScheme="brand" onClick={handleUpdate}>Update</Button>
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
  Progress,
  Image,
  Switch,
} from '@chakra-ui/react';
import { MdEdit, MdDelete, MdSearch } from 'react-icons/md';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from 'components/card/Card';

export default function ChapterManagement() {
  const [subjects, setSubjects] = useState([]);
  const [subSubjects, setSubSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Image State
  const [chapterImage, setChapterImage] = useState(null);

  // Form State (Backend-aligned)
  const [formData, setFormData] = useState({
    subjectId: '',
    subSubjectId: '',
    topicId: '',
    name: '',
    description: '',
    weightage: 0,
    order: 0,
    targetMcqs: 50,
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
      const [subjectRes, chapterRes] = await Promise.all([
        axios.get(`${baseUrl}api/admin/subjects`, { headers }),
        axios.get(`${baseUrl}api/admin/chapters`, { headers }),
      ]);

      setSubjects(subjectRes.data.data || []);
      setChapters(chapterRes.data.data || []);
    } catch (err) {
      toast({ title: 'Data load error', status: 'error' });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔹 Load Sub-Subjects when Subject changes
  const handleSubjectChange = async (subjectId) => {
    setFormData({
      ...formData,
      subjectId,
      subSubjectId: '',
      topicId: '',
    });

    setSubSubjects([]);
    setTopics([]);

    if (!subjectId) return;

    try {
      const res = await axios.get(
        `${baseUrl}api/admin/sub-subjects?subjectId=${subjectId}`,
        { headers },
      );
      setSubSubjects(res.data.data || []);
    } catch (err) {
      toast({ title: 'Sub-Subject load error', status: 'error' });
    }
  };

  // 🔹 Load Topics when Sub-Subject changes
  const handleSubSubjectChange = async (ssId) => {
    setFormData({ ...formData, subSubjectId: ssId, topicId: '' });
    setTopics([]);

    if (!ssId) return;

    try {
      const res = await axios.get(
        `${baseUrl}api/admin/topics/sub-subject/${ssId}`,
        { headers },
      );
      setTopics(res.data.data || []);
    } catch (err) {
      toast({ title: 'Topic load error', status: 'error' });
    }
  };

  // 🔹 CREATE CHAPTER
  const handleCreate = async () => {
    if (
      !formData.subjectId ||
      !formData.subSubjectId ||
      !formData.topicId ||
      !formData.name
    ) {
      return toast({
        title: 'Subject, Sub-Subject, Topic and Name required',
        status: 'warning',
      });
    }

    setLoading(true);
    try {
      const payload = new FormData();

      Object.keys(formData).forEach((key) =>
        payload.append(key, formData[key]),
      );

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
        subjectId: '',
        subSubjectId: '',
        topicId: '',
        name: '',
        description: '',
        weightage: 0,
        order: 0,
        targetMcqs: 50,
        isFreePreview: false,
      });

      setChapterImage(null);
      setSubSubjects([]);
      setTopics([]);
      fetchData();
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
      payload.append('topicId', editData.topicId?._id || editData.topicId);
      payload.append('name', editData.name);
      payload.append('description', editData.description || '');
      payload.append('weightage', editData.weightage);
      payload.append('order', editData.order);
      payload.append('targetMcqs', editData.targetMcqs);
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
      toast({ title: 'Update failed', status: 'error' });
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
      c.subSubjectId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.topicId?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* ADD CHAPTER CARD */}
      <Card mb="20px" p="20px">
        <Text color={textColor} fontSize="22px" fontWeight="700" mb="20px">
          Add New Chapter
        </Text>

        <Flex gap="15px" wrap="wrap">
          {/* SUBJECT */}
          <FormControl width={{ base: '100%', md: '20%' }}>
            <FormLabel fontSize="sm" fontWeight="700">
              Subject
            </FormLabel>
            <Select
              placeholder="Select Subject"
              value={formData.subjectId}
              onChange={(e) => handleSubjectChange(e.target.value)}
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

          {/* TOPIC */}
          <FormControl width={{ base: '100%', md: '20%' }}>
            <FormLabel fontSize="sm" fontWeight="700">
              Topic
            </FormLabel>
            <Select
              placeholder="Select Topic"
              value={formData.topicId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  topicId: e.target.value,
                })
              }
              isDisabled={!formData.subSubjectId}
            >
              {topics.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
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
          <FormControl width={{ base: '100%', md: '20%' }}>
            <FormLabel fontSize="sm" fontWeight="700">
              Description
            </FormLabel>
            <Input
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
              placeholder="Chapter description..."
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
              onChange={(e) => setChapterImage(e.target.files[0])}
              pt="1"
            />
          </FormControl>

          <FormControl width={{ base: '100%', md: '15%' }}>
            <FormLabel fontSize="sm" fontWeight="700">
              Target MCQs
            </FormLabel>
            <Input
              type="number"
              value={formData.targetMcqs}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  targetMcqs: e.target.value,
                })
              }
            />
          </FormControl>

          <FormControl width={{ base: '100%', md: '10%' }}>
            <FormLabel fontSize="sm" fontWeight="700">
              Order
            </FormLabel>
            <Input
              type="number"
              value={formData.order}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  order: e.target.value,
                })
              }
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
                <Th>Topic</Th>
                <Th>Sub-Subject</Th>
                <Th>QBank Target</Th>
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
                    <Badge colorScheme="orange">
                      {item.topicId?.name || 'N/A'}
                    </Badge>
                  </Td>

                  <Td>
                    <Badge colorScheme="purple">
                      {item.subSubjectId?.name || 'N/A'}
                    </Badge>
                  </Td>

                  <Td minW="150px">
                    <Text fontSize="xs" mb="1">
                      Target: {item.targetMcqs || 50} MCQs
                    </Text>
                    <Progress
                      value={((item.topicsCount || 0) / 10) * 100}
                      size="xs"
                      colorScheme="green"
                      borderRadius="full"
                    />
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
                  <FormLabel>Topic</FormLabel>
                  <Select
                    value={editData.topicId?._id || editData.topicId}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        topicId: e.target.value,
                      })
                    }
                  >
                    {topics.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name}
                      </option>
                    ))}
                  </Select>
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

                <Flex gap="4">
                  <FormControl>
                    <FormLabel>Target MCQs</FormLabel>
                    <Input
                      type="number"
                      value={editData.targetMcqs}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          targetMcqs: e.target.value,
                        })
                      }
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Order</FormLabel>
                    <Input
                      type="number"
                      value={editData.order}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          order: e.target.value,
                        })
                      }
                    />
                  </FormControl>
                </Flex>

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
