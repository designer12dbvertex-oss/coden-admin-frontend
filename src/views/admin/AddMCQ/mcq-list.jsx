// 'use client';
// import React, { useEffect, useState } from 'react';
// import {
//   Box,
//   Flex,
//   Text,
//   Heading,
//   useColorModeValue,
//   Badge,
//   Table,
//   Thead,
//   Tbody,
//   Tr,
//   Th,
//   Td,
//   Image,
//   VStack,
//   HStack,
//   Accordion,
//   AccordionItem,
//   AccordionButton,
//   AccordionPanel,
//   AccordionIcon,
//   Icon,
//   Spinner,
//   Divider,
//   Card,
//   CardBody,
//   CardHeader,
// } from '@chakra-ui/react';
// import { MdCheckCircle, MdSchool, MdOutlineQuiz } from 'react-icons/md';
// import axios from 'axios';

// export default function MCQList() {
//   const bgCard = useColorModeValue('white', 'gray.800');
//   const bgHover = useColorModeValue('gray.50', 'gray.700');
//   const borderColor = useColorModeValue('gray.200', 'gray.600');
//   const textColor = useColorModeValue('gray.800', 'gray.100');
//   const secondaryText = useColorModeValue('gray.600', 'gray.400');
//   const accentColor = useColorModeValue('purple.600', 'purple.300');
//   const headerBg = useColorModeValue('purple.50', 'gray.800');
//   const correctOptionBgColor = useColorModeValue('green.50', 'green.900');
//   const tableBg = useColorModeValue('gray.100', 'gray.700');

//   const rawBaseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:4000';
//   const baseUrl = rawBaseUrl.endsWith('/')
//     ? rawBaseUrl.slice(0, -1)
//     : rawBaseUrl;

//   const token = localStorage.getItem('token');
//   const headers = { Authorization: `Bearer ${token}` };

//   const [mcqs, setMcqs] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const fetchMCQs = React.useCallback(async () => {
//     try {
//       const res = await axios.get(`${baseUrl}/api/admin/mcqs`, { headers });
//       setMcqs(res.data.data || []);
//     } catch (err) {
//       console.error('Failed to load MCQs:', err);
//     } finally {
//       setLoading(false);
//     }
//   }, [baseUrl, headers]);

//   useEffect(() => {
//     fetchMCQs();
//   }, [fetchMCQs]);

//   // Group MCQs: subject → subSubject → topic → chapter
//   const grouped = mcqs.reduce((acc, mcq) => {
//     const subject = mcq.subjectId?.name || 'Uncategorized';
//     const subSubject = mcq.subSubjectId?.name || 'General';
//     const topic = mcq.topicId?.name || 'Miscellaneous';
//     const chapter = mcq.chapterId?.name || 'No Chapter';

//     if (!acc[subject]) acc[subject] = {};
//     if (!acc[subject][subSubject]) acc[subject][subSubject] = {};
//     if (!acc[subject][subSubject][topic]) acc[subject][subSubject][topic] = {};
//     if (!acc[subject][subSubject][topic][chapter])
//       acc[subject][subSubject][topic][chapter] = [];

//     acc[subject][subSubject][topic][chapter].push(mcq);
//     return acc;
//   }, {});

//   const getDifficultyColor = (diff) => {
//     if (diff === 'easy') return 'green';
//     if (diff === 'medium') return 'yellow';
//     if (diff === 'hard') return 'red';
//     return 'gray';
//   };

//   const getModeColor = (mode) => (mode === 'exam' ? 'red' : 'blue');

//   const getImageUrl = React.useCallback(
//     (path) => {
//       if (!path) return '';
//       if (path.startsWith('http')) return path;
//       const cleanPath = path.startsWith('/') ? path.slice(1) : path;
//       return `${baseUrl}/${cleanPath}`;
//     },
//     [baseUrl],
//   );

