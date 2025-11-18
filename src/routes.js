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
  MdChat,
  MdCampaign,
  MdCardGiftcard,
  MdPeople,
	MdDescription,
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
import AllServiceProvider from 'views/admin/allServiceprovider';
import UnverifiedServiceProvider from 'views/admin/unverifiedServiceProvider';
import ChatMonitor from 'views/admin/ChatMonitor';
import TotalRevenue from 'views/admin/TotalRevenue';
import Promotion from 'views/admin/Promotion';
import Banner from 'views/admin/Banner';
import Worker from 'views/admin/Worker';
import PendingWorker from 'views/admin/PendingWorker';
import EmergencyWorkCategory from 'views/admin/emergencyWorkCategory';
import DirectHiringRefundPaymentRequest from 'views/admin/directHiringRefundRequest';
import EmergencyHiringRefundPaymentRequest from 'views/admin/emergencyRefundRequest';
import GetAllRefferal from "views/admin/getAllRefferal";

// Auth Imports
import SignInCentered from 'views/auth/signIn';
import {
  FaBullhorn,
  FaChartLine,
  FaCreditCard,
  FaFileContract,
  FaGavel,
  FaMoneyBillWave,
  FaUndoAlt,
  FaUsers,
  FaUsersCog,
  FaWallet,
} from 'react-icons/fa';
import DirectPaymentCreate from 'views/admin/directPaymentCreate';
import BiddingPaymentCreate from 'views/admin/biddingPaymentCreate';
import BiddingPaymentREquest from 'views/admin/biddingPaymentRequest';
import EmergencyPaymentCreate from 'views/admin/emergencyPaymentCreate';
import EmergencyPaymentREquest from 'views/admin/emergencyPaymentRequest';
import RefferalSetting from 'views/admin/Refferal';
const routes = [
  {
    name: 'Main Dashboard',
    layout: '/admin',
    path: '/dashboard',
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    component: <MainDashboard />,
  },
  {
    name: 'User Management',
    layout: '/admin',
    icon: <Icon as={MdPeople} width="20px" height="20px" color="inherit" />,
    collapse: true,
    items: [
      {
        name: 'Users',
        layout: '/admin',
        path: '/users',
        component: <Users />,
      },
      {
        name: 'Verified Service Provider',
        layout: '/admin',
        path: '/service_provider',
        component: <ServiceProvider />,
      },
      {
        name: 'Unverified Service Provider',
        layout: '/admin',
        path: '/unverified_service_provider',
        component: <UnverifiedServiceProvider />,
      },
      {
        name: 'Both',
        layout: '/admin',
        path: '/both',
        component: <Both />,
      },
      {
        name: 'All Service Provider',
        layout: '/admin',
        path: '/all_service_provider',
        component: <AllServiceProvider />,
      },
      {
        name: 'Requested User',
        layout: '/admin',
        path: '/requests',
        component: <RequestUser />,
      },
    ],
  },
  {
    name: 'Co-Workers',
    layout: '/admin',
    icon: <Icon as={FaUsers} width="20px" height="20px" color="inherit" />,
    collapse: true,
    path: '/co-workers', // parent placeholder path
    items: [
      {
        name: 'All Co-Worker',
        layout: '/admin',
        path: '/worker',
        component: <Worker />,
      },
      {
        name: 'Pending Co-Worker',
        layout: '/admin',
        path: '/pending-worker',
        component: <PendingWorker />,
      },
    ],
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
    name: 'Emergency Work Category',
    layout: '/admin',
    icon: <Icon as={MdCategory} width="20px" height="20px" color="inherit" />,
    path: '/emergency_work_category',
    component: <EmergencyWorkCategory />,
  },
  {
    name: 'Platform Fees',
    layout: '/admin',
    icon: (
      <Icon as={MdAttachMoney} width="20px" height="20px" color="inherit" />
    ),
    path: '/platform_fee',
    component: <PlatformFee />,
  },
  {
    name: 'Chat Monitor',
    layout: '/admin',
    icon: <Icon as={MdChat} width="20px" height="20px" color="inherit" />,
    path: '/chat_monitor',
    component: <ChatMonitor />,
  },
  {
    name: 'Hiring',
    layout: '/admin',
    icon: <Icon as={FaUsersCog} width="20px" height="20px" color="inherit" />,
    collapse: true,
    path: '/hiring', // parent (not a real page)
    items: [
			{
        name: 'Direct Hiring',
        layout: '/admin',
        path: '/direct-hiring',
        component: <DirectHiring />,
      },
      {
        name: 'Biding Hiring',
        layout: '/admin',
        path: '/biding',
        component: <Biding />,
      },
      {
        name: 'Emergency Hiring',
        layout: '/admin',
        path: '/emergency-hiring',
        component: <Emergency />,
      },
    ],
  },
  {
    name: 'Payment Create',
    layout: '/admin',
    icon: <Icon as={FaWallet} width="20px" height="20px" color="inherit" />,
    collapse: true,
    path: '/payment-create', // parent path (not a real page)
    items: [
      {
        name: 'Direct Payment Create',
        layout: '/admin',
        path: '/direct-payment-create',
        component: <DirectPaymentCreate />,
      },
      {
        name: 'Bidding Payment Create',
        layout: '/admin',
        path: '/bidding_payment_create',
        component: <BiddingPaymentCreate />,
      },
      {
        name: 'Emergency Payment Create',
        layout: '/admin',
        path: '/emergency_payment_create',
        component: <EmergencyPaymentCreate />,
      },
    ],
  },
  {
    name: 'Payment Requests', // 👈 Dropdown title
    icon: <Icon as={FaCreditCard} width="20px" height="20px" color="inherit" />, // new icon
    collapse: true, // enables dropdown
    layout: '/admin',
    items: [
      {
        name: 'Direct Payment Request',
        layout: '/admin',
        path: '/direct_payment_request',
        component: <DirectPaymentRequest />,
      },
      {
        name: 'Bidding Payment Request',
        layout: '/admin',
        path: '/bidding_payment_request',
        component: <BiddingPaymentREquest />,
      },
      {
        name: 'Emergency Payment Request',
        layout: '/admin',
        path: '/emergency_payment_request',
        component: <EmergencyPaymentREquest />,
      },
    ],
  },

  {
    name: 'Refund Management',
    icon: <Icon as={FaUndoAlt} width="20px" height="20px" color="inherit" />,
    collapse: true,
    layout: '/admin',
    items: [
      {
        name: 'Direct Hiring Refunds',
        layout: '/admin',
        path: '/direct_hiring_refund_payment_request', // ✅ fixed
        component: <DirectHiringRefundPaymentRequest />,
      },
      {
        name: 'Emergency Hiring Refunds',
        layout: '/admin',
        path: '/emergency_hiring_refund_payment_request', // ✅ fixed
        component: <EmergencyHiringRefundPaymentRequest />,
      },
    ],
  },

  {
    name: 'Total Revenue',
    layout: '/admin',
    icon: <Icon as={FaChartLine} width="20px" height="20px" color="inherit" />,
    path: '/revenue',
    component: <TotalRevenue />,
  },
  {
    name: 'Promotion',
    layout: '/admin',
    icon: <Icon as={FaBullhorn} width="20px" height="20px" color="inherit" />,
    path: '/promotion',
    component: <Promotion />,
  },
  {
    name: 'App Banner',
    layout: '/admin',
    icon: <Icon as={MdCampaign} width="20px" height="20px" color="inherit" />,
    path: '/banner',
    component: <Banner />,
  },
  {
    name: 'All Dispute',
    layout: '/admin',
    icon: (
      <Icon as={MdReportProblem} width="20px" height="20px" color="inherit" />
    ),
    path: '/dispute',
    component: <Dispute />,
  },

	{
    name: 'Refferal Settings',
    icon:  <Icon as={MdCardGiftcard} width="20px" height="20px" color="inherit" />,
    collapse: true,
    layout: '/admin',
    items: [
      {
        name: 'Setting',
        layout: '/admin',
        path: '/refferal', // ✅ fixed
        component: <RefferalSetting />,
      },
      {
        name: 'getAllRefferal',
        layout: '/admin',
        path: '/getRefferal', // ✅ fixed
        component: <GetAllRefferal />,
      },
    ],
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
    icon: <Icon as={MdEmail} width="20px" height="20px" color="inherit" />,
    path: '/email-us',
    component: <EmailUs />,
  },
  {
    name: 'CMS Pages',
    layout: '/admin',
    icon: (
      <Icon as={MdDescription} width="20px" height="20px" color="inherit" />
    ),
    collapse: true,
    items: [
      {
        name: 'About Us',
        layout: '/admin',
        path: '/add-aboutus',
        component: <AddAboutus />,
      },
      {
        name: 'Terms & Conditions',
        layout: '/admin',
        path: '/add-terms-conditions',
        component: <AddTermsConditions />,
      },
      {
        name: 'Privacy Policy',
        layout: '/admin',
        path: '/add-privacypolicy',
        component: <AddPrivacyPolicy />,
      },
    ],
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
