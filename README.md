# OralVis - AI-Powered Dental Analysis Platform

A comprehensive dental health analysis platform that uses AI to analyze oral images and generate professional dental reports. Built with the MERN stack (MongoDB, Express.js, React, Node.js).

## 🦷 Features

### For Patients
- **Image Upload**: Upload dental images for AI analysis
- **Professional Reports**: View beautifully formatted dental analysis reports
- **Download Reports**: Download reports as PDF files
- **Track Submissions**: Monitor the status of submitted images
- **Secure Authentication**: JWT-based secure login system

### For Administrators
- **Patient Management**: View and manage all patient submissions
- **Image Annotation**: Annotate dental images with professional tools
- **Report Generation**: Generate, regenerate, and manage dental reports
- **Status Tracking**: Update submission status throughout the workflow
- **Comprehensive Dashboard**: Overview of all submissions and analytics

## 🏗️ Technical Architecture

### Frontend (React)
- **React 18** with modern hooks and functional components
- **React Router** for client-side routing
- **Styled Components** with CSS-in-JS
- **Responsive Design** for mobile and desktop
- **Professional UI** matching medical industry standards

### Backend (Node.js/Express)
- **Express.js** REST API server
- **MongoDB** with Mongoose ODM
- **JWT Authentication** with secure token management
- **File Upload** handling with Multer
- **PDF Generation** using PDFKit
- **Image Processing** capabilities

### Key Technologies
- **Database**: MongoDB with Mongoose
- **Authentication**: JSON Web Tokens (JWT)
- **File Storage**: Local file system with static serving
- **PDF Generation**: PDFKit for professional reports
- **UI Framework**: Custom React components with Lucide icons

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+ recommended)
- MongoDB (local or MongoDB Atlas)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ujjwal1207/orlvis.git
   cd orlvis
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   
   # Create environment file
   cp .env.example .env
   # Edit .env with your MongoDB connection string and JWT secret
   
   # Start the backend server
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   
   # Start the React development server
   npm start
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/orlvis
# or use MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/orlvis

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
```

## 📁 Project Structure

```
orlvis/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Custom middleware
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Utility functions
│   │   ├── config/         # Configuration files
│   │   └── server.js       # Main server file
│   ├── uploads/            # Uploaded images
│   ├── reports/            # Generated PDF reports
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context providers
│   │   ├── utils/          # Utility functions
│   │   ├── styles/         # Global styles
│   │   └── App.js
│   ├── public/
│   └── package.json
├── Images_sample/          # Sample dental images
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Submissions
- `POST /api/submissions` - Create new submission
- `GET /api/submissions` - Get user submissions
- `GET /api/submissions/:id` - Get specific submission
- `PUT /api/submissions/:id` - Update submission

### Reports
- `POST /api/reports/:id/generate` - Generate report
- `GET /api/reports/:id/download` - Download report PDF
- `GET /api/reports/:id/preview` - Preview report
- `DELETE /api/reports/:id` - Delete report

### Admin
- `GET /api/admin/submissions` - Get all submissions
- `PUT /api/admin/submissions/:id/status` - Update submission status
- `POST /api/admin/submissions/:id/annotate` - Save annotations

## 🎨 UI Components

### Dental Report Component
Professional dental analysis reports featuring:
- Patient information header
- Dental image analysis with color-coded annotations
- Treatment recommendations with detailed descriptions
- Print-ready format for clinical use

### Dashboard Components
- Patient dashboard with submission tracking
- Admin dashboard with comprehensive management tools
- Status indicators and progress tracking
- Responsive design for all screen sizes

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Patient and Admin roles
- **Input Validation**: Server-side validation for all inputs
- **File Upload Security**: File type and size restrictions
- **CORS Configuration**: Proper cross-origin resource sharing

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📱 Responsive Design

The application is fully responsive and works on:
- **Desktop**: Full-featured experience
- **Tablet**: Optimized layout for touch interaction
- **Mobile**: Mobile-first responsive design

## 🚀 Deployment

### Backend Deployment (Heroku/Railway/DigitalOcean)
1. Set up MongoDB Atlas for production database
2. Configure environment variables on hosting platform
3. Deploy backend with process manager (PM2 recommended)

