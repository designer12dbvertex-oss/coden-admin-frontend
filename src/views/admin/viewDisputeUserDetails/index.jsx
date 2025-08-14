/* eslint-disable react-hooks/exhaustive-deps */ // Disable specific rule with justification: useEffect dependencies are intentionally limited
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
  Switch,
  useDisclosure,
  Input,
} from '@chakra-ui/react';
import axios from 'axios';
import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import defaultProfilePic from 'assets/img/profile/profile.webp';
// Custom components
import Card from 'components/card/Card';

export default function ServiceProviderDetails() {
  const [data, setData] = React.useState({
    user: null,
    workers: [],
    workerCount: 0,
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [selectedWorker, setSelectedWorker] = React.useState(null);
  const [verifyStatus, setVerifyStatus] = React.useState('');
  const [toggleLoading, setToggleLoading] = React.useState(false);
  const [selectedDocument, setSelectedDocument] = React.useState(null);
  const {
    isOpen: isWorkerDetailsOpen,
    onOpen: onWorkerDetailsOpen,
    onClose: onWorkerDetailsClose,
  } = useDisclosure();
  const {
    isOpen: isDocumentModalOpen,
    onOpen: onDocumentModalOpen,
    onClose: onDocumentModalClose,
  } = useDisclosure();
  const {
    isOpen: isAddressModalOpen,
    onOpen: onAddressModalOpen,
    onClose: onAddressModalClose,
  } = useDisclosure();
  const {
    isOpen: isEditAddressModalOpen,
    onOpen: onEditAddressModalOpen,
    onClose: onEditAddressModalClose,
  } = useDisclosure();
  const [editAddress, setEditAddress] = React.useState(null);
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
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
        if (!user_id) throw new Error('Missing service_provider_id');

        const response = await axios.get(
          `${baseUrl}api/admin/getDisputeUser/${user_id}`,
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
          },
        });
        setLoading(false);
      } catch (err) {
        console.error('Fetch Orders Error:', err);
        if (
          err.response?.status === 401 ||
          err.response?.status === 403 ||
          err.response?.data?.message === 'Not authorized, token failed' ||
          err.response?.data?.message ===
            'Session expired or logged in on another device' ||
          err.response?.data?.message ===
            'Un-Authorized, You are not authorized to access this route.'
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
  }, [navigate, user_id]);

  const getStatusStyles = (status, type) => {
    if (type === 'verifyStatus') {
      switch (status) {
        case 'approved':
        case true:
          return { bg: 'green.100', color: 'green.800' };
        case 'pending':
          return { bg: 'yellow.100', color: 'yellow.800' };
        case 'rejected':
        case false:
          return { bg: 'red.100', color: 'red.800' };
        default:
          return { bg: 'gray.100', color: 'gray.800' };
      }
    }
    return { bg: 'gray.100', color: 'gray.800' };
  };

  // Update verification status for Service Provider
  const toggleUserVerified = async (userId, verified) => {
    if (verified) {
      toast.info('User is already verified.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    setToggleLoading(true);

    try {
      const response = await axios.post(
        `${baseUrl}api/admin/approveServiceProvider`,
        { userId },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.success) {
        setData((prevData) => ({
          ...prevData,
          user: { ...prevData.user, verified: !verified },
        }));

        toast.success('User verified successfully!', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        throw new Error('Failed to update verification status');
      }
    } catch (error) {
      console.error('Error verifying service provider:', error);
      const message =
        error.response?.data?.message || 'Failed to update verification status';
      setError(message);
      toast.error(message, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setToggleLoading(false);
    }
  };

  const capitalizeFirstLetter = (str) => {
    if (!str) return 'N/A';
    return str
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Update verification status for Worker
  const handleWorkerVerifyStatusUpdate = async (worker) => {
    try {
      const endpoint = `${baseUrl}api/worker/verify/${worker._id}`;
      const response = await axios.put(
        endpoint,
        { verifyStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success('Worker verification status updated successfully', {
        position: 'top-right',
        autoClose: 3000,
      });
      setData((prevData) => ({
        ...prevData,
        workers: prevData.workers.map((w) =>
          w._id === worker._id ? { ...w, verifyStatus } : w,
        ),
      }));
      onWorkerDetailsClose();
    } catch (err) {
      console.error('Update Worker Verification Status Error:', err);
      toast.error(
        err.response?.data?.message ||
          'Failed to update Worker verification status',
        {
          position: 'top-right',
          autoClose: 3000,
        },
      );
    }
  };

  // Handle document click
  const handleDocumentClick = (documentUrl) => {
    setSelectedDocument(documentUrl);
    onDocumentModalOpen();
  };

  // Handle edit button click
  const handleEditAddress = (address, index) => {
    setEditAddress({ ...address, index });
    onEditAddressModalOpen();
  };

  // Handle address update
  const handleAddressUpdate = async () => {
    try {
      setToggleLoading(true);
      const response = await axios.put(
        `${baseUrl}api/admin/updateUserAddress/${data.user._id}`,
        {
          addressId: editAddress._id,
          updatedAddress: {
            title: editAddress.title,
            address: editAddress.address,
            landmark: editAddress.landmark,
            latitude: editAddress.latitude,
            longitude: editAddress.longitude,
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.success) {
        const updatedAddresses = [...data.user.full_address];
        updatedAddresses[editAddress.index] = response.data.updatedAddress;

        setData((prevData) => ({
          ...prevData,
          user: { ...prevData.user, full_address: updatedAddresses },
        }));

        toast.success('Address updated successfully!', {
          position: 'top-right',
          autoClose: 3000,
        });
        onEditAddressModalClose();
      } else {
        throw new Error('Failed to update address');
      }
    } catch (error) {
      console.error('Error updating address:', error);
      toast.error(error.response?.data?.message || 'Failed to update address', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setToggleLoading(false);
    }
  };

  if (loading) {
    return (
      <Card
        flexDirection="column"
        w="100%"
        px="0px"
        style={{ marginTop: '100px' }}
        overflowX={{ sm: 'scroll', lg: 'hidden' }}
        borderRadius="16px"
        boxShadow="0px 4px 20px rgba(0, 0, 0, 0.1)"
        bg={cardBg}
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
        px="0px"
        style={{ marginTop: '100px' }}
        overflowX={{ sm: 'scroll', lg: 'hidden' }}
        borderRadius="16px"
        boxShadow="0px 4px 20px rgba(0, 0, 0, 0.1)"
        bg={cardBg}
      >
        <Text color={textColor} fontSize="22px" fontWeight="700" p="25px">
          Error: {error}
        </Text>
      </Card>
    );
  }

  return (
    <>
      <Card
        flexDirection="column"
        w="100%"
        px="0px"
        style={{ marginTop: '100px' }}
        overflowX={{ sm: 'scroll', lg: 'inherit' }}
        borderRadius="16px"
        boxShadow="0px 4px 20px rgba(0, 0, 0, 0.1)"
        bg={cardBg}
      >
        <Flex px="25px" mb="20px" justify="space-between" align="center">
          <Text
            color={textColor}
            fontSize="22px"
            fontWeight="700"
            lineHeight="100%"
          >
            User Details
          </Text>
          <Text color={textColor} fontSize="16px">
            Total Workers: {data.workers?.length || 0}
          </Text>
        </Flex>
        <Box p="20px">
          <ChakraCard
            p="20px"
            borderRadius="lg"
            border="1px solid"
            borderColor={borderColor}
            bg={cardBg}
          >
            <VStack spacing={6} align="stretch">
              {/* Service Provider Section */}
              <ChakraCard
                p="15px"
                borderRadius="lg"
                border="1px solid"
                borderColor={borderColor}
                bg={cardBg}
              >
                <Flex align="center" justify="space-between">
                  <Flex align="center" gap="4">
                    <Image
                      src={
                        data.user?.profile_pic
                          ? `${baseUrl}/${data.user.profile_pic}`
                          : defaultProfilePic
                      }
                      alt="Service Provider"
                      boxSize="60px"
                      borderRadius="full"
                      objectFit="cover"
                    />
                    <Box>
                      <Text fontWeight="bold" color={textColor}>
                        {data.user?.full_name || 'Not Assigned'}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {data.user?.category_id?.name || 'N/A'}
                      </Text>
                    </Box>
                  </Flex>
                </Flex>
              </ChakraCard>

              {/* Service Provider Information and Documents */}
              <Flex gap="4" direction={{ base: 'column', md: 'row' }}>
                {/* Service Provider Information */}
                <ChakraCard
                  p="15px"
                  borderRadius="lg"
                  border="1px solid"
                  borderColor={borderColor}
                  bg={cardBg}
                  flex="2"
                >
                  <VStack spacing={4} align="stretch">
                    <Text fontWeight="bold" fontSize="lg" color={textColor}>
                      User Information
                    </Text>
                    <Flex align="start" gap="4">
                      <Text fontWeight="semibold" color={textColor}>
                        Provider Name:
                      </Text>
                      <Text color={textColor}>
                        {data.user?.full_name || 'N/A'}
                      </Text>
                    </Flex>
                    <Flex align="start" gap="4">
                      <Text fontWeight="semibold" color={textColor}>
                        Phone:
                      </Text>
                      <Text color={textColor}>{data.user?.phone || 'N/A'}</Text>
                    </Flex>
                    <Flex align="start" gap="4">
                      <Text fontWeight="semibold" color={textColor}>
                        Location:
                      </Text>
                      <Text color={textColor}>
                        {data.user?.location.address || 'N/A'}
                      </Text>
                    </Flex>
                    <Flex align="start" gap="4">
                      <Text fontWeight="semibold" color={textColor}>
                        Current Location:
                      </Text>
                      <Text color={textColor}>
                        {data.user?.current_location || 'N/A'}
                      </Text>
                    </Flex>
                    <Flex align="start" gap="4" wrap="wrap">
                      <Text fontWeight="semibold" color={textColor}>
                        Address:
                      </Text>
                      <Flex align="center" wrap="wrap" gap="2">
                        <Text
                          color={textColor}
                          maxW={{ base: '200px', md: '300px' }}
                          isTruncated
                        >
                          {data.user?.full_address?.length > 0
                            ? `${data.user.full_address[0].title}: ${data.user.full_address[0].address}`
                            : [
                                data.user?.colony_name,
                                data.user?.gali_number,
                                data.user?.landmark,
                              ]
                                .filter(Boolean)
                                .join(', ') || 'N/A'}
                        </Text>
                        {data.user?.full_address?.length > 0 && (
                          <Button
                            size="xs"
                            variant="link"
                            colorScheme="teal"
                            onClick={() => onAddressModalOpen()}
                          >
                            Read More
                          </Button>
                        )}
                      </Flex>
                    </Flex>
                    <Flex align="start" gap="4">
                      <Text fontWeight="semibold" color={textColor}>
                        Skill:
                      </Text>
                      <Text color={textColor}>{data.user?.skill || 'N/A'}</Text>
                    </Flex>
                    <Flex align="start" gap="4">
                      <Text fontWeight="semibold" color={textColor}>
                        Category:
                      </Text>
                      <Text color={textColor}>
                        {data.user?.category_id?.name || 'N/A'}
                      </Text>
                    </Flex>
                    <Flex align="start" gap="4">
                      <Text fontWeight="semibold" color={textColor}>
                        Subcategories:
                      </Text>
                      <Text color={textColor}>
                        {data.user?.subcategory_ids
                          ?.map((sub) => sub.name)
                          .join(', ') || 'N/A'}
                      </Text>
                    </Flex>
                    <Flex align="start" gap="4">
                      <Text fontWeight="semibold" color={textColor}>
                        Referral Code:
                      </Text>
                      <Text color={textColor}>
                        {data.user?.referral_code || 'N/A'}
                      </Text>
                    </Flex>
                    <Flex align="start" gap="4">
                      <Text fontWeight="semibold" color={textColor}>
                        Profile Complete:
                      </Text>
                      <Text color={textColor}>
                        {data.user?.isProfileComplete ? 'Yes' : 'No'}
                      </Text>
                    </Flex>
                    <Flex align="start" gap="4">
                      <Text fontWeight="semibold" color={textColor}>
                        Active:
                      </Text>
                      <Text color={textColor}>
                        {data.user?.active ? 'Yes' : 'No'}
                      </Text>
                    </Flex>
                    <Flex align="start" gap="4">
                      <Text fontWeight="semibold" color={textColor}>
                        Created At:
                      </Text>
                      <Text color={textColor}>
                        {data.user?.createdAt
                          ? new Date(data.user.createdAt).toLocaleDateString()
                          : 'N/A'}
                      </Text>
                    </Flex>
                    {/* Inactivation Info Section */}
                    {data.user?.inactivationInfo && (
                      <>
                        <Divider />
                        <Text fontWeight="bold" fontSize="lg" color={textColor}>
                          Inactivation Information
                        </Text>
                        <Flex align="start" gap="4">
                          <Text fontWeight="semibold" color={textColor}>
                            Inactivated By:
                          </Text>
                          <Text color={textColor}>
                            {data.user.inactivationInfo.inactivatedBy
                              ?.full_name || 'N/A'}{' '}
                            (
                            {data.user.inactivationInfo.inactivatedBy?.email ||
                              'N/A'}
                            )
                          </Text>
                        </Flex>
                        <Flex align="start" gap="4">
                          <Text fontWeight="semibold" color={textColor}>
                            Reason:
                          </Text>
                          <Text color={textColor}>
                            {data.user.inactivationInfo.reason || 'N/A'}
                          </Text>
                        </Flex>
                        <Flex align="start" gap="4">
                          <Text fontWeight="semibold" color={textColor}>
                            Dispute ID:
                          </Text>
                          <Text color={textColor}>
                            {data.user.inactivationInfo.disputeId?.unique_id ||
                              'N/A'}{' '}
                            (
                            {data.user.inactivationInfo.disputeId?.status ||
                              'N/A'}
                            )
                          </Text>
                        </Flex>
                        <Flex align="start" gap="4">
                          <Text fontWeight="semibold" color={textColor}>
                            Dispute Created At:
                          </Text>
                          <Text color={textColor}>
                            {data.user.inactivationInfo.disputeId?.createdAt
                              ? new Date(
                                  data.user.inactivationInfo.disputeId.createdAt,
                                ).toLocaleDateString()
                              : 'N/A'}
                          </Text>
                        </Flex>
                        <Flex align="start" gap="4">
                          <Text fontWeight="semibold" color={textColor}>
                            Inactivated At:
                          </Text>
                          <Text color={textColor}>
                            {data.user.inactivationInfo.inactivatedAt
                              ? new Date(
                                  data.user.inactivationInfo.inactivatedAt,
                                ).toLocaleDateString()
                              : 'N/A'}
                          </Text>
                        </Flex>
                      </>
                    )}
                    <Divider />
                    <Text fontWeight="bold" fontSize="lg" color={textColor}>
                      Bank Details
                    </Text>
                    <Flex align="start" gap="4">
                      <Text fontWeight="semibold" color={textColor}>
                        Account Number:
                      </Text>
                      <Text color={textColor}>
                        {data.user?.bankdetails?.accountNumber || 'N/A'}
                      </Text>
                    </Flex>
                    <Flex align="start" gap="4">
                      <Text fontWeight="semibold" color={textColor}>
                        Account Holder Name:
                      </Text>
                      <Text color={textColor}>
                        {data.user?.bankdetails?.accountHolderName || 'N/A'}
                      </Text>
                    </Flex>
                    <Flex align="start" gap="4">
                      <Text fontWeight="semibold" color={textColor}>
                        Bank Name:
                      </Text>
                      <Text color={textColor}>
                        {data.user?.bankdetails?.bankName || 'N/A'}
                      </Text>
                    </Flex>
                    <Flex align="start" gap="4">
                      <Text fontWeight="semibold" color={textColor}>
                        IFSC Code:
                      </Text>
                      <Text color={textColor}>
                        {data.user?.bankdetails?.ifscCode || 'N/A'}
                      </Text>
                    </Flex>
                    <Flex align="start" gap="4">
                      <Text fontWeight="semibold" color={textColor}>
                        UPI ID:
                      </Text>
                      <Text color={textColor}>
                        {data.user?.bankdetails?.upiId || 'N/A'}
                      </Text>
                    </Flex>
                    <Flex align="start" gap="4">
                      <Text fontWeight="semibold" color={textColor}>
                        Verification Status:
                      </Text>
                      <HStack>
                        <Switch
                          isChecked={data.user?.verified}
                          onChange={() =>
                            toggleUserVerified(
                              data.user._id,
                              data.user.verified,
                            )
                          }
                          colorScheme="teal"
                          isDisabled={toggleLoading}
                        />
                        <Text
                          bg={
                            getStatusStyles(data.user?.verified, 'verifyStatus')
                              .bg
                          }
                          color={
                            getStatusStyles(data.user?.verified, 'verifyStatus')
                              .color
                          }
                          px="2"
                          py="1"
                          borderRadius="md"
                        >
                          {data.user?.verified ? 'Approved' : 'Rejected'}
                        </Text>
                      </HStack>
                    </Flex>
                  </VStack>
                </ChakraCard>

                {/* Documents Section */}
                <ChakraCard
                  p="15px"
                  borderRadius="lg"
                  border="1px solid"
                  borderColor={borderColor}
                  bg={cardBg}
                  flex="1"
                >
                  <VStack spacing={4} align="stretch">
                    <Text fontWeight="bold" fontSize="lg" color={textColor}>
                      Documents
                    </Text>
                    <Flex align="start" gap="4">
                      <Text fontWeight="semibold" color={textColor}>
                        Document:
                      </Text>
                      {data.user?.documents ? (
                        <Image
                          src={`${baseUrl}/${data.user.documents}`}
                          alt="Document"
                          boxSize="100px"
                          objectFit="cover"
                          borderRadius="md"
                          cursor="pointer"
                          onClick={() =>
                            handleDocumentClick(
                              `${baseUrl}/${data.user.documents}`,
                            )
                          }
                          _hover={{ transform: 'scale(1.05)', boxShadow: 'md' }}
                          transition="all 0.2s ease-in-out"
                        />
                      ) : (
                        <Text color={textColor}>N/A</Text>
                      )}
                    </Flex>
                  </VStack>
                </ChakraCard>
              </Flex>

              {/* Workers Section */}
              <ChakraCard
                p="15px"
                borderRadius="lg"
                border="1px solid"
                borderColor={borderColor}
                bg={cardBg}
              >
                <Text fontWeight="bold" fontSize="lg" color={textColor}>
                  Associated Workers
                </Text>
                {data.workers?.length > 0 ? (
                  <VStack spacing={2} align="stretch" mt="2">
                    {data.workers.map((worker) => (
                      <Flex
                        key={worker._id}
                        align="center"
                        justify="space-between"
                        p="2"
                        borderBottom="1px solid"
                        borderColor={borderColor}
                      >
                        <Flex align="center" gap="4">
                          <Image
                            src={
                              worker.image
                                ? `${baseUrl}/${worker.image}`
                                : defaultProfilePic
                            }
                            alt="Worker"
                            boxSize="50px"
                            borderRadius="full"
                            objectFit="cover"
                          />
                          <Box>
                            <Text fontWeight="bold" color={textColor}>
                              {worker.name || 'N/A'}
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                              Aadhar: {worker.aadharNumber || 'N/A'}
                            </Text>
                          </Box>
                        </Flex>
                        <HStack spacing="2">
                          <Text
                            bg={
                              getStatusStyles(
                                worker.verifyStatus,
                                'verifyStatus',
                              ).bg
                            }
                            color={
                              getStatusStyles(
                                worker.verifyStatus,
                                'verifyStatus',
                              ).color
                            }
                            px="2"
                            py="1"
                            borderRadius="md"
                          >
                            {worker.verifyStatus || 'Pending'}
                          </Text>
                          <Button
                            colorScheme="teal"
                            size="sm"
                            onClick={() => {
                              setSelectedWorker(worker);
                              setVerifyStatus(worker.verifyStatus || 'pending');
                              onWorkerDetailsOpen();
                            }}
                          >
                            View Details
                          </Button>
                        </HStack>
                      </Flex>
                    ))}
                  </VStack>
                ) : (
                  <Text color={textColor} mt="2">
                    No workers assigned
                  </Text>
                )}
              </ChakraCard>

              {/* Work Samples Section */}
              <ChakraCard
                p="15px"
                borderRadius="lg"
                border="1px solid"
                borderColor={borderColor}
                bg={cardBg}
              >
                <Text fontWeight="bold" fontSize="lg" color={textColor}>
                  Work Samples
                </Text>
                {data.user?.hiswork?.length > 0 ? (
                  <HStack spacing="2" mt="2">
                    {data.user.hiswork.map((work, index) => (
                      <Image
                        key={index}
                        src={`${work}`}
                        alt={`Work Sample ${index + 1}`}
                        boxSize="100px"
                        objectFit="cover"
                      />
                    ))}
                  </HStack>
                ) : (
                  <Text color={textColor} mt="2">
                    No work samples available
                  </Text>
                )}
              </ChakraCard>

              {/* Reviews Section */}
              <ChakraCard
                p="15px"
                borderRadius="lg"
                border="1px solid"
                borderColor={borderColor}
                bg={cardBg}
              >
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
                          <Text color={textColor}>
                            {review.review || 'No review text'}
                          </Text>
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
                          <Text color="yellow.500">
                            Rating: {review.rating || 'N/A'}
                          </Text>
                          <Text color="gray.600">
                            {review.createdAt
                              ? new Date(review.createdAt).toLocaleDateString()
                              : 'N/A'}
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
      {selectedDocument && (
        <Modal
          isOpen={isDocumentModalOpen}
          onClose={onDocumentModalClose}
          size="xl"
        >
          <ModalOverlay bg="blackAlpha.600" />
          <ModalContent borderRadius="xl" boxShadow="2xl" p={4} bg={cardBg}>
            <ModalHeader
              fontSize="2xl"
              fontWeight="bold"
              color={textColor}
              textAlign="center"
            >
              Document Preview
            </ModalHeader>
            <ModalCloseButton
              size="lg"
              _hover={{ bg: 'gray.100', transform: 'scale(1.1)' }}
              transition="all 0.2s ease-in-out"
            />
            <ModalBody>
              <ChakraCard p="4" boxShadow="md" borderRadius="lg">
                <Image
                  src={selectedDocument}
                  alt="Document Preview"
                  maxH="70vh"
                  maxW="100%"
                  objectFit="contain"
                  borderRadius="md"
                  onError={(e) => (e.target.src = defaultProfilePic)}
                />
              </ChakraCard>
            </ModalBody>
            <ModalFooter>
              <Button
                colorScheme="gray"
                onClick={onDocumentModalClose}
                _hover={{ bg: 'gray.300', transform: 'scale(1.05)' }}
                transition="all 0.2s ease-in-out"
              >
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* Address Modal */}
      <Modal
        isOpen={isAddressModalOpen}
        onClose={onAddressModalClose}
        isCentered
        size="lg"
      >
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent
          maxW={{ base: '90%', md: '600px' }}
          borderRadius="16px"
          bg={cardBg}
          boxShadow="0px 4px 20px rgba(0, 0, 0, 0.2)"
        >
          <ModalHeader
            fontSize="lg"
            fontWeight="700"
            color={textColor}
            borderBottom="1px"
            borderColor={borderColor}
          >
            User Addresses
          </ModalHeader>
          <ModalCloseButton color={textColor} />
          <ModalBody py="20px">
            {data.user?.full_address?.length === 0 ? (
              <Text color={textColor} fontSize="sm">
                No addresses available.
              </Text>
            ) : (
              data.user.full_address.map((addr, index) => (
                <Box
                  key={addr._id || index}
                  mb={4}
                  p={4}
                  border="1px"
                  borderColor={borderColor}
                  borderRadius="8px"
                >
                  <Flex justify="space-between" align="center">
                    <Box>
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
                    {/*<Button
                      size="sm"
                      colorScheme="teal"
                      onClick={() => handleEditAddress(addr, index)}
                    >
                      Edit
                    </Button>*/}
                  </Flex>
                </Box>
              ))
            )}
          </ModalBody>
          <ModalFooter borderTop="1px" borderColor={borderColor}>
            <Button
              colorScheme="teal"
              onClick={onAddressModalClose}
              borderRadius="12px"
              size="sm"
              _hover={{ bg: 'teal.600' }}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Address Modal */}
      <Modal
        isOpen={isEditAddressModalOpen}
        onClose={onEditAddressModalClose}
        isCentered
        size="lg"
      >
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent
          maxW={{ base: '90%', md: '600px' }}
          borderRadius="16px"
          bg={cardBg}
          boxShadow="0px 4px 20px rgba(0, 0, 0, 0.2)"
        >
          <ModalHeader
            fontSize="lg"
            fontWeight="700"
            color={textColor}
            borderBottom="1px"
            borderColor={borderColor}
          >
            Edit Address
          </ModalHeader>
          <ModalCloseButton color={textColor} />
          <ModalBody py="20px">
            {editAddress && (
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontSize="sm" fontWeight="600" color={textColor}>
                    Title
                  </Text>
                  <Input
                    value={editAddress.title || ''}
                    onChange={(e) =>
                      setEditAddress({ ...editAddress, title: e.target.value })
                    }
                    placeholder="Enter title (e.g., Home, Office)"
                    size="sm"
                    borderRadius="8px"
                  />
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="600" color={textColor}>
                    Address
                  </Text>
                  <Input
                    value={editAddress.address || ''}
                    onChange={(e) =>
                      setEditAddress({
                        ...editAddress,
                        address: e.target.value,
                      })
                    }
                    placeholder="Enter address"
                    size="sm"
                    borderRadius="8px"
                  />
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="600" color={textColor}>
                    Landmark
                  </Text>
                  <Input
                    value={editAddress.landmark || ''}
                    onChange={(e) =>
                      setEditAddress({
                        ...editAddress,
                        landmark: e.target.value,
                      })
                    }
                    placeholder="Enter landmark"
                    size="sm"
                    borderRadius="8px"
                  />
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="600" color={textColor}>
                    Latitude
                  </Text>
                  <Input
                    value={editAddress.latitude || ''}
                    onChange={(e) =>
                      setEditAddress({
                        ...editAddress,
                        latitude: e.target.value,
                      })
                    }
                    placeholder="Enter latitude"
                    type="number"
                    step="any"
                    size="sm"
                    borderRadius="8px"
                  />
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="600" color={textColor}>
                    Longitude
                  </Text>
                  <Input
                    value={editAddress.longitude || ''}
                    onChange={(e) =>
                      setEditAddress({
                        ...editAddress,
                        longitude: e.target.value,
                      })
                    }
                    placeholder="Enter longitude"
                    type="number"
                    step="any"
                    size="sm"
                    borderRadius="8px"
                  />
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter borderTop="1px" borderColor={borderColor}>
            <Button
              colorScheme="teal"
              onClick={handleAddressUpdate}
              borderRadius="12px"
              size="sm"
              isLoading={toggleLoading}
              _hover={{ bg: 'teal.600' }}
            >
              Save
            </Button>
            <Button
              colorScheme="gray"
              onClick={onEditAddressModalClose}
              borderRadius="12px"
              size="sm"
              ml={2}
              _hover={{ bg: 'gray.300' }}
            >
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Worker Details Modal */}
      {selectedWorker && (
        <Modal
          isOpen={isWorkerDetailsOpen}
          onClose={() => {
            setSelectedWorker(null);
            onWorkerDetailsClose();
          }}
          size="xl"
        >
          <ModalOverlay bg="blackAlpha.600" />
          <ModalContent borderRadius="xl" boxShadow="2xl" p={4} bg={cardBg}>
            <ModalHeader
              fontSize="2xl"
              fontWeight="bold"
              color={textColor}
              textAlign="center"
            >
              Worker Details
            </ModalHeader>
            <ModalCloseButton
              size="lg"
              _hover={{ bg: 'gray.100', transform: 'scale(1.1)' }}
              transition="all 0.2s ease-in-out"
            />
            <ModalBody>
              <ChakraCard p="4" boxShadow="md" borderRadius="lg">
                <VStack spacing={4} align="stretch">
                  <Flex align="center" gap="4">
                    <Image
                      src={
                        selectedWorker.image
                          ? `${baseUrl}/${selectedWorker.image}`
                          : defaultProfilePic
                      }
                      alt="Worker"
                      boxSize="100px"
                      borderRadius="full"
                      objectFit="cover"
                    />
                    <Box>
                      <Text fontWeight="bold" fontSize="xl" color={textColor}>
                        Name:{' '}
                        {capitalizeFirstLetter(selectedWorker.name || 'N/A')}
                      </Text>
                    </Box>
                  </Flex>
                  <Flex align="start" gap="4">
                    <Text fontWeight="semibold" color={textColor}>
                      Phone:
                    </Text>
                    <Text color={textColor}>
                      {selectedWorker.phone || 'N/A'}
                    </Text>
                  </Flex>
                  <Flex align="start" gap="4">
                    <Text fontWeight="semibold" color={textColor}>
                      Address:
                    </Text>
                    <Text color={textColor}>
                      {selectedWorker.address || 'N/A'}
                    </Text>
                  </Flex>
                  <Flex align="start" gap="4">
                    <Text fontWeight="semibold" color={textColor}>
                      Date of Birth:
                    </Text>
                    <Text color={textColor}>
                      {selectedWorker.dob
                        ? new Date(selectedWorker.dob).toLocaleDateString()
                        : 'N/A'}
                    </Text>
                  </Flex>
                  <Flex align="start" gap="4">
                    <Text fontWeight="semibold" color={textColor}>
                      Aadhar Number:
                    </Text>
                    <Text color={textColor}>
                      {selectedWorker.aadharNumber || 'N/A'}
                    </Text>
                  </Flex>
                  <Flex align="start" gap="4">
                    <Text fontWeight="semibold" color={textColor}>
                      Aadhar Card:
                    </Text>
                    {selectedWorker.aadharImage ? (
                      <Image
                        src={`${baseUrl}/${selectedWorker.aadharImage}`}
                        alt="Aadhar Card"
                        boxSize="100px"
                        objectFit="cover"
                        borderRadius="md"
                        cursor="pointer"
                        onClick={() =>
                          handleDocumentClick(
                            `${baseUrl}/${selectedWorker.aadharImage}`,
                          )
                        }
                        onError={(e) => (e.target.src = defaultProfilePic)}
                      />
                    ) : (
                      <Text color={textColor}>No Aadhar card available</Text>
                    )}
                  </Flex>
                  <Flex align="start" gap="4">
                    <Text fontWeight="semibold" color={textColor}>
                      createdAt:
                    </Text>
                    <Text color={textColor}>
                      {selectedWorker?.createdAt
                        ? new Date(selectedWorker.createdAt).toLocaleDateString(
                            'en-IN',
                            {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            },
                          )
                        : 'N/A'}
                    </Text>
                  </Flex>
                  <Flex align="start" gap="4">
                    <Text fontWeight="semibold" color={textColor}>
                      Assigned Orders:
                    </Text>
                    <Text color={textColor}>
                      {selectedWorker.assignOrders?.length > 0
                        ? selectedWorker.assignOrders
                            .map((order) => order.order_id)
                            .join(', ')
                        : 'None'}
                    </Text>
                  </Flex>
                  <Flex align="start" gap="4">
                    <Text fontWeight="semibold" color={textColor}>
                      Verification Status:
                    </Text>
                    <Select
                      value={verifyStatus}
                      onChange={(e) => setVerifyStatus(e.target.value)}
                      width="150px"
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
                onClick={() => {
                  setSelectedWorker(null);
                  onWorkerDetailsClose();
                }}
                _hover={{ bg: 'gray.300', transform: 'scale(1.05)' }}
                transition="all 0.2s ease-in-out"
              >
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />
    </>
  );
}
