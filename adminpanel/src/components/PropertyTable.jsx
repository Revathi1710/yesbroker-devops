import React from 'react';

const PropertyTable = ({ properties = [], loading }) => {
  // Placeholder if data is still loading from your API
  if (loading) return <div className="p-10 text-center">Loading listings...</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left whitespace-nowrap">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Property</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Type & Size</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Localities</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Price</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {properties.map((property) => (
            <tr key={property._id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0 rounded bg-gray-200 mr-3 overflow-hidden">
                    {/* Shows the first photo from your [String] array */}
                    {property.photos?.length > 0 ? (
                      <img src={property.photos[0]} alt="property" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">🏠</div>
                    )}
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    Listing ID: {property._id.toString().slice(-6)}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                <div className="font-semibold text-gray-800">{property.propertyType}</div>
                <div>{property.size}</div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {/* Handles your locality array */}
                <div className="max-w-[150px] truncate">
                  {property.localities.join(', ')}
                </div>
              </td>
              <td className="px-6 py-4 text-sm font-bold text-gray-900">
                ₹{property.price.toLocaleString('en-IN')}
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  property.status === 'Active' ? 'bg-green-100 text-green-800' : 
                  property.status === 'Sold' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {property.status}
                </span>
              </td>
              <td className="px-6 py-4 text-sm font-medium">
                <button className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                <button className="text-red-600 hover:text-red-900">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {properties.length === 0 && !loading && (
        <div className="p-10 text-center text-gray-500">No properties found.</div>
      )}
    </div>
  );
};

export default PropertyTable;