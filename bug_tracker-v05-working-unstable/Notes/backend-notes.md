# Backend Documentation

## Project Overview
The backend is built using Node.js with Express.js framework, implementing a RESTful API for a bug tracking system. It uses MongoDB as the database and includes features for user management, bug tracking, real-time chat, and reporting.

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Handling**: Multer
- **Real-time Communication**: Socket.IO
- **Validation**: Express Validator
- **Environment Management**: dotenv

## Project Structure
```
backend/
├── config/           # Configuration files
│   └── db.js        # Database connection setup
├── controllers/      # Route controllers
│   ├── authController.js
│   ├── bugController.js
│   ├── chatController.js
│   ├── reportController.js
│   └── userController.js
├── middlewares/      # Custom middleware
│   ├── auth.js      # Authentication middleware
│   └── upload.js    # File upload middleware
├── models/          # Database models
│   ├── Bug.js
│   ├── Chat.js
│   ├── Message.js
│   └── User.js
├── routes/          # API routes
│   ├── authRoutes.js
│   ├── bugRoutes.js
│   ├── chatRoutes.js
│   ├── reportRoutes.js
│   └── userRoutes.js
├── services/        # Business logic
├── uploads/         # File upload directory
├── server.js        # Application entry point
└── package.json     # Project dependencies
```

## Core Components

### 1. Server Configuration (`server.js`)
- **Express Setup**:
  - CORS configuration
  - JSON body parsing
  - Static file serving
  - Route mounting
- **Environment Variables**:
  - Port configuration
  - Database URI
  - JWT secret
- **Middleware Integration**:
  - Error handling
  - Request logging
  - Security headers

### 2. Database Models

#### User Model (`models/User.js`)
- **Schema Fields**:
  - `name`: User's full name
  - `email`: Unique email address
  - `password`: Hashed password
  - `role`: User role (admin/tester/developer)
  - `status`: Account status
- **Methods**:
  - Password hashing
  - Token generation
  - Profile updates

#### Bug Model (`models/Bug.js`)
- **Schema Fields**:
  - `title`: Bug title (required, min 5 chars)
  - `description`: Detailed description (required, min 10 chars)
  - `priority`: Enum (Low/Medium/High)
  - `severity`: Enum (Minor/Major/Critical)
  - `status`: Enum (Open/In Progress/Closed)
  - `dueDate`: Optional future date
  - `module`: Affected module
  - `createdBy`: Reference to User
  - `assignedTo`: Array of User references
  - `attachments`: Array of file paths
  - `checklist`: Array of checklist items
  - `updateHistory`: Array of change records
- **Features**:
  - Automatic update tracking
  - Text search indexing
  - Status transition validation
  - Due date validation
- **Indexes**:
  - Compound index on (createdBy, status)
  - Compound index on (assignedTo, status)
  - Text index on (title, description)

#### Chat Model (`models/Chat.js`)
- **Schema Fields**:
  - `participants`: Array of User references
  - `type`: Chat type (private/group)
  - `lastMessage`: Reference to Message
  - `unreadCount`: Message counters
- **Methods**:
  - Message handling
  - Participant management

#### Message Model (`models/Message.js`)
- **Schema Fields**:
  - `chat`: Reference to Chat
  - `sender`: Reference to User
  - `content`: Message content
  - `type`: Message type (text/file)
  - `readBy`: Array of User references
- **Features**:
  - Real-time delivery
  - Read receipts
  - File attachments

### 3. Controllers

#### Auth Controller (`controllers/authController.js`)
- **Endpoints**:
  - `POST /api/auth/register`: User registration
  - `POST /api/auth/login`: User authentication
  - `GET /api/auth/profile`: Get user profile
  - `PUT /api/auth/profile`: Update profile
- **Features**:
  - JWT token generation
  - Password hashing
  - Role-based access
  - Input validation

#### Bug Controller (`controllers/bugController.js`)
- **Endpoints**:
  - `POST /api/bugs`: Create new bug
  - `GET /api/bugs`: List bugs (with filters)
  - `GET /api/bugs/:id`: Get bug details
  - `PUT /api/bugs/:id`: Update bug
  - `DELETE /api/bugs/:id`: Delete bug
- **Features**:
  - CRUD operations
  - File attachments
  - Status management
  - Assignment handling
  - Search and filtering
  - Pagination
  - Update history tracking