//   return (
//     <Box
//       minH="100vh"
//       bg={useColorModeValue('gray.50', 'gray.900')}
//       pt={{ base: '90px', md: '100px' }}
//       pb="12"
//       px={{ base: '4', md: '6', lg: '8' }}
//     >
//       <Card
//         bg={bgCard}
//         shadow="xl"
//         borderRadius="2xl"
//         overflow="hidden"
//         border="1px solid"
//         borderColor={borderColor}
//         maxW="1400px"
//         mx="auto"
//       >
//         <CardHeader
//           bg={useColorModeValue('purple.50', 'gray.800')}
//           py={6}
//           px={8}
//         >
//           <HStack justify="space-between" align="center">
//             <Heading size="lg" color={accentColor}>
//               MCQ Repository
//             </Heading>
//             <Badge fontSize="md" colorScheme="purple" px={4} py={1}>
//               {mcqs.length} Questions
//             </Badge>
//           </HStack>
//         </CardHeader>

//         <CardBody p={{ base: 5, md: 8 }}>
//           {loading ? (
//             <Flex justify="center" align="center" minH="60vh">
//               <VStack spacing={4}>
//                 <Spinner
//                   thickness="4px"
//                   speed="0.65s"
//                   emptyColor="gray.200"
//                   color={accentColor}
//                   size="xl"
//                 />
//                 <Text color={secondaryText}>Loading questions...</Text>
//               </VStack>
//             </Flex>
//           ) : Object.keys(grouped).length === 0 ? (
//             <Flex
//               justify="center"
//               align="center"
//               minH="50vh"
//               direction="column"
//               gap={4}
//             >
//               <Icon as={MdOutlineQuiz} boxSize={16} color="gray.400" />
//               <Text fontSize="xl" color={secondaryText}>
//                 No MCQs found in the database
//               </Text>
//             </Flex>
//           ) : (
//             <Accordion allowMultiple defaultIndex={[0]} allowToggle>
//               {Object.entries(grouped).map(([subject, subSubjects]) => (
//                 <AccordionItem key={subject} border="none" mb={4}>
//                   <AccordionButton
//                     bg={headerBg}
//                     _hover={{ bg: headerBg }}
//                     borderRadius="xl"
//                     py={4}
//                     px={6}
//                   >
//                     <Flex flex="1" align="center" gap={4}>
//                       <Icon as={MdSchool} boxSize={6} color={accentColor} />
//                       <Heading size="md" color={accentColor}>
//                         {subject}
//                       </Heading>
//                     </Flex>
//                     <AccordionIcon fontSize="2xl" />
//                   </AccordionButton>

//                   <AccordionPanel pb={6} pt={4} px={0}>
//                     {Object.entries(subSubjects).map(([subSubject, topics]) => (
//                       <Box key={subSubject} mb={8} pl={6}>
//                         <Badge
//                           colorScheme="blue"
//                           fontSize="md"
//                           px={4}
//                           py={1}
//                           mb={4}
//                           borderRadius="full"
//                         >
//                           {subSubject}
//                         </Badge>

//                         {Object.entries(topics).map(([topic, chapters]) => (
//                           <Box key={topic} mb={8} pl={4}>
//                             <Badge
//                               colorScheme="orange"
//                               variant="subtle"
//                               fontSize="sm"
//                               px={3}
//                               py={1}
//                               mb={4}
//                             >
//                               {topic}
//                             </Badge>

//                             {Object.entries(chapters).map(
//                               ([chapter, items]) => (
//                                 <Box key={chapter} mb={10} pl={4}>
//                                   <HStack mb={4}>
//                                     <Badge
//                                       colorScheme="green"
//                                       variant="solid"
//                                       px={3}
//                                       py={1}
//                                     >
//                                       {chapter}
//                                     </Badge>
//                                     <Text fontSize="sm" color={secondaryText}>
//                                       ({items.length} questions)
//                                     </Text>
//                                   </HStack>

