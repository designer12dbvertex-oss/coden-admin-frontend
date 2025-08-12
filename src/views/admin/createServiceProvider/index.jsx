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
    location: { latitude: '', longitude: '', address: '' },
    full_address: [{ latitude: '', longitude: '', address: '', landmark: '', title: '' }],
    referral_code: '',
    profile_pic: '',
    category_id: '',
    subcategory_ids: [],
  });
  const [categories, setCategories] = React.useState([]);
  const [subcategories, setSubcategories] = React.useState([]);
  const [file, setFile] = React.useState(null);
  const [errors, setErrors] = React.useState({});
  const [addressSuggestions, setAddressSuggestions] = React.useState([]);
  const [currentField, setCurrentField] = React.useState({ type: '', index: null });
	const [isGoogleLoaded, setIsGoogleLoaded] = React.useState(false);
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const navigate = useNavigate();
  const toast = useToast();
 const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const baseUrl = process.env.REACT_APP_BASE_URL;
  const token = localStorage.getItem('token');

  // Fetch categories
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
			const loadGoogleMapsScript = () => {
				if (!googleMapsApiKey) {
					console.error('Google Maps API key is missing');
					toast({
						title: 'Error',
						description: 'Google Maps API key is not configured',
						status: 'error',
						duration: 3000,
						isClosable: true,
						position: 'top-right',
					});
					return;
				}
				if (!window.google) {
					const script = document.createElement('script');
					script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
					script.async = true;
					script.defer = true;
					document.head.appendChild(script);
					script.onload = () => {
						setIsGoogleLoaded(true);
						console.log('Google Maps API loaded successfully');
					};
					script.onerror = (error) => {
						console.error('Failed to load Google Maps API:', error);
						toast({
							title: 'Error',
							description: 'Failed to load Google Maps API. Check your API key or network.',
							status: 'error',
							duration: 3000,
							isClosable: true,
							position: 'top-right',
						});
					};
				} else {
					setIsGoogleLoaded(true);
				}
			};
			loadGoogleMapsScript();
		}, [toast, googleMapsApiKey]);
  // Fetch subcategories
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
          },
        );
        const subcategoriesData = Array.isArray(response.data.data) ? response.data.data : [];
        setSubcategories(subcategoriesData);
        setServiceProviderForm((prev) => ({
          ...prev,
          subcategory_ids: prev.subcategory_ids.filter((id) =>
            subcategoriesData.some((sub) => sub._id === id),
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

  // Handle file change
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        setErrors((prev) => ({
          ...prev,
          profilePic: 'Please select an image file',
        }));
        setFile(null);
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          profilePic: 'File size must be less than 5MB',
        }));
        setFile(null);
        return;
      }
      setErrors((prev) => ({ ...prev, profilePic: '' }));
      setFile(selectedFile);
    }
  };

  // Validate coordinates
  const validateCoordinates = (lat, lng) => {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (isNaN(latNum) || isNaN(lngNum)) {
      return false;
    }
    if (latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
      return false;
    }
    return true;
  };

  // Fetch address suggestions from backend
  const fetchAddressSuggestions = async (input, field, index = null) => {
    if (!input) {
      setAddressSuggestions([]);
      return;
    }
    try {
      const response = await axios.get(`${baseUrl}api/user/suggest-locations`, {
        params: { input },
      });
			console.log(response.data);
      if (response.data.status) {
        setAddressSuggestions(response.data.suggestions);
        setCurrentField({ type: field, index });
      } else {
        setAddressSuggestions([]);
        toast({
          title: 'Error',
          description: response.data.message || 'Failed to fetch address suggestions',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top-right',
        });
      }
    } catch (err) {
      setAddressSuggestions([]);
      toast({
        title: 'Error',
        description: 'Failed to fetch address suggestions. Check your network or backend setup.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    }
  };

  // Fetch place details from backend
  const selectAddress = async (placeId, field, index = null) => {
    try {
      const response = await axios.get(`${baseUrl}api/user/get-location-from-place`, {
        params: { place_id: placeId },
      });
      if (response.data.status) {
        const { latitude, longitude, address } = response.data;
        if (field === 'location') {
          setServiceProviderForm((prev) => ({
            ...prev,
            location: { latitude, longitude, address },
          }));
          setErrors((prev) => ({ ...prev, location: '' }));
        } else if (field === 'full_address' && index !== null) {
          const updatedAddresses = [...serviceProviderForm.full_address];
          updatedAddresses[index] = {
            ...updatedAddresses[index],
            latitude,
            longitude,
            address,
          };
          setServiceProviderForm((prev) => ({
            ...prev,
            full_address: updatedAddresses,
          }));
          setErrors((prev) => ({ ...prev, full_address: '' }));
        }
        setAddressSuggestions([]);
      } else {
        toast({
          title: 'Error',
          description: response.data.message || 'Failed to fetch place details',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top-right',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to fetch place details. Check your network or backend setup.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    }
  };

  // Handle input changes
  const handleInputChange = (e, field, index = null) => {
    const { name, value } = e.target;
    if (field === 'location') {
      const updatedLocation = { ...serviceProviderForm.location, [name]: value };
      setServiceProviderForm((prev) => ({
        ...prev,
        location: updatedLocation,
      }));
      setErrors((prev) => ({ ...prev, location: '' }));

      if (name === 'address' && value) {
        fetchAddressSuggestions(value, field, index);
      } else {
        setAddressSuggestions([]);
      }

      // Validate coordinates
      if ((name === 'latitude' || name === 'longitude') && updatedLocation.latitude && updatedLocation.longitude) {
        if (!validateCoordinates(updatedLocation.latitude, updatedLocation.longitude)) {
          setErrors((prev) => ({ ...prev, location: 'Invalid latitude or longitude' }));
        }
      }
    } else if (field === 'full_address' && index !== null) {
      const updatedAddresses = [...serviceProviderForm.full_address];
      updatedAddresses[index] = { ...updatedAddresses[index], [name]: value };
      setServiceProviderForm((prev) => ({
        ...prev,
        full_address: updatedAddresses,
      }));
      setErrors((prev) => ({ ...prev, full_address: '' }));

      if (name === 'address' && value) {
        fetchAddressSuggestions(value, field, index);
      } else {
        setAddressSuggestions([]);
      }

      // Validate coordinates
      if ((name === 'latitude' || name === 'longitude') && updatedAddresses[index].latitude && updatedAddresses[index].longitude) {
        if (!validateCoordinates(updatedAddresses[index].latitude, updatedAddresses[index].longitude)) {
          setErrors((prev) => ({ ...prev, full_address: 'Invalid latitude or longitude' }));
        }
      }
    } else {
      setServiceProviderForm((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Handle subcategory change
  const handleSubcategoryChange = (e) => {
    const selectedValue = e.target.value;
    if (selectedValue && !serviceProviderForm.subcategory_ids.includes(selectedValue)) {
      setServiceProviderForm((prev) => ({
        ...prev,
        subcategory_ids: [...prev.subcategory_ids, selectedValue],
      }));
      setErrors((prev) => ({ ...prev, subcategory_ids: '' }));
    }
  };

  // Remove subcategory
  const removeSubcategory = (id) => {
    setServiceProviderForm((prev) => ({
      ...prev,
      subcategory_ids: prev.subcategory_ids.filter((subId) => subId !== id),
    }));
  };

  // Add new address
  const addAddress = () => {
    setServiceProviderForm((prev) => ({
      ...prev,
      full_address: [
        ...prev.full_address,
        { latitude: '', longitude: '', address: '', landmark: '', title: '' },
      ],
    }));
  };

  // Remove address
  const removeAddress = (index) => {
    setServiceProviderForm((prev) => ({
      ...prev,
      full_address: prev.full_address.filter((_, i) => i !== index),
    }));
  };

  // Fetch current location using geolocation
 const fetchLocation = (field, index = null) => {
    if (!navigator.geolocation) {
      toast({
        title: 'Error',
        description: 'Geolocation is not supported by your browser',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const geocoder = isGoogleLoaded ? new window.google.maps.Geocoder() : null;
        if (!geocoder) {
          toast({
            title: 'Error',
            description: 'Google Maps API not loaded',
            status: 'error',
            duration: 3000,
            isClosable: true,
            position: 'top-right',
          });
          return;
        }
        geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const address = results[0].formatted_address;
            if (field === 'location') {
              setServiceProviderForm((prev) => ({
                ...prev,
                location: { latitude, longitude, address },
              }));
              setErrors((prev) => ({ ...prev, location: '' }));
            } else if (field === 'full_address' && index !== null) {
              const updatedAddresses = [...serviceProviderForm.full_address];
              updatedAddresses[index] = {
                ...updatedAddresses[index],
                latitude,
                longitude,
                address,
              };
              setServiceProviderForm((prev) => ({
                ...prev,
                full_address: updatedAddresses,
              }));
              setErrors((prev) => ({ ...prev, full_address: '' }));
            }
            toast({
              title: 'Success',
              description: 'Location fetched successfully',
              status: 'success',
              duration: 3000,
              isClosable: true,
              position: 'top-right',
            });
          } else {
            toast({
              title: 'Error',
              description: 'Failed to fetch address from coordinates',
              status: 'error',
              duration: 3000,
              isClosable: true,
              position: 'top-right',
            });
          }
        });
      },
      (error) => {
        let errorMessage = 'Failed to fetch location';
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Location permission denied';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = 'Location information is unavailable';
        } else if (error.code === error.TIMEOUT) {
          errorMessage = 'Location request timed out';
        }
        toast({
          title: 'Error',
          description: errorMessage,
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top-right',
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Form validation
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

    if (
      !serviceProviderForm.location.latitude ||
      !serviceProviderForm.location.longitude ||
      !serviceProviderForm.location.address
    ) {
      newErrors.location = 'All location fields (latitude, longitude, address) are required';
    } else if (!validateCoordinates(serviceProviderForm.location.latitude, serviceProviderForm.location.longitude)) {
      newErrors.location = 'Latitude and longitude must be valid numbers';
    }

    if (serviceProviderForm.full_address.length === 0) {
      newErrors.full_address = 'At least one address is required';
    } else {
      serviceProviderForm.full_address.forEach((addr) => {
        if (!addr.latitude || !addr.longitude || !addr.address || !addr.title) {
          newErrors.full_address = 'All address fields (latitude, longitude, address, title) are required';
        } else if (!validateCoordinates(addr.latitude, addr.longitude)) {
          newErrors.full_address = 'Latitude and longitude must be valid numbers';
        }
      });
    }

    if (!serviceProviderForm.category_id) {
      newErrors.category_id = 'Category is required';
    }
    if (serviceProviderForm.subcategory_ids.length === 0) {
      newErrors.subcategory_ids = 'At least one subcategory is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Create service provider
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
      formData.append('phone', serviceProviderForm.phone);
      formData.append('full_name', serviceProviderForm.full_name);
      formData.append('location', JSON.stringify(serviceProviderForm.location));
      formData.append('full_address', JSON.stringify(serviceProviderForm.full_address));
      formData.append('referral_code', serviceProviderForm.referral_code);
      formData.append('category_id', serviceProviderForm.category_id);
      serviceProviderForm.subcategory_ids.forEach((id) => {
        formData.append('subcategory_ids[]', id);
      });
      if (file) {
        formData.append('profilePic', file);
      }

      const userId = localStorage.getItem('userID');
      const response = await axios.post(
        `${baseUrl}api/admin/createServiceProvider`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            userID: userId,
            'Content-Type': 'multipart/form-data',
          },
        },
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
        location: { latitude: '', longitude: '', address: '' },
        full_address: [{ latitude: '', longitude: '', address: '', landmark: '', title: '' }],
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
    <>
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
                <Input
                  name="phone"
                  value={serviceProviderForm.phone}
                  onChange={(e) => handleInputChange(e)}
                />
                {errors.phone && (
                  <Text color="red.500" fontSize="sm">
                    {errors.phone}
                  </Text>
                )}
              </FormControl>
              <FormControl isRequired isInvalid={!!errors.full_name}>
                <FormLabel>Full Name</FormLabel>
                <Input
                  name="full_name"
                  value={serviceProviderForm.full_name}
                  onChange={(e) => handleInputChange(e)}
                />
                {errors.full_name && (
                  <Text color="red.500" fontSize="sm">
                    {errors.full_name}
                  </Text>
                )}
              </FormControl>
            </Flex>

            {/* Location */}
            <Box position="relative">
              <Flex gap="4" direction={{ base: 'column', md: 'row' }}>
                <FormControl isRequired isInvalid={!!errors.location}>
                  <FormLabel>Location Latitude</FormLabel>
                  <Input
                    name="latitude"
                    value={serviceProviderForm.location.latitude}
                    onChange={(e) => handleInputChange(e, 'location')}
                    type="number"
                    step="any"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Location Longitude</FormLabel>
                  <Input
                    name="longitude"
                    value={serviceProviderForm.location.longitude}
                    onChange={(e) => handleInputChange(e, 'location')}
                    type="number"
                    step="any"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Location Address</FormLabel>
                  <Input
                    name="address"
                    value={serviceProviderForm.location.address}
                    onChange={(e) => handleInputChange(e, 'location')}
                    placeholder="Type to search for a location"
                  />
                </FormControl>
                <Flex direction="column" justify="end" gap="2">
                  <Button
                    size="sm"
                    colorScheme="blue"
                    onClick={() => fetchLocation('location')}
                  >
                    Fetch Current Location
                  </Button>
                </Flex>
              </Flex>
              {currentField.type === 'location' && addressSuggestions.length > 0 && (
                <Box
                  position="absolute"
                  bg="white"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="md"
                  mt="1"
                  zIndex="1000"
                  width="100%"
                  maxHeight="200px"
                  overflowY="auto"
                >
                  {addressSuggestions.map((suggestion) => (
                    <Box
                      key={suggestion.place_id}
                      p="2"
                      cursor="pointer"
                      _hover={{ bg: 'gray.100' }}
                      onClick={() => selectAddress(suggestion.place_id, 'location')}
                    >
                      {suggestion.description}
                    </Box>
                  ))}
                </Box>
              )}
              {errors.location && (
                <Text color="red.500" fontSize="sm">
                  {errors.location}
                </Text>
              )}
            </Box>

            {/* Full Address */}
            {serviceProviderForm.full_address.map((addr, index) => (
              <Box key={index} mb="4" p="4" border="1px solid" borderColor="gray.200" borderRadius="md" position="relative">
                <Text fontWeight="bold" mb="2">Address {index + 1}</Text>
                <Flex gap="4" direction={{ base: 'column', md: 'row' }}>
                  <FormControl isRequired isInvalid={!!errors.full_address}>
                    <FormLabel>Latitude</FormLabel>
                    <Input
                      name="latitude"
                      value={addr.latitude}
                      onChange={(e) => handleInputChange(e, 'full_address', index)}
                      type="number"
                      step="any"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Longitude</FormLabel>
                    <Input
                      name="longitude"
                      value={addr.longitude}
                      onChange={(e) => handleInputChange(e, 'full_address', index)}
                      type="number"
                      step="any"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Address</FormLabel>
                    <Input
                      name="address"
                      value={addr.address}
                      onChange={(e) => handleInputChange(e, 'full_address', index)}
                      placeholder="Type to search for a location"
                    />
                  </FormControl>
                  <Flex direction="column" justify="end" gap="2">
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={() => fetchLocation('full_address', index)}
                    >
                      Fetch Current Location
                    </Button>
                  </Flex>
                </Flex>
                {currentField.type === 'full_address' && currentField.index === index && addressSuggestions.length > 0 && (
                  <Box
                    position="absolute"
                    bg="white"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                    mt="1"
                    zIndex="1000"
                    width="100%"
                    maxHeight="200px"
                    overflowY="auto"
                  >
                    {addressSuggestions.map((suggestion) => (
                      <Box
                        key={suggestion.place_id}
                        p="2"
                        cursor="pointer"
                        _hover={{ bg: 'gray.100' }}
                        onClick={() => selectAddress(suggestion.place_id, 'full_address', index)}
                      >
                        {suggestion.description}
                    </Box>
                  ))}
                </Box>
              )}
              <Flex gap="4" direction={{ base: 'column', md: 'row' }} mt="2">
                <FormControl>
                  <FormLabel>Landmark</FormLabel>
                  <Input
                    name="landmark"
                    value={addr.landmark}
                    onChange={(e) => handleInputChange(e, 'full_address', index)}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Title</FormLabel>
                  <Input
                    name="title"
                    value={addr.title}
                    onChange={(e) => handleInputChange(e, 'full_address', index)}
                  />
                </FormControl>
              </Flex>
              {serviceProviderForm.full_address.length > 1 && (
                <Button mt="2" size="sm" colorScheme="red" onClick={() => removeAddress(index)}>
                  Remove Address
                </Button>
              )}
              {errors.full_address && index === 0 && (
                <Text color="red.500" fontSize="sm" mt="2">
                  {errors.full_address}
                </Text>
              )}
            </Box>
          ))}
          <Button size="sm" colorScheme="blue" onClick={addAddress}>
            Add Another Address
          </Button>

          {/* Referral & Profile Pic */}
          <Flex gap="4" direction={{ base: 'column', md: 'row' }}>
            <FormControl>
              <FormLabel>Referral Code</FormLabel>
              <Input
                name="referral_code"
                value={serviceProviderForm.referral_code}
                onChange={(e) => handleInputChange(e)}
              />
            </FormControl>
            <FormControl isInvalid={!!errors.profilePic}>
              <FormLabel>Profile Picture</FormLabel>
              <Input
                type="file"
                name="profilePic"
                onChange={handleFileChange}
              />
              {errors.profilePic && (
                <Text color="red.500" fontSize="sm">
                  {errors.profilePic}
                </Text>
              )}
            </FormControl>
          </Flex>

          {/* Category & Subcategory */}
          <Flex gap="4" direction={{ base: 'column', md: 'row' }}>
            <FormControl isRequired isInvalid={!!errors.category_id}>
              <FormLabel>Category</FormLabel>
              <Select
                name="category_id"
                value={serviceProviderForm.category_id}
                onChange={(e) => handleInputChange(e)}
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
              {errors.category_id && (
                <Text color="red.500" fontSize="sm">
                  {errors.category_id}
                </Text>
              )}
            </FormControl>
            <FormControl isRequired isInvalid={!!errors.subcategory_ids}>
              <FormLabel fontSize="sm" fontWeight="500" color={textColor}>
                Subcategories
              </FormLabel>
              <Select
                name="subcategory_ids"
                value=""
                onChange={handleSubcategoryChange}
                placeholder="Select subcategory"
              >
                {subcategories
                  .filter((sub) => !serviceProviderForm.subcategory_ids.includes(sub._id))
                  .map((subcategory) => (
                    <option key={subcategory._id} value={subcategory._id}>
                      {subcategory.name}
                    </option>
                  ))}
              </Select>
              {errors.subcategory_ids && (
                <Text color="red.500" fontSize="sm">
                  {errors.subcategory_ids}
                </Text>
              )}
              {serviceProviderForm.subcategory_ids.length > 0 && (
                <Flex mt="2" wrap="wrap" gap="2">
                  {subcategories
                    .filter((sub) => serviceProviderForm.subcategory_ids.includes(sub._id))
                    .map((sub) => (
                      <Flex
                        key={sub._id}
                        align="center"
                        bg="gray.100"
                        px="2"
                        py="1"
                        borderRadius="md"
                      >
                        <Text fontSize="sm">{sub.name}</Text>
                        <Button
                          size="xs"
                          ml="2"
                          onClick={() => removeSubcategory(sub._id)}
                        >
                          ×
                        </Button>
                      </Flex>
                    ))}
                </Flex>
              )}
            </FormControl>
          </Flex>

          <Button colorScheme="teal" onClick={createServiceProvider}>
            Create Service Provider
          </Button>
        </Flex>
      </Box>
    </Card>
  </>
);
}
