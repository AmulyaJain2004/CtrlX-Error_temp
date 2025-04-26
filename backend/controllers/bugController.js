import Bug from "../models/Bug.js";
import asyncHandler from "express-async-handler";
// @desc    Get all bugs (Admin: all, User: only assigned bugs)
// @route   GET /api/bugs/
// @access  Private
const getBugs = async (req, res) => {
    try {
      const filter =
        req.user.role === "admin"
          ? {}
          : req.user.role === "tester"
          ? { createdBy: req.user._id }
          : { assignedTo: req.user._id };
  
      const bugs = await Bug.find(filter).populate("assignedTo", "name email profileImageURL");
  
      // Status summary counts
      const allBugs = await Bug.countDocuments(filter);
  
      const openBugs = await Bug.countDocuments({ ...filter, status: "Open" });
      const inProgressBugs = await Bug.countDocuments({ ...filter, status: "In Progress" });
      const closedBugs = await Bug.countDocuments({ ...filter, status: "Closed" });
  
      res.status(200).json({
        bugs,
        statusSummary: {
          all: allBugs,
          open: openBugs,
          inProgress: inProgressBugs,
          closed: closedBugs,
        },
      });
    } catch (error) {
      res.status(500).json({
        message: "Server Error",
        error: error.message,
      });
    }
};
  

// @desc    Get bug by ID
// @route   GET /api/bugs/:id
// @access  Private
const getBugById = async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id)
  .populate("assignedTo", "name email profileImageURL")
  .populate("createdBy", "name email");

    if (!bug) {
      return res.status(404).json({
        message: "Bug not found",
      });
    }

    const isAuthorized =
    req.user.role === "admin" ||
    (req.user.role === "tester" && bug.createdBy.toString() === req.user._id.toString()) ||
    (req.user.role === "developer" && bug.assignedTo?.toString() === req.user._id.toString());

    if (!isAuthorized) return res.status(403).json({ message: "Not authorized" });
    res.status(200).json(bug);
    } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Create a new bug (Admin only)