//                                   <Box
//                                     border="1px solid"
//                                     borderColor={borderColor}
//                                     borderRadius="xl"
//                                     overflow="hidden"
//                                     boxShadow="sm"
//                                     _hover={{ boxShadow: 'md' }}
//                                     transition="all 0.2s"
//                                   >
//                                     <Table
//                                       variant="simple"
//                                       size={{ base: 'sm', md: 'md' }}
//                                     >
//                                       <Thead bg={tableBg}>
//                                         <Tr>
//                                           <Th>Question</Th>
//                                           <Th minW="140px">Correct Answer</Th>
//                                           <Th minW="90px">Mode</Th>
//                                           <Th minW="100px">Difficulty</Th>
//                                           <Th w="80px">Details</Th>
//                                         </Tr>
//                                       </Thead>
//                                       <Tbody>
//                                         {items.map((mcq) => (
//                                           <Tr
//                                             key={mcq._id}
//                                             _hover={{ bg: bgHover }}
//                                             transition="background 0.15s"
//                                           >
//                                             <Td
//                                               fontWeight="medium"
//                                               maxW="420px"
//                                             >
//                                               <Text noOfLines={2}>
//                                                 {mcq.question?.text || '—'}
//                                               </Text>
//                                             </Td>
//                                             <Td
//                                               color="green.600"
//                                               fontWeight="semibold"
//                                             >
//                                               {mcq.options?.[mcq.correctAnswer]
//                                                 ?.text || '—'}
//                                             </Td>
//                                             <Td>
//                                               <Badge
//                                                 colorScheme={getModeColor(
//                                                   mcq.mode,
//                                                 )}
//                                                 variant="solid"
//                                                 px={3}
//                                               >
//                                                 {mcq.mode?.toUpperCase() || '—'}
//                                               </Badge>
//                                             </Td>
//                                             <Td>
//                                               <Badge
//                                                 colorScheme={getDifficultyColor(
//                                                   mcq.difficulty,
//                                                 )}
//                                                 variant="solid"
//                                                 px={3}
//                                               >
//                                                 {mcq.difficulty || '—'}
//                                               </Badge>
//                                             </Td>
//                                             <Td>
//                                               <Accordion allowToggle>
//                                                 <AccordionItem border="none">
//                                                   <AccordionButton
//                                                     p={2}
//                                                     borderRadius="md"
//                                                     color="blue.500"
//                                                     _hover={{ bg: 'blue.50' }}
//                                                   >
//                                                     <Text fontWeight="bold">
//                                                       View
//                                                     </Text>
//                                                     <AccordionIcon ml={1} />
//                                                   </AccordionButton>
//                                                   <AccordionPanel
//                                                     pt={4}
//                                                     pb={6}
//                                                     bg="transparent"
//                                                   >
//                                                     <VStack
//                                                       align="stretch"
//                                                       spacing={5}
//                                                     >
//                                                       {/* Question Images */}
//                                                       {mcq.question?.images
//                                                         ?.length > 0 && (
//                                                         <Flex
//                                                           wrap="wrap"
//                                                           gap={3}
//                                                         >
//                                                           {mcq.question.images.map(
//                                                             (img, i) => (
//                                                               <Image
//                                                                 key={i}
//                                                                 src={getImageUrl(
//                                                                   img,
//                                                                 )}
//                                                                 maxH="200px"
//                                                                 borderRadius="lg"
//                                                                 objectFit="contain"
//                                                                 border="1px solid"
//                                                                 borderColor={
//                                                                   borderColor
//                                                                 }
//                                                               />
//                                                             ),
//                                                           )}
//                                                         </Flex>
//                                                       )}

