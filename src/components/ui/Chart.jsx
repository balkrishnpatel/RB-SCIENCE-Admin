// import React from 'react';

// const Chart = ({ data, type = 'line' }) => {
//   if (type === 'line') {
//     return (
//       <div className="h-64 flex items-end space-x-2">
//         {data.map((item, index) => (
//           <div key={index} className="flex-1 flex flex-col items-center space-y-2">
//             <div className="w-full relative h-40 flex items-end justify-center space-x-1">
//               <div 
//                 className="w-2 bg-blue-500 rounded-t"
//                 style={{ height: `${(item.sales / 40) * 100}%` }}
//               ></div>
//               <div 
//                 className="w-2 bg-green-500 rounded-t"
//                 style={{ height: `${(item.visitors / 40) * 100}%` }}
//               ></div>
//               <div 
//                 className="w-2 bg-purple-500 rounded-t"
//                 style={{ height: `${(item.products / 40) * 100}%` }}
//               ></div>
//             </div>
//             <span className="text-xs text-gray-500">{item.name}</span>
//           </div>
//         ))}
//       </div>
//     );
//   }

//   if (type === 'bar') {
//     const maxValue = Math.max(...data.map(item => item.value));
//     return (
//       <div className="h-64 flex items-end space-x-4">
//         {data.map((item, index) => (
//           <div key={index} className="flex-1 flex flex-col items-center space-y-2">
//             <div className="w-full relative h-40 flex items-end justify-center">
//               <div 
//                 className="w-8 rounded-t transition-all duration-300"
//                 style={{ 
//                   height: `${(item.value / maxValue) * 100}%`,
//                   backgroundColor: item.color || '#8B5CF6'
//                 }}
//               ></div>
//             </div>
//             <span className="text-xs text-gray-500">{item.name}</span>
//             <span className="text-xs font-semibold text-gray-700">{item.value}</span>
//           </div>
//         ))}
//       </div>
//     );
//   }

//   return null;
// };

// export default Chart;