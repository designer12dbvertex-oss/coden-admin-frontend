/* eslint-disable */
'use client';

import {
  Box,
  Flex,
  Text,
  Input,
  Button,
  FormControl,
  FormLabel,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from 'components/card/Card';

export default function CreateSubadmin() {
  const [subadminForm, setSubadminForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const navigate = useNavigate();
  const toast = useToast();

  const baseUrl = process.env.REACT_APP_BASE_URL;
  const token = localStorage.getItem('token');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        setErrors((prev) => ({
          ...prev,
          profile_pic: 'Please select an image file',
        }));
        setFile(null);
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          profile_pic: 'File size must be less than 5MB',
        }));
        setFile(null);
        return;
      }
      setErrors((prev) => ({ ...prev, profile_pic: '' }));
      setFile(selectedFile);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSubadminForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!subadminForm.full_name) {
      newErrors.full_name = 'Full Name is required';
    }
    if (!subadminForm.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(subadminForm.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!subadminForm.phone) {
      newErrors.phone = 'Phone is required';
    } else if (!/^\d{10}$/.test(subadminForm.phone)) {
      newErrors.phone = 'Phone must be a valid 10-digit number';
    }
    if (!subadminForm.password) {
      newErrors.password = 'Password is required';
    } else if (subadminForm.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createSubadmin = async () => {
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill all required fields correctly',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('full_name', subadminForm.full_name);
      formData.append('email', subadminForm.email);
      formData.append('phone', subadminForm.phone);
      formData.append('password', subadminForm.password);
      if (file) {
        formData.append('profilePic', file);
      }

      const response = await axios.post(
        `${baseUrl}api/admin/createSubadmin`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      toast({
        title: 'Success',
        description: 'Subadmin created successfully!',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });

      setSubadminForm({
        full_name: '',
        email: '',
        phone: '',
        password: '',
      });
      setFile(null);
      setErrors({});
      navigate('/admin/sub_admins');
    } catch (err) {
      console.error('Create Subadmin Error:', err);
      toast({
        title: 'Error',
        description:
          err.response?.data?.message || 'Failed to create subadmin',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    }
  };

  return (
    <Card flexDirection="column" w="100%" px="25px" py="25px" mt="80px">
      <Flex mb="20px" justifyContent="space-between" align="center">
        <Text color={textColor} fontSize="22px" fontWeight="700">
          Create Subadmin
        </Text>
      </Flex>
      <Box mb="30px">
        <Flex direction="column" gap="4">
          {/* Full Name & Email */}
          <Flex gap="4" direction={{ base: 'column', md: 'row' }}>
            <FormControl isRequired isInvalid={!!errors.full_name}>
              <FormLabel>Full Name</FormLabel>
              <Input
                name="full_name"
                value={subadminForm.full_name}
                onChange={handleInputChange}
                placeholder="Enter full name"
              />
              {errors.full_name && (
                <Text color="red.500" fontSize="sm">
                  {errors.full_name}
                </Text>
              )}
            </FormControl>
            <FormControl isRequired isInvalid={!!errors.email}>
              <FormLabel>Email</FormLabel>
              <Input
                name="email"
                value={subadminForm.email}
                onChange={handleInputChange}
                placeholder="Enter email"
                type="email"
              />
              {errors.email && (
                <Text color="red.500" fontSize="sm">
                  {errors.email}
                </Text>
              )}
            </FormControl>
          </Flex>

          {/* Phone & Password */}
          <Flex gap="4" direction={{ base: 'column', md: 'row' }}>
            <FormControl isRequired isInvalid={!!errors.phone}>
              <FormLabel>Phone</FormLabel>
              <Input
                name="phone"
                value={subadminForm.phone}
                onChange={handleInputChange}
                placeholder="Enter phone number"
                type="tel"
              />
              {errors.phone && (
                <Text color="red.500" fontSize="sm">
                  {errors.phone}
                </Text>
              )}
            </FormControl>
            <FormControl isRequired isInvalid={!!errors.password}>
              <FormLabel>Password</FormLabel>
              <Input
                name="password"
                value={subadminForm.password}
                onChange={handleInputChange}
                placeholder="Enter password"
                type="password"
              />
              {errors.password && (
                <Text color="red.500" fontSize="sm">
                  {errors.password}
                </Text>
              )}
            </FormControl>
          </Flex>

          {/* Profile Picture */}
          <FormControl isInvalid={!!errors.profile_pic}>
            <FormLabel>Profile Picture</FormLabel>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            {errors.profile_pic && (
              <Text color="red.500" fontSize="sm">
                {errors.profile_pic}
              </Text>
            )}
          </FormControl>

          <Button colorScheme="blue" onClick={createSubadmin}>
            Create Subadmin
          </Button>
        </Flex>
      </Box>
    </Card>
  );
}
