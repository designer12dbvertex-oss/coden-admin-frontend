// import { Box, SimpleGrid, useColorModeValue, Icon } from '@chakra-ui/react';
// // Custom components
// import MiniStatistics from 'components/card/MiniStatistics';
// import IconBox from 'components/icons/IconBox';
// import React from 'react';
// import { MdPeople } from 'react-icons/md';
// import { Link } from 'react-router-dom';
// import { FaFileInvoiceDollar, FaMoneyBillWave } from 'react-icons/fa';

// export default function UserReports() {
//   // Chakra Color Mode
//   const brandColor = useColorModeValue('#045e14', 'white');
//   const boxBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');

//   // Static Data (Abhi ke liye dummy numbers hain)
//   const dashboardData = {
//     users: 0,
//     service_provider: 0,
//     verified_service_provider: 0,
//     unverified_service_provider: 0,
//     both: 0,
//     subadmins: 0,
//     directPaymentRequest: 0,
//     directOrder: 0,
//   };

//   return (
//     <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
//       <SimpleGrid
//         columns={{ base: 1, md: 2, lg: 3, '2xl': 6 }}
//         gap="20px"
//         mb="20px"
//       >
//         <Link to="/admin/users">
//           <MiniStatistics
//             startContent={
//               <IconBox
//                 w="56px"
//                 h="56px"
//                 bg={boxBg}
//                 icon={
//                   <Icon as={MdPeople} w="32px" h="32px" color={brandColor} />
//                 }
//               />
//             }
//             name="Users"
//             value={dashboardData.users}
//           />
//         </Link>

//         <Link to="/">
//           <MiniStatistics
//             startContent={
//               <IconBox
//                 w="56px"
//                 h="56px"
//                 bg={boxBg}
//                 icon={
//                   <Icon as={MdPeople} w="32px" h="32px" color={brandColor} />
//                 }
//               />
//             }
//             name="Payment List"
//             value={dashboardData.service_provider}
//           />
//         </Link>

//         <Link to="/admin/service_provider">
//           <MiniStatistics
//             startContent={
//               <IconBox
//                 w="56px"
//                 h="56px"
//                 bg={boxBg}
//                 icon={
//                   <Icon as={MdPeople} w="32px" h="32px" color={brandColor} />
//                 }
//               />
//             }
//             name="Tags"
//             value={dashboardData.verified_service_provider}
//           />
//         </Link>

//         <Link to="/admin/unverified_service_provider">
//           <MiniStatistics
//             startContent={
//               <IconBox
//                 w="56px"
//                 h="56px"
//                 bg={boxBg}
//                 icon={
//                   <Icon as={MdPeople} w="32px" h="32px" color={brandColor} />
//                 }
//               />
//             }
//             name="Test"
//             value={dashboardData.unverified_service_provider}
//           />
//         </Link>

//         <Link to="/admin/both">
//           <MiniStatistics
//             startContent={
//               <IconBox
//                 w="56px"
//                 h="56px"
//                 bg={boxBg}
//                 icon={
//                   <Icon as={MdPeople} w="32px" h="32px" color={brandColor} />
//                 }
//               />
//             }
//             name="Video Lecture"
//             value={dashboardData.both}
//           />
//         </Link>

//         <Link to="/admin/sub_admins">
//           <MiniStatistics
//             startContent={
//               <IconBox
//                 w="56px"
//                 h="56px"
//                 bg={boxBg}
//                 icon={
//                   <Icon as={MdPeople} w="32px" h="32px" color={brandColor} />
//                 }
//               />
//             }
//             name="Courses"
//             value={dashboardData.subadmins}
//           />
//         </Link>

//         <Link to="/admin/sub_admins">
//           <MiniStatistics
//             startContent={
//               <IconBox
//                 w="56px"
//                 h="56px"
//                 bg={boxBg}
//                 icon={
//                   <Icon
//                     as={FaMoneyBillWave}
//                     w="32px"
//                     h="32px"
//                     color={brandColor}
//                   />
//                 }
//               />
//             }
//             name="Chapter"
//             value={dashboardData.directPaymentRequest}
//           />
//         </Link>

//         <Link to="/admin/direct-hiring">
//           <MiniStatistics
//             startContent={
//               <IconBox
//                 w="56px"
//                 h="56px"
//                 bg={boxBg}
//                 icon={
//                   <Icon
//                     as={FaFileInvoiceDollar}
//                     w="32px"
//                     h="32px"
//                     color={brandColor}
//                   />
//                 }
//               />
//             }
//             name="Subject"
//             value={dashboardData.directOrder}
//           />
//         </Link>
//       </SimpleGrid>
//     </Box>
//   );
// }

'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  SimpleGrid,
  useColorModeValue,
  Icon,
  Spinner,
  Center,
  useToast,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Custom components
import MiniStatistics from 'components/card/MiniStatistics';
import IconBox from 'components/icons/IconBox';

// Icons
import { MdPeople } from 'react-icons/md';
import { FaFileInvoiceDollar, FaMoneyBillWave } from 'react-icons/fa';

