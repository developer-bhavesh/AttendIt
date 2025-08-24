# AttendIt - Modern Attendance Management App

A scalable, modern attendance management application built with React Native and Firebase, designed to handle 1000+ employees efficiently.

## 🚀 Features

### 🔐 Authentication
- Secure admin login via Firebase Auth
- Single admin access control

### 👥 Employee Management
- Complete CRUD operations for employees
- Searchable, paginated employee list
- Optimized for 1000+ employees
- Employee details: name, email, department, position, employee ID

### 📅 Attendance Management
- Daily attendance marking with intuitive toggle switches
- Date navigation (previous/next day)
- Bulk actions (mark all present/absent)
- Default status: absent if not marked
- Batch writes for optimal performance

### 📊 Reports & Analytics
- Monthly attendance reports
- Employee-wise statistics
- Calendar/table view of attendance data
- Export options (CSV/PDF)
- Attendance percentage calculations

## 🛠 Tech Stack

- **Framework**: React Native 0.75.2
- **Navigation**: React Navigation 6
- **State Management**: Zustand
- **UI Library**: React Native Paper
- **Icons**: Lucide React Native
- **Backend**: Firebase (Auth + Firestore)
- **Language**: TypeScript

## 🏗 Architecture

```
src/
├── components/          # Reusable UI components
├── screens/            # Screen components
├── store/              # Zustand state management
├── services/           # Firebase services
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── navigation/         # Navigation configuration
```

## 📱 Screens

1. **Login Screen** - Admin authentication
2. **Dashboard** - Overview with statistics and quick actions
3. **Employees** - Employee list with search and pagination
4. **Add/Edit Employee** - Employee form management
5. **Attendance** - Daily attendance marking
6. **Reports** - Monthly attendance reports with export

## 🔥 Firebase Structure

### Collections

#### `employees`
```javascript
{
  id: string,
  name: string,
  email: string,
  department: string,
  position: string,
  employeeId: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `attendance`
```javascript
// Document ID: YYYY-MM-DD
{
  [employeeId]: "present" | "absent",
  updatedAt: timestamp
}
```

## ⚡ Performance Optimizations

- **Pagination**: 20 employees per page with infinite scroll
- **Batch Operations**: Efficient Firestore batch writes
- **Indexed Queries**: Optimized Firestore indexes
- **Date Partitioning**: Attendance data partitioned by date
- **Efficient State Management**: Minimal re-renders with Zustand

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- React Native development environment
- Firebase project
- Android Studio / Xcode

### Installation

1. **Clone and install dependencies**
```bash
git clone <repository>
cd AttendIt
npm install
```

2. **Firebase Setup**
   - Create Firebase project
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Add Android/iOS apps
   - Download config files:
     - `google-services.json` → `android/app/`
     - `GoogleService-Info.plist` → `ios/AttendIt/`

3. **iOS Setup** (if targeting iOS)
```bash
cd ios && pod install && cd ..
```

4. **Run the app**
```bash
# Android
npm run android

# iOS
npm run ios
```

For detailed setup instructions, see [SETUP.md](./SETUP.md)

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface
- **Indigo Theme**: Consistent indigo primary color scheme
- **Responsive**: Optimized for various screen sizes
- **Intuitive Navigation**: Easy-to-use navigation flow
- **Loading States**: Smooth loading indicators
- **Error Handling**: User-friendly error messages

## 📈 Scalability

- Handles 1000+ employees efficiently
- Optimized Firestore queries with proper indexing
- Pagination for large datasets
- Batch operations for bulk updates
- Efficient state management

## 🔒 Security

- Firebase Authentication for secure access
- Firestore security rules
- Admin-only access control
- Data validation on client and server

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please read the contributing guidelines before submitting PRs.

## 📞 Support

For support and questions, please open an issue in the repository.
