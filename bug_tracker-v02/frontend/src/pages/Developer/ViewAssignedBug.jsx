import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { UserContext } from '../../context/userContext';
import toast from 'react-hot-toast';
import moment from 'moment';
import { LuClock, LuCalendar, LuPaperclip } from 'react-icons/lu';
import { STATUS_DATA } from '../../utils/data';

const STATUS_OPTIONS = [
  { id: 1, name: 'Pending', value: 'Pending' },
  { id: 2, name: 'In Progress', value: 'In Progress' },
  { id: 3, name: 'Resolved', value: 'Resolved' },
];

const ViewAssignedBug = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [bug, setBug] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [checklist, setChecklist] = useState([]);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  const fetchBugDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.BUGS.GET_BUG_BY_ID(id));
      const bugData = response.data;
      
      // Convert legacy status values if needed
      if (bugData.status === "Open") bugData.status = "Pending";
      if (bugData.status === "Closed") bugData.status = "Resolved";
      
      setBug(bugData);
      setSelectedStatus(bugData.status);
      setChecklist(bugData.checklist || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bug details:', error);
      toast.error('Failed to load bug details');
      setLoading(false);
      navigate('/developer/dashboard');
    }
  };

  const updateBugStatus = async () => {
    try {
      setUpdatingStatus(true);
      await axiosInstance.put(API_PATHS.BUGS.UPDATE_BUG_STATUS(id), {
        status: selectedStatus,
      });
      toast.success('Bug status updated successfully');
      setBug((prev) => ({ ...prev, status: selectedStatus }));
      setUpdatingStatus(false);
    } catch (error) {
      console.error('Error updating bug status:', error);
      toast.error('Failed to update bug status');
      setUpdatingStatus(false);
    }
  };

  const updateChecklistItem = async (index, completed) => {
    try {
      const updatedChecklist = [...checklist];
      updatedChecklist[index] = {
        ...updatedChecklist[index],
        completed,
      };

      await axiosInstance.put(API_PATHS.BUGS.UPDATE_CHECKLIST(id), {
        checklist: updatedChecklist,
      });

      setChecklist(updatedChecklist);
      toast.success('Checklist updated');
    } catch (error) {
      console.error('Error updating checklist:', error);
      toast.error('Failed to update checklist');
    }
  };

  const updateResolutionNotes = async () => {
    if (!resolutionNotes.trim()) return;
    
    try {
      setSavingNotes(true);
      await axiosInstance.put(API_PATHS.BUGS.UPDATE_BUG(id), {
        resolutionNotes,
      });
      toast.success('Resolution notes updated successfully');
      setSavingNotes(false);
    } catch (error) {
      console.error('Error updating resolution notes:', error);
      toast.error('Failed to update resolution notes');
      setSavingNotes(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchBugDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout activeMenu="My Bugs">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading bug details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!bug) {
    return (
      <DashboardLayout activeMenu="My Bugs">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Bug not found or you don't have permission to view it</p>
        </div>
      </DashboardLayout>
    );
  }

  const isAssignedToDeveloper = bug.assignedTo?.some(
    (dev) => dev._id === user?._id || dev === user?._id
  );

  if (!isAssignedToDeveloper) {
    return (
      <DashboardLayout activeMenu="My Bugs">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">This bug is not assigned to you</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="Assigned Bugs">
      <div className="p-6 bg-white rounded-lg shadow-sm mt-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-medium mb-1">{bug.title}</h1>
            <div className="flex items-center text-sm text-gray-500 gap-4">
              <span className="flex items-center gap-1">
                <LuCalendar className="text-gray-400" />
                Reported on {moment(bug.createdAt).format('MMM D, YYYY')}
              </span>
              <span className="flex items-center gap-1">
                <LuClock className="text-gray-400" />
                Due {moment(bug.dueDate).format('MMM D, YYYY')}
              </span>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.id} value={option.value}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={updateBugStatus}
              disabled={updatingStatus || selectedStatus === bug.status}
              className={`px-3 py-1.5 rounded text-sm transition ${
                updatingStatus || selectedStatus === bug.status
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {updatingStatus ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gray-50 rounded p-4">
            <h3 className="font-medium mb-2 text-gray-700">Priority</h3>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                bug.priority === 'High'
                  ? 'bg-red-100 text-red-800'
                  : bug.priority === 'Medium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              {bug.priority}
            </span>
          </div>

          <div className="bg-gray-50 rounded p-4">
            <h3 className="font-medium mb-2 text-gray-700">Severity</h3>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                bug.severity === 'Critical'
                  ? 'bg-red-100 text-red-800'
                  : bug.severity === 'Major'
                  ? 'bg-orange-100 text-orange-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {bug.severity}
            </span>
          </div>

          <div className="bg-gray-50 rounded p-4">
            <h3 className="font-medium mb-2 text-gray-700">Current Status</h3>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                bug.status === 'Pending'
                  ? 'bg-red-100 text-red-800'
                  : bug.status === 'In Progress'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              {bug.status}
            </span>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-medium mb-3 text-gray-700">Description</h3>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-gray-700 whitespace-pre-line">{bug.description}</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-medium mb-3 text-gray-700">
            Module
          </h3>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-gray-700">{bug.module || 'Not specified'}</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-medium mb-3 text-gray-700">Steps to Reproduce</h3>
          <div className="bg-gray-50 p-4 rounded divide-y divide-gray-200">
            {checklist && checklist.length > 0 ? (
              <ul className="space-y-2">
                {checklist.map((item, index) => (
                  <li key={index} className="py-2 flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={(e) => updateChecklistItem(index, e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span
                      className={`${
                        item.completed ? 'line-through text-gray-400' : 'text-gray-700'
                      }`}
                    >
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 py-2">No steps to reproduce provided</p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-medium mb-3 text-gray-700">Resolution Notes</h3>
          <textarea
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
            placeholder="Add your resolution notes or comments here..."
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={updateResolutionNotes}
              disabled={!resolutionNotes.trim() || savingNotes}
              className={`px-4 py-2 rounded text-sm ${
                !resolutionNotes.trim() || savingNotes ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {savingNotes ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        </div>
        
        <div className="flex justify-between mt-8">
          <button
            onClick={() => navigate('/developer/assigned-bugs')}
            className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
          >
            Back to Assigned Bugs
          </button>
          
          {bug.status !== 'Resolved' && (
            <button
              onClick={() => {
                setSelectedStatus('Resolved');
                setTimeout(() => updateBugStatus(), 100);
              }}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              Mark as Resolved
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ViewAssignedBug;
