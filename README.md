# ChoreChamp

A mobile app for parents to assign, track, and reward chores for children with gamification and payment features.

## Project Overview

ChoreChamp is a friendly, gamified mobile application designed to help parents manage household chores while encouraging children to complete tasks through rewards and point systems. The app provides separate interfaces for parents and children, with features for chore assignment, progress tracking, reward systems, and digital wallet functionality.

## Features

### Parent Interface
- Dashboard with child progress overview
- Assign and manage chores
- Set up recurring chore schedules
- Create and manage rewards
- Track child performance with analytics
- Manage the family digital wallet

### Child Interface
- View assigned chores
- Mark chores as completed
- Track personal progress and streaks
- Browse and redeem rewards
- View earned points and rewards

### Core Functionality
- User authentication with parent/child roles
- Chore management with due dates
- Point-based reward system
- Notification system for reminders
- Progress tracking with streaks
- Digital wallet for real-world rewards

## Technology Stack

- **Frontend**: React Native with Expo
- **State Management**: Redux with Redux Toolkit
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Notifications**: Firebase Cloud Messaging
- **Payments**: Stripe (for premium features)
- **AI Integration**: OpenAI (for chore suggestions)

## Project Structure

```
src/
  ├── components/         # Reusable UI components
  │   ├── common/         # Common UI elements (Button, Card, etc.)
  │   ├── parent/         # Parent-specific components
  │   └── child/          # Child-specific components
  ├── screens/            # Screen components
  │   ├── auth/           # Authentication screens
  │   ├── parent/         # Parent screens
  │   └── child/          # Child screens
  ├── store/              # Redux store
  │   └── slices/         # Redux state slices
  ├── services/           # API and backend services
  ├── hooks/              # Custom React hooks
  ├── config/             # App configuration
  ├── constants/          # Constants and theme files
  └── types/              # TypeScript type definitions
```

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Create a `.env` file based on `.env.example`
   - Add your Firebase and Stripe API keys

### Running the App

```bash
npm start
```

Use the Expo Go app on your mobile device to scan the QR code, or press 'i' to open in an iOS simulator or 'a' for an Android emulator.

## Development Notes

- This project uses TypeScript for type safety
- We follow the Redux Toolkit pattern for state management
- The UI is designed to be child-friendly with gamification elements
- Firebase is used for real-time synchronization between parent and child accounts

## License

[MIT](LICENSE)