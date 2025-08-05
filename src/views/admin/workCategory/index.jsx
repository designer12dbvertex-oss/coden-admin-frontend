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
import Swal from 'sweetalert2';

// Custom components
import Card from 'components/card/Card';

const columnHelper = createColumnHelper();

export default function OrdersTable() {
  const [sorting, setSorting] = React.useState([]);
  const [allData, setAllData] = React.useState([]); // Store full dataset
  const [data, setData] = React.useState([]); // Store current page data
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [newCategory, setNewCategory] = React.useState({
    name: '',
    image: null,
  });
  const [editCategory, setEditCategory] = React.useState(null);
  const [editSubcategory, setEditSubcategory] = React.useState(null);
  const [subcategoryCounts, setSubcategoryCounts] = React.useState({});
  const [modalSubcategories, setModalSubcategories] = React.useState([]);
  const [viewSubcategories, setViewSubcategories] = React.useState([]); // For View Details modal
  const [selectedCategoryName, setSelectedCategoryName] = React.useState(''); // For View Details modal header
  const [selectedCategoryId, setSelectedCategoryId] = React.useState(''); // For View Details modal
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
    isOpen: isViewOpen,
    onOpen: onViewOpen,
    onClose: onViewClose,
  } = useDisclosure(); // New disclosure for View Details modal

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
      console.log('API Response (Categories):', response.data);

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

      setAllData(formattedData);

      const calculatedTotalPages = Math.max(
        1,
        Math.ceil(formattedData.length / itemsPerPage),
      );
      setTotalPages(calculatedTotalPages);

      const startIndex = (currentPage - 1) * itemsPerPage;
      const paginatedData = formattedData.slice(
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
        totalItems: formattedData.length,
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

  // Update current page data when currentPage changes
  React.useEffect(() => {
    if (allData.length > 0) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const paginatedData = allData.slice(
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
  }, [currentPage, allData]);

  // Fetch categories on mount and after mutations
  React.useEffect(() => {
    fetchCategories();
  }, [navigate]);

  // Fetch subcategories for edit modal
  React.useEffect(() => {
    if (editCategory && isEditOpen) {
      const loadSubcategories = async () => {
        const subcategories = await fetchSubcategories(editCategory.id);
        setModalSubcategories(subcategories);
      };
      loadSubcategories();
    }
  }, [editCategory?.id, isEditOpen]);

  // Handle create category
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

  // Handle edit category
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

  // Handle edit subcategory
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
      const updatedSubcategories = await fetchSubcategories(selectedCategoryId);
      setViewSubcategories(updatedSubcategories);
      setSubcategoryCounts((prev) => ({
        ...prev,
        [selectedCategoryId]: updatedSubcategories.length,
      }));
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

  // Handle delete subcategory
  const handleDeleteSubcategory = async (subcategoryId) => {
    // Close the modal before showing the alert
    onViewClose();

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${baseUrl}api/subcategories/${subcategoryId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const updatedSubcategories = await fetchSubcategories(selectedCategoryId);
        setViewSubcategories(updatedSubcategories);
        setSubcategoryCounts((prev) => ({
          ...prev,
          [selectedCategoryId]: updatedSubcategories.length,
        }));
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
        Swal.fire('Error!', 'Failed to delete subcategory.', 'error');
      }
    }

    // Reopen the modal after the alert is handled (confirmed or cancelled)
    onViewOpen();
  };

  // Handle view details
  const handleViewDetails = async (categoryId, categoryName) => {
    const subcategories = await fetchSubcategories(categoryId);
    setViewSubcategories(subcategories);
    setSelectedCategoryName(categoryName);
    setSelectedCategoryId(categoryId);
    onViewOpen();
  };

  // Pagination handlers
  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Memoize columns
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
              colorScheme="purple"
              size="sm"
              onClick={() => handleViewDetails(row.original.id, row.original.name)}
            >
              View Details
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
        {/* <Button colorScheme="teal" size="sm" onClick={onAddOpen}>
           Add New Category
         </Button> */}
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
      {/* Pagination Controls */}
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
      {/* Toast Container */}
      <ToastContainer />
      {/* Add Category Modal */}
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
      {/* Edit Category Modal */}
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
                  {editCategory.image &&
                    typeof editCategory.image === 'string' && (
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
      {/* View Details Modal */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => {
          setViewSubcategories([]);
          setSelectedCategoryName('');
          setSelectedCategoryId('');
          setEditSubcategory(null);
          if (subcategoryFileInputRef.current) {
            subcategoryFileInputRef.current.value = '';
          }
          onViewClose();
        }}
      >
        <ModalOverlay style={{ zIndex: 1200 }} />
        <ModalContent maxW="600px">
          <ModalHeader>Subcategories for {selectedCategoryName}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {viewSubcategories.length === 0 ? (
              <Text>No subcategories available.</Text>
            ) : (
              viewSubcategories.map((sub) => (
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
                      onClick={() => handleDeleteSubcategory(sub._id)}
                    >
                      Delete
                    </Button>
                  </Flex>
                </Flex>
              ))
            )}
            {editSubcategory && (
              <Box mt="4">
                <Text fontWeight="bold" mb="2">
                  Edit Subcategory
                </Text>
                <FormControl mt="2">
                  <FormLabel>Subcategory Name</FormLabel>
                  <Input
                    value={editSubcategory.name}
                    onChange={(e) =>
                      setEditSubcategory({ ...editSubcategory, name: e.target.value })
                    }
                    placeholder="Enter subcategory name"
                  />
                </FormControl>
                <FormControl mt="2">
                  <FormLabel>Subcategory Image</FormLabel>
                  {editSubcategory.image &&
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
                    onChange={(e) =>
                      setEditSubcategory({ ...editSubcategory, image: e.target.files[0] })
                    }
                  />
                </FormControl>
                <Button
                  mt="2"
                  colorScheme="blue"
                  onClick={handleEditSubcategory}
                  isDisabled={!editSubcategory.name}
                >
                  Update Subcategory
                </Button>
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
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setViewSubcategories([]);
                setSelectedCategoryName('');
                setSelectedCategoryId('');
                setEditSubcategory(null);
                if (subcategoryFileInputRef.current) {
                  subcategoryFileInputRef.current.value = '';
                }
                onViewClose();
              }}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Card>
  );
}
