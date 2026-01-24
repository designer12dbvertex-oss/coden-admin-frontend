//

'use client';

import React, { useState, useEffect } from 'react';
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
} from 'react-icons/md';
import axios from 'axios';
import Card from 'components/card/Card'; // adjust path if needed
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

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
  const [subjects, setSubjects] = useState([]);
  const [subSubjects, setSubSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [tags, setTags] = useState([]);
  const [mcqs, setMcqs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const toast = useToast();

  const rawBaseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:4000';
  const baseUrl = rawBaseUrl.endsWith('/')
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${baseUrl}${cleanPath}`;
  };

  const initialFormState = {
    courseId: '',
    subjectId: '',
    subSubjectId: '',
    topicId: '',
    chapterId: '',
    tagId: '',
    mode: 'regular',
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
  const handleEdit = (mcq) => {
    setIsEditMode(true);
    setEditingMCQ(mcq);

    setFormData({
      courseId: mcq.courseId?._id || '',
      subjectId: mcq.subjectId?._id || '',
      subSubjectId: mcq.subSubjectId?._id || '',
      topicId: mcq.topicId?._id || '',
      chapterId: mcq.chapterId?._id || '',
      tagId: mcq.tagId?._id || '',
      mode: mcq.mode || 'regular',
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

    loadSubjects(mcq.courseId?._id);
    loadSubSubjects(mcq.subjectId?._id);
    loadTopics(mcq.subSubjectId?._id);
    loadChapters(mcq.topicId?._id);
  };
  const handleUpdate = async () => {
    if (!editingMCQ?._id) return;

    setLoading(true);
    const data = new FormData();

    data.append('chapterId', formData.chapterId);
    if (formData.tagId) data.append('tagId', formData.tagId);
    data.append('mode', formData.mode);
    data.append('correctAnswer', formData.correctAnswer);
    data.append('difficulty', formData.difficulty);
    data.append('marks', formData.marks);
    data.append('negativeMarks', formData.negativeMarks);

    data.append(
      'question',
      JSON.stringify({
        text: formData.questionText,
        replaceImages: !!formData.questionFile,
      }),
    );

    data.append(
      'explanation',
      JSON.stringify({
        text: formData.explanationText,
        replaceImages: !!formData.explanationFile,
      }),
    );

    data.append(
      'options',
      JSON.stringify(
        formData.options.map((o) => ({
          text: o.text,
          replaceImage: !!o.file,
        })),
      ),
    );

    if (formData.questionFile)
      data.append('questionImages', formData.questionFile);

    if (formData.explanationFile)
      data.append('explanationImages', formData.explanationFile);

    formData.options.forEach((opt, i) => {
      if (opt.file) data.append(`optionImage_${i}`, opt.file);
    });

    try {
      await axios.put(`${baseUrl}/api/admin/mcqs/${editingMCQ._id}`, data, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' },
      });

      toast({ title: 'MCQ updated successfully', status: 'success' });

      setIsEditMode(false);
      setEditingMCQ(null);
      setFormData(initialFormState);

      const res = await axios.get(`${baseUrl}/api/admin/mcqs`, { headers });
      setMcqs(res.data.data || res.data || []);
    } catch (err) {
      toast({
        title: 'Update failed',
        description: err.response?.data?.message || 'Server error',
        status: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch Master Data ──────────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [courseRes, tagRes, mcqRes] = await Promise.all([
          axios.get(`${baseUrl}/api/admin/courses`, { headers }),
          axios.get(`${baseUrl}/api/admin/tags`, { headers }),
          axios.get(`${baseUrl}/api/admin/mcqs`, { headers }),
        ]);

        setCourses(courseRes.data.data || courseRes.data || []);
        setTags(tagRes.data.data || tagRes.data || []);
        setMcqs(mcqRes.data.data || mcqRes.data || []);
      } catch (err) {
        toast({
          title: 'Initial data load failed',
          status: 'error',
          description: err.message,
        });
      }
    };
    fetchAll();
  }, []);

  // Cascade fetches
  const loadSubjects = async (courseId) => {
    if (!courseId) {
      setSubjects([]);
      setSubSubjects([]);
      setTopics([]);
      setChapters([]);
      return;
    }
    try {
      const res = await axios.get(
        `${baseUrl}/api/admin/subjects?courseId=${courseId}`,
        { headers },
      );
      setSubjects(res.data.data || []);
      setSubSubjects([]);
      setTopics([]);
      setChapters([]);
    } catch (err) {
      toast({ title: 'Subjects load failed', status: 'error' });
    }
  };

  const loadSubSubjects = async (subjectId) => {
    if (!subjectId) {
      setSubSubjects([]);
      setTopics([]);
      setChapters([]);
      return;
    }
    try {
      const res = await axios.get(
        `${baseUrl}/api/admin/sub-subjects?subjectId=${subjectId}`,
        { headers },
      );
      setSubSubjects(res.data.data || []);
      setTopics([]);
      setChapters([]);
    } catch (err) {
      toast({ title: 'Sub-Subjects load failed', status: 'error' });
    }
  };

  const loadTopics = async (subSubjectId) => {
    setTopics([]);
    setChapters([]);

    if (!subSubjectId) return;

    try {
      const res = await axios.get(
        `${baseUrl}/api/admin/topics/sub-subject/${subSubjectId}`,
        { headers },
      );

      setTopics(res.data.data || []);
      setChapters([]);
    } catch (err) {
      toast({ title: 'Topics load failed', status: 'error' });
    }
  };

  const loadChapters = async (topicId) => {
    setChapters([]);

    if (!topicId) return;

    try {
      // 🔥 correct backend route
      const res = await axios.get(
        `${baseUrl}/api/admin/chapters/sub-subject/${formData.subSubjectId}`,
        { headers },
      );

      // 🔥 frontend side topic filter (safe + production ready)
      const filtered = (res.data.data || []).filter(
        (c) => String(c.topicId) === String(topicId),
      );

      setChapters(filtered);
    } catch (err) {
      toast({ title: 'Chapters load failed', status: 'error' });
    }
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

  const handleCreate = async () => {
    if (!formData.chapterId) {
      toast({ title: 'Chapter is required', status: 'warning' });
      return;
    }

    setLoading(true);
    const data = new FormData();

    // Required hierarchy
    data.append('courseId', formData.courseId);
    data.append('subjectId', formData.subjectId);
    data.append('subSubjectId', formData.subSubjectId);
    data.append('chapterId', formData.chapterId);

    // Optional / defaults
    if (formData.tagId) data.append('tagId', formData.tagId);
    data.append('mode', formData.mode);
    data.append('correctAnswer', formData.correctAnswer);
    data.append('difficulty', formData.difficulty);
    data.append('marks', formData.marks);
    data.append('negativeMarks', formData.negativeMarks);

    // Structured JSON fields
    data.append('question', JSON.stringify({ text: formData.questionText }));
    data.append(
      'explanation',
      JSON.stringify({ text: formData.explanationText }),
    );
    data.append(
      'options',
      JSON.stringify(formData.options.map((o) => ({ text: o.text }))),
    );

    // Images – exact multer field names
    if (formData.questionFile)
      data.append('questionImages', formData.questionFile);
    if (formData.explanationFile)
      data.append('explanationImages', formData.explanationFile);

    formData.options.forEach((opt, i) => {
      if (opt.file) data.append(`optionImage_${i}`, opt.file);
    });

    try {
      await axios.post(`${baseUrl}/api/admin/mcqs`, data, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' },
      });

      toast({ title: 'MCQ created successfully', status: 'success' });
      setFormData(initialFormState);
      // Refresh list
      const res = await axios.get(`${baseUrl}/api/admin/mcqs`, { headers });
      setMcqs(res.data.data || res.data || []);
    } catch (err) {
      toast({
        title: 'Failed to create MCQ',
        description: err.response?.data?.message || 'Server error',
        status: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this MCQ permanently?')) return;

    try {
      await axios.delete(`${baseUrl}/api/admin/mcqs/${id}`, { headers });
      toast({ title: 'MCQ deleted', status: 'info' });
      const res = await axios.get(`${baseUrl}/api/admin/mcqs`, { headers });
      setMcqs(res.data.data || res.data || []);
    } catch (err) {
      toast({ title: 'Delete failed', status: 'error' });
    }
  };

  const filteredMCQs = mcqs.filter(
    (m) =>
      (m.question?.text || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (m.chapterId?.name || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (m.mode || '').toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <Box pt={{ base: '130px', md: '80px' }} px="20px">
      {/* CREATE FORM */}
      <Card mb="30px" p="25px">
        <Flex align="center" mb="25px">
          <Icon
            as={MdAddCircle}
            color={brandColor}
            w="28px"
            h="28px"
            me="12px"
          />
          <Text color={textColor} fontSize="22px" fontWeight="700">
            Create New MCQ
          </Text>
        </Flex>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={10}>
          {/* LEFT – Metadata & Question */}
          <VStack align="stretch" spacing={6}>
            {/* Course → Subject → SubSubject → Topic → Chapter */}
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <GridItem colSpan={{ base: 2, md: 1 }}>
                <FormControl isRequired>
                  <FormLabel
                    fontSize="sm"
                    fontWeight="700"
                    color={secondaryColor}
                  >
                    <Icon as={MdLayers} me="1" /> Course
                  </FormLabel>
                  <Select
                    variant="filled"
                    placeholder="Select Course"
                    value={formData.courseId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((p) => ({
                        ...p,
                        courseId: val,
                        subjectId: '',
                        subSubjectId: '',
                        topicId: '',
                        chapterId: '',
                      }));
                      loadSubjects(val);
                    }}
                  >
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name || c.title}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </GridItem>

              <GridItem colSpan={{ base: 2, md: 1 }}>
                <FormControl isRequired>
                  <FormLabel
                    fontSize="sm"
                    fontWeight="700"
                    color={secondaryColor}
                  >
                    Subject
                  </FormLabel>
                  <Select
                    variant="filled"
                    placeholder="Select Subject"
                    isDisabled={!formData.courseId}
                    value={formData.subjectId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((p) => ({
                        ...p,
                        subjectId: val,
                        subSubjectId: '',
                        topicId: '',
                        chapterId: '',
                      }));
                      loadSubSubjects(val);
                    }}
                  >
                    {subjects.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </GridItem>
            </Grid>

            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <GridItem>
                <FormControl isRequired>
                  <FormLabel
                    fontSize="sm"
                    fontWeight="700"
                    color={secondaryColor}
                  >
                    Sub-Subject
                  </FormLabel>
                  <Select
                    variant="filled"
                    placeholder="Select Sub-Subject"
                    isDisabled={!formData.subjectId}
                    value={formData.subSubjectId}
                    onChange={(e) => {
                      const val = e.target.value;

                      // 🔥 clear old data first
                      setTopics([]);
                      setChapters([]);

                      setFormData((p) => ({
                        ...p,
                        subSubjectId: val,
                        topicId: '',
                        chapterId: '',
                      }));
                      loadTopics(val);
                    }}
                  >
                    {subSubjects.map((ss) => (
                      <option key={ss._id} value={ss._id}>
                        {ss.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl isRequired>
                  <FormLabel
                    fontSize="sm"
                    fontWeight="700"
                    color={secondaryColor}
                  >
                    Topic
                  </FormLabel>
                  <Select
                    variant="filled"
                    placeholder="Select Topic"
                    isDisabled={!formData.subSubjectId}
                    value={formData.topicId}
                    onChange={(e) => {
                      const val = e.target.value;

                      // 🔥 clear old data first
                      setChapters([]);

                      setFormData((p) => ({
                        ...p,
                        topicId: val,
                        chapterId: '',
                      }));
                      loadChapters(val);
                    }}
                  >
                    {topics.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </GridItem>
            </Grid>

            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="700" color={secondaryColor}>
                Chapter
              </FormLabel>
              <Select
                variant="filled"
                placeholder="Select Chapter"
                isDisabled={!formData.topicId}
                value={formData.chapterId}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, chapterId: e.target.value }))
                }
              >
                {chapters.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            {/* Mode, Difficulty, Tag */}
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <GridItem>
                <FormControl>
                  <FormLabel
                    fontSize="sm"
                    fontWeight="700"
                    color={secondaryColor}
                  >
                    Mode
                  </FormLabel>
                  <Select
                    variant="filled"
                    value={formData.mode}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, mode: e.target.value }))
                    }
                  >
                    <option value="regular">Regular</option>
                    <option value="exam">Exam</option>
                  </Select>
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl>
                  <FormLabel
                    fontSize="sm"
                    fontWeight="700"
                    color={secondaryColor}
                  >
                    <Icon as={MdEqualizer} me="1" /> Difficulty
                  </FormLabel>
                  <Select
                    variant="filled"
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, difficulty: e.target.value }))
                    }
                  >
                    <option value="easy">🟢 Easy</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="hard">🔴 Hard</option>
                  </Select>
                </FormControl>
              </GridItem>
            </Grid>

            <FormControl>
              <FormLabel fontSize="sm" fontWeight="700" color={secondaryColor}>
                Tag (optional)
              </FormLabel>
              <Select
                variant="filled"
                placeholder="Select Tag"
                value={formData.tagId}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, tagId: e.target.value }))
                }
              >
                <option value="">No Tag</option>
                {tags.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            {/* Question */}
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="700" color={secondaryColor}>
                <Icon as={MdHelpOutline} me="1" /> Question
              </FormLabel>
              <Textarea
                minH="110px"
                variant="auth"
                placeholder="Enter question text..."
                value={formData.questionText}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, questionText: e.target.value }))
                }
              />
              <Button
                as="label"
                mt={2}
                size="sm"
                leftIcon={<MdCloudUpload />}
                colorScheme="brand"
                variant="subtle"
                cursor="pointer"
              >
                {formData.questionFile
                  ? 'Image selected'
                  : 'Upload Question Image'}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'question')}
                />
              </Button>
            </FormControl>
          </VStack>

          {/* RIGHT – Options + Explanation */}
          <Box bg={inputBg} p="6" borderRadius="20px">
            <FormLabel fontSize="md" fontWeight="700" mb="4">
              Options (A–D)
            </FormLabel>

            {formData.options.map((opt, idx) => (
              <Box
                key={idx}
                p="4"
                mb="4"
                border="2px solid"
                borderRadius="16px"
                borderColor={
                  formData.correctAnswer === idx
                    ? 'green.400'
                    : optionBorderColor
                }
                bg={
                  formData.correctAnswer === idx
                    ? optionSelectedBg
                    : 'transparent'
                }
              >
                <Flex align="center" gap={4}>
                  <input
                    type="radio"
                    checked={formData.correctAnswer === idx}
                    onChange={() =>
                      setFormData((p) => ({ ...p, correctAnswer: idx }))
                    }
                  />
                  <VStack flex="1" align="stretch" spacing={2}>
                    <Input
                      variant="unstyled"
                      fontWeight="600"
                      placeholder={`Option ${String.fromCharCode(65 + idx)} ...`}
                      value={opt.text}
                      onChange={(e) => {
                        const newOpts = [...formData.options];
                        newOpts[idx].text = e.target.value;
                        setFormData((p) => ({ ...p, options: newOpts }));
                      }}
                    />
                    <Button
                      as="label"
                      size="xs"
                      variant="ghost"
                      colorScheme="blue"
                      p="0"
                      justifyContent="flex-start"
                      leftIcon={<MdCloudUpload />}
                    >
                      {opt.file ? 'Image selected' : 'Add option image'}
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'option', idx)}
                      />
                    </Button>
                  </VStack>
                </Flex>
              </Box>
            ))}

            {/* Explanation */}
            <FormControl mt={6}>
              <FormLabel fontSize="sm" fontWeight="700" color={secondaryColor}>
                Detailed Explanation / Solution
              </FormLabel>
              <Box
                border="1px solid"
                borderColor={optionBorderColor}
                borderRadius="12px"
                bg="white"
                overflow="hidden"
              >
                <ReactQuill
                  theme="snow"
                  value={formData.explanationText}
                  onChange={(val) =>
                    setFormData((p) => ({ ...p, explanationText: val }))
                  }
                />
              </Box>
              <Button
                as="label"
                mt={2}
                size="sm"
                leftIcon={<MdImage />}
                variant="outline"
                fontSize="xs"
              >
                {formData.explanationFile
                  ? 'Image selected'
                  : 'Upload Explanation Image'}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'explanation')}
                />
              </Button>
            </FormControl>

            <Button
              colorScheme={isEditMode ? 'orange' : 'brand'}
              mt={8}
              w="full"
              size="lg"
              onClick={isEditMode ? handleUpdate : handleCreate}
              isLoading={loading}
            >
              {isEditMode ? 'UPDATE MCQ' : 'CREATE MCQ'}
            </Button>

            {isEditMode && (
              <Button
                mt={3}
                w="full"
                size="md"
                variant="outline"
                onClick={() => {
                  setIsEditMode(false);
                  setEditingMCQ(null);
                  setFormData(initialFormState);
                }}
              >
                Cancel Edit
              </Button>
            )}
          </Box>
        </SimpleGrid>
      </Card>
      {/* LIST */}
      <Card p="25px">
        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align={{ base: 'start', md: 'center' }}
          mb="30px"
          gap={4}
        >
          <Text fontSize="22px" fontWeight="700" color={textColor}>
            MCQ Repository
          </Text>
          <InputGroup maxW="350px">
            <InputLeftElement children={<MdSearch color="gray.400" />} />
            <Input
              borderRadius="full"
              variant="filled"
              placeholder="Search question..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Flex>

        <Box overflowX="auto">
          <SimpleGrid columns={1} spacing={4}>
            <Box
              border="1px solid"
              borderColor={optionBorderColor}
              borderRadius="12px"
              overflow="hidden"
            >
              <Flex
                bg={listBg}
                px="4"
                py="3"
                fontWeight="700"
                borderBottom="1px solid"
                borderColor={optionBorderColor}
              >
                <Box flex="3">Question</Box>
                <Box flex="2">Correct Answer</Box>
                <Box flex="1" textAlign="center">
                  Action
                </Box>
              </Flex>

              {filteredMCQs.map((item, idx) => {
                const correctOpt =
                  item.options?.[item.correctAnswer]?.text || 'N/A';

                return (
                  <Flex
                    key={item._id}
                    px="4"
                    py="3"
                    align="center"
                    borderBottom="1px solid"
                    borderColor={optionBorderColor}
                    _last={{ borderBottom: 'none' }}
                  >
                    {/* Question */}
                    <Box flex="3">
                      <Text fontSize="sm" fontWeight="600" noOfLines={2}>
                        {item.question?.text}
                      </Text>
                    </Box>

                    {/* Correct Answer */}
                    <Box flex="2">
                      <Text fontSize="sm" color="green.600" fontWeight="600">
                        {correctOpt}
                      </Text>
                    </Box>

                    {/* View Button */}
                    <Box flex="1" textAlign="center">
                      <Button
                        size="sm"
                        colorScheme="brand"
                        variant="outline"
                        onClick={() =>
                          window.location.assign(`/admin/mcq/view/${item._id}`)
                        }
                      >
                        View
                      </Button>
                    </Box>
                    <Box flex="1" textAlign="center">
                      <HStack justify="center" spacing={2}>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          variant="outline"
                          onClick={() => handleEdit(item)}
                        >
                          Edit
                        </Button>
                        <IconButton
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          icon={<MdDelete />}
                          onClick={() => handleDelete(item._id)}
                        />
                      </HStack>
                    </Box>
                  </Flex>
                );
              })}

              {filteredMCQs.length === 0 && (
                <Box py="8" textAlign="center">
                  <Text color="gray.500">No MCQs found</Text>
                </Box>
              )}
            </Box>
          </SimpleGrid>
        </Box>
      </Card>

      {/* LIST
      <Card p="25px">
        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align={{ base: 'start', md: 'center' }}
          mb="30px"
          gap={4}
        >
          <Text fontSize="22px" fontWeight="700" color={textColor}>
            MCQ Repository
          </Text>
          <InputGroup maxW="350px">
            <InputLeftElement children={<MdSearch color="gray.400" />} />
            <Input
              borderRadius="full"
              variant="filled"
              placeholder="Search question / chapter / mode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Flex>

        <VStack spacing={6} align="stretch">
          {filteredMCQs.map((item, idx) => (
            <Box
              key={item._id}
              p="6"
              borderRadius="20px"
              border="1px solid"
              borderColor={optionBorderColor}
              bg={listBg}
              shadow="sm"
            >
              <Flex justify="space-between" mb="4" wrap="wrap" gap={2}>
                <HStack spacing={2} flexWrap="wrap">
                  <Badge colorScheme="purple">{item.chapterId?.name}</Badge>
                  {item.tagId?.name && (
                    <Badge colorScheme="orange" variant="outline">
                      {item.tagId.name}
                    </Badge>
                  )}
                  <Badge
                    colorScheme={
                      item.difficulty === 'easy'
                        ? 'green'
                        : item.difficulty === 'medium'
                          ? 'yellow'
                          : 'red'
                    }
                  >
                    {item.difficulty}
                  </Badge>
                  <Badge colorScheme="blue">{item.mode?.toUpperCase()}</Badge>
                </HStack>
                <IconButton
                  size="sm"
                  colorScheme="red"
                  variant="ghost"
                  icon={<MdDelete />}
                  onClick={() => handleDelete(item._id)}
                />
              </Flex>

              <Text fontSize="lg" fontWeight="700" mb="4" color={textColor}>
                Q{idx + 1}. {item.question?.text}
              </Text>

              {item.question?.images?.[0] && (
                <Image
                  src={getImageUrl(item.question.images[0])}
                  maxH="240px"
                  borderRadius="15px"
                  mb="5"
                  objectFit="contain"
                />
              )}

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb="5">
                {item.options?.map((opt, i) => (
                  <Flex
                    key={i}
                    p="4"
                    borderRadius="15px"
                    border="1px solid"
                    borderColor={
                      item.correctAnswer === i ? 'green.400' : optionBorderColor
                    }
                    bg={
                      item.correctAnswer === i
                        ? optionSelectedBg
                        : 'transparent'
                    }
                    align="center"
                    gap={3}
                  >
                    <Text fontWeight="bold" minW="24px">
                      {String.fromCharCode(65 + i)}.
                    </Text>
                    <Box flex={1}>
                      <Text>{opt.text}</Text>
                      {opt.image && (
                        <Image
                          src={getImageUrl(opt.image)}
                          maxH="90px"
                          mt={2}
                          borderRadius="8px"
                          objectFit="contain"
                        />
                      )}
                    </Box>
                    {item.correctAnswer === i && (
                      <Icon as={MdCheckCircle} color="green.500" boxSize={5} />
                    )}
                  </Flex>
                ))}
              </SimpleGrid>

              <Accordion allowToggle>
                <AccordionItem border="none">
                  <AccordionButton p="0">
                    <Box
                      flex="1"
                      textAlign="left"
                      color="brand.500"
                      fontWeight="700"
                    >
                      Show Explanation
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel
                    pb={4}
                    mt={2}
                    bg={explanationBg}
                    borderRadius="12px"
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: item.explanation?.text || '',
                      }}
                    />
                    {item.explanation?.images?.map((img, i) => (
                      <Image
                        key={i}
                        src={getImageUrl(img)}
                        maxH="220px"
                        mt={4}
                        borderRadius="12px"
                        objectFit="contain"
                      />
                    ))}
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            </Box>
          ))}

          {filteredMCQs.length === 0 && (
            <Text textAlign="center" color="gray.500" py={10}>
              No MCQs found
            </Text>
          )}
        </VStack>
      </Card> */}
    </Box>
  );
}
