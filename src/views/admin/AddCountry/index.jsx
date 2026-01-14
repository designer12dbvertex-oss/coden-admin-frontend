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
} from '@chakra-ui/react';
import { MdEdit, MdDelete, MdSearch } from 'react-icons/md'; // MdSearch icon add kiya
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from 'components/card/Card';

export default function CountryManagement() {
  const [countries, setCountries] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // Search query ke liye state
  const [countryName, setCountryName] = useState('');
  const [editData, setEditData] = useState({ id: '', name: '' });
  const [loading, setLoading] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const toast = useToast();

  const baseUrl = process.env.REACT_APP_BASE_URL;
  const token = localStorage.getItem('token');

  const fetchCountries = async () => {
    try {
      const response = await axios.get(`${baseUrl}api/country/getAll`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCountries(response.data.countries || []);
    } catch (err) {
      console.error('Fetch Error:', err);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  // Filter Logic: Jo countries searchTerm se match karengi wahi dikhengi
  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleAddCountry = async () => {
    if (!countryName) return toast({ title: 'Enter Name', status: 'warning' });
    setLoading(true);
    try {
      await axios.post(
        `${baseUrl}api/country/add`,
        { name: countryName },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast({ title: 'Added!', status: 'success' });
      setCountryName('');
      fetchCountries();
    } catch (err) {
      toast({ title: 'Error', status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (country) => {
    setEditData({ id: country._id, name: country.name });
    onOpen();
  };

  const handleUpdate = async () => {
    try {
      await axios.put(
        `${baseUrl}api/country/update/${editData.id}`,
        { name: editData.name },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast({ title: 'Updated!', status: 'success' });
      onClose();
      fetchCountries();
    } catch (err) {
      toast({ title: 'Update Failed', status: 'error' });
    }
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* ADD SECTION */}
      <Card mb="20px" p="20px">
        <Text color={textColor} fontSize="22px" fontWeight="700" mb="20px">
          Country Management
        </Text>
        <Flex
          gap="20px"
          align="flex-end"
          direction={{ base: 'column', md: 'row' }}
        >
          <FormControl>
            <FormLabel>Country Name</FormLabel>
            <Input
              value={countryName}
              onChange={(e) => setCountryName(e.target.value)}
              placeholder="Ex: India"
            />
          </FormControl>
          <Button
            colorScheme="blue"
            onClick={handleAddCountry}
            isLoading={loading}
            w={{ base: '100%', md: 'auto' }}
          >
            Add
          </Button>
        </Flex>
      </Card>

      {/* SEARCH & TABLE SECTION */}
      <Card p="20px">
        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align={{ md: 'center' }}
          mb="20px"
          gap="10px"
        >
          <Text color={textColor} fontSize="18px" fontWeight="700">
            All Countries
          </Text>

          {/* Search Bar Implementation */}
          <InputGroup maxW={{ md: '300px' }}>
            <InputLeftElement pointerEvents="none">
              <MdSearch color="gray.300" />
            </InputLeftElement>
            <Input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              borderRadius="10px"
            />
          </InputGroup>
        </Flex>

        <Box overflowX="auto">
          <Table variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th>S.No</Th>
                <Th>Name</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredCountries.length > 0 ? (
                filteredCountries.map((c, i) => (
                  <Tr key={c._id}>
                    <Td>{i + 1}</Td>
                    <Td fontWeight="600">{c.name}</Td>
                    <Td>
                      <IconButton
                        icon={<MdEdit />}
                        colorScheme="green"
                        onClick={() => openEditModal(c)}
                        mr="2"
                      />
                      <IconButton icon={<MdDelete />} colorScheme="red" />
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={3} textAlign="center" py="4">
                    No countries found matching "{searchTerm}"
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>
      </Card>

      {/* UPDATE MODAL */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update Country</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>New Country Name</FormLabel>
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
              Save Changes
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
