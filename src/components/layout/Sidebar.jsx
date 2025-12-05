import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../../../public/Euryfox-logo.png';
import { 
  LayoutDashboard, 
  Package, 
  Grid3X3, 
  FileText, 
  Layers,
  BookOpen,
  Phone,
  UserPlus,
  ChevronDown,
  ChevronRight,
  Briefcase,
  FolderTree,
  FileSpreadsheet,
  GraduationCap
} from 'lucide-react';

const Sidebar = () => {
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (menuKey) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/blog-category', icon: Layers, label: 'Blog Category' },
    { path: '/admin/blogs', icon: BookOpen, label: 'Blogs' },
     { path: '/admin/contact', icon: Phone, label: 'Contact' },
    { path: '/admin/team-member-add', icon: UserPlus, label: 'Team Member Add' },
    { path: '/admin/event-management', icon: FileText, label: 'Event Management' },
    { path: '/admin/collaborative-projects', icon: Layers, label: 'Collaborative Projects' },
    
    // Services Menu with 3 options
    {
      key: 'services',
      icon: Briefcase,
      label: 'Services',
      subItems: [
        { path: '/admin/services', icon: Briefcase, label: 'Services' },
        { path: '/admin/service-categories', icon: FolderTree, label: 'Service Categories' },
        { path: '/admin/service-details', icon: FileSpreadsheet, label: 'Service Details' }
      ]
    },

   
    
    // Training Menu with 3 options
    {
      key: 'training',
      icon: GraduationCap,
      label: 'Training',
      subItems: [
        { path: '/admin/training-programs', icon: Grid3X3, label: 'Training Programs' },
        { path: '/admin/training-applications', icon: Package, label: 'Training Applications' },
        { path: '/admin/success-stories', icon: BookOpen, label: 'Success Stories' }
      ]
    },
  ];

  const renderMenuItem = (item, level = 0) => {
    const Icon = item.icon;
    const paddingLeft = `${12 + (level * 16)}px`;

    // If item has subItems (nested menu)
    if (item.subItems) {
      const isOpen = openMenus[item.key];

      return (
        <div key={item.key}>
          {/* Parent Menu Item */}
          <button
            onClick={() => toggleMenu(item.key)}
            className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 text-gray-700 hover:bg-purple-50 hover:text-purple-700"
            style={{ paddingLeft }}
          >
            <div className="flex items-center">
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </div>
            {isOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {/* Submenu Items */}
          {isOpen && (
            <div className="mt-1 space-y-1">
              {item.subItems.map(subItem => renderMenuItem(subItem, level + 1))}
            </div>
          )}
        </div>
      );
    }

    // Regular menu item with link
    return (
      <NavLink
        key={item.path}
        to={item.path}
        className={({ isActive }) =>
          `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
            isActive
              ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white'
              : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
          }`
        }
        style={{ paddingLeft }}
      >
        <Icon className="w-5 h-5 mr-3" />
        {item.label}
      </NavLink>
    );
  };

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200 h-full">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-2 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <a href="/" className="flex items-center space-x-3 sm:space-x-4 group min-w-0 flex-shrink">
            <img 
              src={logo} 
              alt="Eury Fox Logo" 
              className="h-10 w-10 sm:h-12 sm:w-12 object-contain transition-transform duration-300 group-hover:scale-105"
            />

            <div style={{marginLeft: "1px"}} className="min-w-0">
              <h1 className="font-serif font-black text-lg bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent transition-colors duration-300 truncate">
                Eury Fox Global
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-sans hidden xs:block">
                Empowering Global Trade
              </p>
            </div>
          </a>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-3 space-y-1">
          {menuItems.map(item => renderMenuItem(item))}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;




















































































// import React, { useState } from 'react';
// import { NavLink } from 'react-router-dom';
// import logo from '../../../public/Euryfox-logo.png';
// import { 
//   LayoutDashboard, 
//   Package, 
//   Grid3X3, 
//   FileText, 
//   Layers,
//   BookOpen,
//   Phone,
//   Ruler,
//   UserPlus,
//   Scale,
//   IndianRupee,
//   User,
//   ChevronDown,
//   ChevronRight,
//   Briefcase,
//   FolderTree,
//   FileSpreadsheet
// } from 'lucide-react';

// const Sidebar = () => {
//   const [openMenus, setOpenMenus] = useState({});

//   const toggleMenu = (menuKey) => {
//     setOpenMenus(prev => ({
//       ...prev,
//       [menuKey]: !prev[menuKey]
//     }));
//   };

//   const menuItems = [
//     { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
//     { path: '/admin/blog-category', icon: Layers, label: 'Blog Category' },
//     { path: '/admin/blogs', icon: BookOpen, label: 'Blogs' },
    
//     // Services Menu with 3 direct options
//     {
//       key: 'services',
//       icon: Briefcase,
//       label: 'Services',
//       subItems: [
//         { path: '/admin/services', icon: Briefcase, label: 'Services' },
//         { path: '/admin/service-categories', icon: FolderTree, label: 'Service Categories' },
//         { path: '/admin/service-details', icon: FileSpreadsheet, label: 'Service Details' }
//       ]
//     },

//     { path: '/admin/contact', icon: Phone, label: 'Contact' },
//     { path: '/admin/team-member-add', icon: UserPlus, label: 'Team Member Add' },
//     { path: '/admin/event-management', icon: FileText, label: 'Event Management' },
//     { path: '/admin/collaborative-projects', icon: Layers, label: 'Collaborative Projects' },
//     { path: '/admin/training-programs', icon: Grid3X3, label: 'Training Programs' },
//     { path: '/admin/training-applications', icon: Package, label: 'Training Applications' },
//     { path: '/admin/success-stories', icon: BookOpen, label: 'Success Stories' },
//   ];

//   const renderMenuItem = (item, level = 0) => {
//     const Icon = item.icon;
//     const paddingLeft = `${12 + (level * 16)}px`;

//     // If item has subItems (nested menu)
//     if (item.subItems) {
//       const isOpen = openMenus[item.key];

//       return (
//         <div key={item.key}>
//           {/* Parent Menu Item */}
//           <button
//             onClick={() => toggleMenu(item.key)}
//             className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 text-gray-700 hover:bg-purple-50 hover:text-purple-700"
//             style={{ paddingLeft }}
//           >
//             <div className="flex items-center">
//               <Icon className="w-5 h-5 mr-3" />
//               {item.label}
//             </div>
//             {isOpen ? (
//               <ChevronDown className="w-4 h-4" />
//             ) : (
//               <ChevronRight className="w-4 h-4" />
//             )}
//           </button>

//           {/* Submenu Items */}
//           {isOpen && (
//             <div className="mt-1 space-y-1">
//               {item.subItems.map(subItem => renderMenuItem(subItem, level + 1))}
//             </div>
//           )}
//         </div>
//       );
//     }

//     // Regular menu item with link
//     return (
//       <NavLink
//         key={item.path}
//         to={item.path}
//         className={({ isActive }) =>
//           `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
//             isActive
//               ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white'
//               : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
//           }`
//         }
//         style={{ paddingLeft }}
//       >
//         <Icon className="w-5 h-5 mr-3" />
//         {item.label}
//       </NavLink>
//     );
//   };

//   return (
//     <div className="flex flex-col w-64 bg-white border-r border-gray-200 h-full">
//       {/* Logo */}
//       <div className="flex items-center justify-center h-16 px-2 border-b border-gray-200">
//         <div className="flex items-center space-x-3">
//           <a href="/" className="flex items-center space-x-3 sm:space-x-4 group min-w-0 flex-shrink">
//             <img 
//               src={logo} 
//               alt="Eury Fox Logo" 
//               className="h-10 w-10 sm:h-12 sm:w-12 object-contain transition-transform duration-300 group-hover:scale-105"
//             />

//             <div style={{marginLeft: "1px"}} className="min-w-0">
//               <h1 className="font-serif font-black text-lg bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent transition-colors duration-300 truncate">
//                 Eury Fox Global
//               </h1>
//               <p className="text-xs sm:text-sm text-muted-foreground font-sans hidden xs:block">
//                 Empowering Global Trade
//               </p>
//             </div>
//           </a>
//         </div>
//       </div>

//       {/* Navigation */}
//       <nav className="flex-1 overflow-y-auto py-4">
//         <div className="px-3 space-y-1">
//           {menuItems.map(item => renderMenuItem(item))}
//         </div>
//       </nav>
//     </div>
//   );
// };

// export default Sidebar;




// // import React from 'react';
// // import { NavLink } from 'react-router-dom';
// // import logo from '../../../public/Euryfox-logo.png'
// // import { 
// //   LayoutDashboard, 
// //   Package, 
// //   Grid3X3, 
// //   FileText, 
// //   Layers,
// //   BookOpen,
// //   Phone,
// //   Ruler,
// //   UserPlus,
// //   Scale,
// //   IndianRupee,
// //   User
// // } from 'lucide-react';

// // const Sidebar = () => {
// //   const menuItems = [
// //     { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
// //     { path: '/admin/product-category', icon: Grid3X3, label: 'Product Category' },
// //     { path: '/admin/products', icon: Package, label: 'Products' },
// //     { path: '/admin/blog-category', icon: Layers, label: 'Blog Category' },
// //     { path: '/admin/blogs', icon: BookOpen, label: 'Blogs' },
  
// //     { path: '/admin/product-units', icon: Ruler, label: 'Product Units' },
// //     { path: '/admin/unit-quantities', icon: Scale, label: 'Unit Quantities' },
// //     { path: '/admin/contact', icon: Phone, label: 'Contact' },
// //     { path: '/admin/team-member-add', icon: UserPlus, label: 'Team Member Add' },
// //     { path: '/admin/currency', icon:  IndianRupee, label: 'Currency' },
// //     { path: '/admin/user-profile', icon: User, label: 'UserProfile' },
// //     { path: '/admin/event-management', icon: FileText, label: 'Event Management' },
// //     { path: '/admin/collaborative-projects', icon: Layers, label: 'Collaborative Projects' },
    
// //   ];

// //   return (
// //     <div className="flex flex-col w-64 bg-white border-r border-gray-200 h-full">
// //       {/* Logo */}
// //       <div className="flex items-center justify-center h-16 px-2 border-b border-gray-200">
// //         <div className="flex items-center space-x-3">
          
// //           <a href="/" className="flex items-center space-x-3 sm:space-x-4 group min-w-0 flex-shrink">
// //             <img src={logo} alt="Eury Fox Logo" className="h-10 w-10 sm:h-12 sm:w-12 object-contain transition-transform duration-300 group-hover:scale-105"/>

// //             <div style={{marginLeft: "1px"}} className="min-w-0">
// //               <h1 className="font-serif font-black text-lg  bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500  bg-clip-text text-transparent transition-colors duration-300 truncate">
// //                 Eury Fox Global
// //               </h1>
// //               <p className="text-xs sm:text-sm text-muted-foreground font-sans hidden xs:block">
// //                 Empowering Global Trade
// //               </p>
// //             </div>
// //           </a>
// //         </div>
// //       </div>

// //       {/* Navigation */}
// //       <nav className="flex-1 overflow-y-auto py-4">
// //         <div className="px-3 space-y-1">
// //           {menuItems.map((item) => {
// //             const Icon = item.icon;
// //             return (
// //               <NavLink
// //                 key={item.path}
// //                 to={item.path}
// //                 className={({ isActive }) =>
// //                   `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
// //                     isActive
// //                       ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white'
// //                       : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
// //                   }`
// //                 }
// //               >
// //                 <Icon className="w-5 h-5 mr-3" />
// //                 {item.label}
// //               </NavLink>
// //             );
// //           })}
// //         </div>


// //       </nav>
// //     </div>
// //   );
// // };

// // export default Sidebar;






