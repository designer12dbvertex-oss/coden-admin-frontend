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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
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
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const navigate = useNavigate();
  const toast = useToast();

  const baseUrl = process.env.REACT_APP_BASE_URL;
  const token = localStorage.getItem('token');
  const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  // Map modal states
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [tempLocation, setTempLocation] = React.useState({ latitude: '', longitude: '', address: '' });
  const mapRef = React.useRef(null);
  const markerRef = React.useRef(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = React.useState(false);
  const mapInstanceRef = React.useRef(null);

  // Load Google Maps API script
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

  // Fetch categories (unchanged)
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

  // Fetch subcategories (unchanged)
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

  // Handle file change (unchanged)
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

  // Handle input changes and trigger autocomplete
  const handleInputChange = (e, field, index = null) => {
    const { name, value } = e.target;
    if (field === 'location') {
      setServiceProviderForm((prev) => ({
        ...prev,
        location: { ...prev.location, [name]: value },
      }));
      setErrors((prev) => ({ ...prev, location: '' }));
      if (name === 'address' && value && isGoogleLoaded) {
        fetchAddressSuggestions(value, field, index);
      } else {
        setAddressSuggestions([]);
      }
    } else if (field === 'full_address' && index !== null) {
      const updatedAddresses = [...serviceProviderForm.full_address];
      updatedAddresses[index] = { ...updatedAddresses[index], [name]: value };
      setServiceProviderForm((prev) => ({
        ...prev,
        full_address: updatedAddresses,
      }));
      setErrors((prev) => ({ ...prev, full_address: '' }));
      if (name === 'address' && value && isGoogleLoaded) {
        fetchAddressSuggestions(value, field, index);
      } else {
        setAddressSuggestions([]);
      }
    } else {
      setServiceProviderForm((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Fetch address suggestions using Places Autocomplete API
  const fetchAddressSuggestions = async (input, field, index = null) => {
    if (!isGoogleLoaded || !input) {
      setAddressSuggestions([]);
      return;
    }
    try {
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/place/autocomplete/json',
        {
          params: {
            input,
            key: googleMapsApiKey,
            components: 'country:in', // Restrict to India
            types: 'address', // Use 'address' for more precise results
          },
        },
      );
      console.log('Autocomplete response:', response.data); // Debug API response
      if (response.data.status === 'OK') {
        setAddressSuggestions(response.data.predictions);
        setCurrentField({ type: field, index });
      } else {
        setAddressSuggestions([]);
        toast({
          title: 'Error',
          description: `Failed to fetch address suggestions: ${response.data.status}`,
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top-right',
        });
      }
    } catch (err) {
      console.error('Autocomplete error:', err);
      setAddressSuggestions([]);
      toast({
        title: 'Error',
        description: 'Failed to fetch address suggestions. Check your network or API key.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    }
  };

  // Fetch place details (latitude, longitude) for selected address
  const selectAddress = async (placeId, field, index = null) => {
    try {
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/place/details/json',
        {
          params: {
            place_id: placeId,
            key: googleMapsApiKey,
            fields: 'formatted_address,geometry',
          },
        },
      );
      console.log('Place details response:', response.data); // Debug API response
      if (response.data.status === 'OK') {
        const { formatted_address, geometry } = response.data.result;
        const latitude = geometry.location.lat;
        const longitude = geometry.location.lng;
        if (field === 'location') {
          setServiceProviderForm((prev) => ({
            ...prev,
            location: { latitude, longitude, address: formatted_address },
          }));
          setErrors((prev) => ({ ...prev, location: '' }));
        } else if (field === 'full_address' && index !== null) {
          const updatedAddresses = [...serviceProviderForm.full_address];
          updatedAddresses[index] = {
            ...updatedAddresses[index],
            latitude,
            longitude,
            address: formatted_address,
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
          description: `Failed to fetch place details: ${response.data.status}`,
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top-right',
        });
      }
    } catch (err) {
      console.error('Place details error:', err);
      toast({
        title: 'Error',
        description: 'Failed to fetch place details. Check your network or API key.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    }
  };

  // Handle subcategory change (unchanged)
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

  // Remove subcategory (unchanged)
  const removeSubcategory = (id) => {
    setServiceProviderForm((prev) => ({
      ...prev,
      subcategory_ids: prev.subcategory_ids.filter((subId) => subId !== id),
    }));
  };

  // Add new address (unchanged)
  const addAddress = () => {
    setServiceProviderForm((prev) => ({
      ...prev,
      full_address: [
        ...prev.full_address,
        { latitude: '', longitude: '', address: '', landmark: '', title: '' },
      ],
    }));
  };

  // Remove address (unchanged)
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

  // Initialize map in modal
  React.useEffect(() => {
    if (isOpen && isGoogleLoaded && mapRef.current) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 20.5937, lng: 78.9629 }, // Default to India center
        zoom: 5,
        mapTypeControl: false,
        streetViewControl: false,
      });
      mapInstanceRef.current = map;

      const marker = new window.google.maps.Marker({
        map,
        draggable: true,
      });
      markerRef.current = marker;

      // Set initial position
      let initialLatLng;
      if (currentField.type === 'location') {
        const loc = serviceProviderForm.location;
        if (loc.latitude && loc.longitude && !isNaN(loc.latitude) && !isNaN(loc.longitude)) {
          initialLatLng = { lat: parseFloat(loc.latitude), lng: parseFloat(loc.longitude) };
          setTempLocation({ ...loc, latitude: parseFloat(loc.latitude), longitude: parseFloat(loc.longitude) });
        }
      } else if (currentField.type === 'full_address' && currentField.index !== null) {
        const addr = serviceProviderForm.full_address[currentField.index];
        if (addr.latitude && addr.longitude && !isNaN(addr.latitude) && !isNaN(addr.longitude)) {
          initialLatLng = { lat: parseFloat(addr.latitude), lng: parseFloat(addr.longitude) };
          setTempLocation({ ...addr, latitude: parseFloat(addr.latitude), longitude: parseFloat(addr.longitude) });
        }
      }
      if (initialLatLng) {
        map.setCenter(initialLatLng);
        map.setZoom(15);
        marker.setPosition(initialLatLng);
        reverseGeocode(initialLatLng.lat, initialLatLng.lng);
      } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            map.setCenter({ lat: latitude, lng: longitude });
            map.setZoom(15);
            marker.setPosition({ lat: latitude, lng: longitude });
            reverseGeocode(latitude, longitude);
          },
          () => {
            console.log('Geolocation failed, using default center');
          },
        );
      }

      // Trigger resize to ensure map renders
      setTimeout(() => {
        window.google.maps.event.trigger(map, 'resize');
        if (initialLatLng) {
          map.setCenter(initialLatLng);
        }
      }, 200);

      // Map click listener
      map.addListener('click', (e) => {
        marker.setPosition(e.latLng);
        reverseGeocode(e.latLng.lat(), e.latLng.lng());
      });

      // Marker dragend listener
      marker.addListener('dragend', (e) => {
        reverseGeocode(e.latLng.lat(), e.latLng.lng());
      });

      // Add search box to map
      const input = document.createElement('input');
      input.style.width = '90%';
      input.style.padding = '8px';
      input.style.margin = '10px';
      input.style.border = '1px solid #ccc';
      input.style.borderRadius = '4px';
      input.placeholder = 'Search for a place';
      map.controls[window.google.maps.ControlPosition.TOP_LEFT].push(input);
      const searchBox = new window.google.maps.places.SearchBox(input);
      searchBox.addListener('places_changed', () => {
        const places = searchBox.getPlaces();
        if (places.length === 0 || !places[0].geometry) return;
        const place = places[0];
        map.setCenter(place.geometry.location);
        map.setZoom(15);
        marker.setPosition(place.geometry.location);
        setTempLocation({
          latitude: place.geometry.location.lat(),
          longitude: place.geometry.location.lng(),
          address: place.formatted_address || '',
        });
      });
    }
  }, [isOpen, isGoogleLoaded, currentField]);

  // Reverse geocode coordinates to address
  const reverseGeocode = (lat, lng) => {
    if (!isGoogleLoaded) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results[0]) {
        setTempLocation({ latitude: lat, longitude: lng, address: results[0].formatted_address });
      } else {
        console.error('Reverse geocode failed:', status);
        setTempLocation({ latitude: lat, longitude: lng, address: '' });
        toast({
          title: 'Error',
          description: 'Failed to fetch address for coordinates',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top-right',
        });
      }
    });
  };

  // Confirm selected location from map
  const confirmLocation = () => {
    if (!tempLocation.latitude || !tempLocation.longitude) {
      toast({
        title: 'Error',
        description: 'Please select a valid location',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }
    if (currentField.type === 'location') {
      setServiceProviderForm((prev) => ({
        ...prev,
        location: tempLocation,
      }));
      setErrors((prev) => ({ ...prev, location: '' }));
    } else if (currentField.type === 'full_address' && currentField.index !== null) {
      const updatedAddresses = [...serviceProviderForm.full_address];
      updatedAddresses[currentField.index] = {
        ...updatedAddresses[currentField.index],
        ...tempLocation,
      };
      setServiceProviderForm((prev) => ({
        ...prev,
        full_address: updatedAddresses,
      }));
      setErrors((prev) => ({ ...prev, full_address: '' }));
    }
    setAddressSuggestions([]);
    onClose();
  };

  // Open map modal
  const openMapModal = (type, index = null) => {
    if (!isGoogleLoaded) {
      toast({
        title: 'Error',
        description: 'Google Maps API is not loaded yet. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }
    setCurrentField({ type, index });
    setTempLocation({ latitude: '', longitude: '', address: '' });
    onOpen();
  };

  // Form validation (unchanged)
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
    } else if (
      isNaN(serviceProviderForm.location.latitude) ||
      isNaN(serviceProviderForm.location.longitude)
    ) {
      newErrors.location = 'Latitude and longitude must be valid numbers';
    }

    if (serviceProviderForm.full_address.length === 0) {
      newErrors.full_address = 'At least one address is required';
    } else {
      serviceProviderForm.full_address.forEach((addr) => {
        if (!addr.latitude || !addr.longitude || !addr.address || !addr.title) {
          newErrors.full_address = 'All address fields (latitude, longitude, address, title) are required';
        } else if (isNaN(addr.latitude) || isNaN(addr.longitude)) {
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

  // Create service provider (unchanged)
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
                  <Button
                    size="sm"
                    colorScheme="green"
                    onClick={() => openMapModal('location')}
                  >
                    Select on Map
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
                    <Button
                      size="sm"
                      colorScheme="green"
                      onClick={() => openMapModal('full_address', index)}
                    >
                      Select on Map
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

      {/* Map Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select Location on Map</ModalHeader>
          <ModalBody>
            <Box ref={mapRef} style={{ height: '400px', width: '100%', position: 'relative' }} />
            <FormControl mt="4">
              <FormLabel>Selected Address</FormLabel>
              <Input value={tempLocation.address} readOnly placeholder="Selected address will appear here" />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={confirmLocation}>
              Confirm
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
