# StockSync - Inventory Management System

A modern, full-stack inventory management system built with React.js and Node.js featuring real-time updates, dark mode UI, and comprehensive stock tracking.

## 🚀 Features

- **Real-time Stock Management**: Live updates across all connected clients via WebSocket
- **Dark Mode UI**: Professional dark theme with optimized text visibility
- **Authentication System**: JWT-based auth with user roles and demo mode
- **Barcode Scanning**: Simulated barcode scanning with product matching
- **Shipment Management**: Track incoming and outgoing shipments
- **Item Search**: Live search functionality across inventory
- **Responsive Design**: Mobile-first design optimized for all devices
- **Stock Health Dashboard**: Animated gauges and real-time metrics

## 🛠 Tech Stack

### Frontend
- **React.js** with Vite for fast development
- **React Router** for client-side routing
- **Socket.IO Client** for real-time communication
- **CSS-in-JS** for component styling
- **Responsive Design** with CSS Grid and Flexbox

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **Socket.IO** for WebSocket communication
- **JWT** for authentication
- **bcryptjs** for password hashing

## 🏗 Project Structure

```
stocksync/
├── backend/                 # Node.js backend
│   ├── config/             # Database configuration
│   ├── controllers/        # Route controllers
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   └── server.js          # Main server file
└── StockSync/             # React frontend
    ├── src/
    │   ├── components/    # Reusable components
    │   │   ├── AuthLogin.jsx
    │   │   ├── BarcodeScanner.jsx
    │   │   ├── ItemSearch.jsx
    │   │   ├── Navigation.jsx
    │   │   ├── ShipmentQueue.jsx
    │   │   ├── StockGauge.jsx
    │   │   └── WebSocketProvider.jsx
    │   ├── Component/     # Page components
    │   │   └── EnhancedDashboard.jsx
    │   ├── App.jsx        # Main app component
    │   └── main.jsx       # Entry point
    └── public/            # Static assets
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/stocksync.git
   cd stocksync
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```

3. **Setup Frontend**
   ```bash
   cd ../StockSync
   npm install
   ```

### Running the Application

1. **Start MongoDB** (if running locally)
   ```bash
   brew services start mongodb/brew/mongodb-community
   # or
   mongod
   ```

2. **Start Backend Server**
   ```bash
   cd backend
   node server.js
   ```
   Server will run on `http://localhost:3001`

3. **Start Frontend Development Server**
   ```bash
   cd StockSync
   npm run dev
   ```
   Application will run on `http://localhost:5173` (or next available port)

## 🔐 Demo Access

Use the following credentials to access the demo:
- **Username**: `demo`
- **Password**: `demo`

Or click "Continue with Demo" for guest access.

## 📱 Usage

### Dashboard
- View real-time inventory metrics
- Monitor stock health with animated gauges
- Add/remove products
- Track stock movements

### Item Search
- Search products by name, SKU, or location
- Real-time filtering
- Click items for detailed view

### Barcode Scanner
- Simulate barcode scanning
- Quick scan preset products
- View scan history with timestamps

### Shipment Management
- Track incoming and outgoing shipments
- Update shipment status
- Filter by shipment type

## 🔌 API Endpoints

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `DELETE /api/products/:id` - Delete product

### Stock Movements
- `POST /api/movements` - Create stock movement

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

## 🌐 WebSocket Events

- `stockUpdate` - Real-time stock changes
- `barcodeScan` - Barcode scanning events
- `lowStockAlert` - Low stock notifications

## 🎨 Dark Mode Theme

The application features a professional dark mode theme with:
- **Deep slate backgrounds** (`#0f172a`, `#1e293b`)
- **High contrast text** for optimal readability
- **Consistent component styling**
- **Accessible color combinations**

## 🚀 Deployment

### Frontend (Netlify/Vercel)
1. Build the React app:
   ```bash
   cd StockSync
   npm run build
   ```
2. Deploy the `dist` folder to your preferred hosting service

### Backend (Railway/Heroku)
1. Set environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Secret key for JWT tokens
   - `PORT`: Server port (default: 3001)

2. Deploy using your preferred platform

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React.js community for excellent documentation
- MongoDB team for robust database solution
- Socket.IO for seamless real-time communication
- Vite for blazing fast development experience

## 📞 Support

For support, email your-email@example.com or create an issue in the GitHub repository.

---

**Built with ❤️ using React.js, Node.js, and MongoDB**
