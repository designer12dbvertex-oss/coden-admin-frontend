/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import {
  Box,
  Button,
  Flex,
  Text,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  VStack,
  Divider,
  Card as ChakraCard,
  Image,
  Select,
  HStack,
  FormControl,
  FormLabel,
  Textarea,
} from '@chakra-ui/react';
import axios from 'axios';
import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import defaultProfilePic from 'assets/img/profile/profile.webp';
import Card from 'components/card/Card';

export default function ServiceProviderDetails() {
  // Theme colors
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const selectBg = useColorModeValue('gray.100', 'gray.700');
  const textareaBg = useColorModeValue('gray.100', 'gray.700');

  // State
  const [data, setData] = React.useState({
    user: null,
    workers: [],
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [selectedWorker, setSelectedWorker] = React.useState(null);
  const [workerVerifyStatus, setWorkerVerifyStatus] = React.useState('pending');
  const [isDocumentModalOpen, setIsDocumentModalOpen] = React.useState(false);
  const [documentUrl, setDocumentUrl] = React.useState(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = React.useState(false);
  const [selectedAddresses, setSelectedAddresses] = React.useState([]);
  const [isRejectionModalOpen, setIsRejectionModalOpen] = React.useState(false);
  const [rejectionReason, setRejectionReason] = React.useState('');
  const [expanded, setExpanded] = React.useState(false);

  // Navigation and params
  const navigate = useNavigate();
  const { user_id } = useParams();
  const baseUrl = process.env.REACT_APP_BASE_URL;
  const token = localStorage.getItem('token');

  // Fetch data from API
  React.useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!baseUrl) throw new Error('Missing base URL');
        if (!token) throw new Error('Missing authentication token');
        if (!user_id) throw new Error('Missing user_id');

        const response = await axios.get(
          `${baseUrl}api/admin/getUser/${user_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!response.data?.user) {
          throw new Error('Invalid response format: Expected user object');
        }

        setData({
          ...response.data,
          user: {
            ...response.data.user,
            full_address: Array.isArray(response.data.user.full_address)
              ? response.data.user.full_address
              : [],
            inactivationInfo: response.data.user.inactivationInfo || null,
            verificationStatus:
              response.data.user.verificationStatus || 'pending',
            rejectionReason: response.data.user.rejectionReason || null,
          },
        });
        setLoading(false);
      } catch (err) {
        console.error('Fetch Orders Error:', err);
        if (
          err.response?.status === 401 ||
          err.response?.status === 403 ||
          err.response?.data?.message?.includes('Not authorized') ||
          err.response?.data?.message?.includes('Session expired') ||
          err.response?.data?.message?.includes('Un-Authorized')
        ) {
          localStorage.removeItem('token');
          navigate('/');
        } else {
          setError(err.message || 'Failed to fetch data');
          setLoading(false);
        }
      }
    };

    fetchOrders();
  }, [baseUrl, token, user_id, navigate]);

  // Skill display logic
  const previewLength = 100;
  const skill = data?.user?.skill || 'N/A';
  const isLong = skill.length > previewLength;
  const displayText = !expanded && isLong ? `${skill.slice(0, previewLength)}...` : skill;

  // Memoized status styles
  const getStatusStyles = React.useCallback((status) => {
    switch (status) {
      case 'approved':
      case 'verified':
        return { bg: 'green.100', color: 'green.800' };
      case 'pending':
        return { bg: 'yellow.100', color: 'yellow.800' };
      case 'rejected':
        return { bg: 'red.100', color: 'red.800' };
      default:
        return { bg: 'gray.100', color: 'gray.800' };
    }
  }, []);

  // Handle document preview
  const handleDocumentClick = React.useCallback((docUrl) => {
    setDocumentUrl(docUrl);
    setIsDocumentModalOpen(true);
  }, []);

  // Handle address modal
  const openAddressModal = React.useCallback((addresses) => {
    setSelectedAddresses(addresses);
    setIsAddressModalOpen(true);
  }, []);

  const closeAddressModal = React.useCallback(() => {
    setIsAddressModalOpen(false);
    setSelectedAddresses([]);
  }, []);

  // Handle rejection modal
  const openRejectionModal = React.useCallback(() => {
    setIsRejectionModalOpen(true);
    setRejectionReason('');
  }, []);

  const closeRejectionModal = React.useCallback(() => {
    setIsRejectionModalOpen(false);
    setRejectionReason('');
  }, []);

  // Capitalize first letter
  const capitalizeFirstLetter = (str) => {
    if (!str) return 'N/A';
    return str
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Update verification status for Service Provider
  const toggleUserVerified = async (userId, status, reason = '') => {
    try {
      const response = await axios.post(
        `${baseUrl}api/admin/approveServiceProvider`,
        { userId, status, reason },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (response.data.success) {
        setData((prevData) => ({
          ...prevData,
          user: {
            ...prevData.user,
            verificationStatus: status,
            rejectionReason: status === 'rejected' ? reason : null,
          },
        }));
        toast.success('Service Provider verification status updated successfully!');
      } else {
        throw new Error('Failed to update user verification status');
      }
    } catch (error) {
      console.error('Error toggling user verification:', error);
      toast.error(error.response?.data?.message || 'Failed to update user verification status');
    }
  };

  // Handle verification status change
  const handleToggleVerified = async (status) => {
    if (status === 'rejected') {
      openRejectionModal();
      return;
    }
    await toggleUserVerified(data.user?._id, status);
  };

  // Handle rejection reason submission
  const handleRejectionSubmit = async () => {
    if (!rejectionReason) {
      toast.error('Reason for rejection is required');
      return;
    }
    await toggleUserVerified(data.user?._id, 'rejected', rejectionReason);
    closeRejectionModal();
  };

  // Update verification status for Worker
  const handleWorkerVerifyStatusUpdate = async (worker) => {
    try {
      const response = await axios.put(
        `${baseUrl}api/worker/verify/${worker._id}`,
        { verifyStatus: workerVerifyStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success('Worker verification status updated successfully');
      setData((prevData) => ({
        ...prevData,
        workers: prevData.workers.map((w) =>
          w._id === worker._id ? { ...w, verifyStatus: workerVerifyStatus } : w,
        ),
      }));
      setSelectedWorker(null);
    } catch (err) {
      console.error('Update Worker Verification Status Error:', err);
      toast.error(err.response?.data?.message || 'Failed to update Worker verification status');
    }
  };

  if (loading) {
    return (
      <Card p="25px" bg={cardBg} borderRadius="16px" boxShadow="0px 4px 20px rgba(0, 0, 0, 0.1)">
        <Text color={textColor} fontSize="22px" fontWeight="700">
          Loading...
        </Text>
      </Card>
    );
  }

  if (error) {
    return (
      <Card p="25px" bg={cardBg} borderRadius="16px" boxShadow="0px 4px 20px rgba(0, 0, 0, 0.1)">
        <Text color={textColor} fontSize="22px" fontWeight="700">
          Error: {error}
        </Text>
      </Card>
    );
  }

  if (!data.user) {
    return (
      <Card p="25px" bg={cardBg} borderRadius="16px" boxShadow="0px 4px 20px rgba(0, 0, 0, 0.1)">
        <Text color={textColor} fontSize="22px" fontWeight="700">
          No user data available
        </Text>
      </Card>
    );
  }

  return (
    <>
      <Card p="25px" bg={cardBg} borderRadius="16px" boxShadow="0px 4px 20px rgba(0, 0, 0, 0.1)">
        <Flex mb="20px" justify="space-between" align="center">
          <Text color={textColor} fontSize="22px" fontWeight="700">
            Service Provider Details
          </Text>
          <Text color={textColor} fontSize="16px">
            Total Workers: {data.workers?.length || 0}
          </Text>
        </Flex>
        <Box>
          <ChakraCard p="20px" borderRadius="lg" border="1px solid" borderColor={borderColor} bg={cardBg}>
            <VStack spacing={6} align="stretch">
              {/* Service Provider Section */}
              <ChakraCard p="15px" borderRadius="lg" border="1px solid" borderColor={borderColor} bg={cardBg}>
                <Flex align="center" justify="space-between">
                  <Flex align="center" gap="4">
                    <Image
                      src={data.user?.profile_pic ? `${baseUrl}/${data.user.profile_pic}` : defaultProfilePic}
                      alt="Service Provider"
                      boxSize="60px"
                      borderRadius="full"
                      objectFit="cover"
                    />
                    <Box>
                      <Text fontWeight="bold" color={textColor}>
                        {capitalizeFirstLetter(data.user?.full_name || 'Not Assigned')}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {data.user?.category_id?.name || 'N/A'}
                      </Text>
                    </Box>
                  </Flex>
                </Flex>
              </ChakraCard>

              {/* Service Provider Details and Document Section */}
              <Flex gap="6" direction={{ base: 'column', md: 'row' }}>
                <ChakraCard p="15px" borderRadius="lg" border="1px solid" borderColor={borderColor} bg={cardBg} flex="1">
                  <VStack spacing={4} align="stretch">
                    <Text fontWeight="bold" fontSize="lg" color={textColor}>
                      Service Provider Information
                    </Text>
                    <Flex align="start" gap="4">
                      <Text fontWeight="semibold" color={textColor}>Provider Name:</Text>
                      <Text color={textColor}>{capitalizeFirstLetter(data.user?.full_name || 'N/A')}</Text>
                    </Flex>
                    <Flex align="start" gap="4">
                      <Text fontWeight="semibold" color={textColor}>Phone:</Text>
                      <Text color={textColor}>{data.user?.phone || 'N/A'}</Text>
                    </Flex>
                    <Flex align="start" gap="4">
                      <Text fontWeight="semibold" color={textColor}>Saved Address:</Text>
                      <Text color={textColor}>{data.user?.location.address || 'N/A'}</Text>
                    </Flex>
                    <Flex align="start" gap="4">
                      <Text fontWeight="semibold" color={textColor}>Skill:</Text>
                      <Box flex="1" wordBreak="break-word">
                        <Text color={textColor}>{displayText}</Text>
                        {isLong && (
                          <Button
                            onClick={() => setExpanded(!expanded)}
                            variant="link"
                            colorScheme="blue"
                            size="sm"
                            mt={1}
                          >
                            {expanded ? 'Read Less' : 'Read More'}
                          </Button>
                        )}
                      </Box>
                    </Flex>
                    <Flex align="start" gap="4">
                      <Text fontWeight="semibold" color={textColor}>Category:</Text>
                      <Text color={textColor}>{data.user?.category_id?.name || 'N/A'}</Text>
                    </Flex>
                    <Flex align="start" gap="4">
                      <Text fontWeight="semibold" color={textColor}>Subcategories:</Text>
                      <Text color={textColor}>
                        {data.user?.subcategory_ids?.map((sub) => sub.name).join(', ') || 'N/A'}
                      </Text>
                    </Flex>
                    <Flex align="start" gap="4">
                      <Text fontWeight="semibold" color={textColor}>Referral Code:</Text>
                      <Text color={textColor}>{data.user?.referral_code || 'N/A'}</Text>
                    </Flex>
                    <Flex align="start" gap="4">
                      <Text fontWeight="semibold" color={textColor}>Profile Complete:</Text>
                      <Text color={textColor}>{data.user?.isProfileComplete ? 'Yes' : 'No'}</Text>
                    </Flex>
                    <Flex align="start" gap="4">
                      <Text fontWeight="semibold" color={textColor}>Active:</Text>
                      <Text color={textColor}>{data.user?.active ? 'Yes' : 'No'}</Text>
                    </Flex>
                    <Flex align="start" gap="4">
                      <Text fontWeight="semibold" color={textColor}>Created At:</Text>
                      <Text color={textColor}>
                        {data.user?.createdAt ? new Date(data.user.createdAt).toLocaleDateString() : 'N/A'}
                      </Text>
                    </Flex>
                    <Flex align="start" gap="4">
                      <Text fontWeight="semibold" color={textColor}>Verification Status:</Text>
                      <HStack>
                        <Select
                          value={data.user?.verificationStatus || 'pending'}
                          onChange={(e) => handleToggleVerified(e.target.value)}
                          size="sm"
                          bg={selectBg}
                          borderRadius="8px"
                          width="150px"
                        >
                          <option value="pending">Pending</option>
                          <option value="verified">Verified</option>
                          <option value="rejected">Rejected</option>
                        </Select>
                        <Text
                          bg={getStatusStyles(data.user?.verificationStatus || 'pending').bg}
                          color={getStatusStyles(data.user?.verificationStatus || 'pending').color}
                          px="2"
                          py="1"
                          borderRadius="md"
                        >
                          {capitalizeFirstLetter(data.user?.verificationStatus || 'Pending')}
                        </Text>
                      </HStack>
                    </Flex>
                    {data.user?.verificationStatus === 'rejected' && (
                      <Flex align="start" gap="4">
                        <Text fontWeight="semibold" color={textColor}>Rejection Reason:</Text>
                        <Text color={textColor}>{data.user?.rejectionReason || 'N/A'}</Text>
                      </Flex>
                    )}
                    {data.user?.inactivationInfo && (
                      <Box mt={4} p={4} border="1px" borderColor={borderColor} borderRadius="8px">
                        <Text fontSize="md" fontWeight="600" color={textColor} mb={2}>
                          Inactivation Details
                        </Text>
                        <Flex align="start" gap="4">
                          <Text fontWeight="semibold" color={textColor}>Inactivated By:</Text>
                          <Text color={textColor}>
                            {data.user.inactivationInfo.inactivatedBy?.full_name || 'N/A'} (
                            {data.user.inactivationInfo.inactivatedBy?.email || 'N/A'})
                          </Text>
                        </Flex>
                        <Flex align="start" gap="4" mt={2}>
                          <Text fontWeight="semibold" color={textColor}>Reason:</Text>
                          <Text color={textColor}>{data.user.inactivationInfo.reason || 'N/A'}</Text>
                        </Flex>
                        <Flex align="start" gap="4" mt={2}>
                          <Text fontWeight="semibold" color={textColor}>Dispute ID:</Text>
                          <Text color={textColor}>
                            {data.user.inactivationInfo.disputeId?.unique_id || 'N/A'}
                          </Text>
                        </Flex>
                        <Flex align="start" gap="4" mt={2}>
                          <Text fontWeight="semibold" color={textColor}>Inactivated At:</Text>
                          <Text color={textColor}>
                            {data.user.inactivationInfo.inactivatedAt
                              ? new Date(data.user.inactivationInfo.inactivatedAt).toLocaleString()
                              : 'N/A'}
                          </Text>
                        </Flex>
                      </Box>
                    )}
                  </VStack>
                </ChakraCard>

                {/* Document Section */}
                <ChakraCard p="15px" borderRadius="lg" border="1px solid" borderColor={borderColor} bg={cardBg} w={{ base: '100%', md: '200px' }}>
                  <Text fontWeight="bold" fontSize="lg" color={textColor}>
                    Document
                  </Text>
                  {data.user?.documents ? (
                    <Flex justify="center" mt="2">
                      <Image
                        src={`${baseUrl}/${data.user.documents}`}
                        alt="Document Preview"
                        boxSize="150px"
                        objectFit="cover"
                        borderRadius="md"
                        cursor="pointer"
                        onClick={() => handleDocumentClick(`${baseUrl}/${data.user.documents}`)}
                        onError={(e) => (e.target.src = defaultProfilePic)}
                      />
                    </Flex>
                  ) : (
                    <Text color={textColor} mt="2">
                      No document available
                    </Text>
                  )}
                </ChakraCard>
              </Flex>

              {/* Bank Details Section */}
              <ChakraCard p="15px" borderRadius="lg" border="1px solid" borderColor={borderColor} bg={cardBg}>
                <VStack spacing={4} align="stretch">
                  <Divider />
                  <Text fontWeight="bold" fontSize="lg" color={textColor}>
                    Bank Details
                  </Text>
                  <Flex align="start" gap="4">
                    <Text fontWeight="semibold" color={textColor}>Account Number:</Text>
                    <Text color={textColor}>{data.user?.bankdetails?.accountNumber || 'N/A'}</Text>
                  </Flex>
                  <Flex align="start" gap="4">
                    <Text fontWeight="semibold" color={textColor}>Account Holder Name:</Text>
                    <Text color={textColor}>{data.user?.bankdetails?.accountHolderName || 'N/A'}</Text>
                  </Flex>
                  <Flex align="start" gap="4">
                    <Text fontWeight="semibold" color={textColor}>Bank Name:</Text>
                    <Text color={textColor}>{data.user?.bankdetails?.bankName || 'N/A'}</Text>
                  </Flex>
                  <Flex align="start" gap="4">
                    <Text fontWeight="semibold" color={textColor}>IFSC Code:</Text>
                    <Text color={textColor}>{data.user?.bankdetails?.ifscCode || 'N/A'}</Text>
                  </Flex>
                  <Flex align="start" gap="4">
                    <Text fontWeight="semibold" color={textColor}>UPI ID:</Text>
                    <Text color={textColor}>{data.user?.bankdetails?.upiId || 'N/A'}</Text>
                  </Flex>
                </VStack>
              </ChakraCard>

              {/* Reviews Section */}
              <ChakraCard p="15px" borderRadius="lg" border="1px solid" borderColor={borderColor} bg={cardBg}>
                <Text fontWeight="bold" fontSize="lg" color={textColor}>
                  Rate and Reviews
                </Text>
                {data.user?.rateAndReviews?.length > 0 ? (
                  <VStack spacing={2} align="stretch" mt="2">
                    {data.user.rateAndReviews.map((review, index) => (
                      <Flex
                        key={index}
                        align="center"
                        justify="space-between"
                        p="2"
                        borderBottom="1px solid"
                        borderColor={borderColor}
                      >
                        <Box>
                          <Text color={textColor}>{review.review || 'No review text'}</Text>
                          <HStack spacing="1">
                            {review.images?.map((img, imgIndex) => (
                              <Image
                                key={imgIndex}
                                src={`${img}`}
                                alt={`Review Image ${imgIndex + 1}`}
                                boxSize="50px"
                                objectFit="cover"
                              />
                            ))}
                          </HStack>
                        </Box>
                        <Flex align="center" gap="2">
                          <Text color="yellow.500">Rating: {review.rating || 'N/A'}</Text>
                          <Text color="gray.600">
                            {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'N/A'}
                          </Text>
                        </Flex>
                      </Flex>
                    ))}
                  </VStack>
                ) : (
                  <Text color={textColor} mt="2">
                    No reviews available
                  </Text>
                )}
              </ChakraCard>
            </VStack>
          </ChakraCard>
        </Box>
      </Card>

      {/* Document Modal */}
      <Modal isOpen={isDocumentModalOpen} onClose={() => setIsDocumentModalOpen(false)} size="xl">
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent borderRadius="16px" bg={cardBg} boxShadow="0px 4px 20px rgba(0, 0, 0, 0.2)">
          <ModalHeader fontSize="lg" fontWeight="700" color={textColor}>
            Document Preview
          </ModalHeader>
          <ModalCloseButton color={textColor} />
          <ModalBody>
            {documentUrl && (
              <Image
                src={documentUrl}
                alt="Document"
                objectFit="contain"
                maxH="80vh"
                maxW="100%"
                onError={(e) => (e.target.src = defaultProfilePic)}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Address Modal */}
      <Modal isOpen={isAddressModalOpen} onClose={closeAddressModal} isCentered size="lg">
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent maxW={{ base: '90%', md: '600px' }} borderRadius="16px" bg={cardBg} boxShadow="0px 4px 20px rgba(0, 0, 0, 0.2)">
          <ModalHeader fontSize="lg" fontWeight="700" color={textColor} borderBottom="1px" borderColor={borderColor}>
            User Addresses
          </ModalHeader>
          <ModalCloseButton color={textColor} />
          <ModalBody py="20px">
            {selectedAddresses.length === 0 ? (
              <Text color={textColor} fontSize="sm">
                No addresses available.
              </Text>
            ) : (
              selectedAddresses.map((addr, index) => (
                <Box key={addr.id} mb={4} p={4} border="1px" borderColor={borderColor} borderRadius="8px">
                  <Text fontSize="sm" fontWeight="600" color={textColor}>
                    {index + 1}. {addr.title || 'Address'}
                  </Text>
                  <Text fontSize="sm" color={textColor} mt={1}>
                    <strong>Address:</strong> {addr.address || 'N/A'}
                  </Text>
                  <Text fontSize="sm" color={textColor} mt={1}>
                    <strong>Landmark:</strong> {addr.landmark || 'N/A'}
                  </Text>
                  <Text fontSize="sm" color={textColor} mt={1}>
                    <strong>Latitude:</strong> {addr.latitude || 'N/A'}
                  </Text>
                  <Text fontSize="sm" color={textColor} mt={1}>
                    <strong>Longitude:</strong> {addr.longitude || 'N/A'}
                  </Text>
                </Box>
              ))
            )}
          </ModalBody>
          <ModalFooter borderTop="1px" borderColor={borderColor}>
            <Button colorScheme="teal" onClick={closeAddressModal} borderRadius="12px" size="sm" _hover={{ bg: 'teal.600' }}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Rejection Reason Modal */}
      <Modal isOpen={isRejectionModalOpen} onClose={closeRejectionModal} isCentered>
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent maxW={{ base: '90%', md: '500px' }} borderRadius="16px" bg={cardBg} boxShadow="0px 4px 20px rgba(0, 0, 0, 0.2)">
          <ModalHeader fontSize="lg" fontWeight="700" color={textColor} borderBottom="1px" borderColor={borderColor}>
            Rejection Reason
          </ModalHeader>
          <ModalCloseButton color={textColor} />
          <ModalBody py="20px">
            <FormControl isRequired mb={4}>
              <FormLabel color={textColor}>Reason for Rejection</FormLabel>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection"
                bg={textareaBg}
                borderRadius="8px"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter borderTop="1px" borderColor={borderColor}>
            <Button colorScheme="gray" mr={3} onClick={closeRejectionModal} borderRadius="12px" size="sm">
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleRejectionSubmit} borderRadius="12px" size="sm" isLoading={false} _hover={{ bg: 'red.600' }}>
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Worker Details Modal */}
      {selectedWorker && (
        <Modal isOpen={!!selectedWorker} onClose={() => setSelectedWorker(null)} size="xl">
          <ModalOverlay bg="blackAlpha.600" />
          <ModalContent borderRadius="xl" boxShadow="2xl" p={4} bg={cardBg}>
            <ModalHeader fontSize="2xl" fontWeight="bold" color={textColor} textAlign="center">
              Worker Details
            </ModalHeader>
            <ModalCloseButton size="lg" _hover={{ bg: 'gray.100', transform: 'scale(1.1)' }} transition="all 0.2s ease-in-out" />
            <ModalBody>
              <ChakraCard p="4" boxShadow="md" borderRadius="lg">
                <VStack spacing={4} align="stretch">
                  <Flex align="center" gap="4">
                    <Image
                      src={selectedWorker.image ? `${baseUrl}/${selectedWorker.image}` : defaultProfilePic}
                      alt="Worker"
                      boxSize="100px"
                      borderRadius="full"
                      objectFit="cover"
                    />
                    <Box>
                      <Text fontWeight="bold" fontSize="xl" color={textColor}>
                        Name: {capitalizeFirstLetter(selectedWorker.name || 'N/A')}
                      </Text>
                    </Box>
                  </Flex>
                  <Flex align="start" gap="4">
                    <Text fontWeight="semibold" color={textColor}>Phone:</Text>
                    <Text color={textColor}>{selectedWorker.phone || 'N/A'}</Text>
                  </Flex>
                  <Flex align="start" gap="4">
                    <Text fontWeight="semibold" color={textColor}>Address:</Text>
                    <Text color={textColor}>{selectedWorker.address || 'N/A'}</Text>
                  </Flex>
                  <Flex align="start" gap="4">
                    <Text fontWeight="semibold" color={textColor}>Date of Birth:</Text>
                    <Text color={textColor}>
                      {selectedWorker.dob ? new Date(selectedWorker.dob).toLocaleDateString() : 'N/A'}
                    </Text>
                  </Flex>
                  <Flex align="start" gap="4">
                    <Text fontWeight="semibold" color={textColor}>Aadhar Number:</Text>
                    <Text color={textColor}>{selectedWorker.aadharNumber || 'N/A'}</Text>
                  </Flex>
                  <Flex align="start" gap="4">
                    <Text fontWeight="semibold" color={textColor}>Aadhar Card:</Text>
                    {selectedWorker.aadharImage ? (
                      <Image
                        src={`${baseUrl}/${selectedWorker.aadharImage}`}
                        alt="Aadhar Card"
                        boxSize="100px"
                        objectFit="cover"
                        borderRadius="md"
                        cursor="pointer"
                        onClick={() => handleDocumentClick(`${baseUrl}/${selectedWorker.aadharImage}`)}
                        onError={(e) => (e.target.src = defaultProfilePic)}
                      />
                    ) : (
                      <Text color={textColor}>No Aadhar card available</Text>
                    )}
                  </Flex>
                  <Flex align="start" gap="4">
                    <Text fontWeight="semibold" color={textColor}>Created At:</Text>
                    <Text color={textColor}>
                      {selectedWorker?.createdAt
                        ? new Date(selectedWorker.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })
                        : 'N/A'}
                    </Text>
                  </Flex>
                  <Flex align="start" gap="4">
                    <Text fontWeight="semibold" color={textColor}>Assigned Orders:</Text>
                    <Text color={textColor}>
                      {selectedWorker.assignOrders?.length > 0
                        ? selectedWorker.assignOrders.map((order) => order.order_id).join(', ')
                        : 'None'}
                    </Text>
                  </Flex>
                  <Flex align="start" gap="4">
                    <Text fontWeight="semibold" color={textColor}>Verification Status:</Text>
                    <Select
                      value={workerVerifyStatus}
                      onChange={(e) => setWorkerVerifyStatus(e.target.value)}
                      width="150px"
                      bg={selectBg}
                      borderRadius="8px"
                    >
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                    </Select>
                  </Flex>
                </VStack>
              </ChakraCard>
            </ModalBody>
            <ModalFooter>
              <Button
                colorScheme="teal"
                mr={3}
                onClick={() => handleWorkerVerifyStatusUpdate(selectedWorker)}
                _hover={{ bg: 'teal.600', transform: 'scale(1.05)' }}
                transition="all 0.2s ease-in-out"
              >
                Save
              </Button>
              <Button
                colorScheme="gray"
                onClick={() => setSelectedWorker(null)}
                _hover={{ bg: 'gray.300', transform: 'scale(1.05)' }}
                transition="all 0.2s ease-in-out"
              >
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
      <ToastContainer />
    </>
  );
}
