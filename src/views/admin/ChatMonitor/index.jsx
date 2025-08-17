/* eslint-disable */
'use client';

import {
  Box,
  Flex,
  Text,
  Button,
  useColorModeValue,
  useToast,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Stack,
  useDisclosure,
} from '@chakra-ui/react';
import axios from 'axios';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';

// Custom components
import Card from 'components/card/Card';

export default function ConversationsTable() {
  const [conversations, setConversations] = React.useState([]);
  const [messages, setMessages] = React.useState([]);
  const [selectedConversationId, setSelectedConversationId] = React.useState(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const navigate = useNavigate();
  const toast = useToast();

  const baseUrl = process.env.REACT_APP_BASE_URL;
  const token = localStorage.getItem('token');

  const { isOpen: isImageModalOpen, onOpen: onImageModalOpen, onClose: onImageModalClose } = useDisclosure();

  // Fetch all conversations
  const fetchConversations = async () => {
    try {
      if (!baseUrl || !token) {
        throw new Error('Missing base URL or authentication token');
      }
      setLoading(true);
      const response = await axios.get(`${baseUrl}api/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('API Response (Conversations):', response.data);

      if (!response.data || !Array.isArray(response.data.conversations)) {
        throw new Error('Invalid response format: Expected an array of conversations');
      }

      setConversations(response.data.conversations);
      setLoading(false);
    } catch (err) {
      console.error('Fetch Conversations Error:', err);
      if (
        err.response?.data?.message === 'Not authorized, token failed' ||
        err.response?.data?.message === 'Session expired or logged in on another device' ||
        err.response?.data?.message === 'Un-Authorized, You are not authorized to access this route.'
      ) {
        localStorage.removeItem('token');
        navigate('/');
      } else {
        setError(err.message || 'Failed to fetch conversations');
        setLoading(false);
      }
    }
  };

  // Fetch messages for a specific conversation
  const fetchConversationMessages = async (conversationId) => {
    try {
      if (!baseUrl || !token) {
        throw new Error('Missing base URL or authentication token');
      }
      setLoading(true);
      const response = await axios.get(`${baseUrl}api/chat/messages/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('API Response (Messages):', response.data);

      if (!response.data || !Array.isArray(response.data.messages)) {
        throw new Error('Invalid response format: Expected an array of messages');
      }

      setMessages(response.data.messages);
      setSelectedConversationId(conversationId);
      setIsModalOpen(true);
      setLoading(false);
    } catch (err) {
      console.error('Fetch Messages Error:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to fetch messages',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      setError(err.message || 'Failed to fetch messages');
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchConversations();
  }, [navigate]);

  if (loading) {
    return (
      <Card
        flexDirection="column"
        w="100%"
        px="25px"
        py="25px"
        overflowX={{ sm: 'scroll', lg: 'hidden' }}
        borderRadius="20px"
        boxShadow="lg"
      >
        <Text color={textColor} fontSize="22px" fontWeight="700" p="25px">
          Loading...
        </Text>
      </Card>
    );
  }

  if (error) {
    return (
      <Card
        flexDirection="column"
        w="100%"
        px="25px"
        py="25px"
        overflowX={{ sm: 'scroll', lg: 'hidden' }}
        borderRadius="20px"
        boxShadow="lg"
        style={{ marginTop: '80px' }}
      >
        <Text color={textColor} fontSize="22px" fontWeight="700" p="25px">
          Error: {error}
        </Text>
      </Card>
    );
  }

  return (
    <Card
      flexDirection="column"
      w="100%"
      px="25px"
      py="25px"
      overflowX={{ sm: 'scroll', lg: 'hidden' }}
      borderRadius="20px"
      boxShadow="lg"
      style={{ marginTop: '80px' }}
    >
      <Flex
        px="0px"
        mb="20px"
        justifyContent="space-between"
        alignItems="center"
        bg="teal.500"
        color="white"
        p="10px"
        borderRadius="md"
      >
        <Text fontSize="xl" fontWeight="700">
          Chat Monitor
        </Text>
      </Flex>
      <Box mb="30px" maxH="300px" overflowY="auto">
        <Flex
          p="10px"
          mb="5px"
          borderBottom={`1px solid ${borderColor}`}
          fontWeight="600"
          color={textColor}
          minW="700px"
          justifyContent="space-between"
          alignItems="center"
        >
          <Text w="150px" textAlign="center">User 1</Text>
          <Text w="150px" textAlign="center">User 2</Text>
          <Text w="200px" textAlign="center">Last Message</Text>
          <Text w="150px" textAlign="center">Last Message Date</Text>
          <Text w="100px" textAlign="center">Action</Text>
        </Flex>
        {conversations.map((conv) => {
          const [user1, user2] = conv.members;
          return (
            <Flex
              key={conv._id}
              p="10px"
              mb="5px"
              borderBottom={`1px solid ${borderColor}`}
              justifyContent="space-between"
              alignItems="center"
              minW="700px"
            >
              <Text color={textColor} fontSize="sm" fontWeight="400" w="150px" textAlign="center">
                {user1.full_name} - {user1.unique_id}
              </Text>

              <Text color={textColor} fontSize="sm" fontWeight="400" w="150px" textAlign="center">
                {user2.full_name} - {user2.unique_id}
              </Text>
              <Text color={textColor} fontSize="sm" fontWeight="400" w="200px" textAlign="center">
                {conv.lastMessage || 'No message'}
              </Text>
              <Text color="gray.500" fontSize="xs" w="150px" textAlign="center">
                {new Date(conv.lastMessageTime || conv.updatedAt).toLocaleString('en-IN', {
                  timeZone: 'Asia/Kolkata',
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </Text>
              <Button
                colorScheme="teal"
                size="sm"
                onClick={() => fetchConversationMessages(conv._id)}
              >
                View Message
              </Button>
            </Flex>
          );
        })}
      </Box>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="xl" maxH="50vh">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader bg="teal.500" color="white" borderTopRadius="md">
            Conversation Details
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody p="20px">
            <Stack spacing="15px" maxH="75vh" overflowY="auto">
              {messages.map((msg, index) => {
                const conversation = conversations.find((c) => c._id === msg.conversationId);
                const [user1] = conversation?.members || [];
                const isUser1 = msg.senderId === user1?._id;
                return (
                  <Flex
                    key={msg._id}
                    direction="column"
                    alignSelf={isUser1 ? 'flex-start' : 'flex-end'}
                    bg={isUser1 ? 'gray.200' : 'green.100'}
                    p="10px"
                    borderRadius="md"
                    maxW="70%"
                  >
                    {msg.messageType === 'image' && msg.image && msg.image.length > 0 ? (
                      <Box>
                        <Flex wrap="wrap" gap="10px">
                          {msg.image.map((img, imgIndex) => (
                            <Image
                              key={imgIndex}
                              src={`${baseUrl}${img}`}
                              alt={`Message image ${imgIndex + 1}`}
                              maxH="150px"
                              objectFit="cover"
                              borderRadius="md"
                              boxShadow="md"
                              _hover={{ transform: 'scale(1.05)', transition: '0.3s' }}
                              cursor="pointer"
                              onClick={() => {
                                setSelectedImage(`${baseUrl}${img}`);
                                onImageModalOpen();
                              }}
                            />
                          ))}
                        </Flex>
                      </Box>
                    ) : (
                      <Text fontSize="sm" fontWeight="500" color={textColor}>
                        {msg.message || 'No message'}
                      </Text>
                    )}
                    <Text fontSize="xs" color="gray.600">
                      {new Date(msg.createdAt).toLocaleTimeString('en-IN', {
                        timeZone: 'Asia/Kolkata',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </Flex>
                );
              })}
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal isOpen={isImageModalOpen} onClose={onImageModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader bg="teal.500" color="white" borderTopRadius="md">
            Image Preview
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody p="20px" display="flex" justifyContent="center" alignItems="center">
            <Image src={selectedImage} alt="Enlarged image" maxH="80vh" objectFit="contain" />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Card>
  );
}