// @route   POST /api/bugs/
// @access  Private (Tester)
const createBug = async (req, res) => {
  try {
    let {
      title,
      description,
      severity,
      module,
      assignedTo,
      checklist,
      priority,
      dueDate,
      attachments,
    } = req.body;

    if (req.user.role !== 'tester') {
        return res.status(403).json({ message: 'Only testers can create bugs' });
      }

    if (!Array.isArray(assignedTo)) {
      return res.status(400).json({
        message: "assignedTo must be an array of user IDs",
      });
    }

    const bug = await Bug.create({
        title,
        description,
        severity,
        module,
        createdBy: req.user._id,
        assignedTo,
        checklist,
        priority,
        dueDate,
        attachments,
    });

    res.status(201).json({
        message: "Bug created successfully",
        bug,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Update bug details
// @route   PUT /api/bugs/:id
// @access  Private (Tester, Admin) Developer can only update status and checklist
const updateBug = async (req, res) => {
    try {
        const bug = await Bug.findById(req.params.id);
        if (!bug) return res.status(404).json({ message: "Bug not found" });

        const isTester = req.user.role === "tester" && bug.createdBy.toString() === req.user._id.toString();
        const isDeveloper =
            req.user.role === "developer" &&
            bug.assignedTo?.some(userId => userId.toString() === req.user._id.toString());
        const isAdmin = req.user.role === "admin";

        if (!isTester && !isDeveloper && !isAdmin) {
            return res.status(403).json({ message: "Not authorized" });
        }

        if (isDeveloper) {
            const { checklist, status } = req.body;
            
            if (checklist) {
                bug.checklist = checklist;
            }

            if (status) {
                bug.status = status;  // Developer can update status if needed
            }
        } else {
            // Admin and Tester can update all fields
            const allowedFields = [
                "title", "description", "priority", "severity", "status",
                "dueDate", "module", "checklist", "attachments", "assignedTo"
            ];
    
            allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                bug[field] = req.body[field];
            }
            });
    
            if (req.body.assignedTo && !Array.isArray(req.body.assignedTo)) {
                return res.status(400).json({ message: "assignedTo must be an array of user IDs" });
            }
        }
  
        const updatedBug = await bug.save();
        res.status(200).json({
            message: "Bug updated successfully",
            updatedBug,
        });
  
    } catch (error) {
      res.status(500).json({
        message: "Server Error",
        error: error.message,
      });
    }
  };

// @desc    Delete a bug (Admin only)
// @route   DELETE /api/bugs/:id
// @access  Private (Admin)
const deleteBug = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Not authorized" });
    const bug = await Bug.findById(req.params.id);
    if (!bug) {
      return res.status(404).json({
        message: "Bug not found",
      });
    }
    await bug.deleteOne();
    res.json({
      message: "Bug deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Update bug status
// @route   PUT /api/bugs/:id/status
// @access  Private

// Transition	Who Can Do It
// "Open" → "In Progress"	Developer (assigned)
// "In Progress" → "Closed"	Developer (if checklist complete)
// "Closed" → any other	Admin only
const updateBugStatus = async (req, res) => {
    try {
      const bug = await Bug.findById(req.params.id);
      if (!bug) return res.status(404).json({ message: "Bug not found" });
  
      const isAdmin = req.user.role === "admin";
      const isDeveloper =
        req.user.role === "developer" &&
        bug.assignedTo?.some(userId => userId.toString() === req.user._id.toString());
  
      if (!isAdmin && !isDeveloper) {
        return res.status(403).json({ message: "Not authorized" });
      }
  
      const newStatus = req.body.status;
      if (!newStatus) return res.status(400).json({ message: "Status is required" });
  
      // Only developers can move to "In Progress"
      if (newStatus === "In Progress" && !isDeveloper) {
        return res.status(403).json({ message: "Only assigned developers can move bug to In Progress." });
      }
  
      // Only admins can reopen a Closed bug
      if (bug.status === "Closed" && newStatus !== "Closed" && !isAdmin) {
        return res.status(403).json({ message: "Only admin can reopen a closed bug." });
      }
  
      // Prevent closing unless checklist is complete
      if (newStatus === "Closed") {
        const allItemsCompleted = (bug.checklist || []).every(item => item.completed);
        if (!allItemsCompleted) {
          return res.status(400).json({
            message: "Cannot close bug unless all checklist items are completed.",
          });
        }
      }
  
      bug.status = newStatus;
      await bug.save();
  
      res.json({
        message: "Bug status updated",
        bug,
      });
  
    } catch (error) {
      res.status(500).json({
        message: "Server Error",
        error: error.message,
      });
    }
  };  

// @desc    Update bug checklist
// @route   PUT /api/bugs/:id/checklist
// @access  Private
const updateBugChecklist = async (req, res) => {
  try {
    
    const bug = await Bug.findById(req.params.id);

    if (!bug) {
      return res.status(404).json({
        message: "Bug not found",
      });
    }

    const isAssigned = Array.isArray(bug.assignedTo) &&
      bug.assignedTo.some(
        (userId) => userId.toString() === req.user._id.toString()
      );

    
    if (!isAssigned) {
      res.status(403);
      throw new Error("You are not assigned to this bug");
    }

    const isAdmin = req.user.role === "admin";
    const isDeveloper = req.user.role === "developer" && isAssigned;

    if (!isAdmin && !isDeveloper) return res.status(403).json({ message: "Not authorized" });

    const { checklist } = req.body;
    bug.checklist = checklist; // Replace with updated checklist

    // Auto-update progress based on checklist completion
    const completedCount = checklist.filter(
      (item) => item.done
    ).length;

    // Auto-close only if all checklist items are completed, and bug isn't already in a final state
  const allCompleted = checklist.every((item) => item.done);
  const finalStates = ["Closed", "Rejected"];

  if (!finalStates.includes(bug.status)) {
    if (allCompleted) {
      bug.status = "Closed";
      bug.closedByChecklist = true;
    } else if (completedCount > 0) {
      bug.status = "In Progress";
    } else {
      bug.status = "Open";
    }
  }

    await bug.save();

    const updatedBug = await Bug.findById(req.params.id).populate(
      "assignedTo",
      "name email profileImageUrl"
    );

    res.json({
      message: "Bug checklist updated",
      bug: updatedBug,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Dashboard data (Admin only)
// @route   GET /api/bugs/dashboard-data
// @access  Private
const getAdminDashboardData = async (req, res) => {
  try {
    // Fetch statistics
    const totalBugs = await Bug.countDocuments();
    const openBugs = await Bug.countDocuments(
        {
            status: "Open",
        }
    );
    const closedBugs = await Bug.countDocuments(
        {
            status: "Closed",
        }
    );

    // Ensure all possible statuses are included
    const bugStatuses = ["Open", "In Progress", "Closed"];

    const bugDistributionRaw = await Bug.aggregate(
        [
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ]
    );

    const bugDistribution = bugStatuses.reduce((acc, status) => {
        const formattedKey = status.replace(/\s+/g, ""); // Remove spaces for response keys
        acc[formattedKey] = bugDistributionRaw.find(
            (item) => item._id === status
        )?.count || 0; // Default to 0 if not found
        return acc;
    }, {});
    bugDistribution["All"] = totalBugs; // Add total bugs count to Bug Distribution

    // Ensure all priorities are included
    const bugPriorities = [
        "Low",
        "Medium",
        "High",
    ];
    const bugPriorityLevelsRaw = await Bug.aggregate(
        [
            {
                $group: {
                    _id: "$priority",
                    count: { $sum: 1 },
                },
            },
        ]
    );
    const bugPriorityLevels = bugPriorities.reduce((acc, priority) => {
        acc[priority] = bugPriorityLevelsRaw.find(
            (item) => item._id === priority
        )?.count || 0; // Default to 0 if not found
        return acc; 
    }, {});

    // Fetch recent 10 tasks
    const recentBugs = await Bug.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select("title status priority dueDate createdAt")
    
    res.status(200).json(
        {
            statistics: {
                totalBugs,
                openBugs,
                closedBugs,
            },
            charts: {   
                bugDistribution,
                bugPriorityLevels,
            },
            recentBugs,
        }
    );
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};


const getTesterDashboardData = asyncHandler(async (req, res) => {
  return getUserDashboardData(req, res, "tester");
});

const getDeveloperDashboardData = asyncHandler(async (req, res) => {
  return getUserDashboardData(req, res, "developer");
});



// @desc    Dashboard data (User-specific)
// @route   GET /api/bugs/user-dashboard-data
// @access  Private
const getUserDashboardData = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === "tester") {
      filter = { createdBy: req.user._id };
    } else if (req.user.role === "developer") {
      filter = { assignedTo: req.user._id };
    }
    const totalBugs = await Bug.countDocuments(filter);
    const openBugs = await Bug.countDocuments({ ...filter, status: "Open" });
    const closedBugs = await Bug.countDocuments({ ...filter, status: "Closed" });
    // res.status(200).json({ totalBugs, openBugs, closedBugs });

    // Bug Distribution by Status
    const bugStatuses = ["Open", "In Progress", "Closed"];

    const bugDistributionRaw = await Bug.aggregate(
        [
            {
                $match: filter
            },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ]
    );

    const bugDistribution = bugStatuses.reduce((acc, status) => {
        const formattedKey = status.replace(/\s+/g, "");
        acc[formattedKey] = bugDistributionRaw.find(
            (item) => item._id === status
        )?.count || 0; // Default to 0 if not found
        return acc;
    }, {});
    bugDistribution["All"] = totalBugs;

    // Bug Distribution by Priority
    const bugPriorities = [
        "Low",
        "Medium",
        "High",
    ];
    const bugPriorityLevelsRaw = await Bug.aggregate(
        [
            {
                $match: filter
            },
            {
                $group: {
                    _id: "$priority",
                    count: { $sum: 1 },
                },
            },
        ]
    );
    const bugPriorityLevels = bugPriorities.reduce((acc, priority) => {
        acc[priority] = bugPriorityLevelsRaw.find(
            (item) => item._id === priority
        )?.count || 0; 
        return acc;
    }, {});

    // Fetch recent 10 bugs for the user
    const recentBugs = await Bug.find(
        filter
    )
        .sort({ createdAt: -1 })
        .limit(10)
        .select("title status priority dueDate createdAt")  
    
    res.status(200).json(
        {
            statistics: {
                totalBugs,
                openBugs,
                closedBugs,
            },
            charts: {
                bugDistribution,
                bugPriorityLevels,
            },
            recentBugs,
        }
    );
  } 
  catch (error) {
    res.status(500).json({
        message: "Server Error",
        error: error.message,
    });
  }
};

export {
  getBugs,
  getBugById,
  createBug,
  updateBug,
  deleteBug,
  updateBugStatus,
  updateBugChecklist,
  getAdminDashboardData,
  getUserDashboardData,

  getTesterDashboardData,
  getDeveloperDashboardData,
};
