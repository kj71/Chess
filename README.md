# Chess Game

A modern, interactive chess game built with React Native and Expo. This application provides a complete chess experience with a beautiful user interface and smooth gameplay.

## Features

- Interactive chess board with piece movement
- Legal move validation
- Game state management
- Haptic feedback for piece movements
- Cross-platform support (iOS, Android, Web)

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (LTS version recommended)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for Mac users) or Android Studio (for Android development)

## Installation

1. Clone the repository:
```bash
git clone [your-repository-url]
cd chess
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm start
# or
yarn start
```

## Available Scripts

- `npm start` or `yarn start` - Starts the Expo development server
- `npm run android` or `yarn android` - Runs the app on Android
- `npm run ios` or `yarn ios` - Runs the app on iOS
- `npm run web` or `yarn web` - Runs the app in web browser
- `npm test` or `yarn test` - Runs the test suite
- `npm run lint` or `yarn lint` - Runs the linter

## Deployment

To deploy your Expo app as a website, follow the official Expo documentation for publishing websites:
[Expo Website Publishing Guide](https://docs.expo.dev/guides/publishing-websites/)

## Project Structure

```
chess/
├── app/                 # Main application code
├── components/          # Reusable React components
├── assets/             # Static assets (images, fonts)
├── .expo/              # Expo configuration
├── ios/                # iOS specific files
├── node_modules/       # Dependencies
└── ...
```

## Technologies Used

- React Native
- Expo
- TypeScript
- React Navigation
- Expo Router
- React Native Reanimated
- React Native Gesture Handler

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
