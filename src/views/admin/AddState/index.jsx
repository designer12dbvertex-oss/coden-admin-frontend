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
  Switch,
  Badge,
} from '@chakra-ui/react';
import { MdEdit, MdDelete, MdSearch } from 'react-icons/md';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from 'components/card/Card';

export default function StateManagement() {
  const [states, setStates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Form States
  const [stateName, setStateName] = useState('');
  const [editData, setEditData] = useState({
    id: '',
    name: '',
    isActive: true,
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const toast = useToast();

  const baseUrl = process.env.REACT_APP_BASE_URL.replace(/\/+$/, '');

  const token = localStorage.getItem('token');

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` },
  });

  // 1. Fetch States (Admin ke liye isAdmin=true bhej rahe hain)
  const fetchData = async () => {
    try {
      const stateRes = await axios.get(
        `${baseUrl}/api/location/all-states?isAdmin=true`,
        getHeaders(),
      );
      setStates(stateRes.data.data || []);
    } catch (err) {
      console.error('Fetch Error:', err);
      toast({ title: 'Failed to load states', status: 'error' });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Search Filter
  const filteredStates = states.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // 3. Add State (Ab sirf name jayega)
  const handleAddState = async () => {
    if (!stateName) {
      return toast({ title: 'Enter State Name', status: 'warning' });
    }
    setLoading(true);
    try {
      await axios.post(
        `${baseUrl}/api/location/add`,
        { name: stateName },
        getHeaders(),
      );
      toast({ title: 'State Added Successfully!', status: 'success' });
      setStateName('');
      fetchData();
    } catch (err) {
      toast({
        title: err.response?.data?.message || 'Error adding state',
        status: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // 4. Update Status Toggle (Active/Inactive)
  const handleStatusToggle = async (id, currentStatus) => {
    try {
      await axios.put(
        `${baseUrl}/api/location/update/${id}`,
        { isActive: !currentStatus },
        getHeaders(),
      );
      toast({
        title: `State ${!currentStatus ? 'Activated' : 'Deactivated'}`,
        status: 'success',
        duration: 2000,
      });
      fetchData();
    } catch (err) {
      toast({ title: 'Failed to update status', status: 'error' });
    }
  };

  // 5. Update State Name Modal
  const openEditModal = (state) => {
    setEditData({ id: state._id, name: state.name, isActive: state.isActive });
    onOpen();
  };

  const handleUpdate = async () => {
    try {
      await axios.put(
        `${baseUrl}/api/location/update/${editData.id}`,
        { name: editData.name, isActive: editData.isActive },
        getHeaders(),
      );
      toast({ title: 'State Updated!', status: 'success' });
      onClose();
      fetchData();
    } catch (err) {
      toast({ title: 'Update Failed', status: 'error' });
    }
  };

  // 6. Delete State
  const handleDelete = async (id) => {
    if (
      window.confirm('Are you sure? This will remove the state permanently.')
    ) {
      try {
        await axios.delete(
          `${baseUrl}/api/location/delete/${id}`,
          getHeaders(),
        );
        toast({ title: 'State Deleted!', status: 'info' });
        fetchData();
      } catch (err) {
        toast({ title: 'Delete Failed', status: 'error' });
      }
    }
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* ADD SECTION */}
      <Card mb="20px" p="20px">
        <Text color={textColor} fontSize="22px" fontWeight="700" mb="20px">
          India State Management
        </Text>
        <Flex
          gap="20px"
          align="flex-end"
          direction={{ base: 'column', md: 'row' }}
        >
          <FormControl>
            <FormLabel>State Name</FormLabel>
            <Input
              value={stateName}
              onChange={(e) => setStateName(e.target.value)}
              placeholder="Ex: Maharashtra, Delhi..."
            />
          </FormControl>
          <Button
            colorScheme="blue"
            onClick={handleAddState}
            isLoading={loading}
            px="40px"
            minW="150px"
          >
            Add New State
          </Button>
        </Flex>
      </Card>

      {/* LIST SECTION */}
      <Card p="20px">
        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align={{ md: 'center' }}
          mb="20px"
          gap="10px"
        >
          <Text color={textColor} fontSize="18px" fontWeight="700">
            Manage States
          </Text>
          <InputGroup maxW={{ md: '300px' }}>
            <InputLeftElement pointerEvents="none">
              <MdSearch color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search state..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Flex>

        <Box overflowX="auto">
          <Table variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th w="50px">S.No</Th>
                <Th>State Name</Th>
                <Th textAlign="center">Show to User</Th>
                <Th>Status</Th>
                <Th textAlign="right">Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredStates.map((s, i) => (
                <Tr key={s._id}>
                  <Td>{i + 1}</Td>
                  <Td fontWeight="600" textTransform="capitalize">
                    {s.name}
                  </Td>
                  <Td textAlign="center">
                    <Switch
                      colorScheme="blue"
                      isChecked={s.isActive}
                      onChange={() => handleStatusToggle(s._id, s.isActive)}
                    />
                  </Td>
                  <Td>
                    <Badge colorScheme={s.isActive ? 'green' : 'red'}>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </Td>
                  <Td textAlign="right">
                    <IconButton
                      icon={<MdEdit />}
                      variant="ghost"
                      colorScheme="blue"
                      onClick={() => openEditModal(s)}
                      mr="2"
                    />
                    <IconButton
                      icon={<MdDelete />}
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => handleDelete(s._id)}
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
        <ModalContent>
          <ModalHeader>Edit State</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>State Name</FormLabel>
              <Input
                value={editData.name}
                onChange={(e) =>
                  setEditData({ ...editData, name: e.target.value })
                }
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleUpdate}>
              Update
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
