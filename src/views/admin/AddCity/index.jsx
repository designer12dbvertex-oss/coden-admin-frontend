/* eslint-disable */
'use client';

import {
  Box, Flex, Table, Tbody, Td, Text, Th, Thead, Tr, useColorModeValue,
  Button, Input, FormControl, FormLabel, useToast, IconButton,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  useDisclosure, InputGroup, InputLeftElement, Select
} from '@chakra-ui/react';
import { MdEdit, MdDelete, MdSearch } from 'react-icons/md';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from 'components/card/Card';

export default function CityManagement() {
  const [countries, setCountries] = useState([]); // Dropdown ke liye
  const [states, setStates] = useState([]); // Filtered States ke liye
  const [cities, setCities] = useState([]); // All Cities list
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Form States
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [cityName, setCityName] = useState('');
  const [editData, setEditData] = useState({ id: '', name: '', stateId: '', countryId: '' });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const toast = useToast();

  const baseUrl = process.env.REACT_APP_BASE_URL;
  const token = localStorage.getItem('token');

  // 1. Initial Data Load (Countries & Cities)
  const fetchData = async () => {
    try {
      const [countryRes, cityRes] = await Promise.all([
        axios.get(`${baseUrl}api/country/getAll`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${baseUrl}api/city/getAll`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setCountries(countryRes.data.countries || []);
      setCities(cityRes.data.cities || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // 2. Dependency Logic: Jab Country change ho toh uske States fetch karo
  const handleCountryChange = async (countryId) => {
    setSelectedCountry(countryId);
    setSelectedState(''); // Purana state clear karein
    try {
      const res = await axios.get(`${baseUrl}api/state/getByCountry/${countryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStates(res.data.states || []);
    } catch (err) {
      setStates([]);
    }
  };

  // 3. Add City
  const handleAddCity = async () => {
    if (!cityName || !selectedState) {
      return toast({ title: 'Please select State and enter City name', status: 'warning' });
    }
    setLoading(true);
    try {
      await axios.post(`${baseUrl}api/city/add`, 
        { name: cityName, stateId: selectedState }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({ title: 'City Added!', status: 'success' });
      setCityName('');
      fetchData();
    } catch (err) { toast({ title: 'Error adding city', status: 'error' }); }
    finally { setLoading(false); }
  };

  // 4. Update Logic
  const openEditModal = (city) => {
    setEditData({ 
      id: city._id, 
      name: city.name, 
      stateId: city.stateId?._id,
      countryId: city.stateId?.countryId // Backend se populated data chahiye
    });
    onOpen();
  };

  // 5. Filter for Table
  const filteredCities = cities.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.stateId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      
      {/* ADD SECTION */}
      <Card mb='20px' p='20px'>
        <Text color={textColor} fontSize='22px' fontWeight='700' mb='20px'>City Management</Text>
        <Flex gap='15px' align='flex-end' direction={{ base: 'column', md: 'row' }}>
          <FormControl>
            <FormLabel>Country</FormLabel>
            <Select placeholder='Select Country' onChange={(e) => handleCountryChange(e.target.value)}>
              {countries.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel>State</FormLabel>
            <Select placeholder='Select State' value={selectedState} onChange={(e) => setSelectedState(e.target.value)}>
              {states.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel>City Name</FormLabel>
            <Input value={cityName} onChange={(e) => setCityName(e.target.value)} placeholder='Ex: Gwalior' />
          </FormControl>
          <Button colorScheme='blue' onClick={handleAddCity} isLoading={loading} px='40px'>Add</Button>
        </Flex>
      </Card>

      {/* SEARCH & TABLE SECTION */}
      <Card p='20px'>
        <Flex justify='space-between' align='center' mb='20px'>
          <Text color={textColor} fontSize='18px' fontWeight='700'>All Cities</Text>
          <InputGroup maxW='300px'>
            <InputLeftElement><MdSearch color='gray.300' /></InputLeftElement>
            <Input placeholder='Search city...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </InputGroup>
        </Flex>

        <Box overflowX='auto'>
          <Table variant='simple'>
            <Thead bg='gray.50'>
              <Tr>
                <Th>S.No</Th>
                <Th>City Name</Th>
                <Th>State</Th>
                <Th>Country</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredCities.map((c, i) => (
                <Tr key={c._id}>
                  <Td>{i + 1}</Td>
                  <Td fontWeight='600'>{c.name}</Td>
                  <Td>{c.stateId?.name || 'N/A'}</Td>
                  <Td>{c.stateId?.countryId?.name || 'N/A'}</Td>
                  <Td>
                    <IconButton icon={<MdEdit />} colorScheme='green' onClick={() => openEditModal(c)} mr='2' />
                    <IconButton icon={<MdDelete />} colorScheme='red' />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Card>

      {/* UPDATE MODAL (Similar to State modal but with State dropdown) */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update City</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb='4'>
              <FormLabel>City Name</FormLabel>
              <Input value={editData.name} onChange={(e) => setEditData({...editData, name: e.target.value})} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='blue' onClick={() => {/* Update Function */}}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </Box>
  );
}