/* eslint-disable */
'use client';

import {
  Box,
  Text,
  Card,
  CardBody,
  Stack,
  Select,
  useColorModeValue,
  useToast,
	CardHeader,
} from '@chakra-ui/react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import axios from 'axios';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);



export default function PaymentsDashboard() {
  const [data, setData] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [selectedMonth, setSelectedMonth] = React.useState('');
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const cardBg = useColorModeValue('white', 'gray.700');
  const navigate = useNavigate();
  const toast = useToast();

  const baseUrl = process.env.REACT_APP_BASE_URL;
  const token = localStorage.getItem('token');

  const fetchPayments = async () => {
	try {
	  if (!baseUrl || !token) {
		throw new Error('Missing base URL or authentication token');
	  }
	  setLoading(true);
	  const response = await axios.get(`${baseUrl}api/admin/getAdminPayments`, {
		headers: { Authorization: `Bearer ${token}` },
	  });
	  console.log('API Response (Payments):', response.data);

	  if (!response.data || !response.data.payments) {
		throw new Error('Invalid response format: Expected payment data');
	  }
	  console.log('Payment Data:', response.data);
	  setData(response.data.payments);
	  setLoading(false);
	} catch (err) {
	  console.error('Fetch Payments Error:', err);
	  if (
		err.response?.data?.message === 'Not authorized, token failed' ||
		err.response?.data?.message === 'Session expired or logged in on another device' ||
		err.response?.data?.message === 'Un-Authorized, You are not authorized to access this route.' ||
		err.response?.data?.message === 'Not authorized, token failed'
	  ) {
		localStorage.removeItem('token');
		navigate('/');
	  } else {
		setError(err.message || 'Failed to fetch payment data');
		setLoading(false);
	  }
	}
  };

  React.useEffect(() => {
	fetchPayments();
  }, [navigate]);

  if (loading) {
	return (
	  <Card bg={cardBg} p="20px" borderRadius="20px" boxShadow="lg">
		<Text color={textColor} fontSize="22px" fontWeight="700">
		  Loading...
		</Text>
	  </Card>
	);
  }

  if (error) {
	return (
	  <Card bg={cardBg} p="20px" borderRadius="20px" boxShadow="lg" mt="80px">
		<Text color={textColor} fontSize="22px" fontWeight="700">
		  Error: {error}
		</Text>
	  </Card>
	);
  }

  const paymentTypes = [
	{ key: 'direct', label: 'Direct' },
	{ key: 'bidding', label: 'Bidding' },
	{ key: 'emergency', label: 'Emergency' },
	{ key: 'totals', label: 'Totals' },
  ];

  const getChartData = (paymentData, label) => {
	// Use available months as x-axis labels
	const months = Object.keys(paymentData.monthly || {}).sort();
	const labels = ['Initial', ...months, 'Final'];
	const monthlyValues = months.map(month => paymentData.monthly[month] || 0);
	const selectedValue = selectedMonth ? paymentData.monthly?.[selectedMonth] || 0 : paymentData.yearly?.['2025'] || 0;

	// Create interpolated data for Released, Release Request, and Pending
	const releasedData = [0, ...monthlyValues.map(() => paymentData.released / months.length).slice(0, -1), paymentData.released || 0];
	const releaseRequestData = [0, ...monthlyValues.map(() => paymentData.release_request / months.length).slice(0, -1), paymentData.release_request || 0];
	const pendingData = [0, ...monthlyValues.map(() => paymentData.pending / months.length).slice(0, -1), paymentData.pending || 0];

	return {
	  labels,
	  datasets: [
		{
		  label: 'Released',
		  data: releasedData,
		  borderColor: 'rgb(75, 192, 192)',
		  backgroundColor: 'rgba(75, 192, 192, 0.5)',
		  tension: 0.1,
		},
		{
		  label: 'Release Request',
		  data: releaseRequestData,
		  borderColor: 'rgb(255, 99, 132)',
		  backgroundColor: 'rgba(255, 99, 132, 0.5)',
		  tension: 0.1,
		},
		{
		  label: 'Pending',
		  data: pendingData,
		  borderColor: 'rgb(54, 162, 235)',
		  backgroundColor: 'rgba(54, 162, 235, 0.5)',
		  tension: 0.1,
		},
	  ],
	};
  };

  return (
	<Box p="20px" bg="white" minHeight="100vh">
	  <Card bg={cardBg} p="20px" borderRadius="20px" boxShadow="lg" mb="30px">
		<CardHeader title="Order: Admin Payments Overview" />
		<CardBody>
		  <Select
			mt="20px"
			value={selectedMonth}
			onChange={(e) => setSelectedMonth(e.target.value)}
			placeholder="Monthly Breakdown ▼"
			borderRadius="8px"
			borderColor="gray.300"
			_focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
		  >
			{Object.keys(data.totals?.monthly || {}).map((month) => (
			  <option key={month} value={month}>
				{month}
			  </option>
			))}
		  </Select>
		</CardBody>
	  </Card>

	  <Stack spacing="20px">
		{paymentTypes.map(({ key, label }) => {
		  const payment = data[key] || {};
		  const chartOptions = {
			responsive: true,
			plugins: {
			  legend: { position: 'top' },
			  title: {
				display: true,
				text: `${paymentTypes.find(p => p.key === key)?.label} Payments`,
				font: { size: 18 },
			  },
			},
			scales: {
			  y: {
				beginAtZero: true,
				ticks: { callback: value => `₹${value.toLocaleString()}` },
			  },
			},
		  };

		  return (
			<Card
			  key={key}
			  bg={cardBg}
			  borderRadius="20px"
			  boxShadow="lg"
			  p="20px"
			>
			  <CardHeader title={`${label} Payments`} />
			  <CardBody>
				<Box h="400px">
				  <Line data={getChartData(payment, label)} options={chartOptions} />
				</Box>
			  </CardBody>
			</Card>
		  );
		})}
	  </Stack>
	</Box>
  );
}