export default function UserReports() {
  const brandColor = useColorModeValue('#045e14', 'white');
  const boxBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');

  const toast = useToast();

  const baseUrl = (
    process.env.REACT_APP_BASE_URL || 'http://localhost:4000'
  ).replace(/\/$/, '');

  const token = localStorage.getItem('token');

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const [dashboardData, setDashboardData] = useState({
    users: 0,
    tags: 0,
    tests: 0,
    videos: 0,
    courses: 0,
    chapters: 0,
    subjects: 0,
    payments: 0,
  });

  const [loading, setLoading] = useState(true);

  // 🔹 Fetch Dashboard Stats
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);

        const res = await axios.get(`${baseUrl}/api/admin/dashboard/stats`, {
          headers,
        });

        const data = res.data?.data || {};

        setDashboardData({
          users: data.users || 0,
          tags: data.tags || 0,
          tests: data.tests || 0,
          videos: data.videos || 0,
          courses: data.courses || 0,
          chapters: data.chapters || 0,
          subjects: data.subjects || 0,
          payments: data.payments || 0,
        });
      } catch (err) {
        console.error('Dashboard Stats Error:', err);

        toast({
          title: 'Failed to load dashboard stats',
          description: err.response?.data?.message || 'Server error',
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboardStats();
    } else {
      toast({
        title: 'Unauthorized',
        description: 'Please login again',
        status: 'warning',
      });
      setLoading(false); // 👈 IMPORTANT
    }
  }, []);

  if (loading) {
    return (
      <Center pt="150px">
        <Spinner size="xl" thickness="4px" color="brand.500" />
      </Center>
    );
  }

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <SimpleGrid
        columns={{ base: 1, md: 2, lg: 3, '2xl': 6 }}
        gap="20px"
        mb="20px"
      >
        {/* USERS */}
        <Link to="/admin/users">
          <MiniStatistics
            startContent={
              <IconBox
                w="56px"
                h="56px"
                bg={boxBg}
                icon={
                  <Icon as={MdPeople} w="32px" h="32px" color={brandColor} />
                }
              />
            }
            name="Users"
            value={dashboardData.users}
          />
        </Link>

        {/* TAGS */}
        <Link to="/admin/tags">
          <MiniStatistics
            startContent={
              <IconBox
                w="56px"
                h="56px"
                bg={boxBg}
                icon={
                  <Icon as={MdPeople} w="32px" h="32px" color={brandColor} />
                }
              />
            }
            name="Tags"
            value={dashboardData.tags}
          />
        </Link>

        {/* TESTS */}
        <Link to="/admin/test">
          <MiniStatistics
            startContent={
              <IconBox
                w="56px"
                h="56px"
                bg={boxBg}
                icon={
                  <Icon as={MdPeople} w="32px" h="32px" color={brandColor} />
                }
              />
            }
            name="Tests"
            value={dashboardData.tests}
          />
        </Link>

        {/* VIDEOS */}
        <Link to="/admin/video">
          <MiniStatistics
            startContent={
              <IconBox
                w="56px"
                h="56px"
                bg={boxBg}
                icon={
                  <Icon as={MdPeople} w="32px" h="32px" color={brandColor} />
                }
              />
            }
            name="Video Lectures"
            value={dashboardData.videos}
          />
        </Link>

        {/* COURSES */}
        <Link to="/admin/course">
          <MiniStatistics
            startContent={
              <IconBox
                w="56px"
                h="56px"
                bg={boxBg}
                icon={
                  <Icon as={MdPeople} w="32px" h="32px" color={brandColor} />
                }
              />
            }
            name="Courses"
            value={dashboardData.courses}
          />
        </Link>

        {/* CHAPTERS */}
        <Link to="/admin/chapter">
          <MiniStatistics
            startContent={
              <IconBox
                w="56px"
                h="56px"
                bg={boxBg}
                icon={
                  <Icon
                    as={FaMoneyBillWave}
                    w="32px"
                    h="32px"
                    color={brandColor}
                  />
                }
              />
            }
            name="Chapters"
            value={dashboardData.chapters}
          />
        </Link>

        {/* SUBJECTS */}
        <Link to="/admin/subject">
          <MiniStatistics
            startContent={
              <IconBox
                w="56px"
                h="56px"
                bg={boxBg}
                icon={
                  <Icon
                    as={FaFileInvoiceDollar}
                    w="32px"
                    h="32px"
                    color={brandColor}
                  />
                }
              />
            }
            name="Subjects"
            value={dashboardData.subjects}
          />
        </Link>

        {/* PAYMENTS */}
        <Link to="/admin/payment">
          <MiniStatistics
            startContent={
              <IconBox
                w="56px"
                h="56px"
                bg={boxBg}
                icon={
                  <Icon
                    as={FaFileInvoiceDollar}
                    w="32px"
                    h="32px"
                    color={brandColor}
                  />
                }
              />
            }
            name="Payments"
            value={dashboardData.payments}
          />
        </Link>
      </SimpleGrid>
    </Box>
  );
}
