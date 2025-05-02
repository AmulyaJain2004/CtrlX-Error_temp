import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { UserContext } from '../../context/userContext';
import BugListTable from '../../components/BugListTable';
import toast from 'react-hot-toast';

const AssignedBugs = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'open', 'in-progress', 'closed'

  const fetchAssignedBugs = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.BUGS.GET_ALL_BUGS, {
        params: { assignedTo: user?._id }
      });
      
      if (response.data) {
        setBugs(response.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching assigned bugs:', error);
      toast.error('Failed to load assigned bugs');
      setLoading(false);
    }
  };

  const filteredBugs = () => {
    if (filter === 'all') return bugs;
    if (filter === 'pending') return bugs.filter(bug => bug.status === 'Pending');
    if (filter === 'in-progress') return bugs.filter(bug => bug.status === 'In Progress');
    if (filter === 'resolved') return bugs.filter(bug => bug.status === 'Resolved');
    return bugs;
  };

  const handleViewBug = (bugId) => {
    navigate(`/developer/bug/${bugId}`);
  };

  useEffect(() => {
    fetchAssignedBugs();
  }, [user]);

  return (
    <DashboardLayout activeMenu="Assigned Bugs">
      <div className="card my-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-xl md:text-2xl font-medium">Your Assigned Bugs</h2>
          
          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <p className="text-gray-500">Loading bugs...</p>
          </div>
        ) : bugs.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No bugs are currently assigned to you</p>
          </div>
        ) : (
          <BugListTable 
            bugs={filteredBugs()}
            onRowClick={handleViewBug}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default AssignedBugs; 