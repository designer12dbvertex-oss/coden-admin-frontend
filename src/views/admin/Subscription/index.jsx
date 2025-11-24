/* eslint-disable */
'use client';

import {
  Box,
  Flex,
  Text,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Icon,
  Tooltip,
  Button,
  Input,
  Switch,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  useDisclosure,
} from '@chakra-ui/react';
import axios from 'axios';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckIcon, CloseIcon, EditIcon } from '@chakra-ui/icons';

import Card from 'components/card/Card';

export default function SubscriptionPlans() {
  const [plans, setPlans] = React.useState([]);
  const [editingPlan, setEditingPlan] = React.useState(null);
  const [formData, setFormData] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const bgHover = useColorModeValue('gray.50', 'whiteAlpha.100');
  const navigate = useNavigate();

  const baseUrl = process.env.REACT_APP_BASE_URL;
  const token = localStorage.getItem('token');

  const fetchSubscriptionPlans = async () => {
    try {
      if (!baseUrl || !token) throw new Error('Missing config');

      setLoading(true);
      const response = await axios.get(`${baseUrl}api/subscription/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.data.status || !Array.isArray(response.data.data)) {
        throw new Error('Invalid response');
      }

      const sortedPlans = response.data.data.sort((a, b) => a.price - b.price);
      setPlans(sortedPlans);
      setLoading(false);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401 || err.response?.data?.message?.includes('authorized')) {
        localStorage.removeItem('token');
        navigate('/');
      } else {
        setError(err.message || 'Failed to load plans');
        setLoading(false);
      }
    }
  };

  const handleEditClick = (plan) => {
    setEditingPlan(plan);
    setFormData({ ...plan });
    onOpen();
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await axios.put(
        `${baseUrl}api/subscription/update/${editingPlan._id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status) {
        toast({
          title: 'Success',
          description: 'Plan updated successfully!',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top-right',
        });

        // Update the plan in local state
        setPlans(prev => prev.map(p => p._id === editingPlan._id ? response.data.data : p));
        onClose();
      }
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to update plan',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    } finally {
      setSaving(false);
    }
  };

  React.useEffect(() => {
    fetchSubscriptionPlans();
  }, []);

  const getPlanBadge = (name) => {
    const n = name.split(' ')[0];
    if (n === 'Starter') return <Badge colorScheme="gray">Free</Badge>;
    if (n === 'Professional') return <Badge colorScheme="blue">Pro</Badge>;
    if (n === 'Premium+') return <Badge colorScheme="purple">Premium+</Badge>;
    return <Badge>{n}</Badge>;
  };

  if (loading) {
    return (
      <Card p="25px" borderRadius="20px" boxShadow="lg">
        <Text fontSize="22px" fontWeight="700" color={textColor}>Loading plans...</Text>
      </Card>
    );
  }

  if (error) {
    return (
      <Card p="25px" borderRadius="20px" boxShadow="lg" mt="80px">
        <Text fontSize="22px" fontWeight="700" color="red.500">Error: {error}</Text>
      </Card>
    );
  }

  return (
    <>
      <Card flexDirection="column" w="100%" px="25px" py="25px" borderRadius="20px" boxShadow="lg" mt="80px">
        <Flex mb="30px" justifyContent="space-between" align="center">
          <Text color={textColor} fontSize="28px" fontWeight="700">
            Subscription Plans (Admin)
          </Text>
        </Flex>

        <Box overflowX="auto">
          <Table variant="simple" color={textColor}>
            <Thead>
              <Tr bg={useColorModeValue('gray.50', 'navy.800')}>
                <Th>Plan</Th>
                <Th>Price</Th>
                <Th>No-Comm Tasks</Th>
                <Th>Total Hires</Th>
                <Th>Emergency</Th>
                <Th>Commission (Normal)</Th>
                <Th>Emergency Comm</Th>
                <Th>Priority</Th>
                <Th>Active</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {plans.map((plan) => (
                <Tr key={plan._id} _hover={{ bg: bgHover }}>
                  <Td>
                    <Flex align="center" gap="10px">
                      <Text fontWeight="600">{plan.name}</Text>
                      {getPlanBadge(plan.name)}
                    </Flex>
                  </Td>
                  <Td fontWeight="600">{plan.price === 0 ? 'Free' : `₹${plan.price}/mo`}</Td>
                  <Td>{plan.noCommissionTasksPerMonth}/mo</Td>
                  <Td>{plan.totalTaskHiresLimit}</Td>
                  <Td>{plan.emergencyTaskLimit}</Td>
                  <Td>{plan.commissionInsideLimit}% → {plan.commissionAboveLimit}%</Td>
                  <Td fontWeight="600" color="red.600">{plan.commissionEmergency}%</Td>
                  <Td textAlign="center">
                    {plan.priorityListing ? <CheckIcon color="green.500" /> : <CloseIcon color="red.500" />}
                  </Td>
                  <Td>
                    <Badge colorScheme={plan.isActive ? 'green' : 'red'}>
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </Td>
                  <Td>
                    <Button size="sm" leftIcon={<EditIcon />} colorScheme="blue" variant="ghost" onClick={() => handleEditClick(plan)}>
                      Edit
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Card>

      {/* Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Subscription Plan</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {editingPlan && (
              <Flex direction="column" gap="4">
                <FormControl>
                  <FormLabel>Plan Name</FormLabel>
                  <Input name="name" value={formData.name || ''} onChange={handleInputChange} />
                </FormControl>

                <FormControl>
                  <FormLabel>Price (₹)</FormLabel>
                  <Input name="price" type="number" value={formData.price || 0} onChange={handleInputChange} />
                </FormControl>

                <FormControl>
                  <FormLabel>No-Commission Tasks / Month</FormLabel>
                  <Input name="noCommissionTasksPerMonth" type="number" value={formData.noCommissionTasksPerMonth || 0} onChange={handleInputChange} />
                </FormControl>

                <FormControl>
                  <FormLabel>Total Task Hires Limit</FormLabel>
                  <Input name="totalTaskHiresLimit" type="number" value={formData.totalTaskHiresLimit || 0} onChange={handleInputChange} />
                </FormControl>

                <FormControl>
                  <FormLabel>Emergency Task Limit</FormLabel>
                  <Input name="emergencyTaskLimit" type="number" value={formData.emergencyTaskLimit || 0} onChange={handleInputChange} />
                </FormControl>

                <FormControl>
                  <FormLabel>Commission Inside Limit (%)</FormLabel>
                  <Input name="commissionInsideLimit" type="number" value={formData.commissionInsideLimit || 0} onChange={handleInputChange} />
                </FormControl>

                <FormControl>
                  <FormLabel>Commission Above Limit (%)</FormLabel>
                  <Input name="commissionAboveLimit" type="number" value={formData.commissionAboveLimit || 0} onChange={handleInputChange} />
                </FormControl>

                <FormControl>
                  <FormLabel>Emergency Commission (%)</FormLabel>
                  <Input name="commissionEmergency" type="number" value={formData.commissionEmergency || 0} onChange={handleInputChange} />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Priority Listing</FormLabel>
                  <Switch name="priorityListing" isChecked={formData.priorityListing} onChange={handleInputChange} />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Active</FormLabel>
                  <Switch name="isActive" isChecked={formData.isActive} onChange={handleInputChange} />
                </FormControl>
              </Flex>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" onClick={onClose} mr={3}>Cancel</Button>
            <Button colorScheme="blue" onClick={handleSave} isLoading={saving}>
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
