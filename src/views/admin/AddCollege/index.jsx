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

export default function CollarManagement() {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [collars, setCollars] = useState([]); // All data list
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Form States
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [collarName, setCollarName] = useState('');
  const [editData, setEditData] = useState({ id: '', name: '', cityId: '' });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const toast = useToast();

  const baseUrl = process.env.REACT_APP_BASE_URL;
  const token = localStorage.getItem('token');

  // 1. Initial Load: Get Countries and All Collars
  const fetchData = async () => {
    try {
      const [countryRes, collarRes] = await Promise.all([
        axios.get(`${baseUrl}api/country/getAll`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${baseUrl}api/collar/getAll`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setCountries(countryRes.data.countries || []);
      setCollars(collarRes.data.collars || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // 2. Cascading Logic: Country -> State
  const handleCountryChange = async (countryId) => {
    setSelectedCountry(countryId);
    setSelectedState('');
    setSelectedCity('');
    setStates([]);
    setCities([]);
    try {
      const res = await axios.get(`${baseUrl}api/state/getByCountry/${countryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStates(res.data.states || []);
    } catch (err) { console.error(err); }
  };

  // 3. Cascading Logic: State -> City
  const handleStateChange = async (stateId) => {
    setSelectedState(stateId);
    setSelectedCity('');
    setCities([]);
    try {
      const res = await axios.get(`${baseUrl}api/city/getByState/${stateId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCities(res.data.cities || []);
    } catch (err) { console.error(err); }
  };

  // 4. Add Collar
  const handleAddCollar = async () => {
    if (!collarName || !selectedCity) {
      return toast({ title: 'Please select City and enter Collar name', status: 'warning' });
    }
    setLoading(true);
    try {
      await axios.post(`${baseUrl}api/collar/add`, 
        { name: collarName, cityId: selectedCity }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({ title: 'Collar Added!', status: 'success' });
      setCollarName('');
      fetchData();
    } catch (err) { toast({ title: 'Error adding collar', status: 'error' }); }
    finally { setLoading(false); }
  };

  // 5. Search Filter for Table
  const filteredCollars = collars.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cityId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      
      {/* ADD SECTION - 4 Fields Row */}
      <Card mb='20px' p='20px'>
        <Text color={textColor} fontSize='22px' fontWeight='700' mb='20px'>College Management</Text>
        <Flex gap='10px' align='flex-end' wrap='wrap'>
          <FormControl flex='1' minW='150px'>
            <FormLabel fontSize='sm'>Country</FormLabel>
            <Select placeholder='Country' onChange={(e) => handleCountryChange(e.target.value)}>
              {countries.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </Select>
          </FormControl>
          
          <FormControl flex='1' minW='150px'>
            <FormLabel fontSize='sm'>State</FormLabel>
            <Select placeholder='State' value={selectedState} onChange={(e) => handleStateChange(e.target.value)} isDisabled={!selectedCountry}>
              {states.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </Select>
          </FormControl>

          <FormControl flex='1' minW='150px'>
            <FormLabel fontSize='sm'>City</FormLabel>
            <Select placeholder='City' value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} isDisabled={!selectedState}>
              {cities.map(ct => <option key={ct._id} value={ct._id}>{ct.name}</option>)}
            </Select>
          </FormControl>

          <FormControl flex='1' minW='150px'>
            <FormLabel fontSize='sm'>College Name</FormLabel>
            <Input value={collarName} onChange={(e) => setCollarName(e.target.value)} placeholder='Ex: Area Name' />
          </FormControl>

          <Button colorScheme='blue' onClick={handleAddCollar} isLoading={loading} px='30px'>Add</Button>
        </Flex>
      </Card>

      {/* TABLE SECTION */}
      <Card p='20px'>
        <Flex justify='space-between' align='center' mb='20px' wrap='wrap' gap='10px'>
          <Text color={textColor} fontSize='18px' fontWeight='700'>All College</Text>
          <InputGroup maxW='300px'>
            <InputLeftElement><MdSearch color='gray.300' /></InputLeftElement>
            <Input placeholder='Search collar or city...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </InputGroup>
        </Flex>

        <Box overflowX='auto'>
          <Table variant='simple'>
            <Thead bg='gray.50'>
              <Tr>
                <Th>S.No</Th>
                <Th>Collage Name</Th>
                <Th>City</Th>
                <Th>State</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredCollars.map((c, i) => (
                <Tr key={c._id}>
                  <Td>{i + 1}</Td>
                  <Td fontWeight='600' color='blue.600'>{c.name}</Td>
                  <Td>{c.cityId?.name || 'N/A'}</Td>
                  <Td>{c.cityId?.stateId?.name || 'N/A'}</Td>
                  <Td>
                    <IconButton icon={<MdEdit />} colorScheme='green' size='sm' mr='2' />
                    <IconButton icon={<MdDelete />} colorScheme='red' size='sm' />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Card>

    </Box>
  );
}