### Frontend Deployment (Netlify/Vercel)
1. Build the React application: `npm run build`
2. Deploy the build folder to static hosting service
3. Configure API base URL for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Email: support@orlvis.com
- Documentation: [Wiki](https://github.com/ujjwal1207/orlvis/wiki)

## 🙏 Acknowledgments

- **Medical Consultation**: Thanks to dental professionals for guidance
- **UI/UX Design**: Inspired by modern medical software interfaces
- **Open Source Libraries**: Built with amazing open source tools

---

**Built with ❤️ for better dental health outcomes**
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── context/       # Context providers
│   │   ├── utils/         # Utility functions
│   │   └── App.js
│   └── package.json
├── Images_sample/          # Sample dental images
└── report_demo.pdf        # Sample report format
```

## 🚀 Features

### Core Features
- **Authentication & Authorization**: JWT-based auth with role-based access (Patient/Admin)
- **Patient Portal**: Upload dental photos with patient details
- **Admin Dashboard**: Review submissions, annotate images, generate reports
- **Image Annotation**: Advanced canvas-based annotation with multiple tools
- **PDF Generation**: Automated report generation with embedded images and details
- **File Management**: Secure file upload and storage

### Bonus Features
- **AWS S3 Integration**: Cloud storage for images and PDFs
- **Report Links**: Direct access links embedded in PDFs and UI

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **PDF Generation**: PDFKit
- **Image Processing**: Sharp, Canvas
- **Security**: Helmet, Rate Limiting

### Frontend
- **Framework**: React
- **Routing**: React Router
- **State Management**: Context API
- **Styling**: CSS3 with modern features
- **HTTP Client**: Fetch API
- **Canvas**: HTML5 Canvas for annotations

## 📋 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user

### Patient Routes
- `POST /api/submissions` - Upload dental image with details
- `GET /api/submissions/my` - Get patient's submissions
- `GET /api/reports/:id/download` - Download PDF report

### Admin Routes
- `GET /api/submissions` - Get all submissions
- `GET /api/submissions/:id` - Get specific submission
- `PUT /api/submissions/:id/annotate` - Save annotation
- `POST /api/submissions/:id/generate-report` - Generate PDF report

## 🔧 Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- Git

### Backend Setup

1. **Clone and navigate to backend**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running on your system
   mongod
   ```

5. **Run the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

### Frontend Setup

1. **Navigate to frontend**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the application**
   ```bash
   npm start
   ```

## 🧪 Test Credentials

### Patient Account
- **Email**: patient@oralvis.com
- **Password**: patient123
- **Role**: patient

### Admin Account
- **Email**: admin@oralvis.com
- **Password**: admin123
- **Role**: admin

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Rate limiting on API endpoints
- File type validation for uploads
- CORS configuration
- Helmet for security headers
- Input validation and sanitization

## 📱 User Flows

### Patient Flow
1. Register/Login to the system
2. Fill out patient details form
3. Upload dental image
4. View submission status
5. Download generated PDF report

### Admin Flow
1. Login to admin portal
2. View all patient submissions
3. Select submission for review
4. Annotate dental image with tools
5. Generate and save PDF report
6. Update submission status

## 🎨 Annotation Tools

- **Rectangle**: Draw rectangular annotations
- **Circle**: Create circular highlights
- **Arrow**: Point to specific areas
- **Freehand**: Draw custom shapes
- **Text**: Add text annotations
- **Color Picker**: Choose annotation colors
- **Undo/Redo**: Annotation history

## 📄 PDF Report Features

- Patient demographic information
- Original and annotated images
- Annotation details and notes
- Timestamp and healthcare provider info
- Professional formatting
- Downloadable and shareable

## 🌐 Deployment

### Backend Deployment
- Environment variables configuration
- MongoDB Atlas for cloud database
- PM2 for process management
- Nginx for reverse proxy

### Frontend Deployment
- Build optimization
- Static file serving
- Environment-specific configurations

## 🔮 Future Enhancements

- Real-time notifications
- Advanced image analysis with AI
- Telemedicine integration
- Multi-language support
- Mobile app development
- DICOM support for medical imaging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 📞 Support

For support and questions, please contact the development team.

---

**Note**: This application is built for educational and demonstration purposes. For production use, ensure proper security audits and compliance with healthcare regulations like HIPAA.