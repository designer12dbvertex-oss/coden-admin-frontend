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
  InputGroup,
  InputLeftElement,
  Select,
  Badge,
  Icon,
  Tooltip
} from '@chakra-ui/react';
import { MdDelete, MdSearch, MdCloudUpload, MdPlayCircleOutline } from 'react-icons/md';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Card from 'components/card/Card';

export default function VideoManagement() {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [subSubjects, setSubSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [videos, setVideos] = useState([]);
  
  // Selection States
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedSubSubject, setSelectedSubSubject] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  
  // Input States
  const [videoFile, setVideoFile] = useState(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [description, setDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef();
  const toast = useToast();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const iconColor = useColorModeValue('brand.500', 'white');
  
  const baseUrl = process.env.REACT_APP_BASE_URL;
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchData = async () => {
    try {
      const [courseRes, videoRes] = await Promise.all([
        axios.get(`${baseUrl}api/admin/courses`, { headers }),
        axios.get(`${baseUrl}api/admin/videos`, { headers })
      ]);
      setCourses(courseRes.data.data || []);
      setVideos(videoRes.data.data || []);
    } catch (err) { 
      toast({ title: 'Fetch Error', description: 'Data load nahi ho paya', status: 'error' }); 
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Cascading Logic
  const handleCourseChange = async (id) => {
    setSelectedCourse(id);
    setSelectedSubject(''); setSelectedSubSubject(''); setSelectedChapter('');
    try {
      const res = await axios.get(`${baseUrl}api/admin/subjects?courseId=${id}`, { headers });
      setSubjects(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const handleSubjectChange = async (id) => {
    setSelectedSubject(id);
    setSelectedSubSubject(''); setSelectedChapter('');
    try {
      const res = await axios.get(`${baseUrl}api/admin/sub-subjects?subjectId=${id}`, { headers });
      setSubSubjects(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const handleSubSubjectChange = async (id) => {
    setSelectedSubSubject(id);
    setSelectedChapter('');
    try {
      const res = await axios.get(`${baseUrl}api/admin/chapters?subSubjectId=${id}`, { headers });
      setChapters(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const handleUploadVideo = async () => {
    if (!videoFile || !videoTitle || !selectedChapter) {
      return toast({ title: 'Warning', description: 'Title, File aur Chapter zaroori hain!', status: 'warning' });
    }

    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('title', videoTitle);
    formData.append('description', description);
    formData.append('courseId', selectedCourse);
    formData.append('subjectId', selectedSubject);
    formData.append('subSubjectId', selectedSubSubject);
    formData.append('chapterId', selectedChapter);

    setLoading(true);
    try {
      await axios.post(`${baseUrl}api/admin/videos`, formData, { 
        headers: { ...headers, 'Content-Type': 'multipart/form-data' } 
      });
      toast({ title: 'Success', description: 'Video upload ho gayi!', status: 'success' });
      // Reset fields
      setVideoFile(null); setVideoTitle(''); setDescription('');
      fetchData();
    } catch (err) { 
      toast({ title: 'Upload Failed', description: 'Server error', status: 'error' }); 
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Kya aap is video ko delete karna chahte hain?")) {
      try {
        await axios.delete(`${baseUrl}api/admin/videos/${id}`, { headers });
        toast({ title: 'Deleted', status: 'info' });
        fetchData();
      } catch (err) { toast({ title: 'Error', status: 'error' }); }
    }
  };

  // Search filter logic
  const filteredVideos = videos.filter(v => 
    v.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      
      {/* 1. UPLOAD FORM CARD */}
      <Card mb='20px' p='20px'>
        <Text fontSize='22px' fontWeight='700' mb='20px' color={textColor}>
          Video Management
        </Text>
        
        {/* Dropdowns */}
        <Flex gap='15px' mb='20px' wrap="wrap">
            <Select placeholder='Select Course' flex="1" value={selectedCourse} onChange={(e) => handleCourseChange(e.target.value)}>
                {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </Select>
            <Select placeholder='Select Subject' flex="1" value={selectedSubject} onChange={(e) => handleSubjectChange(e.target.value)}>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </Select>
            <Select placeholder='Select Sub-Subject' flex="1" value={selectedSubSubject} onChange={(e) => handleSubSubjectChange(e.target.value)}>
                {subSubjects.map(ss => <option key={ss._id} value={ss._id}>{ss.name}</option>)}
            </Select>
            <Select placeholder='Select Chapter' flex="1" value={selectedChapter} onChange={(e) => setSelectedChapter(e.target.value)}>
                {chapters.map(ch => <option key={ch._id} value={ch._id}>{ch.name}</option>)}
            </Select>
        </Flex>

        {/* Inputs & File Selection */}
        <Flex gap='15px' direction={{ base: 'column', md: 'row' }} align="flex-end">
          <FormControl flex='1'>
            <FormLabel fontWeight="700">Video Title</FormLabel>
            <Input value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} placeholder='Ex: Lecture 01' />
          </FormControl>
          
          <FormControl flex='1'>
            <FormLabel fontWeight="700">Description</FormLabel>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder='Topic details...' />
          </FormControl>

          <FormControl flex='1'>
            <FormLabel fontWeight="700">Video File</FormLabel>
            <input 
              type='file' 
              accept='video/*' 
              hidden 
              ref={fileInputRef} 
              onChange={(e) => setVideoFile(e.target.files[0])} 
            />
            <Button 
              leftIcon={<MdCloudUpload />} 
              onClick={() => fileInputRef.current.click()} 
              w="100%" 
              variant="outline"
              colorScheme={videoFile ? "green" : "gray"}
            >
              {videoFile ? videoFile.name.substring(0, 15) + "..." : "Select Video"}
            </Button>
          </FormControl>

          <Button 
            colorScheme='brand' 
            variant='solid'
            isLoading={loading} 
            onClick={handleUploadVideo} 
            px='40px'
          >
            Upload
          </Button>
        </Flex>
      </Card>

      {/* 2. VIDEO LIST TABLE CARD */}
      <Card p='20px'>
        <Flex justify='space-between' align='center' mb='20px' wrap="wrap" gap="10px">
          <Text color={textColor} fontSize='18px' fontWeight='700'>
            Videos Library ({filteredVideos.length})
          </Text>
          <InputGroup maxW='300px'>
            <InputLeftElement pointerEvents='none'>
              <MdSearch color='gray.300' />
            </InputLeftElement>
            <Input 
              placeholder='Search video by title...' 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </InputGroup>
        </Flex>

        <Box overflowX='auto'>
          <Table variant='simple' color="gray.500">
            <Thead bg={useColorModeValue('gray.50', 'navy.800')}>
              <Tr>
                <Th>Play</Th>
                <Th>Video Details</Th>
                <Th>Hierarchy</Th>
                <Th textAlign="right">Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredVideos.map((video) => (
                <Tr key={video._id}>
                  <Td>
                    <IconButton
                      icon={<MdPlayCircleOutline size="24px" />}
                      variant="ghost"
                      colorScheme="brand"
                      onClick={() => window.open(`${baseUrl}${video.videoUrl}`, '_blank')}
                      aria-label="Play Video"
                    />
                  </Td>
                  <Td>
                    <Text fontWeight='700' color={textColor}>{video.title}</Text>
                    <Text fontSize='xs' noOfLines={1} color="gray.400">{video.description}</Text>
                  </Td>
                  <Td>
                    <Flex direction="column" gap="1">
                        <Badge variant="subtle" colorScheme="orange" fontSize="10px">
                          Course: {video.courseId?.name || 'N/A'}
                        </Badge>
                        <Badge variant="subtle" colorScheme="blue" fontSize="10px">
                          Sub: {video.subjectId?.name || 'N/A'}
                        </Badge>
                        <Badge variant="subtle" colorScheme="purple" fontSize="10px">
                          Ch: {video.chapterId?.name || 'N/A'}
                        </Badge>
                    </Flex>
                  </Td>
                  <Td textAlign="right">
                    <IconButton 
                      variant="ghost" 
                      colorScheme='red' 
                      icon={<MdDelete />} 
                      onClick={() => handleDelete(video._id)} 
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          
          {filteredVideos.length === 0 && (
            <Box textAlign="center" py="20px">
              <Text color="gray.400">No Videos Found</Text>
            </Box>
          )}
        </Box>
      </Card>
    </Box>
  );
}