//                                                       {/* Options */}
//                                                       <VStack
//                                                         spacing={3}
//                                                         align="stretch"
//                                                       >
//                                                         {mcq.options?.map(
//                                                           (opt, i) => (
//                                                             <Flex
//                                                               key={i}
//                                                               p={4}
//                                                               borderRadius="lg"
//                                                               border="2px solid"
//                                                               borderColor={
//                                                                 mcq.correctAnswer ===
//                                                                 i
//                                                                   ? 'green.400'
//                                                                   : borderColor
//                                                               }
//                                                               bg={
//                                                                 mcq.correctAnswer ===
//                                                                 i
//                                                                   ? correctOptionBgColor
//                                                                   : 'transparent'
//                                                               }
//                                                               align="center"
//                                                               gap={4}
//                                                               transition="all 0.2s"
//                                                               _hover={{
//                                                                 bg:
//                                                                   mcq.correctAnswer ===
//                                                                   i
//                                                                     ? undefined
//                                                                     : bgHover,
//                                                               }}
//                                                             >
//                                                               <Box
//                                                                 fontWeight="bold"
//                                                                 fontSize="lg"
//                                                                 minW="32px"
//                                                                 textAlign="center"
//                                                                 color={
//                                                                   mcq.correctAnswer ===
//                                                                   i
//                                                                     ? 'green.600'
//                                                                     : 'inherit'
//                                                                 }
//                                                               >
//                                                                 {String.fromCharCode(
//                                                                   65 + i,
//                                                                 )}
//                                                                 .
//                                                               </Box>
//                                                               <Box flex={1}>
//                                                                 <Text>
//                                                                   {opt.text}
//                                                                 </Text>
//                                                                 {opt.image && (
//                                                                   <Image
//                                                                     src={getImageUrl(
//                                                                       opt.image,
//                                                                     )}
//                                                                     maxH="140px"
//                                                                     mt={3}
//                                                                     borderRadius="md"
//                                                                     objectFit="contain"
//                                                                   />
//                                                                 )}
//                                                               </Box>
//                                                               {mcq.correctAnswer ===
//                                                                 i && (
//                                                                 <Icon
//                                                                   as={
//                                                                     MdCheckCircle
//                                                                   }
//                                                                   boxSize={6}
//                                                                   color="green.500"
//                                                                 />
//                                                               )}
//                                                             </Flex>
//                                                           ),
//                                                         )}
//                                                       </VStack>

//                                                       {/* Explanation */}
//                                                       {(mcq.explanation?.text ||
//                                                         mcq.explanation?.images
//                                                           ?.length > 0) && (
//                                                         <>
//                                                           <Divider my={4} />
//                                                           <Box>
//                                                             <Heading
//                                                               size="sm"
//                                                               mb={3}
//                                                               color={
//                                                                 accentColor
//                                                               }
//                                                             >
//                                                               Explanation
//                                                             </Heading>
//                                                             {mcq.explanation
//                                                               ?.text && (
//                                                               <Box
//                                                                 dangerouslySetInnerHTML={{
//                                                                   __html:
//                                                                     mcq
//                                                                       .explanation
//                                                                       .text,
//                                                                 }}
//                                                                 sx={{
//                                                                   '& p': {
//                                                                     mb: 3,
//                                                                   },
//                                                                   '& ul, & ol':
//                                                                     {
//                                                                       pl: 6,
//                                                                       mb: 3,
//                                                                     },
//                                                                 }}
//                                                               />
//                                                             )}
//                                                             {mcq.explanation?.images?.map(
//                                                               (img, i) => (
//                                                                 <Image
//                                                                   key={i}
//                                                                   src={getImageUrl(
//                                                                     img,
//                                                                   )}
//                                                                   maxH="240px"
//                                                                   mt={4}
//                                                                   borderRadius="lg"
//                                                                   objectFit="contain"
//                                                                   border="1px solid"
//                                                                   borderColor={
//                                                                     borderColor
//                                                                   }
//                                                                 />
//                                                               ),
//                                                             )}
//                                                           </Box>
//                                                         </>
//                                                       )}
//                                                     </VStack>
//                                                   </AccordionPanel>
//                                                 </AccordionItem>
//                                               </Accordion>
//                                             </Td>
//                                           </Tr>
//                                         ))}
//                                       </Tbody>
//                                     </Table>
//                                   </Box>
//                                 </Box>
//                               ),
//                             )}
//                           </Box>
//                         ))}
//                       </Box>
//                     ))}
//                   </AccordionPanel>
//                 </AccordionItem>
//               ))}
//             </Accordion>
//           )}
//         </CardBody>
//       </Card>
//     </Box>
//   );
// }

'use client';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Text,
  Heading,
  useColorModeValue,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Image,
  VStack,
  HStack,
  Icon,
  Spinner,
  Divider,
  Card,
  CardBody,
  CardHeader,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Button,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { MdCheckCircle, MdSchool, MdOutlineQuiz } from 'react-icons/md';
import axios from 'axios';

