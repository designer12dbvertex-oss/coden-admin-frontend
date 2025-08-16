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
    payments: null,
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [selectedWorker, setSelectedWorker] = React.useState(null);
  const [verifyStatus, setVerifyStatus] = React.useState('');
  const [toggleLoading, setToggleLoading] = React.useState(false);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = React.useState(false);
  const [documentUrl, setDocumentUrl] = React.useState(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = React.useState(false);
  const [selectedAddresses, setSelectedAddresses] = React.useState([]);
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const navigate = useNavigate();
  const { service_provider_id } = useParams();
  const baseUrl = process.env.REACT_APP_BASE_URL;
  const token = localStorage.getItem('token');

  // Fetch data from API
  React.useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!baseUrl) throw new Error('Missing base URL');
        if (!token) throw new Error('Missing authentication token');
        if (!service_provider_id)
          throw new Error('Missing service_provider_id');

        const response = await axios.get(
          `${baseUrl}api/admin/getServiceProvider/${service_provider_id}`,
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
  }, [navigate, service_provider_id]);

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

  // Handle document preview
  const handleDocumentClick = (docUrl) => {
    setDocumentUrl(docUrl);
    setIsDocumentModalOpen(true);
  };

  // Handle address modal
  const openAddressModal = React.useCallback((addresses) => {
    setSelectedAddresses(addresses);
    setIsAddressModalOpen(true);
  }, []);

  const closeAddressModal = React.useCallback(() => {
    setIsAddressModalOpen(false);
    setSelectedAddresses([]);
  }, []);

  // Capitalize first letter of name or status
  const capitalizeFirstLetter = (str) => {
    if (!str) return 'N/A';
    return str
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Update verification status for Service Provider
  const toggleUserVerified = async (userId, verified) => {
    setToggleLoading(true);
    try {
      const response = await axios.patch(
        `${baseUrl}api/admin/updateUserverified`,
        { userId, verified: !verified },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (response.data.success) {
        setData((prevData) => ({
          ...prevData,
          user: { ...prevData.user, verified: !verified },
        }));
        toast.success(
          'Service Provider verification status updated successfully!',
          {
            position: 'top-right',
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          },
        );
      } else {
        throw new Error('Failed to update user verification status');
      }
    } catch (error) {
      console.error('Error toggling user verification:', error);
      setError(
        error.response?.data?.message ||
          'Failed to update user verification status',
      );
      toast.error(
        error.response?.data?.message ||
          'Failed to update user verification status',
        {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        },
      );
    } finally {
      setToggleLoading(false);
    }
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

  if (loading) {
    return (
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
        overflowX={{ sm: 'scroll', lg: 'inherit' }}
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
            Service Provider Details
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
                        {capitalizeFirstLetter(
                          data.user?.full_name || 'Not Assigned',
                        )}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {data.user?.category_id?.name || 'N/A'}
                      </Text>
                    </Box>
                  </Flex>
                </Flex>
              </ChakraCard>

              {/* Service Provider Details and Document Section */}
              <Flex gap="6" align="flex-start" direction={{ base: 'column', md: 'row' }}>
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
                      Service Provider Information
                    </Text>
                    <Flex align="start" gap="4">
                      <Text fontWeight="semibold" color={textColor}>
                        Provider Name:
                      </Text>
                      <Text color={textColor}>
                        {capitalizeFirstLetter(data.user?.full_name || 'N/A')}
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
                            ? data.user.full_address[0].address
                            : 'N/A'}
                        </Text>
                        {data.user?.full_address?.length > 0 && (
                          <Button
                            size="xs"
                            variant="link"
                            colorScheme="teal"
                            onClick={() => openAddressModal(data.user.full_address)}
                          >
                            Show More
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
                      <Text color={textColor}>{data.user?.category_id?.name || 'N/A'}</Text>
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
                          {capitalizeFirstLetter(
                            data.user?.verified ? 'approved' : 'rejected',
                          )}
                        </Text>
                      </HStack>
                    </Flex>
                    {data.user?.inactivationInfo && (
                      <Box
                        mt={4}
                        p={4}
                        border="1px"
                        borderColor={borderColor}
                        borderRadius="8px"
                      >
                        <Text fontSize="md" fontWeight="600" color={textColor} mb={2}>
                          Inactivation Details
                        </Text>
                        <Flex align="start" gap="4">
                          <Text fontWeight="semibold" color={textColor}>
                            Inactivated By:
                          </Text>
                          <Text color={textColor}>
                            {data.user.inactivationInfo.inactivatedBy?.full_name || 'N/A'} (
                            {data.user.inactivationInfo.inactivatedBy?.email || 'N/A'})
                          </Text>
                        </Flex>
                        <Flex align="start" gap="4" mt={2}>
                          <Text fontWeight="semibold" color={textColor}>
                            Reason:
                          </Text>
                          <Text color={textColor}>
                            {data.user.inactivationInfo.reason || 'N/A'}
                          </Text>
                        </Flex>
                        <Flex align="start" gap="4" mt={2}>
                          <Text fontWeight="semibold" color={textColor}>
                            Dispute ID:
                          </Text>
                          <Text color={textColor}>
                            {data.user.inactivationInfo.disputeId?.unique_id || 'N/A'}
                          </Text>
                        </Flex>
                        <Flex align="start" gap="4" mt={2}>
                          <Text fontWeight="semibold" color={textColor}>
                            Inactivated At:
                          </Text>
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
                <ChakraCard
                  p="15px"
                  borderRadius="lg"
                  border="1px solid"
                  borderColor={borderColor}
                  bg={cardBg}
                  w={{ base: '100%', md: '200px' }}
                >
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
                        onClick={() =>
                          handleDocumentClick(
                            `${baseUrl}/${data.user.documents}`,
                          )
                        }
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
              <ChakraCard
                p="15px"
                borderRadius="lg"
                border="1px solid"
                borderColor={borderColor}
                bg={cardBg}
              >
                <VStack spacing={4} align="stretch">
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
                </VStack>
              </ChakraCard>

              {/* Payments Section */}
              <ChakraCard
                p="15px"
                borderRadius="lg"
                border="1px solid"
                borderColor={borderColor}
                bg={cardBg}
              >
                <VStack spacing={4} align="stretch">
                  <Divider />
                  <Text fontWeight="bold" fontSize="lg" color={textColor}>
                    Payment Details
                  </Text>
                  {data.payments ? (
                    <Box>
                      <Flex justify="space-between" gap="4">
                        {/* Direct Orders Column */}
                        <VStack flex="1" align="stretch" spacing={2}>
                          <Text fontWeight="semibold" color={textColor}>
                            Direct Orders
                          </Text>
                          <Text color={textColor}>
                            Total: ₹{data.payments.direct.total || 0}
                          </Text>
                          <Box>
                            <Text fontWeight="medium" color={textColor}>
                              Monthly:
                            </Text>
                            {Object.keys(data.payments.direct.monthly).length > 0 ? (
                              Object.entries(data.payments.direct.monthly).map(([month, amount]) => (
                                <Text key={month} color={textColor} fontSize="sm">
                                  {month}: ₹{amount}
                                </Text>
                              ))
                            ) : (
                              <Text color={textColor} fontSize="sm">
                                N/A
                              </Text>
                            )}
                          </Box>
                          <Box>
                            <Text fontWeight="medium" color={textColor}>
                              Yearly:
                            </Text>
                            {Object.keys(data.payments.direct.yearly).length > 0 ? (
                              Object.entries(data.payments.direct.yearly).map(([year, amount]) => (
                                <Text key={year} color={textColor} fontSize="sm">
                                  {year}: ₹{amount}
                                </Text>
                              ))
                            ) : (
                              <Text color={textColor} fontSize="sm">
                                N/A
                              </Text>
                            )}
                          </Box>
                        </VStack>

                        {/* Bidding Orders Column */}
                        <VStack flex="1" align="stretch" spacing={2}>
                          <Text fontWeight="semibold" color={textColor}>
                            Bidding Orders
                          </Text>
                          <Text color={textColor}>
                            Total: ₹{data.payments.bidding.total || 0}
                          </Text>
                          <Box>
                            <Text fontWeight="medium" color={textColor}>
                              Monthly:
                            </Text>
                            {Object.keys(data.payments.bidding.monthly).length > 0 ? (
                              Object.entries(data.payments.bidding.monthly).map(([month, amount]) => (
                                <Text key={month} color={textColor} fontSize="sm">
                                  {month}: ₹{amount}
                                </Text>
                              ))
                            ) : (
                              <Text color={textColor} fontSize="sm">
                                N/A
                              </Text>
                            )}
                          </Box>
                          <Box>
                            <Text fontWeight="medium" color={textColor}>
                              Yearly:
                            </Text>
                            {Object.keys(data.payments.bidding.yearly).length > 0 ? (
                              Object.entries(data.payments.bidding.yearly).map(([year, amount]) => (
                                <Text key={year} color={textColor} fontSize="sm">
                                  {year}: ₹{amount}
                                </Text>
                              ))
                            ) : (
                              <Text color={textColor} fontSize="sm">
                                N/A
                              </Text>
                            )}
                          </Box>
                        </VStack>

                        {/* Emergency Orders Column */}
                        <VStack flex="1" align="stretch" spacing={2}>
                          <Text fontWeight="semibold" color={textColor}>
                            Emergency Orders
                          </Text>
                          <Text color={textColor}>
                            Total: ₹{data.payments.emergency.total || 0}
                          </Text>
                          <Box>
                            <Text fontWeight="medium" color={textColor}>
                              Monthly:
                            </Text>
                            {Object.keys(data.payments.emergency.monthly).length > 0 ? (
                              Object.entries(data.payments.emergency.monthly).map(([month, amount]) => (
                                <Text key={month} color={textColor} fontSize="sm">
                                  {month}: ₹{amount}
                                </Text>
                              ))
                            ) : (
                              <Text color={textColor} fontSize="sm">
                                N/A
                              </Text>
                            )}
                          </Box>
                          <Box>
                            <Text fontWeight="medium" color={textColor}>
                              Yearly:
                            </Text>
                            {Object.keys(data.payments.emergency.yearly).length > 0 ? (
                              Object.entries(data.payments.emergency.yearly).map(([year, amount]) => (
                                <Text key={year} color={textColor} fontSize="sm">
                                  {year}: ₹{amount}
                                </Text>
                              ))
                            ) : (
                              <Text color={textColor} fontSize="sm">
                                N/A
                              </Text>
                            )}
                          </Box>
                        </VStack>
                      </Flex>
                      {/* Overall Totals */}
                      <Box mt={4}>
                        <Text fontWeight="semibold" color={textColor} mb={2}>
                          Overall Totals
                        </Text>
                        <Text color={textColor}>
                          Total: ₹{data.payments.totals.overall || 0}
                        </Text>
                        <Box>
                          <Text fontWeight="medium" color={textColor}>
                            Monthly:
                          </Text>
                          {Object.keys(data.payments.totals.monthly).length > 0 ? (
                            Object.entries(data.payments.totals.monthly).map(([month, amount]) => (
                              <Text key={month} color={textColor} fontSize="sm">
                                {month}: ₹{amount}
                              </Text>
                            ))
                          ) : (
                            <Text color={textColor} fontSize="sm">
                              N/A
                            </Text>
                          )}
                        </Box>
                        <Box>
                          <Text fontWeight="medium" color={textColor}>
                            Yearly:
                          </Text>
                          {Object.keys(data.payments.totals.yearly).length > 0 ? (
                            Object.entries(data.payments.totals.yearly).map(([year, amount]) => (
                              <Text key={year} color={textColor} fontSize="sm">
                                {year}: ₹{amount}
                              </Text>
                            ))
                          ) : (
                            <Text color={textColor} fontSize="sm">
                              N/A
                            </Text>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  ) : (
                    <Text color={textColor} mt="2">
                      No payment details available
                    </Text>
                  )}
                </VStack>
              </ChakraCard>

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
                              {capitalizeFirstLetter(worker.name || 'N/A')}
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
                            {capitalizeFirstLetter(
                              worker.verifyStatus || 'Pending',
                            )}
                          </Text>
                          <Button
                            colorScheme="teal"
                            size="sm"
                            onClick={() => {
                              setSelectedWorker(worker);
                              setVerifyStatus(worker.verifyStatus || 'pending');
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
      <Modal
        isOpen={isDocumentModalOpen}
        onClose={() => setIsDocumentModalOpen(false)}
        size="xl"
      >
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
            {selectedAddresses.length === 0 ? (
              <Text color={textColor} fontSize="sm">
                No addresses available.
              </Text>
            ) : (
              selectedAddresses.map((addr, index) => (
                <Box
                  key={addr.id}
                  mb={4}
                  p={4}
                  border="1px"
                  borderColor={borderColor}
                  borderRadius="8px"
                >
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
            <Button
              colorScheme="teal"
              onClick={closeAddressModal}
              borderRadius="12px"
              size="sm"
              _hover={{ bg: 'teal.600' }}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Worker Details Modal */}
      {selectedWorker && (
        <Modal
          isOpen={!!selectedWorker}
          onClose={() => setSelectedWorker(null)}
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
