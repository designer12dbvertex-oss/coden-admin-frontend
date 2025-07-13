// Chakra imports
import {
  Box,
  SimpleGrid,
  useColorModeValue,
  Spinner,
  Text,
  Icon,
} from "@chakra-ui/react";
// Custom components
import MiniCalendar from "components/calendar/MiniCalendar";
import MiniStatistics from "components/card/MiniStatistics";
import IconBox from "components/icons/IconBox";
import React, { useState, useEffect } from "react";
import {
  MdAddTask,
  MdAttachMoney,
  MdPeople,
  MdMoney,
} from "react-icons/md";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaExclamationTriangle, FaFileInvoiceDollar, FaGavel } from "react-icons/fa";

export default function UserReports() {
  // Chakra Color Mode
  const brandColor = useColorModeValue("#045e14", "white");
  const boxBg = useColorModeValue("secondaryGray.300", "whiteAlpha.100");
  const navigate = useNavigate();
  // State for API data, loading, and error
  const [dashboardData, setDashboardData] = useState({
    users: 0,
    service_provider: 0,
    restaurants: 0,
		directOrder: 0,
		biddingOrder: 0,
		emergencyOrders: 0,
    newTasks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from API on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const baseUrl = process.env.REACT_APP_BASE_URL;
        const token = localStorage.getItem("token") || "";

        const response = await axios.get(`${baseUrl}api/admin/adminAllDashboardCount`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        const data = response.data.data || {};

        console.log("data", data);

        setDashboardData({
          users: data.totalUsers ?? 0,
          service_provider: data.totalSeller ?? 0,
          restaurants: data.totalRestaurants ?? 0,
					directOrder: data.totalDirectOrder ?? 0,
					biddingOrder: data.totalBiddingOrder ?? 0,
					emergencyOrders: data.totalEmergencyOrder ?? 0,
          newTasks: data.newTasks ?? 0,
        });
      } catch (err) {
        console.error("API Error:", err.response || err.message);
				if (
          err.response?.data?.message === 'Not authorized, token failed' ||
          err.response?.data?.message === 'Session expired or logged in on another device' ||
          err.response?.data?.message ===
            'Un-Authorized, You are not authorized to access this route.' || 'Not authorized, token failed'
        ) {
          localStorage.removeItem('token');
          navigate('/');
        }
        setError("Failed to fetch dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  console.log("data2", dashboardData)

  if (loading) {
    return (
      <Box pt={{ base: "130px", md: "80px", xl: "80px" }} textAlign="center">
        <Spinner size="xl" color={brandColor} />
        <Text mt="4">Loading dashboard data...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box pt={{ base: "130px", md: "80px", xl: "80px" }} textAlign="center">
        <Text color="red.500">{error}</Text>
      </Box>
    );
  }

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3, "2xl": 6 }} gap="20px" mb="20px">
      <Link to ="/admin/users"> 
        <MiniStatistics
          startContent={
            <IconBox w="56px" h="56px" bg={boxBg}
              icon={<Icon as={MdPeople} w="32px" h="32px" color={brandColor} />}
            />
          }
          name="Users"
          value={dashboardData.users}
        />
				</Link>
				<Link to ="/admin/service_provider">
        <MiniStatistics
          startContent={
            <IconBox w="56px" h="56px" bg={boxBg}
              icon={<Icon as={MdPeople} w="32px" h="32px" color={brandColor} />}
            />
          }
          name="Service Provider"
          value={dashboardData.service_provider.toLocaleString()}
        />
				</Link>
				<Link to="/admin/direct-hiring">
				 <MiniStatistics
          startContent={
            <IconBox w="56px" h="56px" bg={boxBg}
              icon={<Icon as={FaFileInvoiceDollar} w="32px" h="32px" color={brandColor} />}
            />
          }
          name="Direct Orders"
          value={`${dashboardData.directOrder}`}
        />
				</Link>
				<Link to="/admin/biding">
				 <MiniStatistics
          startContent={
            <IconBox w="56px" h="56px" bg={boxBg}
              icon={<Icon as={FaGavel} w="32px" h="32px" color={brandColor} />}
            />
          }
          name="Bidding Orders"
          value={`${dashboardData.biddingOrder}`}
        />
				</Link>
				<Link to="/admin/emergency-hiring">
				 <MiniStatistics
          startContent={
            <IconBox w="56px" h="56px" bg={boxBg}
              icon={<Icon as={FaExclamationTriangle} w="32px" h="32px" color={brandColor} />}
            />
          }
          name="Emergency Orders"
          value={`${dashboardData.emergencyOrders}`}
        />
				</Link>
				{ /* <MiniStatistics
          startContent={
            <IconBox w="56px" h="56px" bg={boxBg}
              icon={<Icon as={MdAttachMoney} w="32px" h="32px" color={brandColor} />}
            />
          }
          name="Online Orders"
          value={`${dashboardData.onlineOrders}`}
        /> 
        <MiniStatistics
          startContent={
            <IconBox w="56px" h="56px" bg={boxBg}
              icon={<Icon as={MdMoney} w="32px" h="32px" color={brandColor} />}
            />
          }
          name="COD Collection"
          value={`₹${dashboardData.codCollection}`}
        />
        <MiniStatistics
          startContent={
            <IconBox w="56px" h="56px" bg={boxBg}
              icon={<Icon as={MdAttachMoney} w="32px" h="32px" color={brandColor} />}
            />
          }
          name="Online Collection"
          value={`₹${dashboardData.onlineCollection}`}
        /> */}
        <MiniStatistics
          startContent={
            <IconBox w="56px" h="56px"
              bg="linear-gradient(90deg, #4481EB 0%, #04BEFE 100%)"
              icon={<Icon as={MdAddTask} w="28px" h="28px" color="white" />}
            />
          }
          name="New Tasks"
          value={dashboardData.newTasks}
        />
      </SimpleGrid>
{			/* Calendar Component 
      <SimpleGrid columns={{ base: 1, md: 1, xl: 2 }} gap="20px" mb="20px">
        <MiniCalendar h="100%" minW="100%" selectRange={false} />
      </SimpleGrid>
			*/}
    </Box>
  );
}
