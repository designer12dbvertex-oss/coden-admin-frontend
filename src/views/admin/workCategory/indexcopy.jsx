/* eslint-disable */
'use client';

import {
  Box,
  Button,
  Flex,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Input,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import axios from 'axios';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Custom components
import Card from 'components/card/Card';

const columnHelper = createColumnHelper();

export default function OrdersTable() {
  const [sorting, setSorting] = React.useState([]);
  const [allData, setAllData] = React.useState([]);
  const [data, setData] = React.useState([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [newCategory, setNewCategory] = React.useState({
	name: '',
	image: null,
  });
  const [editCategory, setEditCategory] = React.useState(null);
  const [newSubcategory, setNewSubcategory] = React.useState({
	name: '',
	image: null,
	categoryId: '',
  });
  const [editSubcategory, setEditSubcategory] = React.useState(null);
  const [subcategoryCounts, setSubcategoryCounts] = React.useState({});
  const [modalSubcategories, setModalSubcategories] = React.useState([]);
  // New state for confirmation modal
  const [deleteItem, setDeleteItem] = React.useState({ id: null, type: null });
  const categoryFileInputRef = React.useRef(null);
  const subcategoryFileInputRef = React.useRef(null);
  const itemsPerPage = 10;

  const {
	isOpen: isAddOpen,
	onOpen: onAddOpen,
	onClose: onAddClose,
  } = useDisclosure();
  const {
	isOpen: isEditOpen,
	onOpen: onEditOpen,
	onClose: onEditClose,
  } = useDisclosure();
  const {
	isOpen: isDetailsOpen,
	onOpen: onDetailsOpen,
	onClose: onDetailsClose,
  } = useDisclosure();
  // New disclosure for confirmation modal
  const {
	isOpen: isConfirmOpen,
	onOpen: onConfirmOpen,
	onClose: onConfirmClose,
  } = useDisclosure();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const navigate = useNavigate();

  const baseUrl = process.env.REACT_APP_BASE_URL;
  const token = localStorage.getItem('token');

  // Fetch subcategories for a category
  const fetchSubcategories = async (categoryId) => {
	try {
	  const response = await axios.get(
		`${baseUrl}api/adminSubcategories/${categoryId}`,
		{ headers: { Authorization: `Bearer ${token}` } },
	  );
	  if (!response.data || !Array.isArray(response.data.data)) {
		throw new Error('Invalid subcategory response format');
	  }
	  return response.data.data;
	} catch (err) {
	  console.error('Fetch Subcategories Error:', err);
	  return [];
	}
  };

  // Fetch all categories
  const fetchCategories = async () => {
	try {
	  if (!baseUrl || !token) {
		throw new Error('Missing base URL or authentication token');
	  }
	  setLoading(true);
	  const response = await axios.get(
		`${baseUrl}api/adminWork-category`,
		{ headers: { Authorization: `Bearer ${token}` } },
	  );
	  // console.log('API Response (Categories):', response.data);

	  if (!response.data || !Array.isArray(response.data.data)) {
		throw new Error(
		  'Invalid response format: Expected an array of categories',
		);
	  }

	  const formattedData = response.data.data.map((item) => ({
		id: item._id || '',
		name: item.name || '',
		image: item.image || '',
	  }));

	  const filteredData = formattedData.filter((category) =>
		category.name.toLowerCase().includes(searchQuery.toLowerCase())
	  );

	  setAllData(formattedData);

	  const calculatedTotalPages = Math.max(
		1,
		Math.ceil(filteredData.length / itemsPerPage),
	  );
	  setTotalPages(calculatedTotalPages);

	  const startIndex = (currentPage - 1) * itemsPerPage;
	  const paginatedData = filteredData.slice(
		startIndex,
		startIndex + itemsPerPage,
	  );
	  setData(paginatedData);

	  const counts = {};
	  for (const category of formattedData) {
		const subcategories = await fetchSubcategories(category.id);
		counts[category.id] = subcategories.length;
	  }
	  setSubcategoryCounts(counts);

	  console.log('Pagination Info:', {
		totalItems: filteredData.length,
		totalPages: calculatedTotalPages,
		currentPage,
		itemsDisplayed: paginatedData.length,
	  });

	  if (currentPage > calculatedTotalPages) {
		setCurrentPage(1);
	  }

	  setLoading(false);
	} catch (err) {
	  console.error('Fetch Categories Error:', err);
	  if (
		err.response?.data?.message === 'Not authorized, token failed' ||
		err.response?.data?.message ===
		  'Session expired or logged in on another device' ||
		err.response?.data?.message ===
		  'Un-Authorized, You are not authorized to access this route.' ||
		err.response?.data?.message === 'Not authorized, token failed'
	  ) {
		localStorage.removeItem('token');
		navigate('/');
	  } else {
		setError(err.message || 'Failed to fetch categories');
		setLoading(false);
	  }
	}
  };

  React.useEffect(() => {
	if (allData.length > 0) {
	  const filteredData = allData.filter((category) =>
		category.name.toLowerCase().includes(searchQuery.toLowerCase())
	  );
	  const calculatedTotalPages = Math.max(
		1,
		Math.ceil(filteredData.length / itemsPerPage),
	  );
	  setTotalPages(calculatedTotalPages);

	  const startIndex = (currentPage - 1) * itemsPerPage;
	  const paginatedData = filteredData.slice(
		startIndex,
		startIndex + itemsPerPage,
	  );
	  setData(paginatedData);
	  console.log('Current Page Data:', {
		currentPage,
		startIndex,
		itemsDisplayed: paginatedData.length,
	  });
	}
  }, [currentPage, allData, searchQuery]);

  React.useEffect(() => {
	fetchCategories();
  }, [navigate]);

  React.useEffect(() => {
	if ((editCategory && isEditOpen) || (editCategory && isDetailsOpen)) {
	  const loadSubcategories = async () => {
		const subcategories = await fetchSubcategories(editCategory.id);
		setModalSubcategories(subcategories);
	  };
	  loadSubcategories();
	}
  }, [editCategory?.id, isEditOpen, isDetailsOpen]);

  const handleCreateCategory = async () => {
	try {
	  const formData = new FormData();
	  formData.append('name', newCategory.name);
	  if (newCategory.image) {
		formData.append('image', newCategory.image);
	  }
	  const response = await axios.post(
		`${baseUrl}api/work-category`,
		formData,
		{
		  headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'multipart/form-data',
		  },
		},
	  );
	  console.log('Create Category Response:', response.data);
	  setCurrentPage(1);
	  await fetchCategories();
	  setNewCategory({ name: '', image: null });
	  if (categoryFileInputRef.current) {
		categoryFileInputRef.current.value = '';
	  }
	  onAddClose();
	  toast.success('Category created successfully!', {
		position: 'top-right',
		autoClose: 3000,
	  });
	} catch (err) {
	  console.error('Create Category Error:', err);
	  toast.error('Failed to create category', {
		position: 'top-right',
		autoClose: 3000,
	  });
	}
  };

  const handleEditCategory = async () => {
	try {
	  const formData = new FormData();
	  formData.append('name', editCategory.name);
	  if (editCategory.image instanceof File) {
		formData.append('image', editCategory.image);
	  }
	  const response = await axios.put(
		`${baseUrl}api/work-category/${editCategory.id}`,
		formData,
		{
		  headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'multipart/form-data',
		  },
		},
	  );
	  console.log('Update Category Response:', response.data);
	  setCurrentPage(1);
	  await fetchCategories();
	  setEditCategory(null);
	  onEditClose();
	  toast.success('Category updated successfully!', {
		position: 'top-right',
		autoClose: 3000,
	  });
	} catch (err) {
	  console.error('Update Category Error:', err);
	  toast.error('Failed to update category', {
		position: 'top-right',
		autoClose: 3000,
	  });
	}
  };

  // Modified handleDeleteCategory to open confirmation modal
  const handleDeleteCategory = async () => {
	try {
	  await axios.delete(`${baseUrl}api/work-category/${deleteItem.id}`, {
		headers: { Authorization: `Bearer ${token}` },
	  });
	  setCurrentPage(1);
	  await fetchCategories();
	  setEditCategory(null);
	  setModalSubcategories([]);
	  onEditClose();
	  onConfirmClose();
	  setDeleteItem({ id: null, type: null });
	  toast.success('Category deleted successfully!', {
		position: 'top-right',
		autoClose: 3000,
	  });
	} catch (err) {
	  console.error('Delete Category Error:', err);
	  toast.error('Failed to delete category', {
		position: 'top-right',
		autoClose: 3000,
	  });
	}
  };

  const handleCreateSubcategory = async () => {
	try {
	  const formData = new FormData();
	  formData.append('name', newSubcategory.name);
	  formData.append('category_id', editCategory.id);
	  if (newSubcategory.image) {
		formData.append('image', newSubcategory.image);
	  }
	  const response = await axios.post(
		`${baseUrl}api/sub-category`,
		formData,
		{
		  headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'multipart/form-data',
		  },
		},
	  );
	  console.log('Create Subcategory Response:', response.data);
	  const updatedSubcategories = await fetchSubcategories(editCategory.id);
	  setModalSubcategories(updatedSubcategories);
	  setSubcategoryCounts((prev) => ({
		...prev,
		[editCategory.id]: updatedSubcategories.length,
	  }));
	  setNewSubcategory({ name: '', image: null, categoryId: '' });
	  if (subcategoryFileInputRef.current) {
		subcategoryFileInputRef.current.value = '';
	  }
	  toast.success('Subcategory created successfully!', {
		position: 'top-right',
		autoClose: 3000,
	  });
	} catch (err) {
	  console.error('Create Subcategory Error:', err);
	  toast.error('Failed to create subcategory', {
		position: 'top-right',
		autoClose: 3000,
	  });
	}
  };

  const handleEditSubcategory = async () => {
	try {
	  const formData = new FormData();
	  formData.append('name', editSubcategory.name);
	  if (editSubcategory.image instanceof File) {
		formData.append('image', editSubcategory.image);
	  }
	  const response = await axios.put(
		`${baseUrl}api/subcategories/${editSubcategory._id}`,
		formData,
		{
		  headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'multipart/form-data',
		  },
		},
	  );
	  console.log('Update Subcategory Response:', response.data);
	  const updatedSubcategories = await fetchSubcategories(editCategory.id);
	  setModalSubcategories(updatedSubcategories);
	  setEditSubcategory(null);
	  if (subcategoryFileInputRef.current) {
		subcategoryFileInputRef.current.value = '';
	  }
	  toast.success('Subcategory updated successfully!', {
		position: 'top-right',
		autoClose: 3000,
	  });
	} catch (err) {
	  console.error('Update Subcategory Error:', err);
	  toast.error('Failed to update subcategory', {
		position: 'top-right',
		autoClose: 3000,
	  });
	}
  };

  // Modified handleDeleteSubcategory to open confirmation modal
  const handleDeleteSubcategory = async () => {
	try {
	  await axios.delete(`${baseUrl}api/subcategories/${deleteItem.id}`, {
		headers: { Authorization: `Bearer ${token}` },
	  });
	  const updatedSubcategories = await fetchSubcategories(editCategory.id);
	  setModalSubcategories(updatedSubcategories);
	  setSubcategoryCounts((prev) => ({
		...prev,
		[editCategory.id]: updatedSubcategories.length,
	  }));
	  onConfirmClose();
	  setDeleteItem({ id: null, type: null });
	  toast.success('Subcategory deleted successfully!', {
		position: 'top-right',
		autoClose: 3000,
	  });
	} catch (err) {
	  console.error('Delete Subcategory Error:', err);
	  toast.error('Failed to delete subcategory', {
		position: 'top-right',
		autoClose: 3000,
	  });
	}
  };

  // New function to handle confirmation
  const confirmDelete = () => {
	if (deleteItem.type === 'category') {
	  handleDeleteCategory();
	} else if (deleteItem.type === 'subcategory') {
	  handleDeleteSubcategory();
	}
  };

  const handlePreviousPage = () => {
	setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
	setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleSearchChange = (e) => {
	setSearchQuery(e.target.value);
	setCurrentPage(1);
  };

  const columns = React.useMemo(
	() => [
	  columnHelper.display({
		id: 'serialNo',
		header: () => (
		  <Text
			justifyContent="space-between"
			align="center"
			fontSize={{ sm: '10px', lg: '12px' }}
			color="gray.400"
		  >
			S.NO
		  </Text>
		),
		cell: ({ row }) => (
		  <Flex align="center">
			<Text color={textColor} fontSize="sm" fontWeight="700">
			  {(currentPage - 1) * itemsPerPage + row.index + 1}
			</Text>
		  </Flex>
		),
	  }),
	  columnHelper.accessor('name', {
		id: 'name',
		header: () => (
		  <Text
			justifyContent="space-between"
			align="center"
			fontSize={{ sm: '10px', lg: '12px' }}
			color="gray.400"
		  >
			CATEGORY NAME
		  </Text>
		),
		cell: (info) => (
		  <Flex align="center">
			<Text color={textColor} fontSize="sm" fontWeight="700">
			  {info.getValue()}
			</Text>
		  </Flex>
		),
	  }),
	  columnHelper.accessor('image', {
		id: 'image',
		header: () => (
		  <Text
			justifyContent="space-between"
			align="center"
			fontSize={{ sm: '10px', lg: '12px' }}
			color="gray.400"
		  >
			IMAGE
		  </Text>
		),
		cell: (info) => (
		  <Flex align="center">
			<Image
			  src={info.getValue()}
			  alt="Category Image"
			  boxSize="50px"
			  objectFit="cover"
			  borderRadius="md"
			/>
		  </Flex>
		),
	  }),
	  columnHelper.display({
		id: 'subcategories',
		header: () => (
		  <Text
			justifyContent="space-between"
			align="center"
			fontSize={{ sm: '10px', lg: '12px' }}
			color="gray.400"
		  >
			SUBCATEGORIES
		  </Text>
		),
		cell: ({ row }) => (
		  <Flex align="center">
			<Text color={textColor} fontSize="sm" fontWeight="700">
			  {subcategoryCounts[row.original.id] || 0}
			</Text>
		  </Flex>
		),
	  }),
	  columnHelper.display({
		id: 'actions',
		header: () => (
		  <Text
			justifyContent="space-between"
			align="center"
			fontSize={{ sm: '10px', lg: '12px' }}
			color="gray.400"
		  >
			ACTIONS
		  </Text>
		),
		cell: ({ row }) => (
		  <Flex align="center" gap="2">
			<Button
			  colorScheme="teal"
			  size="sm"
			  onClick={() => {
				setEditCategory({ ...row.original });
				onEditOpen();
			  }}
			>
			  Edit
			</Button>
			<Button
			  colorScheme="blue"
			  size="sm"
			  onClick={() => {
				setEditCategory({ ...row.original });
				onDetailsOpen();
			  }}
			>
			  View Details
			</Button>
			<Button
			  colorScheme="red"
			  size="sm"
			  onClick={() => {
				setDeleteItem({ id: row.original.id, type: 'category' });
				setEditCategory({ ...row.original }); // Ensure editCategory is set for deletion
				onConfirmOpen();
			  }}
			>
			  Delete
			</Button>
		  </Flex>
		),
	  }),
	],
	[textColor, borderColor, subcategoryCounts],
  );

  const table = useReactTable({
	data,
	columns,
	state: { sorting },
	onSortingChange: setSorting,
	getCoreRowModel: getCoreRowModel(),
	getSortedRowModel: getSortedRowModel(),
	debugTable: true,
  });

  if (loading) {
	return (
	  <Card
		flexDirection="column"
		w="100%"
		px="0px"
		mt="100px"
		overflowX={{ sm: 'scroll', lg: 'hidden' }}
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
		mt="100px"
		overflowX={{ sm: 'scroll', lg: 'hidden' }}
	  >
		<Text color={textColor} fontSize="22px" fontWeight="700" p="25px">
		  Error: {error}
		</Text>
	  </Card>
	);
  }

  return (
	<Card
	  flexDirection="column"
	  w="100%"
	  px="0px"
	  mt="100px"
	  overflowX={{ sm: 'scroll', lg: 'hidden' }}
	>
	  <Flex px="25px" mb="8px" justifyContent="space-between" align="center">
		<Text
		  color={textColor}
		  fontSize="22px"
		  fontWeight="700"
		  lineHeight="100%"
		>
		  All Work Categories
		</Text>
		<Flex gap="4" align="center">
		  <FormControl w="200px">
			<Input
			  placeholder="Search categories..."
			  value={searchQuery}
			  onChange={handleSearchChange}
			/>
		  </FormControl>
		  {/* <Button colorScheme="teal" size="sm" onClick={onAddOpen}>
			Add New Category
		  </Button> */}                                                                   
		</Flex>
	  </Flex>
	  <Box>
		<Table variant="simple" color="gray.500" mb="24px" mt="12px">
		  <Thead>
			{table.getHeaderGroups().map((headerGroup) => (
			  <Tr key={headerGroup.id}>
				{headerGroup.headers.map((header) => (
				  <Th
					key={header.id}
					colSpan={header.colSpan}
					pe="10px"
					borderColor={borderColor}
					cursor="pointer"
					onClick={header.column.getToggleSortingHandler()}
				  >
					<Flex
					  justifyContent="space-between"
					  align="center"
					  fontSize={{ sm: '10px', lg: '12px' }}
					  color="gray.400"
					>
					  {flexRender(
						header.column.columnDef.header,
						header.getContext(),
					  )}
					  {{
						asc: '',
						desc: '',
					  }[header.column.getIsSorted()] ?? null}
					</Flex>
				  </Th>
				))}
			  </Tr>
			))}
		  </Thead>
		  <Tbody>
			{table.getRowModel().rows.map((row) => (
			  <Tr key={row.id}>
				{row.getVisibleCells().map((cell) => (
				  <Td
					key={cell.id}
					fontSize={{ sm: '14px' }}
					minW={{ sm: '150px', md: '200px', lg: 'auto' }}
					borderColor="transparent"
				  >
					{flexRender(cell.column.columnDef.cell, cell.getContext())}
				  </Td>
				))}
			  </Tr>
			))}
		  </Tbody>
		</Table>
	  </Box>
	  <Flex
		justifyContent="space-between"
		alignItems="center"
		px="25px"
		mb="20px"
	  >
		{data.length === 0 ? (
		  <Text>No categories available.</Text>
		) : (
		  <Text>
			Page {currentPage} of {totalPages} ({data.length} items)
		  </Text>
		)}
		<Flex gap="2">
		  <Button
			colorScheme="teal"
			size="sm"
			onClick={handlePreviousPage}
			isDisabled={currentPage === 1}
		  >
			Previous
		  </Button>
		  {totalPages > 1 &&
			Array.from({ length: totalPages }, (_, i) => i + 1)
			  .slice(
				Math.max(0, currentPage - 3),
				Math.min(totalPages, currentPage + 2),
			  )
			  .map((page) => (
				<Button
				  key={page}
				  colorScheme={currentPage === page ? 'teal' : 'gray'}
				  size="sm"
				  onClick={() => setCurrentPage(page)}
				>
				  {page}
				</Button>
			  ))}
		  <Button
			colorScheme="teal"
			size="sm"
			onClick={handleNextPage}
			isDisabled={currentPage === totalPages || data.length === 0}
		  >
			Next
		  </Button>
		</Flex>
	  </Flex>
	  <ToastContainer />
	  <Modal
		isOpen={isAddOpen}
		onClose={() => {
		  setNewCategory({ name: '', image: null });
		  if (categoryFileInputRef.current) {
			categoryFileInputRef.current.value = '';
		  }
		  onAddClose();
		}}
	  >
		<ModalOverlay />
		<ModalContent>
		  <ModalHeader>Add New Category</ModalHeader>
		  <ModalCloseButton />
		  <ModalBody>
			<FormControl mb="4">
			  <FormLabel>Category Name</FormLabel>
			  <Input
				value={newCategory.name}
				onChange={(e) =>
				  setNewCategory({ ...newCategory, name: e.target.value })
				}
				placeholder="Enter category name"
			  />
			</FormControl>
			<FormControl mb="4">
			  <FormLabel>Image</FormLabel>
			  <Input
				type="file"
				accept="image/*"
				ref={categoryFileInputRef}
				onChange={(e) =>
				  setNewCategory({ ...newCategory, image: e.target.files[0] })
				}
			  />
			</FormControl>
		  </ModalBody>
		  <ModalFooter>
			<Button
			  colorScheme="blue"
			  mr={3}
			  onClick={handleCreateCategory}
			  isDisabled={!newCategory.name || !newCategory.image}
			>
			  Save
			</Button>
			<Button
			  variant="ghost"
			  onClick={() => {
				setNewCategory({ name: '', image: null });
				if (categoryFileInputRef.current) {
				  categoryFileInputRef.current.value = '';
				}
				onAddClose();
			  }}
			>
			  Cancel
			</Button>
		  </ModalFooter>
		</ModalContent>
	  </Modal>
	  <Modal
		isOpen={isEditOpen}
		onClose={() => {
		  setEditCategory(null);
		  setEditSubcategory(null);
		  setModalSubcategories([]);
		  if (subcategoryFileInputRef.current) {
			subcategoryFileInputRef.current.value = '';
		  }
		  onEditClose();
		}}
	  >
		<ModalOverlay />
		<ModalContent maxW="600px">
		  <ModalHeader>Edit Category: {editCategory?.name}</ModalHeader>
		  <ModalCloseButton />
		  <ModalBody>
			{editCategory && (
			  <Box>
				<FormControl mb="4">
				  <FormLabel>Category Name</FormLabel>
				  <Input
					value={editCategory.name}
					onChange={(e) =>
					  setEditCategory({ ...editCategory, name: e.target.value })
					}
					placeholder="Enter category name"
				  />
				</FormControl>
				<FormControl mb="4">
				  <FormLabel>Image</FormLabel>
				  {editCategory.image && typeof editCategory.image === 'string' && (
					<Image
					  src={editCategory.image}
					  alt="Current Category Image"
					  boxSize="100px"
					  objectFit="cover"
					  borderRadius="md"
					  mb="2"
					/>
				  )}
				  <Input
					type="file"
					accept="image/*"
					onChange={(e) =>
					  setEditCategory({
						...editCategory,
						image: e.target.files[0],
					  })
					}
				  />
				</FormControl>
				{/* Uncommented Subcategories Section */}
				<Box mb="4">
				  <Text fontWeight="bold" fontSize="lg" mb="2">
					Subcategories
				  </Text>
				  {modalSubcategories.length === 0 ? (
					<Text>No subcategories available.</Text>
				  ) : (
					modalSubcategories.map((sub) => (
					  <Flex
						key={sub._id}
						justify="space-between"
						align="center"
						mb="2"
					  >
						<Flex align="center" gap="2">
						  <Image
							src={sub.image}
							alt="Subcategory Image"
							boxSize="50px"
							objectFit="cover"
							borderRadius="md"
						  />
						  <Text>{sub.name}</Text>
						</Flex>
						<Flex gap="2">
						  <Button
							size="sm"
							colorScheme="teal"
							onClick={() => setEditSubcategory({ ...sub })}
						  >
							Edit
						  </Button>
						  <Button
							size="sm"
							colorScheme="red"
							onClick={() => {
							  setDeleteItem({ id: sub._id, type: 'subcategory' });
							  onConfirmOpen();
							}}
						  >
							Delete
						  </Button>
						</Flex>
					  </Flex>
					))
				  )}
				  <Box mt="4">
					<Text fontWeight="bold" mb="2">
					  {editSubcategory ? 'Edit Subcategory' : 'Add Subcategory'}
					</Text>
					<FormControl mt="2">
					  <FormLabel>Subcategory Name</FormLabel>
					  <Input
						value={
						  editSubcategory
							? editSubcategory.name
							: newSubcategory.name
						}
						onChange={(e) => {
						  const name = e.target.value;
						  if (editSubcategory) {
							setEditSubcategory({ ...editSubcategory, name });
						  } else {
							setNewSubcategory({ ...newSubcategory, name });
						  }
						}}
						placeholder="Enter subcategory name"
					  />
					</FormControl>
					<FormControl mt="2">
					  <FormLabel>Subcategory Image</FormLabel>
					  {editSubcategory &&
						editSubcategory.image &&
						typeof editSubcategory.image === 'string' && (
						  <Image
							src={editSubcategory.image}
							alt="Current Subcategory Image"
							boxSize="100px"
							objectFit="cover"
							borderRadius="md"
							mb="2"
						  />
						)}
					  <Input
						type="file"
						accept="image/*"
						ref={subcategoryFileInputRef}
						onChange={(e) => {
						  const image = e.target.files[0];
						  if (editSubcategory) {
							setEditSubcategory({ ...editSubcategory, image });
						  } else {
							setNewSubcategory({ ...newSubcategory, image });
						  }
						}}
					  />
					</FormControl>
					{/* <Button
					  mt="2"
					  colorScheme="blue"
					  onClick={
						editSubcategory
						  ? handleEditSubcategory
						  : handleCreateSubcategory
					  }
					  isDisabled={
						editSubcategory
						  ? !editSubcategory.name
						  : !newSubcategory.name || !newSubcategory.image
					  }
					>
					  {editSubcategory ? 'Update Subcategory' : 'Add Subcategory'}
					</Button> */}
					{editSubcategory && (
					  <Button
						mt="2"
						ml="2"
						variant="ghost"
						onClick={() => {
						  setEditSubcategory(null);
						  if (subcategoryFileInputRef.current) {
							subcategoryFileInputRef.current.value = '';
						  }
						}}
					  >
						Cancel Edit
					  </Button>
					)}
				  </Box>
				</Box>
			  </Box>
			)}
		  </ModalBody>
		  <ModalFooter>
			<Button
			  colorScheme="blue"
			  mr={3}
			  onClick={handleEditCategory}
			  isDisabled={!editCategory?.name}
			>
			  Save
			</Button>
			<Button
			  colorScheme="red"
			  mr={3}
			  onClick={() => {
				setDeleteItem({ id: editCategory.id, type: 'category' });
				onConfirmOpen();
			  }}
			>
			  Delete
			</Button>
			<Button
			  variant="ghost"
			  onClick={() => {
				setEditCategory(null);
				setEditSubcategory(null);
				setModalSubcategories([]);
				if (subcategoryFileInputRef.current) {
				  subcategoryFileInputRef.current.value = '';
				}
				onEditClose();
			  }}
			>
			  Cancel
			</Button>
		  </ModalFooter>
		</ModalContent>
	  </Modal>
	  <Modal
		isOpen={isDetailsOpen}
		onClose={() => {
		  setEditCategory(null);
		  setEditSubcategory(null);
		  setModalSubcategories([]);
		  if (subcategoryFileInputRef.current) {
			subcategoryFileInputRef.current.value = '';
		  }
		  onDetailsClose();
		}}
	  >
		<ModalOverlay />
		<ModalContent maxW="600px">
		  <ModalHeader>Subcategories for {editCategory?.name}</ModalHeader>
		  <ModalCloseButton />
		  <ModalBody>
			{modalSubcategories.length === 0 ? (
			  <Text>No subcategories available.</Text>
			) : (
			  modalSubcategories.map((sub) => (
				<Flex
				  key={sub._id}
				  justify="space-between"
				  align="center"
				  mb="2"
				>
				  <Flex align="center" gap="2">
					<Image
					  src={sub.image}
					  alt="Subcategory Image"
					  boxSize="50px"
					  objectFit="cover"
					  borderRadius="md"
					/>
					<Text>{sub.name}</Text>
				  </Flex>
				  <Flex gap="2">
					<Button
					  size="sm"
					  colorScheme="teal"
					  onClick={() => setEditSubcategory({ ...sub })}
					>
					  Edit
					</Button>
					<Button
					  size="sm"
					  colorScheme="red"
					  onClick={() => {
						setDeleteItem({ id: sub._id, type: 'subcategory' });
						onConfirmOpen();
					  }}
					>
					  Delete
					</Button>
				  </Flex>
				</Flex>
			  ))
			)}
			<Box mt="4">
			  <Text fontWeight="bold" mb="2">
				{editSubcategory ? 'Edit Subcategory' : 'Add Subcategory'}
			  </Text>
			  <FormControl mt="2">
				<FormLabel>Subcategory Name</FormLabel>
				<Input
				  value={
					editSubcategory ? editSubcategory.name : newSubcategory.name
				  }
				  onChange={(e) => {
					const name = e.target.value;
					if (editSubcategory) {
					  setEditSubcategory({ ...editSubcategory, name });
					} else {
					  setNewSubcategory({ ...newSubcategory, name });
					}
				  }}
				  placeholder="Enter subcategory name"
				/>
			  </FormControl>
			  <FormControl mt="2">
				<FormLabel>Subcategory Image</FormLabel>
				{editSubcategory &&
				  editSubcategory.image &&
				  typeof editSubcategory.image === 'string' && (
					<Image
					  src={editSubcategory.image}
					  alt="Current Subcategory Image"
					  boxSize="100px"
					  objectFit="cover"
					  borderRadius="md"
					  mb="2"
					/>
				  )}
				<Input
				  type="file"
				  accept="image/*"
				  ref={subcategoryFileInputRef}
				  onChange={(e) => {
					const image = e.target.files[0];
					if (editSubcategory) {
					  setEditSubcategory({ ...editSubcategory, image });
					} else {
					  setNewSubcategory({ ...newSubcategory, image });
					}
				  }}
				/>
			  </FormControl>
			  <Button
				mt="2"
				colorScheme="blue"
				onClick={
				  editSubcategory ? handleEditSubcategory : handleCreateSubcategory
				}
				isDisabled={
				  editSubcategory
					? !editSubcategory.name
					: !newSubcategory.name || !newSubcategory.image
				}
			  >
				{editSubcategory ? 'Update Subcategory' : 'Add Subcategory'}
			  </Button>
			  {editSubcategory && (
				<Button
				  mt="2"
				  ml="2"
				  variant="ghost"
				  onClick={() => {
					setEditSubcategory(null);
					if (subcategoryFileInputRef.current) {
					  subcategoryFileInputRef.current.value = '';
					}
				  }}
				>
				  Cancel Edit
				</Button>
			  )}
			</Box>
		  </ModalBody>
		  <ModalFooter>
			<Button
			  variant="ghost"
			  onClick={() => {
				setEditCategory(null);
				setEditSubcategory(null);
				setModalSubcategories([]);
				if (subcategoryFileInputRef.current) {
				  subcategoryFileInputRef.current.value = '';
				}
				onDetailsClose();
			  }}
			>
			  Close
			</Button>
		  </ModalFooter>
		</ModalContent>
	  </Modal>
	  {/* New Confirmation Modal */}
	  <Modal isOpen={isConfirmOpen} onClose={onConfirmClose}>
		<ModalOverlay />
		<ModalContent>
		  <ModalHeader>Confirm Deletion</ModalHeader>
		  <ModalCloseButton />
		  <ModalBody>
			<Text>
			  Are you sure you want to delete this{' '}
			  {deleteItem.type === 'category' ? 'category' : 'subcategory'}? This
			  action cannot be undone.
			</Text>
		  </ModalBody>
		  <ModalFooter>
			<Button colorScheme="red" mr={3} onClick={confirmDelete}>
			  Delete
			</Button>
			<Button variant="ghost" onClick={onConfirmClose}>
			  Cancel
			</Button>
		  </ModalFooter>
		</ModalContent>
	  </Modal>
	</Card>
  );
}