export default function MCQList() {
  const bgCard = useColorModeValue('white', 'gray.800');
  const bgHover = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const secondaryText = useColorModeValue('gray.600', 'gray.400');
  const accentColor = useColorModeValue('purple.600', 'purple.300');
  const headerBg = useColorModeValue('purple.50', 'gray.800');
  const correctOptionBgColor = useColorModeValue('green.50', 'green.900');
  const tableBg = useColorModeValue('gray.100', 'gray.700');

  const rawBaseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:4000';
  const baseUrl = rawBaseUrl.endsWith('/')
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const [mcqs, setMcqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedKey, setExpandedKey] = useState(null);
  const [selectedMcq, setSelectedMcq] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchMCQs = React.useCallback(async () => {
    try {
      const res = await axios.get(`${baseUrl}/api/admin/mcqs`, { headers });
      setMcqs(res.data.data || []);
    } catch (err) {
      console.error('Failed to load MCQs:', err);
    } finally {
      setLoading(false);
    }
  }, [baseUrl, headers]);

  useEffect(() => {
    fetchMCQs();
  }, [fetchMCQs]);

  // Group MCQs: subject → subSubject → topic → chapter
  const grouped = mcqs.reduce((acc, mcq) => {
    const subject = mcq.subjectId?.name || 'Uncategorized';
    const subSubject = mcq.subSubjectId?.name || 'General';
    const topic = mcq.topicId?.name || 'Miscellaneous';
    const chapter = mcq.chapterId?.name || 'No Chapter';

    if (!acc[subject]) acc[subject] = {};
    if (!acc[subject][subSubject]) acc[subject][subSubject] = {};
    if (!acc[subject][subSubject][topic]) acc[subject][subSubject][topic] = {};
    if (!acc[subject][subSubject][topic][chapter])
      acc[subject][subSubject][topic][chapter] = [];

    acc[subject][subSubject][topic][chapter].push(mcq);
    return acc;
  }, {});

  const getDifficultyColor = (diff) => {
    if (diff === 'easy') return 'green';
    if (diff === 'medium') return 'yellow';
    if (diff === 'hard') return 'red';
    return 'gray';
  };

  const getModeColor = (mode) => (mode === 'exam' ? 'red' : 'blue');

  const getImageUrl = React.useCallback(
    (path) => {
      if (!path) return '';
      if (path.startsWith('http')) return path;
      const cleanPath = path.startsWith('/') ? path.slice(1) : path;
      return `${baseUrl}/${cleanPath}`;
    },
    [baseUrl],
  );

  const openModal = (mcq) => {
    setSelectedMcq(mcq);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedMcq(null);
    setIsModalOpen(false);
  };

  return (
    <Box
      minH="100vh"
      bg={useColorModeValue('gray.50', 'gray.900')}
      pt={{ base: '90px', md: '100px' }}
      pb="12"
      px={{ base: '4', md: '6', lg: '8' }}
    >
      <Card
        bg={bgCard}
        shadow="2xl"
        borderRadius="2xl"
        overflow="hidden"
        border="1px solid"
        borderColor={borderColor}
        maxW="1400px"
        mx="auto"
      >
        <CardHeader bg={headerBg} py={6} px={8}>
          <HStack justify="space-between" align="center">
            <HStack spacing={3}>
              <Icon as={MdOutlineQuiz} boxSize={7} color={accentColor} />
              <Heading size="lg" color={accentColor}>
                MCQ Repository
              </Heading>
            </HStack>
            <Badge fontSize="md" colorScheme="purple" px={4} py={1}>
              {mcqs.length} Questions
            </Badge>
          </HStack>
        </CardHeader>

        <CardBody p={{ base: 5, md: 8 }}>
          {loading ? (
            <Flex justify="center" align="center" minH="60vh">
              <VStack spacing={4}>
                <Spinner
                  thickness="4px"
                  speed="0.65s"
                  emptyColor="gray.200"
                  color={accentColor}
                  size="xl"
                />
                <Text color={secondaryText}>Loading questions...</Text>
              </VStack>
            </Flex>
          ) : Object.keys(grouped).length === 0 ? (
            <Flex
              justify="center"
              align="center"
              minH="50vh"
              direction="column"
              gap={4}
            >
              <Icon as={MdOutlineQuiz} boxSize={16} color="gray.400" />
              <Text fontSize="xl" color={secondaryText}>
                No MCQs found in the database
              </Text>
            </Flex>
          ) : (
            Object.entries(grouped).map(([subject, subSubjects]) => (
              <Box key={subject} mb={12}>
                <HStack mb={4}>
                  <Icon as={MdSchool} boxSize={6} color={accentColor} />
                  <Heading size="md" color={accentColor}>
                    {subject}
                  </Heading>
                </HStack>

                {/* SubSubject–Topic–Chapter Table */}
                <Box
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="xl"
                  overflow="hidden"
                  boxShadow="sm"
                >
                  <Table variant="simple" size="md">
                    <Thead bg={tableBg}>
                      <Tr>
                        <Th>Sub Subject</Th>
                        <Th>Topic</Th>
                        <Th>Chapter</Th>
                        <Th>Tags</Th>
                        <Th>Total Questions</Th>
                        <Th>Action</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {Object.entries(subSubjects).flatMap(
                        ([subSubject, topics]) =>
                          Object.entries(topics).flatMap(([topic, chapters]) =>
                            Object.entries(chapters).map(([chapter, items]) => {
                              const key = `${subject}-${subSubject}-${topic}-${chapter}`;
                              const tags = Array.from(
                                new Set(items.flatMap((m) => m.tags || [])),
                              );

                              return (
                                <React.Fragment key={key}>
                                  <Tr _hover={{ bg: bgHover }}>
                                    <Td fontWeight="medium">{subSubject}</Td>
                                    <Td>{topic}</Td>
                                    <Td>{chapter}</Td>
                                    <Td>
                                      <Wrap>
                                        {tags.length > 0 ? (
                                          tags.map((tag, i) => (
                                            <WrapItem key={i}>
                                              <Badge
                                                colorScheme="teal"
                                                variant="subtle"
                                                px={2}
                                              >
                                                {tag}
                                              </Badge>
                                            </WrapItem>
                                          ))
                                        ) : (
                                          <Text
                                            fontSize="sm"
                                            color={secondaryText}
                                          >
                                            —
                                          </Text>
                                        )}
                                      </Wrap>
                                    </Td>
                                    <Td>
                                      <Badge
                                        colorScheme="purple"
                                        borderRadius="full"
                                        px={3}
                                      >
                                        {items.length}
                                      </Badge>
                                    </Td>
                                    <Td>
                                      <Button
                                        size="sm"
                                        colorScheme="blue"
                                        variant="outline"
                                        borderRadius="full"
                                        onClick={() =>
                                          setExpandedKey(
                                            expandedKey === key ? null : key,
                                          )
                                        }
                                      >
                                        {expandedKey === key
                                          ? 'Hide'
                                          : 'View Questions'}
                                      </Button>
                                    </Td>
                                  </Tr>

                                  {/* Inline Questions */}
                                  {expandedKey === key && (
                                    <Tr>
                                      <Td colSpan={6} p={4}>
                                        <Box
                                          border="1px solid"
                                          borderColor={borderColor}
                                          borderRadius="xl"
                                          overflow="hidden"
                                          boxShadow="sm"
                                        >
                                          <Table variant="simple" size="sm">
                                            <Thead bg={tableBg}>
                                              <Tr>
                                                <Th>Question</Th>
                                                <Th>Correct Answer</Th>
                                                <Th>Mode</Th>
                                                <Th>Difficulty</Th>
                                                <Th>Tags</Th>
                                                <Th>View</Th>
                                              </Tr>
                                            </Thead>
                                            <Tbody>
                                              {items.map((mcq) => (
                                                <Tr
                                                  key={mcq._id}
                                                  _hover={{
                                                    bg: bgHover,
                                                  }}
                                                >
                                                  <Td maxW="420px">
                                                    <Text noOfLines={2}>
                                                      {mcq.question?.text ||
                                                        '—'}
                                                    </Text>
                                                  </Td>
                                                  <Td
                                                    color="green.600"
                                                    fontWeight="semibold"
                                                  >
                                                    {mcq.options?.[
                                                      mcq.correctAnswer
                                                    ]?.text || '—'}
                                                  </Td>
                                                  <Td>
                                                    <Badge
                                                      colorScheme={getModeColor(
                                                        mcq.mode,
                                                      )}
                                                      px={3}
                                                    >
                                                      {mcq.mode}
                                                    </Badge>
                                                  </Td>
                                                  <Td>
                                                    <Badge
                                                      colorScheme={getDifficultyColor(
                                                        mcq.difficulty,
                                                      )}
                                                      px={3}
                                                    >
                                                      {mcq.difficulty}
                                                    </Badge>
                                                  </Td>
                                                  <Td>
                                                    <Wrap>
                                                      {(mcq.tags || []).map(
                                                        (tag, i) => (
                                                          <WrapItem key={i}>
                                                            <Badge
                                                              colorScheme="teal"
                                                              variant="subtle"
                                                              px={2}
                                                            >
                                                              {tag}
                                                            </Badge>
                                                          </WrapItem>
                                                        ),
                                                      )}
                                                    </Wrap>
                                                  </Td>
                                                  <Td>
                                                    <Button
                                                      size="sm"
                                                      colorScheme="blue"
                                                      borderRadius="full"
                                                      onClick={() =>
                                                        openModal(mcq)
                                                      }
                                                    >
                                                      View
                                                    </Button>
                                                  </Td>
                                                </Tr>
                                              ))}
                                            </Tbody>
                                          </Table>
                                        </Box>
                                      </Td>
                                    </Tr>
                                  )}
                                </React.Fragment>
                              );
                            }),
                          ),
                      )}
                    </Tbody>
                  </Table>
                </Box>
              </Box>
            ))
          )}
        </CardBody>
      </Card>

      {/* View Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader>Question Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedMcq && (
              <VStack align="stretch" spacing={5}>
                <Box>
                  <Heading size="sm" mb={2}>
                    Question
                  </Heading>
                  <Text>{selectedMcq.question?.text}</Text>

                  {selectedMcq.question?.images?.map((img, i) => (
                    <Image
                      key={i}
                      src={getImageUrl(img)}
                      maxH="220px"
                      mt={3}
                      borderRadius="lg"
                      objectFit="contain"
                    />
                  ))}
                </Box>

                <Box>
                  <Heading size="sm" mb={3}>
                    Options
                  </Heading>

                  <VStack spacing={3} align="stretch">
                    {selectedMcq.options?.map((opt, i) => (
                      <Flex
                        key={i}
                        p={4}
                        borderRadius="lg"
                        border="2px solid"
                        borderColor={
                          selectedMcq.correctAnswer === i
                            ? 'green.400'
                            : borderColor
                        }
                        bg={
                          selectedMcq.correctAnswer === i
                            ? correctOptionBgColor
                            : 'transparent'
                        }
                        align="center"
                        gap={4}
                      >
                        <Text fontWeight="bold">
                          {String.fromCharCode(65 + i)}.
                        </Text>
                        <Box flex={1}>
                          <Text>{opt.text}</Text>
                          {opt.image && (
                            <Image
                              src={getImageUrl(opt.image)}
                              maxH="140px"
                              mt={3}
                              borderRadius="md"
                              objectFit="contain"
                            />
                          )}
                        </Box>
                        {selectedMcq.correctAnswer === i && (
                          <Icon
                            as={MdCheckCircle}
                            boxSize={6}
                            color="green.500"
                          />
                        )}
                      </Flex>
                    ))}
                  </VStack>
                </Box>

                {(selectedMcq.explanation?.text ||
                  selectedMcq.explanation?.images?.length > 0) && (
                  <Box>
                    <Divider my={4} />
                    <Heading size="sm" mb={3} color={accentColor}>
                      Explanation
                    </Heading>

                    {selectedMcq.explanation?.text && (
                      <Box
                        dangerouslySetInnerHTML={{
                          __html: selectedMcq.explanation.text,
                        }}
                      />
                    )}

                    {selectedMcq.explanation?.images?.map((img, i) => (
                      <Image
                        key={i}
                        src={getImageUrl(img)}
                        maxH="240px"
                        mt={4}
                        borderRadius="lg"
                        objectFit="contain"
                      />
                    ))}
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
