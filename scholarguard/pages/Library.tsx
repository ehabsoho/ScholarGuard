import React from 'react';
import { LibraryDocument } from '../types';
import { Search, Filter, MoreVertical, FileText, Download, Trash2 } from 'lucide-react';

const mockDocs: LibraryDocument[] = [
  { id: '1', name: 'Thesis_Final_Draft_v2.pdf', type: 'PDF', uploadDate: '2023-10-15', size: '2.4 MB', content: '' },
  { id: '2', name: 'IEEE_Conference_Paper.docx', type: 'DOCX', uploadDate: '2023-11-02', size: '1.1 MB', content: '' },
  { id: '3', name: 'Literature_Review_Autoimmunity.pdf', type: 'PDF', uploadDate: '2023-12-10', size: '3.5 MB', content: '' },
  { id: '4', name: 'Research_Notes_Lab.txt', type: 'TXT', uploadDate: '2024-01-05', size: '15 KB', content: '' },
];

export const Library: React.FC = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-serif font-bold text-scholar-900">Reference Library</h2>
          <p className="text-scholar-gray mt-1">Manage your private collection of papers for cross-referencing.</p>
        </div>
        <button className="bg-scholar-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-scholar-800">
          + Upload New Reference
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search documents..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-scholar-gold"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>

        {/* List */}
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <th className="p-4 font-medium">Document Name</th>
              <th className="p-4 font-medium">Type</th>
              <th className="p-4 font-medium">Date Added</th>
              <th className="p-4 font-medium">Size</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mockDocs.map((doc) => (
              <tr key={doc.id} className="hover:bg-blue-50/30 group transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-scholar-blue-50 rounded text-scholar-900">
                      <FileText className="w-5 h-5 text-scholar-900" />
                    </div>
                    <span className="font-medium text-scholar-900">{doc.name}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-gray-100 text-xs rounded font-medium text-gray-600">{doc.type}</span>
                </td>
                <td className="p-4 text-sm text-gray-500">{doc.uploadDate}</td>
                <td className="p-4 text-sm text-gray-500">{doc.size}</td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500" title="Download">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded text-gray-500" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
