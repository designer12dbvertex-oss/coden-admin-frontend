import React from 'react';
import { Icon } from '@chakra-ui/react';
import {
  MdPerson,
  MdHome,
  MdLock,
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
  MdSubscriptions,
} from 'react-icons/md';

// Admin Imports
import MainDashboard from 'views/admin/dashboard';
// import NFTMarketplace from 'views/admin/marketplace';
// import Profile from 'views/admin/profile';
// import DataTables from 'views/admin/dataTables';
import Users from 'views/admin/User';
import MCQList from 'views/admin/AddMCQ/mcq-list.jsx';
import AddAboutus from 'views/admin/addAboutUs';
import AddTermsConditions from 'views/admin/addTermsCondition';
import AddPrivacyPolicy from 'views/admin/addPrivacyPolicy';
import Subject from 'views/admin/AddSubject';
import Course from 'views/admin/AddCourse';
import SubSubject from 'views/admin/AddSubSubject';

import Chapter from 'views/admin/AddChapter';
import Payment from 'views/admin/Payment';

import ContactUs from 'views/admin/CallContact';
import EmailUs from 'views/admin/EmailContact';

import Country from 'views/admin/AddCountry';
import State from 'views/admin/AddState';
import PendingWorker from 'views/admin/AddCity';
import City from 'views/admin/AddCity';
import College from 'views/admin/AddCollege';
import TestManagement from './views/admin/test/CreateTest';

import Subscription from 'views/admin/Subscription';
import ProfilePage from 'views/admin/profile/ProfileSetting';
import MCQ from 'views/admin/AddMCQ';
import Video from 'views/admin/Video';
import Tags from 'views/admin/Tags';
import Topic from 'views/admin/topic.jsx';
import AddFaculty from 'views/admin/faculty';
// import FacultyList from "views/admin/listfaculty"
import FacultyList from 'views/admin/listfaculty/index';
import PromoManagement from "views/admin/promoCode/index"
// Auth Imports
import SignInCentered from 'views/auth/signIn';
import {
  FaAccessibleIcon,
  FaCreditCard,
  FaFlask,
  FaListUl,
  FaUsers,
  FaUsersCog,
  FaVideo,
  FaWallet,
} from 'react-icons/fa';
import TestsList from 'views/admin/test/TestsList';
import McqView from 'views/admin/AddMCQ/McqView';
import MCQManagement from 'views/admin/AddMCQ';

