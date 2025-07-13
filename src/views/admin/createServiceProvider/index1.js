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
  Select,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import axios from 'axios';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';

import Card from 'components/card/Card';

export default function OrdersTable() {
  const [serviceProviderForm, setServiceProviderForm] = React.useState({
	phone: '',
	full_name: '',
	location: '',
	current_location: '',
	full_address: '',
	landmark: '',
	colony_name: '',
	house_number: '',
	referral_code: '',
	profile_pic: '',
	category_id: '',
	subcategory_ids: [],
  });
  const [categories, setCategories] = React.useState([]);
  const [subcategories, setSubcategories] = React.useState([]);
  const [file, setFile] = React.useState(null);
  const [errors, setErrors] = React.useState({});
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const navigate = useNavigate();
  const toast = useToast();

  const baseUrl = process.env.REACT_APP_BASE_URL;
  const token = localStorage.getItem('token');

  React.useEffect(() => {
	const fetchCategories = async () => {
	  try {
		const response = await axios.get(`${baseUrl}api/adminWork-category`, {
		  headers: { Authorization: `Bearer ${token}` },
		});
		setCategories(Array.isArray(response.data.data) ? response.data.data : []);
	  } catch (err) {
		toast({
		  title: 'Error',
		  description: 'Failed to fetch categories',
		  status: 'error',
		  duration: 3000,
		  isClosable: true,
		  position: 'top-right',
		});
	  }
	};
	fetchCategories();
  }, [baseUrl, token, toast]);

  React.useEffect(() => {
	const fetchSubcategories = async () => {
	  if (!serviceProviderForm.category_id) {
		setSubcategories([]);
		setServiceProviderForm((prev) => ({ ...prev, subcategory_ids: [] }));
		return;
	  }
	  try {
		const response = await axios.get(
		  `${baseUrl}api/adminSubcategories/${serviceProviderForm.category_id}`,
		  {
			headers: { Authorization: `Bearer ${token}` },
		  }
		);
		const subcategoriesData = Array.isArray(response.data.data) ? response.data.data : [];
		setSubcategories(subcategoriesData);
		setServiceProviderForm((prev) => ({
		  ...prev,
		  subcategory_ids: prev.subcategory_ids.filter((id) =>
			subcategoriesData.some((sub) => sub._id === id)
		  ),
		}));
	  } catch (err) {
		toast({
		  title: 'Error',
		  description: 'Failed to fetch subcategories',
		  status: 'error',
		  duration: 3000,
		  isClosable: true,
		  position: 'top-right',
		});
		setSubcategories([]);
	  }
	};
	fetchSubcategories();
  }, [baseUrl, token, serviceProviderForm.category_id, toast]);

  const handleFileChange = (e) => {
	const selectedFile = e.target.files[0];
	if (selectedFile) {
	  if (!selectedFile.type.startsWith('image/')) {
		setErrors((prev) => ({ ...prev, profilePic: 'Please select an image file' }));
		setFile(null);
		return;
	  }
	  if (selectedFile.size > 5 * 1024 * 1024) {
		setErrors((prev) => ({ ...prev, profilePic: 'File size must be less than 5MB' }));
		setFile(null);
		return;
	  }
	  setErrors((prev) => ({ ...prev, profilePic: '' }));
	  setFile(selectedFile);
	}
  };

  const handleServiceProviderInputChange = (e) => {
	const { name, value } = e.target;
	setServiceProviderForm((prev) => ({ ...prev, [name]: value }));
	setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubcategoryChange = (e) => {
	const selectedOptions = Array.from(e.target.selectedOptions).map((option) => option.value);
	setServiceProviderForm((prev) => ({ ...prev, subcategory_ids: selectedOptions }));
	setErrors((prev) => ({ ...prev, subcategory_ids: '' }));
  };

  const validateForm = () => {
	const newErrors = {};
	if (!serviceProviderForm.phone) {
	  newErrors.phone = 'Phone is required';
	} else if (!/^\d{10}$/.test(serviceProviderForm.phone)) {
	  newErrors.phone = 'Phone must be a valid 10-digit number';
	}
	if (!serviceProviderForm.full_name) {
	  newErrors.full_name = 'Full Name is required';
	}
	if (!serviceProviderForm.category_id) {
	  newErrors.category_id = 'Category is required';
	}
	if (serviceProviderForm.category_id && serviceProviderForm.subcategory_ids.length === 0) {
	  newErrors.subcategory_ids = 'At least one subcategory is required';
	}
	setErrors(newErrors);
	return Object.keys(newErrors).length === 0;
  };

  const createServiceProvider = async () => {
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
	  Object.keys(serviceProviderForm).forEach((key) => {
		if (key !== 'profile_pic' && key !== 'subcategory_ids') {
		  formData.append(key, serviceProviderForm[key]);
		}
	  });
	  // ✅ Proper way to send subcategory_ids as array
	  serviceProviderForm.subcategory_ids.forEach((id) => {
		formData.append('subcategory_ids', id);
	  });
	  if (file) {
		formData.append('profilePic', file);
	  }

	  const response = await axios.post(
		`${baseUrl}api/admin/createServiceProvider`,
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
		description: 'Service provider created successfully!',
		status: 'success',
		duration: 3000,
		isClosable: true,
		position: 'top-right',
	  });

	  setServiceProviderForm({
		phone: '',
		full_name: '',
		location: '',
		current_location: '',
		full_address: '',
		landmark: '',
		colony_name: '',
		house_number: '',
		referral_code: '',
		profile_pic: '',
		category_id: '',
		subcategory_ids: [],
	  });
	  setFile(null);
	  setErrors({});
	  navigate('/admin/service_provider');
	} catch (err) {
	  console.error('Create Service Provider Error:', err);
	  toast({
		title: 'Error',
		description: err.response?.data?.message || 'Failed to create service provider',
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
		  Create Service Provider
		</Text>
	  </Flex>
	  <Box mb="30px">
		<Flex direction="column" gap="4">
		  {/* Phone & Name */}
		  <Flex gap="4" direction={{ base: 'column', md: 'row' }}>
			<FormControl isRequired isInvalid={!!errors.phone}>
			  <FormLabel>Phone</FormLabel>
			  <Input name="phone" value={serviceProviderForm.phone} onChange={handleServiceProviderInputChange} />
			  {errors.phone && <Text color="red.500" fontSize="sm">{errors.phone}</Text>}
			</FormControl>
			<FormControl isRequired isInvalid={!!errors.full_name}>
			  <FormLabel>Full Name</FormLabel>
			  <Input name="full_name" value={serviceProviderForm.full_name} onChange={handleServiceProviderInputChange} />
			  {errors.full_name && <Text color="red.500" fontSize="sm">{errors.full_name}</Text>}
			</FormControl>
		  </Flex>

		  {/* Location Info */}
		  <Flex gap="4" direction={{ base: 'column', md: 'row' }}>
			<FormControl><FormLabel>Location</FormLabel>
			  <Input name="location" value={serviceProviderForm.location} onChange={handleServiceProviderInputChange} />
			</FormControl>
			<FormControl><FormLabel>Current Location</FormLabel>
			  <Input name="current_location" value={serviceProviderForm.current_location} onChange={handleServiceProviderInputChange} />
			</FormControl>
		  </Flex>

		  {/* Address Info */}
		  <Flex gap="4" direction={{ base: 'column', md: 'row' }}>
			<FormControl><FormLabel>Full Address</FormLabel>
			  <Input name="full_address" value={serviceProviderForm.full_address} onChange={handleServiceProviderInputChange} />
			</FormControl>
			<FormControl><FormLabel>Landmark</FormLabel>
			  <Input name="landmark" value={serviceProviderForm.landmark} onChange={handleServiceProviderInputChange} />
			</FormControl>
		  </Flex>

		  {/* Colony & House No */}
		  <Flex gap="4" direction={{ base: 'column', md: 'row' }}>
			<FormControl><FormLabel>Colony Name</FormLabel>
			  <Input name="colony_name" value={serviceProviderForm.colony_name} onChange={handleServiceProviderInputChange} />
			</FormControl>
			<FormControl><FormLabel>House Number</FormLabel>
			  <Input name="house_number" value={serviceProviderForm.house_number} onChange={handleServiceProviderInputChange} />
			</FormControl>
		  </Flex>

		  {/* Referral & Profile Pic */}
		  <Flex gap="4" direction={{ base: 'column', md: 'row' }}>
			<FormControl><FormLabel>Referral Code</FormLabel>
			  <Input name="referral_code" value={serviceProviderForm.referral_code} onChange={handleServiceProviderInputChange} />
			</FormControl>
			<FormControl isInvalid={!!errors.profilePic}>
			  <FormLabel>Profile Picture</FormLabel>
			  <Input type="file" name="profilePic" onChange={handleFileChange} />
			  {errors.profilePic && <Text color="red.500" fontSize="sm">{errors.profilePic}</Text>}
			</FormControl>
		  </Flex>

		  {/* Category & Subcategory */}
		  <Flex gap="4" direction={{ base: 'column', md: 'row' }}>
			<FormControl isRequired isInvalid={!!errors.category_id}>
			  <FormLabel>Category</FormLabel>
			  <Select name="category_id" value={serviceProviderForm.category_id} onChange={handleServiceProviderInputChange}>
				<option value="">Select category</option>
				{categories.map((cat) => (
				  <option key={cat._id} value={cat._id}>{cat.name}</option>
				))}
			  </Select>
			  {errors.category_id && <Text color="red.500" fontSize="sm">{errors.category_id}</Text>}
			</FormControl>
			<FormControl isRequired isInvalid={!!errors.subcategory_ids}>
			  <FormLabel>Subcategories</FormLabel>
			  <Select name="subcategory_ids" multiple value={serviceProviderForm.subcategory_ids} onChange={handleSubcategoryChange}>
				{subcategories.map((sub) => (
				  <option key={sub._id} value={sub._id}>{sub.name}</option>
				))}
			  </Select>
			  {errors.subcategory_ids && <Text color="red.500" fontSize="sm">{errors.subcategory_ids}</Text>}
			</FormControl>
		  </Flex>

		  <Button colorScheme="blue" onClick={createServiceProvider}>
			Create Service Provider
		  </Button>
		</Flex>
	  </Box>
	</Card>
  );
}
