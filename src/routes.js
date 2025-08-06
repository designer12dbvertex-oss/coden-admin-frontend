import React from 'react';
import { Icon } from '@chakra-ui/react';
import {
  MdPerson,
  MdHome,
  MdLock,
  MdInfo,
	MdPrivacyTip,
	MdEmergency,
	MdPersonAddAlt1,
	MdCategory,
	MdAttachMoney,
	MdEmail,
	MdPhone,
	MdReportProblem,
} from 'react-icons/md';

// Admin Imports
import MainDashboard from 'views/admin/dashboard';
// import NFTMarketplace from 'views/admin/marketplace';
// import Profile from 'views/admin/profile';
// import DataTables from 'views/admin/dataTables';
import Users from 'views/admin/User';
import ServiceProvider from 'views/admin/ServiceProvider';
import AddAboutus from 'views/admin/addAboutUs';
import AddTermsConditions from 'views/admin/addTermsCondition';
import AddPrivacyPolicy from 'views/admin/addPrivacyPolicy';
import Biding from 'views/admin/Biding';
import DirectHiring from 'views/admin/directHiring';
import Emergency from 'views/admin/emergencyHiring';
import WorkCategory from 'views/admin/workCategory';
import PlatformFee from 'views/admin/platformfee';
import ContactUs from 'views/admin/CallContact';
import EmailUs from 'views/admin/EmailContact';
import SubAdmins from 'views/admin/allSubadmins';
import Both from 'views/admin/both';
import RequestUser from 'views/admin/RequestUser';
import DirectPaymentRequest from 'views/admin/directPaymentRequest';
import Dispute from 'views/admin/dispute';
// import OnlineOrders from 'views/admin/onlineOrders';

// Auth Imports
import SignInCentered from 'views/auth/signIn';
import { FaFileContract, FaGavel, FaMoneyBillWave,} from 'react-icons/fa';

const routes = [
  {
    name: 'Main Dashboard',
    layout: '/admin',
    path: '/dashboard',
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    component: <MainDashboard />,
  },
  {
    name: 'Users',
    layout: '/admin',
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    path: '/users',
    component: <Users />,
  },
  {
    name: 'Service Provider',
    layout: '/admin',
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    path: '/service_provider',
    component: <ServiceProvider />,
  },
	{
    name: 'Both',
    layout: '/admin',
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    path: '/both',
    component: <Both />,
  },
	{
    name: 'Requested User',
    layout: '/admin',
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    path: '/requests',
    component: <RequestUser />,
  },
	{
    name: 'Sub Admins',
    layout: '/admin',
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    path: '/sub_admins',
    component: <SubAdmins />,
  },
	{
    name: 'Work Category',
    layout: '/admin',
    icon: <Icon as={MdCategory} width="20px" height="20px" color="inherit" />,
    path: '/work_category',
    component: <WorkCategory />,
  },
		{
    name: 'Platform Fees',
    layout: '/admin',
    icon: <Icon as={MdAttachMoney} width="20px" height="20px" color="inherit" />,
    path: '/platform_fee',
    component: <PlatformFee />,
  },
	 {
    name: 'Biding Hiring',
    layout: '/admin',
    icon: <Icon as={FaGavel} width="20px" height="20px" color="inherit" />,
    path: '/biding',
    component: <Biding />,
  },
	 {
    name: 'Direct Hiring',
    layout: '/admin',
    icon: <Icon as={MdPersonAddAlt1} width="20px" height="20px" color="inherit" />,
    path: '/direct-hiring',
    component: <DirectHiring />,
  },
	 {
    name: 'Emergency Hiring',
    layout: '/admin',
    icon: <Icon as={MdEmergency} width="20px" height="20px" color="inherit" />,
    path: '/emergency-hiring',
    component: <Emergency />,
  },
	 {
    name: 'Direct Payment Request',
    layout: '/admin',
    icon: <Icon as={FaMoneyBillWave} width="20px" height="20px" color="inherit" />,
    path: '/direct_payment_request',
    component: <DirectPaymentRequest />,
  },
	 {
    name: 'All Dispute',
    layout: '/admin',
    icon: <Icon as={MdReportProblem} width="20px" height="20px" color="inherit" />,
    path: '/dispute',
    component: <Dispute />,
  },
	 {
    name: 'Contact Us',
    layout: '/admin',
    icon: <Icon as={MdPhone} width="20px" height="20px" color="inherit" />,
    path: '/contact-us',
    component: <ContactUs />,
  },
	 {
    name: 'Email Us',
    layout: '/admin',
    icon: <Icon as={MdEmail } width="20px" height="20px" color="inherit" />,
    path: '/email-us',
    component: <EmailUs />,
  },
  {
    name: 'About Us',
    layout: '/admin',
    icon: <Icon as={MdInfo} width="20px" height="20px" color="inherit" />,
    path: '/add-aboutus',
    component: <AddAboutus />,
  },
	 {
    name: 'Terms&Conditions',
    layout: '/admin',
    icon: <Icon as={FaFileContract} width="20px" height="20px" color="inherit" />,
    path: '/add-terms-conditions',
    component: <AddTermsConditions />,
  },
	 {
    name: 'Privacy Policy',
    layout: '/admin',
    icon: <Icon as={MdPrivacyTip} width="20px" height="20px" color="inherit" />,
    path: '/add-privacypolicy',
    component: <AddPrivacyPolicy />,
  },
  {
    name: 'Sign In',
    layout: '/', // Updated for navigation purposes
    path: '/', // Updated for navigation purposes
    icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
    component: <SignInCentered />,
  },
];

export default routes;