const routes = [
  {
    name: 'Main Dashboard',
    layout: '/admin',
    path: '/dashboard',
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    component: <MainDashboard />,
  },
  {
    name: 'Profile Setting',
    layout: '/admin',
    path: '/profile-setting',
    component: <ProfilePage />,
    showInSidebar: false, // Yeh line sabse zaroori hai
  },
  {
    name: 'User List',
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
    ],
  },
  {
    name: 'Location',
    layout: '/admin',
    icon: <Icon as={FaUsers} width="20px" height="20px" color="inherit" />,
    collapse: true,
    path: '/co-workers', // parent placeholder path
    items: [
      {
        name: 'Add Country',
        layout: '/admin',
        path: '/country',
        component: <Country />,
      },
      {
        name: 'Add State',
        layout: '/admin',
        path: '/state',
        component: <State />,
      },
      {
        name: 'Add City',
        layout: '/admin',
        path: '/city',
        component: <City />,
      },
      {
        name: 'Add College',
        layout: '/admin',
        path: '/college',
        component: <College />,
      },
    ],
  },
  {
    name: 'Add Tags',
    layout: '/admin',
    icon: <Icon as={FaCreditCard} width="20px" height="20px" color="inherit" />,
    path: '/tags',

    component: <Tags />,
  },

  {
    name: 'Academic Structure',
    layout: '/admin',
    icon: <Icon as={FaUsersCog} width="20px" height="20px" color="inherit" />,
    collapse: true,
    path: '/hiring', // parent (not a real page)
    items: [
      {
        name: 'Add Courses',
        layout: '/admin',
        path: '/course',
        component: <Course />,
      },
      {
        name: 'Add Subject',
        layout: '/admin',
        path: '/subject',
        component: <Subject />,
      },
      {
        name: 'Add Sub-Subject',
        layout: '/admin',
        path: '/subsubject',
        component: <SubSubject />,
      },

      {
        name: 'Add Chapter',
        layout: '/admin',
        path: '/chapter',
        component: <Chapter />,
      },
      {
        name: 'Add Topic',
        layout: '/admin',
        path: '/topic',
        component: <Topic />,
      },
      {
        name: 'Add Manual MCQ',
        layout: '/admin',
        path: '/mcq-manual',
        component: <MCQManagement mode="manual" />,
      },
      {
        name: 'Manual MCQs List',
        layout: '/admin',
        path: '/mcqs-manual',
        component: <MCQList mode="manual" />,
      },
    ],
  },

  {
    name: 'Test',
    layout: '/admin',
    path: '/test', // parent ko real route bana do
    icon: <Icon as={FaFlask} width="20px" height="20px" color="inherit" />,
    component: <TestManagement />, // 👈 yahi important hai
    collapse: true,
    items: [
      {
        name: 'Create Test',
        layout: '/admin',
        path: '/test',
        component: <TestsList />,
      },
      {
        name: 'Test List',
        layout: '/admin',
        path: '/test-list',
        component: <TestsList />,
      },
      {
        name: 'Test MCQs List',
        layout: '/admin',
        path: '/mcqs-test-list',
        component: <MCQList mode="exam" />,
      },
    ],
  },
  {
    name: 'Q-Test',
    layout: '/admin',
    path: '/q-test', // parent route
    icon: <Icon as={FaFlask} width="20px" height="20px" color="inherit" />,
    component: <TestManagement />, // Q-Test create page
    collapse: true,
    items: [
      {
        name: 'Create Q-Test',
        layout: '/admin',
        path: '/q-test',
        component: <TestManagement />, // ⚠️ yaha pe TestManagement hi hona chahiye
      },
      {
        name: 'Q-Test List',
        layout: '/admin',
        path: '/q-test-list',
        component: <TestsList />,
      },
      {
        name: 'Q-Test MCQs List',
        layout: '/admin',
        path: '/mcqs-q-test-list',
        component: <MCQList mode="regular" />,
      },
    ],
  },

  // {
  //   name: 'Add MCQ',
  //   layout: '/admin',
  //   path: '/mcq',
  //   component: <MCQManagement mode="test" />,
  //   showInSidebar: false, // optional (sidebar me hide rakhna ho to)
  // },

  {
    name: 'Add MCQ',
    layout: '/admin',
    path: '/mcq/:mode?',
    component: <MCQManagement />,
    showInSidebar: false,
  },

  {
    name: 'Video Lectures',  
    layout: '/admin',
    path: '/video',
    icon: <Icon as={FaVideo} width="20px" height="20px" color="inherit" />, // new icon
    component: <Video />,
  },
   {
    name: 'AddFaculty',  
    layout: '/admin',
    path: '/faculty',
    icon: <Icon as={FaVideo} width="20px" height="20px" color="inherit" />, // new icon
    component: <AddFaculty/>,
  },
     {
    name: 'List-Faculty',  
    layout: '/admin',
    path: '/list-faculty',
    icon: <Icon as={FaVideo} width="20px" height="20px" color="inherit" />, // new icon
    component: <FacultyList/>,
  },
     {
    name: 'Promo',  
    layout: '/admin',
    path: '/PromoCode',
    icon: <Icon as={FaVideo} width="20px" height="20px" color="inherit" />, // new icon
    component: <PromoManagement/>,
  },
  // {
  //   name: 'QBank $ Practice',
  //   layout: '/admin',
  //   path: '/emergency-hiring',
  //   icon: <Icon as={FaCreditCard} width="20px" height="20px" color="inherit" />, // new icon
  //   component: <Chapter />,
  // },

  //   {
  //     name: 'Total Revenue',
  //     layout: '/admin',
  //     icon: <Icon as={FaChartLine} width="20px" height="20px" color="inherit" />,
  //     path: '/revenue',
  //     component: <TotalRevenue />,
  //   },
  //   {
  //     name: 'Promotion',
  //     layout: '/admin',
  //     icon: <Icon as={FaBullhorn} width="20px" height="20px" color="inherit" />,
  //     path: '/promotion',
  //     component: <Promotion />,
  //   },
  //   {
  //     name: 'App Banner',
  //     layout: '/admin',
  //     icon: <Icon as={MdCampaign} width="20px" height="20px" color="inherit" />,
  //     path: '/banner',
  //     component: <Banner />,
  //   },
  //   {
  //     name: 'All Dispute',
  //     layout: '/admin',
  //     icon: (
  //       <Icon as={MdReportProblem} width="20px" height="20px" color="inherit" />
  //     ),
  //     path: '/dispute',
  //     component: <Dispute />,
  //   },
  //   {
  //   name: 'Bidding Order Details',
  //   layout: '/admin',
  //   path: '/bidding-order/:orderId',
  //   component: <ViewBiddingOrder/>,

  //   {
  //     name: 'Total Revenue',
  //     layout: '/admin',
  //     icon: <Icon as={FaChartLine} width="20px" height="20px" color="inherit" />,
  //     path: '/revenue',
  //     component: <TotalRevenue />,
  //   },
  //   {
  //     name: 'Promotion',
  //     layout: '/admin',
  //     icon: <Icon as={FaBullhorn} width="20px" height="20px" color="inherit" />,
  //     path: '/promotion',
  //     component: <Promotion />,
  //   },
  //   {
  //     name: 'App Banner',
  //     layout: '/admin',
  //     icon: <Icon as={MdCampaign} width="20px" height="20px" color="inherit" />,
  //     path: '/banner',
  //     component: <Banner />,
  //   },
  //   {
  //     name: 'All Dispute',
  //     layout: '/admin',
  //     icon: (
  //       <Icon as={MdReportProblem} width="20px" height="20px" color="inherit" />
  //     ),
  //     path: '/dispute',
  //     component: <Dispute />,
  //   },
  //   {
  //   name: 'Bidding Order Details',
  //   layout: '/admin',
  //   path: '/bidding-order/:orderId',
  //   component: <ViewBiddingOrder/>,

  // },
  //   {
  //   name: 'Emergency Order Details',
  //   layout: '/admin',
  //   path:'/emergency-order/:orderId',
  //   component: <ViewEmergencygOrder/>,

  // },

  // {
  //   name: 'Refferal Settings',
  //   icon:  <Icon as={MdCardGiftcard} width="20px" height="20px" color="inherit" />,
  //   collapse: true,
  //   layout: '/admin',
  //   items: [
  //     {
  //       name: 'Setting',
  //       layout: '/admin',
  //       path: '/refferal', // ✅ fixed
  //       component: <RefferalSetting />,
  //     },
  //     {
  //       name: 'getAllRefferal',
  //       layout: '/admin',
  //       path: '/getRefferal', // ✅ fixed
  //       component: <GetAllRefferal />,
  //     },
  //   ],
  // },
  {
    name: 'Subscriptions',
    layout: '/admin',
    icon: (
      <Icon as={MdSubscriptions} width="20px" height="20px" color="inherit" />
    ),
    path: '/subscription',
    component: <Subscription />,
  },
  {
    name: 'Payment List',
    layout: '/admin',
    icon: <Icon as={FaWallet} width="20px" height="20px" color="inherit" />,
    path: '/payment',
    component: <Payment />,
  },
  // {
  //   name: 'Contact Us',
  //   layout: '/admin',
  //   icon: <Icon as={MdPhone} width="20px" height="20px" color="inherit" />,
  //   path: '/contact-us',
  //   component: <ContactUs />,
  // },
  // {
  //   name: 'Email Us',
  //   layout: '/admin',
  //   icon: <Icon as={MdEmail} width="20px" height="20px" color="inherit" />,
  //   path: '/email-us',
  //   component: <EmailUs />,
  // },
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
