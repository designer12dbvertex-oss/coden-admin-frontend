import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  HStack,
  Heading,
  Text,
  useToast,
  Spinner,
  Badge,
  Checkbox,
  CheckboxGroup,
  SimpleGrid,
} from '@chakra-ui/react';
import axios from 'axios';

const CreateTest = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [fetchingCourses, setFetchingCourses] = useState(false);
  const [fetchingFilters, setFetchingFilters] = useState(false);
  const [filteredSubSubjects, setFilteredSubSubjects] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [filteredChapters, setFilteredChapters] = useState([]);

  // API Configuration
  const baseUrl = process.env.REACT_APP_BASE_URL || '';
  const token = localStorage.getItem('token');
  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` },
  });

  // ===== STATE =====
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    month: '',
    academicYear: '',
    testTitle: '',
    courseId: '',
    category: 'grand', // 'grand' or 'subject'
    testMode: 'regular', // 'regular' or 'exam'
    subjects: [],
    subSubjects: [],
    topics: [],
    chapters: [],
    mcqLimit: '',
    timeLimit: '',
    description: '',
  });

  const [filterData, setFilterData] = useState({
    subjects: [],
    subSubjects: [],
    topics: [],
    chapters: [],
  });

  // Months list
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  // Years list (current year - 5 to +5)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => {
    const year = currentYear - 5 + i;
    return `${year}-${year + 1}`;
  });

  // ===== EFFECTS =====
  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (formData.courseId && formData.category === 'subject') {
      fetchCourseFilters(formData.courseId);
    }
  }, [formData.courseId, formData.category]);

  // 🔹 Subjects → Sub-subjects
  useEffect(() => {
    if (formData.subjects.length) {
      const filtered = filterData.subSubjects.filter((s) =>
        formData.subjects.includes(String(s.subjectId)),
      );
      setFilteredSubSubjects(filtered);
    } else {
      setFilteredSubSubjects([]);
    }
  }, [formData.subjects, filterData.subSubjects]);

  // 🔹 Sub-subjects → Topics
  useEffect(() => {
    if (formData.subSubjects.length) {
      const filtered = filterData.topics.filter((t) =>
        formData.subSubjects.includes(String(t.subSubjectId)),
      );
      setFilteredTopics(filtered);
    } else {
      setFilteredTopics([]);
    }
  }, [formData.subSubjects, filterData.topics]);

  // 🔹 Topics → Chapters
  useEffect(() => {
    if (formData.topics.length) {
      const filtered = filterData.chapters.filter((c) =>
        formData.topics.includes(String(c.topicId)),
      );
      setFilteredChapters(filtered);
    } else {
      setFilteredChapters([]);
    }
  }, [formData.topics, filterData.chapters]);

  // ===== API CALLS =====
  const fetchCourses = async () => {
    setFetchingCourses(true);
    try {
      const response = await axios.get(
        `${baseUrl}api/admin/courses`,
        getHeaders(),
      );
      setCourses(response.data.data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch courses',
        status: 'error',
      });
    } finally {
      setFetchingCourses(false);
    }
  };

  const fetchCourseFilters = async (courseId) => {
    if (!courseId) return;
    setFetchingFilters(true);
    try {
      const response = await axios.get(
        `${baseUrl}api/admin/tests/filters/${courseId}`,
        getHeaders(),
      );
      setFilterData(
        response.data.data || {
          subjects: [],
          subSubjects: [],
          topics: [],
          chapters: [],
        },
      );
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch course filters',
        status: 'error',
      });
    } finally {
      setFetchingFilters(false);
    }
  };

  // ===== HANDLERS =====
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCategoryChange = (category) => {
    setFormData((prev) => ({
      ...prev,
      category,
      subjects: [],
      subSubjects: [],
      topics: [],
      chapters: [],
    }));
    // If subject test and course is selected, fetch filters
    if (category === 'subject' && formData.courseId) {
      fetchCourseFilters(formData.courseId);
    }
  };

  const handleCourseChange = (courseId) => {
    setFormData((prev) => ({
      ...prev,
      courseId,
      subjects: [],
      subSubjects: [],
      topics: [],
      chapters: [],
    }));
    // If subject test, fetch filters
    if (formData.category === 'subject' && courseId) {
      fetchCourseFilters(courseId);
    }
  };

  const handleMultiSelect = (field, value, isChecked) => {
    setFormData((prev) => {
      let updated = { ...prev };

      if (isChecked) {
        updated[field] = [...prev[field], value];
      } else {
        updated[field] = prev[field].filter((id) => id !== value);
      }

      // DEPENDENCY CLEAR LOGIC
      if (field === 'subjects') {
        updated.subSubjects = [];
        updated.topics = [];
        updated.chapters = [];
      }

      if (field === 'subSubjects') {
        updated.topics = [];
        updated.chapters = [];
      }

      if (field === 'topics') {
        updated.chapters = [];
      }

      return updated;
    });
  };

  const handleCreateTest = async () => {
    // Validation
    if (!formData.month || !formData.academicYear || !formData.testTitle) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill Month, Academic Year, and Test Title',
        status: 'error',
      });
      return;
    }

    if (!formData.courseId) {
      toast({
        title: 'Missing Course',
        description: 'Please select a course',
        status: 'error',
      });
      return;
    }

    if (!formData.mcqLimit || parseInt(formData.mcqLimit) < 1) {
      toast({
        title: 'Invalid MCQ Limit',
        description: 'MCQ Limit must be at least 1',
        status: 'error',
      });
      return;
    }

    if (
      formData.testMode === 'exam' &&
      (!formData.timeLimit || parseInt(formData.timeLimit) < 1)
    ) {
      toast({
        title: 'Missing Time Limit',
        description: 'Time limit is required for Exam Mode',
        status: 'error',
      });
      return;
    }

    if (formData.category === 'subject') {
      const hasFilter =
        formData.subjects.length > 0 ||
        formData.subSubjects.length > 0 ||
        formData.topics.length > 0 ||
        formData.chapters.length > 0;

      if (!hasFilter) {
        toast({
          title: 'No Selection',
          description:
            'Please select at least one Subject, Sub-subject, Topic, or Chapter',
          status: 'error',
        });
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        month: formData.month,
        academicYear: formData.academicYear,
        testTitle: formData.testTitle,
        category: formData.category,
        testMode: formData.testMode,
        courseId: formData.courseId,
        subjects: formData.subjects,
        subSubjects: formData.subSubjects,
        topics: formData.topics,
        chapters: formData.chapters,
        mcqLimit: parseInt(formData.mcqLimit),
        timeLimit:
          formData.testMode === 'exam' ? parseInt(formData.timeLimit) : null,
        description: formData.description || '',
      };

      const response = await axios.post(
        `${baseUrl}api/admin/tests/create`,
        payload,
        getHeaders(),
      );

      toast({
        title: 'Success',
        description: response.data.message || 'Test created successfully!',
        status: 'success',
        duration: 3000,
      });

      // Reset form
      setFormData({
        month: '',
        academicYear: '',
        testTitle: '',
        courseId: '',
        category: 'grand',
        testMode: 'regular',
        subjects: [],
        subSubjects: [],
        topics: [],
        chapters: [],
        mcqLimit: '',
        timeLimit: '',
        description: '',
      });
      setFilterData({
        subjects: [],
        subSubjects: [],
        topics: [],
        chapters: [],
      });

      // Optionally refresh page or redirect
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create test',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // ===== RENDER =====
  return (
    <Box p={6}>
      <Card p={8} maxWidth="900px" mx="auto">
        <VStack spacing={6} align="stretch">
          <Heading size="lg" textAlign="center">
            Create New Test
          </Heading>

          {/* Month Select */}
          <FormControl isRequired>
            <FormLabel>Month</FormLabel>
            <Select
              value={formData.month}
              onChange={(e) => handleInputChange('month', e.target.value)}
              placeholder="Select Month"
            >
              {months.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>
          </FormControl>

          {/* Academic Year Select */}
          <FormControl isRequired>
            <FormLabel>Academic Year</FormLabel>
            <Select
              value={formData.academicYear}
              onChange={(e) =>
                handleInputChange('academicYear', e.target.value)
              }
              placeholder="Select Academic Year"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Select>
          </FormControl>

          {/* Test Title */}
          <FormControl isRequired>
            <FormLabel>Test Title</FormLabel>
            <Input
              type="text"
              placeholder="e.g., Physics Full Syllabus Test"
              value={formData.testTitle}
              onChange={(e) => handleInputChange('testTitle', e.target.value)}
            />
          </FormControl>

          {/* Course Select */}
          <FormControl isRequired>
            <FormLabel>Course</FormLabel>
            {fetchingCourses ? (
              <Spinner />
            ) : (
              <Select
                value={formData.courseId}
                onChange={(e) => handleCourseChange(e.target.value)}
                placeholder="Select Course"
              >
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.name}
                  </option>
                ))}
              </Select>
            )}
          </FormControl>

          {/* Category Select */}
          <FormControl isRequired>
            <FormLabel>Category</FormLabel>
            <Select
              value={formData.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              <option value="grand">Grand Test</option>
              <option value="subject">Subject Test</option>
            </Select>
          </FormControl>

          {/* Subject Test Filters - Show only when Subject Test is selected */}
          {formData.category === 'subject' && formData.courseId && (
            <Box
              border="1px solid"
              borderColor="gray.300"
              borderRadius="md"
              p={4}
              bg="gray.50"
            >
              <Heading size="sm" mb={4}>
                Select Content (Select at least one)
              </Heading>
              {fetchingFilters ? (
                <Spinner />
              ) : (
                <SimpleGrid columns={2} spacing={4}>
                  {/* Subjects */}
                  <FormControl>
                    <FormLabel>Subjects</FormLabel>
                    <Box
                      border="1px solid"
                      borderColor="gray.300"
                      borderRadius="md"
                      p={3}
                      maxHeight="200px"
                      overflowY="auto"
                      bg="white"
                    >
                      {filterData.subjects.length === 0 ? (
                        <Text fontSize="sm" color="gray.500">
                          No subjects available
                        </Text>
                      ) : (
                        filterData.subjects.map((subject) => (
                          <Checkbox
                            key={subject._id}
                            isChecked={formData.subjects.includes(subject._id)}
                            onChange={(e) =>
                              handleMultiSelect(
                                'subjects',
                                subject._id,
                                e.target.checked,
                              )
                            }
                            mb={2}
                          >
                            {subject.name}
                          </Checkbox>
                        ))
                      )}
                    </Box>
                  </FormControl>

                  {/* Sub-Subjects */}
                  <FormControl isDisabled={!formData.subjects.length}>
                    <FormLabel>Sub-Subjects</FormLabel>
                    <Box
                      border="1px solid"
                      borderColor="gray.300"
                      borderRadius="md"
                      p={3}
                      maxHeight="200px"
                      overflowY="auto"
                      bg="white"
                    >
                      {filterData.subSubjects.length === 0 ? (
                        <Text fontSize="sm" color="gray.500">
                          No sub-subjects available
                        </Text>
                      ) : (
                        (filteredSubSubjects.length
                          ? filteredSubSubjects
                          : []
                        ).map((subSubject) => (
                          <Checkbox
                            key={subSubject._id}
                            isChecked={formData.subSubjects.includes(
                              subSubject._id,
                            )}
                            onChange={(e) =>
                              handleMultiSelect(
                                'subSubjects',
                                subSubject._id,
                                e.target.checked,
                              )
                            }
                            mb={2}
                          >
                            {subSubject.name}
                          </Checkbox>
                        ))
                      )}
                    </Box>
                  </FormControl>

                  {/* Topics */}
                  <FormControl isDisabled={!formData.subSubjects.length}>
                    <FormLabel>Topics</FormLabel>
                    <Box
                      border="1px solid"
                      borderColor="gray.300"
                      borderRadius="md"
                      p={3}
                      maxHeight="200px"
                      overflowY="auto"
                      bg="white"
                    >
                      {filterData.topics.length === 0 ? (
                        <Text fontSize="sm" color="gray.500">
                          No topics available
                        </Text>
                      ) : (
                        (filteredTopics.length ? filteredTopics : []).map(
                          (topic) => (
                            <Checkbox
                              key={topic._id}
                              isChecked={formData.topics.includes(topic._id)}
                              onChange={(e) =>
                                handleMultiSelect(
                                  'topics',
                                  topic._id,
                                  e.target.checked,
                                )
                              }
                              mb={2}
                            >
                              {topic.name}
                            </Checkbox>
                          ),
                        )
                      )}
                    </Box>
                  </FormControl>

                  {/* Chapters */}
                  <FormControl isDisabled={!formData.topics.length}>
                    <FormLabel>Chapters</FormLabel>
                    <Box
                      border="1px solid"
                      borderColor="gray.300"
                      borderRadius="md"
                      p={3}
                      maxHeight="200px"
                      overflowY="auto"
                      bg="white"
                    >
                      {filterData.chapters.length === 0 ? (
                        <Text fontSize="sm" color="gray.500">
                          No chapters available
                        </Text>
                      ) : (
                        (filteredChapters.length ? filteredChapters : []).map(
                          (chapter) => (
                            <Checkbox
                              key={chapter._id}
                              isChecked={formData.chapters.includes(
                                chapter._id,
                              )}
                              onChange={(e) =>
                                handleMultiSelect(
                                  'chapters',
                                  chapter._id,
                                  e.target.checked,
                                )
                              }
                              mb={2}
                            >
                              {chapter.name}
                            </Checkbox>
                          ),
                        )
                      )}
                    </Box>
                  </FormControl>
                </SimpleGrid>
              )}
            </Box>
          )}

          {/* Mode Select */}
          <FormControl isRequired>
            <FormLabel>Mode</FormLabel>
            <Select
              value={formData.testMode}
              onChange={(e) => handleInputChange('testMode', e.target.value)}
            >
              <option value="regular">Regular Mode</option>
              <option value="exam">Exam Mode</option>
            </Select>
          </FormControl>

          {/* MCQ Limit */}
          <FormControl isRequired>
            <FormLabel>MCQ Limit</FormLabel>
            <Input
              type="number"
              placeholder="e.g., 50"
              min="1"
              value={formData.mcqLimit}
              onChange={(e) => handleInputChange('mcqLimit', e.target.value)}
            />
          </FormControl>

          {/* Time Limit - Only for Exam Mode */}
          {formData.testMode === 'exam' && (
            <FormControl isRequired>
              <FormLabel>Time Limit (Minutes)</FormLabel>
              <Input
                type="number"
                placeholder="e.g., 60"
                min="1"
                value={formData.timeLimit}
                onChange={(e) => handleInputChange('timeLimit', e.target.value)}
              />
            </FormControl>
          )}

          {/* Description (Optional) */}
          <FormControl>
            <FormLabel>Description (Optional)</FormLabel>
            <Input
              type="text"
              placeholder="Optional description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </FormControl>

          {/* Summary Card */}
          {(formData.testTitle || formData.mcqLimit) && (
            <Card p={4} bg="blue.50" border="1px solid" borderColor="blue.200">
              <VStack align="start" spacing={2}>
                <Text fontWeight="bold" fontSize="md">
                  Test Summary:
                </Text>
                {formData.testTitle && (
                  <Text>
                    <strong>Title:</strong> {formData.testTitle}
                  </Text>
                )}
                {formData.month && formData.academicYear && (
                  <Text>
                    <strong>Period:</strong> {formData.month} /{' '}
                    {formData.academicYear}
                  </Text>
                )}
                <HStack>
                  <Badge
                    colorScheme={
                      formData.category === 'grand' ? 'green' : 'blue'
                    }
                  >
                    {formData.category === 'grand'
                      ? 'Grand Test'
                      : 'Subject Test'}
                  </Badge>
                  <Badge
                    colorScheme={
                      formData.testMode === 'exam' ? 'orange' : 'cyan'
                    }
                  >
                    {formData.testMode === 'exam'
                      ? 'Exam Mode'
                      : 'Regular Mode'}
                  </Badge>
                </HStack>
                {formData.mcqLimit && (
                  <Text>
                    <strong>MCQ Limit:</strong> {formData.mcqLimit} questions
                  </Text>
                )}
                {formData.testMode === 'exam' && formData.timeLimit && (
                  <Text>
                    <strong>Time Limit:</strong> {formData.timeLimit} minutes
                  </Text>
                )}
              </VStack>
            </Card>
          )}

          {/* Create Button */}
          <Button
            colorScheme="green"
            size="lg"
            onClick={handleCreateTest}
            isLoading={loading}
            loadingText="Creating Test..."
            width="100%"
          >
            Create Test
          </Button>
        </VStack>
      </Card>
    </Box>
  );
};

export default CreateTest;