#### Chat Controller (`controllers/chatController.js`)
- **Endpoints**:
  - `POST /api/chats`: Create chat
  - `GET /api/chats`: List user's chats
  - `GET /api/chats/:id`: Get chat details
  - `POST /api/chats/:id/messages`: Send message
  - `GET /api/chats/:id/messages`: Get messages
- **Features**:
  - Real-time messaging
  - File sharing
  - Read receipts
  - Chat history
  - Participant management

#### Report Controller (`controllers/reportController.js`)
- **Endpoints**:
  - `GET /api/reports/bugs`: Bug statistics
  - `GET /api/reports/users`: User activity
  - `GET /api/reports/performance`: System metrics
- **Features**:
  - Data aggregation
  - Custom date ranges
  - Export functionality
  - Role-based access

### 4. Middleware

#### Authentication Middleware (`middlewares/auth.js`)
- **Features**:
  - Token verification
  - Role-based access control
  - Request validation
  - Error handling

#### Upload Middleware (`middlewares/upload.js`)
- **Features**:
  - File type validation
  - Size limits
  - Secure storage
  - Error handling

### 5. Services

#### File Service
- File upload handling
- Storage management
- File type validation
- Cleanup routines

#### Notification Service
- Email notifications
- In-app alerts
- WebSocket events

## API Endpoints

### Authentication Routes
```
POST /api/auth/register    # Register new user
POST /api/auth/login       # User login
GET  /api/auth/profile     # Get user profile
PUT  /api/auth/profile     # Update profile
```

### Bug Routes
```
POST   /api/bugs          # Create bug
GET    /api/bugs          # List bugs
GET    /api/bugs/:id      # Get bug
PUT    /api/bugs/:id      # Update bug
DELETE /api/bugs/:id      # Delete bug
```

### Chat Routes
```
POST   /api/chats              # Create chat
GET    /api/chats              # List chats
GET    /api/chats/:id          # Get chat
POST   /api/chats/:id/messages # Send message
GET    /api/chats/:id/messages # Get messages
```

### Report Routes
```
GET /api/reports/bugs        # Bug statistics
GET /api/reports/users       # User activity
GET /api/reports/performance # System metrics
```

## Security Implementation

### Authentication
- JWT-based authentication
- Token refresh mechanism
- Password hashing with bcrypt
- Role-based access control

### Data Protection
- Input sanitization
- XSS prevention
- CSRF protection
- Rate limiting
- File upload security

### Error Handling
- Global error middleware
- Custom error classes
- Validation error handling
- Database error handling

## Database Operations

### Indexing Strategy
- Compound indexes for common queries
- Text indexes for search
- Unique indexes for constraints

### Query Optimization
- Pagination implementation
- Selective field projection
- Aggregation pipeline optimization
- Caching strategy

## Real-time Features

### WebSocket Implementation
- Socket.IO integration
- Event-based communication
- Room management
- Connection handling

### Chat System
- Real-time messaging
- Typing indicators
- Online status
- Message delivery status

## File Management

### Upload System
- Secure file storage
- Type validation
- Size limits
- Cleanup routines

### File Types
- Images (jpg, png, gif)
- Documents (pdf, doc, docx)
- Code files
- Log files

## Performance Optimizations

### Database
- Index optimization
- Query caching
- Connection pooling
- Aggregation optimization

### API
- Response compression
- Request validation
- Rate limiting
- Caching headers

## Error Handling

### Global Error Handler
- Custom error classes
- Error logging
- Client-friendly messages
- Stack trace management

### Validation
- Input validation
- Schema validation
- Custom validators
- Error messages

## Testing Strategy

### Unit Testing
- Controller tests
- Service tests
- Model tests
- Utility tests

### Integration Testing
- API endpoint tests
- Database integration
- Authentication flow
- File operations

## Deployment

### Environment Setup
- Environment variables
- Database configuration
- File storage setup
- SSL/TLS configuration

### Production Considerations
- Logging
- Monitoring
- Backup strategy
- Scaling options

## Maintenance

### Code Organization
- Modular architecture
- Clear separation of concerns
- Consistent naming conventions
- Documentation

### Version Control
- Git workflow
- Branch management
- Release process
- Change logging

## Future Improvements
1. Implement:
   - Advanced search functionality
   - Analytics dashboard
   - Automated testing
   - CI/CD pipeline
   - Containerization
   - API documentation
   - Performance monitoring
   - Enhanced security features
