# AttendIt - Setup Guide

## Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project named "AttendIt"
3. Enable Google Analytics (optional)

### 2. Enable Authentication
1. Go to Authentication > Sign-in method
2. Enable Email/Password authentication
3. Create an admin user account

### 3. Enable Firestore Database
1. Go to Firestore Database
2. Create database in production mode
3. Deploy the security rules: `firebase deploy --only firestore:rules`
4. Deploy the indexes: `firebase deploy --only firestore:indexes`

### 4. Add Android App
1. Go to Project Settings > General
2. Add Android app with package name: `com.ayinos.attendeit`
3. Download `google-services.json`
4. Place it in `android/app/google-services.json`

### 5. Add iOS App (if needed)
1. Add iOS app with bundle ID: `com.ayinos.attendeit`
2. Download `GoogleService-Info.plist`
3. Place it in `ios/AttendIt/GoogleService-Info.plist`
4. Run `cd ios && pod install`

## Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Install iOS Pods (iOS only)
```bash
cd ios && pod install && cd ..
```

### 3. Build and Run
```bash
# Android
npm run android

# iOS
npm run ios
```

## Admin Login
Use the email/password you created in Firebase Authentication to log in as admin.

## Features

### Employee Management
- Add, edit, delete employees
- Search and pagination for 1000+ employees
- Employee details: name, email, department, position, employee ID

### Attendance Management
- Daily attendance marking with toggle switches
- Date navigation (previous/next day)
- Bulk actions (mark all present/absent)
- Default status: absent if not marked

### Reports
- Monthly attendance reports
- Employee-wise statistics
- Export to CSV/PDF (PDF requires additional library)
- Attendance percentage calculations

## Data Structure

### Employees Collection
```
employees/{employeeId}
{
  name: string,
  email: string,
  department: string,
  position: string,
  employeeId: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Attendance Collection
```
attendance/{YYYY-MM-DD}
{
  [employeeId]: "present" | "absent",
  updatedAt: timestamp
}
```

## Performance Optimizations

1. **Pagination**: Employee list loads 20 items at a time
2. **Batch Writes**: Attendance is saved using Firestore batch operations
3. **Indexed Queries**: Optimized Firestore indexes for fast searches
4. **Efficient State Management**: Zustand for minimal re-renders
5. **Date-based Partitioning**: Attendance stored by date for efficient queries

## Troubleshooting

### Build Issues
1. Clean project: `npm run clean`
2. Reset Metro cache: `npx react-native start --reset-cache`
3. Rebuild: `cd android && ./gradlew clean && cd .. && npm run android`

### Firebase Issues
1. Verify `google-services.json` is in correct location
2. Check Firebase project configuration
3. Ensure Firestore rules allow authenticated access
4. Verify indexes are deployed

### Performance Issues
1. Check Firestore usage in Firebase Console
2. Monitor query performance
3. Ensure proper pagination implementation
4. Use React DevTools for performance profiling